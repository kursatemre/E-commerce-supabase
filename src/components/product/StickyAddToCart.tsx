'use client'

import { Button } from '@/components/ui/Button'
import { ShoppingCart } from 'lucide-react'
import { useEffect, useState } from 'react'

interface StickyAddToCartProps {
  productName: string
  price: number
  onAddToCart: () => void
  isLoading?: boolean
  stock?: number
}

export function StickyAddToCart({
  productName,
  price,
  onAddToCart,
  isLoading,
  stock = 0,
}: StickyAddToCartProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky footer when user scrolls past 300px
      setIsVisible(window.scrollY > 300)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const currencyFormatter = new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })

  if (!isVisible) return null

  return (
    <div className="md:hidden sticky-cta-footer animate-slide-up">
      <div className="flex items-center gap-3">
        {/* Price Section */}
        <div className="flex-shrink-0">
          <p className="text-xs text-brand-dark/60">Fiyat</p>
          <p className="text-lg font-bold text-action">
            {currencyFormatter.format(price)}
          </p>
        </div>

        {/* Add to Cart Button */}
        <Button
          onClick={onAddToCart}
          isLoading={isLoading}
          disabled={stock === 0}
          className="flex-1"
          size="lg"
        >
          <ShoppingCart className="w-5 h-5 mr-2" />
          {stock === 0 ? 'Stokta Yok' : 'Sepete Ekle'}
        </Button>
      </div>
    </div>
  )
}
