'use client'

import { useState, useEffect } from 'react'
import { ShoppingCart } from 'lucide-react'

type StickyCTABarProps = {
  productName: string
  price: number
  onAddToCart: () => void
  isLoading?: boolean
}

const currencyFormatter = new Intl.NumberFormat('tr-TR', {
  style: 'currency',
  currency: 'TRY',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

export function StickyCTABar({ productName, price, onAddToCart, isLoading = false }: StickyCTABarProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky bar after scrolling 300px
      setIsVisible(window.scrollY > 300)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 bg-surface-white border-t border-gray-200 shadow-button transition-transform duration-300 md:hidden ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="flex items-center gap-3 p-4">
        {/* Product Info - Left Side */}
        <div className="flex-1 min-w-0">
          <p className="text-xs text-brand-dark/60 truncate mb-0.5">
            {productName}
          </p>
          <p className="text-lg font-heading font-semibold text-brand-dark">
            {currencyFormatter.format(price)}
          </p>
        </div>

        {/* CTA Button - Right Side (65% width) */}
        <button
          onClick={onAddToCart}
          disabled={isLoading}
          className="btn-cta flex items-center justify-center gap-2 flex-[1.85] disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ minWidth: '65%' }}
        >
          <ShoppingCart className="w-5 h-5" />
          <span>{isLoading ? 'Ekleniyor...' : 'Sepete Ekle'}</span>
        </button>
      </div>
    </div>
  )
}
