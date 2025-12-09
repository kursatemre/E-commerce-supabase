import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { ADMIN_COOKIE_NAME, isAdminSessionValid } from '@/lib/adminAuth'

const PROTECTED_PATH_PREFIXES = ['/admin']
const PUBLIC_ADMIN_PATHS = ['/admin/login', '/admin/logout']
const GUEST_COOKIE_NAME = 'guest_id'
const GUEST_COOKIE_MAX_AGE = 60 * 60 * 24 * 180 // 180 days

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const adminSessionCookie = request.cookies.get(ADMIN_COOKIE_NAME)?.value
  const hasAdminSession = isAdminSessionValid(adminSessionCookie)

  // Ensure guest_id cookie exists
  const existingGuestId = request.cookies.get(GUEST_COOKIE_NAME)?.value
  if (!existingGuestId) {
    const newGuestId = crypto.randomUUID()
    response.cookies.set(GUEST_COOKIE_NAME, newGuestId, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: GUEST_COOKIE_MAX_AGE,
    })
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user && !hasAdminSession && shouldProtectPath(request.nextUrl.pathname)) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin/login'
    url.searchParams.set('redirectedFrom', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  return response
}

function shouldProtectPath(pathname: string) {
  if (
    PUBLIC_ADMIN_PATHS.some(
      (publicPath) => pathname === publicPath || pathname.startsWith(`${publicPath}/`)
    )
  ) {
    return false
  }

  return PROTECTED_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}
