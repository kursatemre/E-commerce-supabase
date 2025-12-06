'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface AdminHeaderProps {
  userName: string
}

export function AdminHeader({ userName }: AdminHeaderProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const pathname = usePathname()

  // Get page title from pathname
  const getPageTitle = () => {
    if (pathname === '/admin') return 'Dashboard'
    if (pathname.includes('/orders')) return 'Siparişler'
    if (pathname.includes('/categories')) return 'Kategoriler'
    if (pathname.includes('/brands')) return 'Markalar'
    if (pathname.includes('/products')) return 'Ürünler & Stok'
    if (pathname.includes('/customers')) return 'Müşteriler & CRM'
    if (pathname.includes('/marketing')) return 'Pazarlama & SEO'
    if (pathname.includes('/integrations')) return 'Omnichannel'
    if (pathname.includes('/settings')) return 'Ayarlar'
    return 'Admin Panel'
  }

  return (
    <header className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-10">
      <div className="flex justify-between items-center px-8 py-4">
        {/* Left: Breadcrumb */}
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-white hidden lg:block">Admin Panel</h1>
          <span className="text-gray-500 hidden lg:inline">|</span>
          <div className="flex space-x-2 text-sm">
            <span className="text-white font-medium">{getPageTitle()}</span>
          </div>
        </div>

        {/* Right: Search, Icons, Profile */}
        <div className="flex items-center space-x-4">
          {/* Search Bar */}
          <div className="relative hidden md:block">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ara..."
              className="bg-gray-800 text-gray-200 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 text-sm w-64 border border-gray-700"
            />
            <svg
              className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Notification Icon */}
          <button className="p-2 hover:bg-gray-800 rounded-full transition duration-150 text-gray-400 hover:text-white relative">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Profile & Sign Out */}
          <div className="flex items-center space-x-3 pl-3 border-l border-gray-700">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="hidden lg:block">
              <p className="text-sm font-medium text-white">{userName}</p>
              <button
                onClick={async () => {
                  const supabase = createClient()
                  await supabase.auth.signOut()
                  router.push('/auth/login')
                }}
                className="text-xs text-gray-400 hover:text-red-400 transition"
              >
                Çıkış Yap
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
