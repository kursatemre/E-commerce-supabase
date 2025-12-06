import { NextResponse, type NextRequest } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const PROJECT_REF = (() => {
  try {
    if (!SUPABASE_URL) return null
    const hostname = new URL(SUPABASE_URL).hostname
    return hostname.split('.')[0]
  } catch {
    return null
  }
})()
const AUTH_COOKIE = PROJECT_REF ? `sb-${PROJECT_REF}-auth-token` : null
const PROTECTED_PATH_PREFIXES = ['/admin']

type SupabaseAuthCookie = {
  access_token?: string
  accessToken?: string
  currentSession?: {
    access_token?: string
    accessToken?: string
  }
}

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({ request })

  if (!shouldProtectPath(request.nextUrl.pathname)) {
    return response
  }

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !AUTH_COOKIE) {
    return response
  }

  const authCookie = request.cookies.get(AUTH_COOKIE)
  if (!authCookie) {
    return redirectToLogin(request)
  }

  const accessToken = extractAccessToken(authCookie.value)
  if (!accessToken) {
    return redirectToLogin(request)
  }

  try {
    const userResponse = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    })

    if (!userResponse.ok) {
      return redirectToLogin(request)
    }
  } catch (error) {
    console.error('[middleware] Failed to validate Supabase session', error)
    return redirectToLogin(request)
  }

  return response
}

function shouldProtectPath(pathname: string) {
  return PROTECTED_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}

function extractAccessToken(rawValue: string | undefined) {
  if (!rawValue) {
    return null
  }

  try {
    const parsed = JSON.parse(rawValue) as SupabaseAuthCookie
    return (
      parsed.currentSession?.access_token ??
      parsed.currentSession?.accessToken ??
      parsed.access_token ??
      parsed.accessToken ??
      null
    )
  } catch {
    try {
      const decoded = decodeURIComponent(rawValue)
      const parsed = JSON.parse(decoded) as SupabaseAuthCookie
      return (
        parsed.currentSession?.access_token ??
        parsed.currentSession?.accessToken ??
        parsed.access_token ??
        parsed.accessToken ??
        null
      )
    } catch {
      return null
    }
  }
}

function redirectToLogin(request: NextRequest) {
  const url = request.nextUrl.clone()
  url.pathname = '/auth/login'
  return NextResponse.redirect(url)
}
