'use client'

import Link from 'next/link'
import { Search, Heart, ShoppingCart, User, Menu } from 'lucide-react'
import { useState } from 'react'

type ShopHeaderProps = {
  user?: {
    email?: string
    id: string
  } | null
  profile?: {
    first_name?: string
    last_name?: string
  } | null
  cartItemCount?: number
  cartTotal?: number
  onSignOut?: () => void
}

export function ShopHeader({ user, profile, cartItemCount = 0, cartTotal = 0, onSignOut }: ShopHeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const currencyFormatter = new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })

  return (
    <>
      {/* Desktop Header */}
      <header className="sticky top-0 z-40 bg-surface-white border-b border-gray-200 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/shop" className="flex-shrink-0">
              <h1 className="text-2xl font-heading font-bold text-brand-dark">E-Ticaret</h1>
            </Link>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-dark/40" />
                <input
                  type="search"
                  placeholder="Ürün, kategori veya marka ara..."
                  className="w-full pl-12 pr-4 py-2.5 bg-surface-light border border-gray-200 rounded-button text-sm focus:outline-none focus:border-action focus:ring-2 focus:ring-action/20 transition-all"
                  onFocus={() => setIsSearchOpen(true)}
                />
              </div>
            </div>

            {/* Right Icons */}
            <div className="flex items-center space-x-6">
              <Link href="/shop/favorites" className="text-brand-dark/60 hover:text-brand-dark transition-colors">
                <Heart className="w-6 h-6" />
              </Link>

              {user ? (
                <Link href="/shop/account" className="text-brand-dark/60 hover:text-brand-dark transition-colors">
                  <User className="w-6 h-6" />
                </Link>
              ) : (
                <Link href="/auth/login" className="text-sm font-semibold text-brand-dark hover:text-action transition-colors">
                  Giriş Yap
                </Link>
              )}

              <Link href="/shop/cart" className="relative text-brand-dark/60 hover:text-brand-dark transition-colors">
                <ShoppingCart className="w-6 h-6" />
                {cartTotal > 0 && (
                  <div className="absolute -top-2 -right-3 min-w-[52px] px-2 py-0.5 bg-action text-white text-xs font-semibold rounded-full whitespace-nowrap">
                    {currencyFormatter.format(cartTotal)}
                  </div>
                )}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="sticky top-0 z-40 bg-surface-white border-b border-gray-200 md:hidden">
        <div className="flex items-center justify-between h-14 px-4">
          {/* Logo (Center) */}
          <Link href="/shop" className="absolute left-1/2 -translate-x-1/2">
            <h1 className="text-lg font-heading font-bold text-brand-dark">E-Ticaret</h1>
          </Link>

          {/* Search Icon (Right) */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="ml-auto text-brand-dark/60 hover:text-brand-dark transition-colors"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Mobile Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-white md:hidden animate-fade-in">
          <div className="flex items-center h-14 px-4 border-b border-gray-200">
            <button
              onClick={() => setIsSearchOpen(false)}
              className="mr-3 text-brand-dark"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-dark/40" />
              <input
                type="search"
                placeholder="Ne arıyorsunuz?"
                className="w-full pl-10 pr-4 py-2 bg-surface-light rounded-button text-sm focus:outline-none"
                autoFocus
              />
            </div>
          </div>
          <div className="p-4">
            <p className="text-xs uppercase tracking-wide text-brand-dark/60 font-semibold mb-3">Popüler Aramalar</p>
            <div className="flex flex-wrap gap-2">
              {['Elbise', 'Pantolon', 'Gömlek', 'Ayakkabı'].map((term) => (
                <button
                  key={term}
                  className="px-4 py-2 bg-surface-light text-sm text-brand-dark rounded-full hover:bg-action hover:text-white transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
