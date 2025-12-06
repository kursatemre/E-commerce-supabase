'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { ADMIN_COOKIE_NAME, getAdminConfig, isAdminCredentialValid } from '@/lib/adminAuth'
import type { AdminLoginState } from '@/actions/adminAuthState'
import { adminLoginDefaultState } from '@/actions/adminAuthState'

export async function adminLogin(_prevState: AdminLoginState, formData: FormData): Promise<AdminLoginState> {
  const username = formData.get('username')?.toString().trim() || ''
  const password = formData.get('password')?.toString() || ''
  const redirectToRaw = formData.get('redirectTo')?.toString() || '/admin'
  const redirectTo = redirectToRaw.startsWith('/admin') ? redirectToRaw : '/admin'

  if (!isAdminCredentialValid(username, password)) {
    return { error: 'Kullanıcı adı veya şifre hatalı' }
  }

  const cookieStore = await cookies()
  const { sessionToken } = getAdminConfig()

  cookieStore.set({
    name: ADMIN_COOKIE_NAME,
    value: sessionToken,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 12, // 12 saat
  })

  redirect(redirectTo)

  return adminLoginDefaultState
}

export async function adminLogout(redirectTo = '/admin/login') {
  const cookieStore = await cookies()
  cookieStore.delete(ADMIN_COOKIE_NAME)
  redirect(redirectTo)
}
