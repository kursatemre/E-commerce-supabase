'use client'

import { logout } from '@/actions/profile'

export function LogoutButton() {
  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      // NEXT_REDIRECT is expected behavior, not an error
      if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
        return
      }
      console.error('Logout error:', error)
    }
  }

  return (
    <button
      onClick={handleLogout}
      className="text-sm font-medium text-error hover:text-error/80 transition-colors"
    >
      Çıkış Yap
    </button>
  )
}
