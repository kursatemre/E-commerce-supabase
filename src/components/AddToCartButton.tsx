'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface AddToCartButtonProps {
  productId: string
  stock: number
  variantId?: string | null
  disabled?: boolean
}

export function AddToCartButton({ productId, stock, variantId, disabled = false }: AddToCartButtonProps) {
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

      // Success feedback
      alert('✓ Ürün sepete eklendi!')
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
      className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
    >
      {loading ? 'Ekleniyor...' : stock > 0 ? 'Sepete Ekle' : 'Stokta Yok'}
    </button>
  )
}
