'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { X, ShoppingBag, Trash2, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface CartItem {
  id: string
  quantity: number
  product: {
    id: string
    name: string
    slug: string
    price: number
    images?: Array<{ url: string; alt: string | null }>
  }
  variant?: {
    id: string
    name: string
    price: number
  }
}

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}

const currencyFormatter = new Intl.NumberFormat('tr-TR', {
  style: 'currency',
  currency: 'TRY',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchCartItems()
    }
  }, [isOpen])

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  const fetchCartItems = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/cart')
      if (response.ok) {
        const data = await response.json()
        setCartItems(data.items || [])
      }
    } catch (error) {
      console.error('Error fetching cart:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId)
      return
    }

    try {
      const response = await fetch('/api/cart/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, quantity: newQuantity }),
      })

      if (response.ok) {
        fetchCartItems()
      }
    } catch (error) {
      console.error('Error updating quantity:', error)
    }
  }

  const removeItem = async (itemId: string) => {
    try {
      const response = await fetch('/api/cart/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId }),
      })

      if (response.ok) {
        fetchCartItems()
      }
    } catch (error) {
      console.error('Error removing item:', error)
    }
  }

  const subtotal = cartItems.reduce((sum, item) => {
    const unitPrice = item.variant?.price ?? item.product.price
    return sum + unitPrice * item.quantity
  }, 0)

  const handleGoToCart = () => {
    onClose()
    router.push('/cart')
  }

  const handleGoToCheckout = () => {
    onClose()
    router.push('/checkout')
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 z-50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[480px] bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-6 h-6 text-action" />
            <div>
              <h2 className="font-heading text-xl font-bold text-brand-dark">
                Sepetim
              </h2>
              <p className="text-sm text-brand-dark/60">
                {cartItems.length} ürün
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface-light rounded-full transition-colors"
            aria-label="Sepeti kapat"
          >
            <X className="w-6 h-6 text-brand-dark" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-action" />
            </div>
          ) : cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-24 h-24 bg-surface-light rounded-full flex items-center justify-center mb-4">
                <ShoppingBag className="w-12 h-12 text-brand-dark/40" />
              </div>
              <h3 className="font-heading text-xl font-semibold text-brand-dark mb-2">
                Sepetiniz Boş
              </h3>
              <p className="text-sm text-brand-dark/60 mb-6">
                Alışverişe başlamak için ürünleri keşfedin
              </p>
              <button
                onClick={onClose}
                className="btn-cta"
              >
                Alışverişe Başla
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => {
                const firstImage = item.product.images?.[0]
                const unitPrice = item.variant?.price ?? item.product.price
                const productName = item.variant
                  ? `${item.product.name} - ${item.variant.name}`
                  : item.product.name

                return (
                  <div
                    key={item.id}
                    className="flex gap-3 p-3 bg-surface-light rounded-xl hover:shadow-md transition-shadow"
                  >
                    {/* Product Image */}
                    <Link
                      href={`/${item.product.slug}`}
                      onClick={onClose}
                      className="relative w-20 h-20 bg-white rounded-lg overflow-hidden flex-shrink-0"
                    >
                      {firstImage ? (
                        <Image
                          src={firstImage.url}
                          alt={firstImage.alt || productName}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl opacity-20">
                          📦
                        </div>
                      )}
                    </Link>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/${item.product.slug}`}
                        onClick={onClose}
                        className="font-semibold text-sm text-brand-dark hover:text-action transition-colors line-clamp-2 block mb-1"
                      >
                        {productName}
                      </Link>

                      <p className="text-sm font-bold text-action mb-2">
                        {currencyFormatter.format(unitPrice * item.quantity)}
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 rounded-md border border-gray-300 flex items-center justify-center hover:bg-white transition-colors"
                          aria-label="Azalt"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-sm font-semibold text-brand-dark">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 rounded-md border border-gray-300 flex items-center justify-center hover:bg-white transition-colors"
                          aria-label="Artır"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 h-fit hover:bg-red-50 rounded-lg transition-colors group"
                      aria-label="Ürünü kaldır"
                    >
                      <Trash2 className="w-4 h-4 text-brand-dark/40 group-hover:text-red-500 transition-colors" />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer - Only show if cart has items */}
        {cartItems.length > 0 && (
          <div className="border-t border-gray-200 p-4 sm:p-6 space-y-4 bg-surface-light">
            {/* Subtotal */}
            <div className="flex items-center justify-between">
              <span className="text-brand-dark/80">Ara Toplam</span>
              <span className="text-xl font-bold text-brand-dark">
                {currencyFormatter.format(subtotal)}
              </span>
            </div>

            {/* Free Shipping Message */}
            <div className="text-xs text-green-600 bg-green-50 p-2 rounded-lg text-center">
              🎉 Ücretsiz kargo kazandınız!
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={handleGoToCheckout}
                className="btn-cta w-full flex items-center justify-center gap-2"
              >
                Ödemeye Geç
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleGoToCart}
                className="w-full py-3 px-4 bg-white border-2 border-brand-dark text-brand-dark font-semibold rounded-button hover:bg-brand-dark hover:text-white transition-all"
              >
                Sepete Git
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
