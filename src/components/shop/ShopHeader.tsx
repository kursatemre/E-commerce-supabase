'use client'

import Link from 'next/link'
import { Search, Heart, ShoppingCart, User, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { CartDrawer } from '@/components/cart/CartDrawer'

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
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const currencyFormatter = new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })

  const mainCategories = [
    { name: 'Kadın', href: '/categories/kadin' },
    { name: 'Erkek', href: '/categories/erkek' },
    { name: 'Yeni Ürünler', href: '/new' },
    { name: 'İndirim', href: '/sale' },
  ]

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="bg-action/10 border-b border-action/20 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-10">
            <p className="text-sm text-action font-semibold">
              Bugün 23:59&apos;a kadar tüm siparişlerde <span className="font-bold">Ücretsiz Kargo</span> 🚚
            </p>
          </div>
        </div>
      </div>

      {/* Desktop Header */}
      <header className="sticky top-0 z-40 bg-surface-white border-b border-gray-200 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <h1 className="text-2xl font-heading font-bold text-brand-dark">E-Ticaret</h1>
            </Link>

            {/* Main Navigation */}
            <nav className="flex items-center space-x-8 mx-8">
              {mainCategories.map((category) => (
                <Link
                  key={category.href}
                  href={category.href}
                  className="text-sm font-medium text-brand-dark/80 hover:text-action transition-colors"
                >
                  {category.name}
                </Link>
              ))}
            </nav>

            {/* Search Bar */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-dark/40" />
                <input
                  type="search"
                  placeholder="Ürün ara..."
                  className="w-full pl-12 pr-4 py-2.5 bg-surface-light border border-gray-200 rounded-button text-sm focus:outline-none focus:border-action focus:ring-2 focus:ring-action/20 transition-all"
                  onFocus={() => setIsSearchOpen(true)}
                />
              </div>
            </div>

            {/* Right Icons */}
            <div className="flex items-center space-x-6 ml-8">
              <Link href="/favorites" className="text-brand-dark/60 hover:text-brand-dark transition-colors">
                <Heart className="w-6 h-6" />
              </Link>

              {user ? (
                <Link href="/account" className="text-brand-dark/60 hover:text-brand-dark transition-colors">
                  <User className="w-6 h-6" />
                </Link>
              ) : (
                <Link href="/auth/login" className="text-sm font-semibold text-brand-dark hover:text-action transition-colors">
                  Giriş Yap
                </Link>
              )}

              <button
                onClick={() => setIsCartOpen(true)}
                className="relative text-brand-dark/60 hover:text-brand-dark transition-colors"
              >
                <ShoppingCart className="w-6 h-6" />
                {cartTotal > 0 && (
                  <div className="absolute -top-2 -right-3 min-w-[52px] px-2 py-0.5 bg-action text-white text-xs font-semibold rounded-full whitespace-nowrap">
                    {currencyFormatter.format(cartTotal)}
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="sticky top-0 z-40 bg-surface-white border-b border-gray-200 md:hidden">
        <div className="flex items-center justify-between h-14 px-4">
          {/* Hamburger Menu */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="text-brand-dark/60 hover:text-brand-dark transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Logo (Center) */}
          <Link href="/" className="absolute left-1/2 -translate-x-1/2">
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

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="fixed left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-surface-white shadow-xl animate-slide-in-left">
            <div className="flex items-center justify-between h-14 px-4 border-b border-gray-200">
              <h2 className="font-heading font-bold text-brand-dark">Menü</h2>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-brand-dark/60 hover:text-brand-dark"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <nav className="p-4 space-y-1">
              {mainCategories.map((category) => (
                <Link
                  key={category.href}
                  href={category.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-3 text-brand-dark hover:bg-action/10 hover:text-action rounded-lg transition-colors font-medium"
                >
                  {category.name}
                </Link>
              ))}
              {!user && (
                <Link
                  href="/auth/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-3 text-action font-semibold border-t border-gray-200 mt-4 pt-4"
                >
                  Giriş Yap / Kayıt Ol
                </Link>
              )}
            </nav>
          </div>
        </div>
      )}

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

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  )
}
