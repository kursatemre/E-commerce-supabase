import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Suspense, type ReactNode } from 'react'
import { cookies } from 'next/headers'
import { ToastNotification } from '@/components/ToastNotification'
import { AdminSidebar } from '@/components/AdminSidebar'
import { AdminHeader } from '@/components/AdminHeader'
import { ADMIN_COOKIE_NAME, isAdminSessionValid } from '@/lib/adminAuth'

export default async function AdminPanelLayout({
  children,
}: {
  children: ReactNode
}) {
  const cookieStore = await cookies()
  const adminSessionCookie = cookieStore.get(ADMIN_COOKIE_NAME)?.value
  const hasAdminCookie = isAdminSessionValid(adminSessionCookie)

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user && !hasAdminCookie) {
    redirect('/admin/login')
  }

  let userName = 'Yönetici'

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, first_name, last_name')
      .eq('id', user.id)
      .single()

    const normalizedRole = profile?.role?.toLowerCase() ?? null
    const metadataRole = (user.user_metadata?.role || user.app_metadata?.role)?.toString().toLowerCase() ?? null
    const allowedAdminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS
      ? process.env.NEXT_PUBLIC_ADMIN_EMAILS.split(',').map((email) => email.trim().toLowerCase()).filter(Boolean)
      : []
    const isAdminEmail = user.email ? allowedAdminEmails.includes(user.email.toLowerCase()) : false
    const isSupabaseAdmin = normalizedRole === 'admin' || metadataRole === 'admin' || isAdminEmail

    if (!isSupabaseAdmin && !hasAdminCookie) {
      redirect('/')
    }

    userName = `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || user.email || 'Yönetici'
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <AdminSidebar />

      <div className="lg:pl-64">
        <AdminHeader userName={userName} />

        <Suspense fallback={null}>
          <ToastNotification />
        </Suspense>

        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
