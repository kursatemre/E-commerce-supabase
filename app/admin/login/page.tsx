import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminLoginForm } from '@/components/admin/AdminLoginForm'
import { ADMIN_COOKIE_NAME, isAdminSessionValid } from '@/lib/adminAuth'

interface AdminLoginPageProps {
  searchParams?: Record<string, string | string[] | undefined>
}

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const cookieStore = await cookies()
  const adminSessionCookie = cookieStore.get(ADMIN_COOKIE_NAME)?.value
  const hasAdminSession = isAdminSessionValid(adminSessionCookie)
  const redirectParam = typeof searchParams?.redirectedFrom === 'string' ? searchParams?.redirectedFrom : null
  const redirectTarget = redirectParam && redirectParam.startsWith('/admin') ? redirectParam : '/admin'

  if (hasAdminSession) {
    redirect(redirectTarget)
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role === 'admin') {
      redirect('/admin')
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-gray-900/80 p-8 shadow-2xl">
        <div className="mb-6 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-gray-500">Yalnızca Yönetici</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Admin Panel Girişi</h1>
          <p className="mt-2 text-sm text-gray-400">Site kullanıcılarından bağımsız güvenli giriş</p>
        </div>
        <AdminLoginForm redirectTo={redirectTarget} />
      </div>
    </div>
  )
}
