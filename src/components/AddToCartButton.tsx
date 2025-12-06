'use client'

import { addToCart } from '@/actions/shop'
import { useState } from 'react'

interface AddToCartButtonProps {
  productId: string
  stock: number
  variantId?: string | null
  disabled?: boolean
}

export function AddToCartButton({ productId, stock, variantId, disabled = false }: AddToCartButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleAddToCart = async () => {
    setLoading(true)
    try {
      await addToCart(productId, variantId ?? undefined)
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
