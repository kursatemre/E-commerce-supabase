import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin
  const redirectedFrom = requestUrl.searchParams.get('redirectedFrom')
  const safeRedirectPath = redirectedFrom && redirectedFrom.startsWith('/') ? redirectedFrom : '/'
  const cookieStore = await cookies()

  if (code) {
    const supabase = createRouteHandlerClient({ cookies: () => Promise.resolve(cookieStore) })
    await supabase.auth.exchangeCodeForSession(code)
  }

  return NextResponse.redirect(new URL(safeRedirectPath, origin).toString())
}

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const supabase = createRouteHandlerClient({ cookies: () => Promise.resolve(cookieStore) })
  const { event, session } = await request.json()

  if (event === 'SIGNED_OUT') {
    await supabase.auth.signOut()
  } else if (session) {
    await supabase.auth.setSession(session)
  }

  return NextResponse.json({ success: true })
}
