import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { ToastNotification } from '@/components/ToastNotification'
import { AdminSidebar } from '@/components/AdminSidebar'
import { AdminHeader } from '@/components/AdminHeader'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, first_name, last_name')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/shop')
  }

  const userName = `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'Admin'

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
