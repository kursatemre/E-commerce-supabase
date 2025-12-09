'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Grid, User, ShoppingCart } from 'lucide-react'
import { useState } from 'react'
import { CartDrawer } from '@/components/cart/CartDrawer'

export function MobileNavigation({ cartItemCount = 0, cartTotal = 0 }: { cartItemCount?: number; cartTotal?: number }) {
  const pathname = usePathname()
  const [isCartOpen, setIsCartOpen] = useState(false)

  const navItems = [
    { href: '/', icon: Home, label: 'Anasayfa', isLink: true },
    { href: '/categories', icon: Grid, label: 'Kategoriler', isLink: true },
    { href: '/account', icon: User, label: 'Profil', isLink: true },
    { href: '/cart', icon: ShoppingCart, label: 'Sepet', badge: cartItemCount, price: cartTotal, isLink: false },
  ]

  const currencyFormatter = new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface-white border-t border-gray-200 md:hidden">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href + '/'))
            const Icon = item.icon
            const isCart = item.href === '/cart'

            const content = (
              <>
                <div className="relative">
                  <Icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />

                  {isCart && item.price && item.price > 0 && (
                    <div className="absolute -top-2 -right-2 min-w-[48px] px-1.5 py-0.5 bg-action text-white text-[10px] font-semibold rounded-full whitespace-nowrap animate-cart-pulse">
                      {currencyFormatter.format(item.price)}
                    </div>
                  )}

                  {!isCart && item.badge && item.badge > 0 && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-action text-white text-[10px] font-semibold rounded-full flex items-center justify-center">
                      {item.badge > 9 ? '9+' : item.badge}
                    </div>
                  )}
                </div>
                <span className={`text-[11px] mt-1 font-medium ${isActive ? 'font-semibold' : ''}`}>
                  {item.label}
                </span>
              </>
            )

            return item.isLink ? (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                  isActive ? 'text-action' : 'text-brand-dark/60'
                }`}
              >
                {content}
              </Link>
            ) : (
              <button
                key={item.href}
                onClick={() => setIsCartOpen(true)}
                className={`relative flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                  isActive ? 'text-action' : 'text-brand-dark/60'
                }`}
              >
                {content}
              </button>
            )
          })}
        </div>
      </nav>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  )
}
