'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingCart } from 'lucide-react'

interface AddToCartButtonProps {
  productId: string
  stock: number
  variantId?: string | null
  disabled?: boolean
  fullWidth?: boolean
  onAddToCart?: () => void
}

export function AddToCartButton({
  productId,
  stock,
  variantId,
  disabled = false,
  fullWidth = true,
  onAddToCart
}: AddToCartButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleAddToCart = async () => {
    if (stock === 0) return

    setLoading(true)
    try {
      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          variantId: variantId ?? null
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || 'Sepete eklenirken hata oluştu')
        return
      }

      // Success feedback - simple toast-like message
      const toast = document.createElement('div')
      toast.className = 'fixed top-20 left-1/2 -translate-x-1/2 bg-brand-dark text-white px-6 py-3 rounded-button shadow-button z-50 animate-fade-in'
      toast.textContent = '✓ Ürün sepete eklendi!'
      document.body.appendChild(toast)
      setTimeout(() => toast.remove(), 2000)

      if (onAddToCart) onAddToCart()
      router.refresh()
    } catch (error) {
      console.error('Error adding to cart:', error)
      alert('Sepete eklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleAddToCart}
      disabled={stock === 0 || loading || disabled}
      className={`btn-cta flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
        fullWidth ? 'w-full' : ''
      }`}
    >
      <ShoppingCart className="w-5 h-5" />
      <span>{loading ? 'Ekleniyor...' : stock > 0 ? 'Sepete Ekle' : 'Stokta Yok'}</span>
    </button>
  )
}
