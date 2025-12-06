import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse, type NextRequest } from 'next/server'
import { ADMIN_COOKIE_NAME, isAdminSessionValid } from '@/lib/adminAuth'

const PROTECTED_PATH_PREFIXES = ['/admin']
const PUBLIC_ADMIN_PATHS = ['/admin/login', '/admin/logout']

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({ request })
  const supabase = createMiddlewareClient({ req: request, res: response })
  const adminSessionCookie = request.cookies.get(ADMIN_COOKIE_NAME)?.value
  const hasAdminSession = isAdminSessionValid(adminSessionCookie)

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
