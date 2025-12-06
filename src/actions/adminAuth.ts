'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { ADMIN_COOKIE_NAME, getAdminConfig, isAdminCredentialValid } from '@/lib/adminAuth'

export type AdminLoginState = {
  error?: string | null
}

const defaultState: AdminLoginState = { error: null }

export async function adminLogin(_: AdminLoginState | undefined, formData: FormData): Promise<AdminLoginState | void> {
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
}

export async function adminLogout(redirectTo = '/admin/login') {
  const cookieStore = await cookies()
  cookieStore.delete(ADMIN_COOKIE_NAME)
  redirect(redirectTo)
}

export { defaultState as adminLoginDefaultState }
