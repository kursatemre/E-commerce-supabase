import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { NextRequest, NextResponse } from 'next/server'

// Initialize Redis client (optional, for production use Upstash)
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : undefined

// Create rate limiters with different strategies
export const apiRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '10 s'), // 10 requests per 10 seconds
      analytics: true,
      prefix: '@upstash/ratelimit/api',
    })
  : null

export const webhookRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, '60 s'), // 100 webhooks per minute
      analytics: true,
      prefix: '@upstash/ratelimit/webhook',
    })
  : null

export const authRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '60 s'), // 5 auth attempts per minute
      analytics: true,
      prefix: '@upstash/ratelimit/auth',
    })
  : null

// In-memory fallback rate limiter (for development without Redis)
class InMemoryRateLimiter {
  private requests: Map<string, number[]> = new Map()
  private maxLimit: number
  private windowMs: number

  constructor(limit: number, windowMs: number) {
    this.maxLimit = limit
    this.windowMs = windowMs
  }

  async limit(identifier: string): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
    const now = Date.now()
    const windowStart = now - this.windowMs

    // Get existing requests for this identifier
    const requests = this.requests.get(identifier) || []

    // Filter out old requests
    const recentRequests = requests.filter((time) => time > windowStart)

    // Check if limit exceeded
    if (recentRequests.length >= this.maxLimit) {
      const oldestRequest = Math.min(...recentRequests)
      const reset = oldestRequest + this.windowMs

      this.requests.set(identifier, recentRequests)

      return {
        success: false,
        limit: this.maxLimit,
        remaining: 0,
        reset,
      }
    }

    // Add current request
    recentRequests.push(now)
    this.requests.set(identifier, recentRequests)

    return {
      success: true,
      limit: this.maxLimit,
      remaining: this.maxLimit - recentRequests.length,
      reset: now + this.windowMs,
    }
  }
}

// Fallback rate limiters for development
const inMemoryApiLimiter = new InMemoryRateLimiter(10, 10000) // 10 req per 10s
const inMemoryWebhookLimiter = new InMemoryRateLimiter(100, 60000) // 100 req per min
const inMemoryAuthLimiter = new InMemoryRateLimiter(5, 60000) // 5 req per min

/**
 * Rate limit middleware for API routes
 */
export async function rateLimit(
  request: NextRequest,
  type: 'api' | 'webhook' | 'auth' = 'api'
): Promise<{ success: boolean; headers: Record<string, string>; response?: NextResponse }> {
  // Get identifier (IP address or user ID)
  const identifier = getIdentifier(request)

  let result: { success: boolean; limit: number; remaining: number; reset: number }

  // Use appropriate rate limiter
  if (type === 'webhook') {
    if (webhookRateLimiter) {
      result = await webhookRateLimiter.limit(identifier)
    } else {
      result = await inMemoryWebhookLimiter.limit(identifier)
    }
  } else if (type === 'auth') {
    if (authRateLimiter) {
      result = await authRateLimiter.limit(identifier)
    } else {
      result = await inMemoryAuthLimiter.limit(identifier)
    }
  } else {
    if (apiRateLimiter) {
      result = await apiRateLimiter.limit(identifier)
    } else {
      result = await inMemoryApiLimiter.limit(identifier)
    }
  }

  const headers = {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': new Date(result.reset).toISOString(),
  }

  if (!result.success) {
    const retryAfter = Math.ceil((result.reset - Date.now()) / 1000)

    return {
      success: false,
      headers: {
        ...headers,
        'Retry-After': retryAfter.toString(),
      },
      response: new NextResponse(
        JSON.stringify({
          error: 'Too many requests',
          message: `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            ...headers,
            'Retry-After': retryAfter.toString(),
          },
        }
      ),
    }
  }

  return {
    success: true,
    headers,
  }
}

/**
 * Get unique identifier for rate limiting
 */
function getIdentifier(request: NextRequest): string {
  // Try to get IP from headers (Vercel, Cloudflare, etc.)
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip')

  const ip = cfConnectingIp || realIp || forwardedFor?.split(',')[0] || 'unknown'

  return ip
}

/**
 * Helper to apply rate limiting to API route handlers
 */
export function withRateLimit(
  handler: (request: NextRequest) => Promise<NextResponse>,
  type: 'api' | 'webhook' | 'auth' = 'api'
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const { success, headers, response } = await rateLimit(request, type)

    if (!response) {
      const handlerResponse = await handler(request)

      // Add rate limit headers to response
      Object.entries(headers).forEach(([key, value]) => {
        handlerResponse.headers.set(key, value)
      })

      return handlerResponse
    }

    return response
  }
}
