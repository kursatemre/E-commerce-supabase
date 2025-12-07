import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

type AuthCallbackPayload = {
  event?: string | null
  session?: unknown
}

type SessionTokenPayload = {
  access_token: string
  refresh_token: string
}

const isRelativePath = (value: string | null) => Boolean(value && value.startsWith('/'))

const extractSessionTokens = (session: unknown): SessionTokenPayload | null => {
  if (!session || typeof session !== 'object') {
    return null
  }

  const candidate = session as Record<string, unknown>
  const accessToken = typeof candidate.access_token === 'string' ? candidate.access_token : null
  const refreshToken = typeof candidate.refresh_token === 'string' ? candidate.refresh_token : null

  if (accessToken && refreshToken) {
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    }
  }

  return null
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')
  const redirectedFrom = request.nextUrl.searchParams.get('redirectedFrom')
  const safeRedirectPath = isRelativePath(redirectedFrom) ? (redirectedFrom as string) : '/'
  const supabase = createRouteHandlerClient({ cookies })

  if (code) {
    await supabase.auth.exchangeCodeForSession(code)
  }

  return NextResponse.redirect(new URL(safeRedirectPath, request.nextUrl.origin))
}

export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })

  let payload: AuthCallbackPayload | null = null
  try {
    payload = await request.json()
  } catch (error) {
    return NextResponse.json({ success: false, reason: 'invalid-payload' }, { status: 400 })
  }

  const event = typeof payload?.event === 'string' ? payload.event : undefined
  const sessionTokens = extractSessionTokens(payload?.session)

  try {
    if (event === 'SIGNED_OUT') {
      await supabase.auth.signOut()
    } else if (sessionTokens) {
      const { error } = await supabase.auth.setSession(sessionTokens)
      if (error) {
        console.error('Session sync error:', error)
        return NextResponse.json({ success: false, reason: 'session-update-failed' }, { status: 500 })
      }
    }
  } catch (error) {
    console.error('Auth callback error:', error)
    return NextResponse.json({ success: false }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
