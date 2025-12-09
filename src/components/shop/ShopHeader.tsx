'use client'

import Link from 'next/link'
import { Search, Heart, ShoppingCart, User, Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { CartDrawer } from '@/components/cart/CartDrawer'
import { searchProducts } from '@/actions/shop'
import Image from 'next/image'

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

type SearchResult = {
  id: string
  name: string
  slug: string
  price: number
  product_images: { url: string; alt: string | null }[]
}

export function ShopHeader({ user, profile, cartItemCount = 0, cartTotal = 0, onSignOut }: ShopHeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)

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

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true)
        const result = await searchProducts(searchQuery)
        setSearchResults(result.products as SearchResult[])
        setIsSearching(false)
      } else {
        setSearchResults([])
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const handleSearchClose = () => {
    setIsSearchOpen(false)
    setSearchQuery('')
    setSearchResults([])
  }

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
            <div className="flex-1 max-w-md relative">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-dark/40" />
                <input
                  type="search"
                  placeholder="Ürün ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-2.5 bg-surface-light border border-gray-200 rounded-button text-sm focus:outline-none focus:border-action focus:ring-2 focus:ring-action/20 transition-all"
                  onFocus={() => setIsSearchOpen(true)}
                />
              </div>

              {/* Desktop Search Results Dropdown */}
              {isSearchOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={handleSearchClose} />
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto z-40">
                    {isSearching ? (
                      <div className="p-4 text-center text-brand-dark/60">Aranıyor...</div>
                    ) : searchQuery.trim().length < 2 ? (
                      <div className="p-4">
                        <p className="text-xs uppercase tracking-wide text-brand-dark/60 font-semibold mb-3">Popüler Aramalar</p>
                        <div className="flex flex-wrap gap-2">
                          {['Elbise', 'Pantolon', 'Gömlek', 'Ayakkabı'].map((term) => (
                            <button
                              key={term}
                              onClick={() => setSearchQuery(term)}
                              className="px-4 py-2 bg-surface-light text-sm text-brand-dark rounded-full hover:bg-action hover:text-white transition-colors"
                            >
                              {term}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div className="divide-y divide-gray-100">
                        {searchResults.map((product) => (
                          <Link
                            key={product.id}
                            href={`/${product.slug}`}
                            onClick={handleSearchClose}
                            className="flex items-center gap-3 p-3 hover:bg-surface-light transition-colors"
                          >
                            <div className="w-12 h-12 bg-gray-100 rounded flex-shrink-0 overflow-hidden">
                              {product.product_images?.[0]?.url && (
                                <Image
                                  src={product.product_images[0].url}
                                  alt={product.product_images[0].alt || product.name}
                                  width={48}
                                  height={48}
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-brand-dark truncate">{product.name}</p>
                              <p className="text-sm text-action font-semibold">{currencyFormatter.format(product.price)}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-brand-dark/60">Sonuç bulunamadı</div>
                    )}
                  </div>
                </>
              )}
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
              onClick={handleSearchClose}
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-surface-light rounded-button text-sm focus:outline-none"
                autoFocus
              />
            </div>
          </div>

          {/* Mobile Search Results */}
          <div className="overflow-y-auto h-[calc(100vh-3.5rem)]">
            {isSearching ? (
              <div className="p-4 text-center text-brand-dark/60">Aranıyor...</div>
            ) : searchQuery.trim().length < 2 ? (
              <div className="p-4">
                <p className="text-xs uppercase tracking-wide text-brand-dark/60 font-semibold mb-3">Popüler Aramalar</p>
                <div className="flex flex-wrap gap-2">
                  {['Elbise', 'Pantolon', 'Gömlek', 'Ayakkabı'].map((term) => (
                    <button
                      key={term}
                      onClick={() => setSearchQuery(term)}
                      className="px-4 py-2 bg-surface-light text-sm text-brand-dark rounded-full hover:bg-action hover:text-white transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {searchResults.map((product) => (
                  <Link
                    key={product.id}
                    href={`/${product.slug}`}
                    onClick={handleSearchClose}
                    className="flex items-center gap-3 p-4 hover:bg-surface-light transition-colors"
                  >
                    <div className="w-16 h-16 bg-gray-100 rounded flex-shrink-0 overflow-hidden">
                      {product.product_images?.[0]?.url && (
                        <Image
                          src={product.product_images[0].url}
                          alt={product.product_images[0].alt || product.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-brand-dark mb-1">{product.name}</p>
                      <p className="text-sm text-action font-semibold">{currencyFormatter.format(product.price)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-brand-dark/60">Sonuç bulunamadı</div>
            )}
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  )
}
