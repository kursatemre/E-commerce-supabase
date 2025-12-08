'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface CartItemButtonsProps {
  itemId: string
  quantity: number
  maxStock: number
}

export function CartItemButtons({ itemId, quantity, maxStock }: CartItemButtonsProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleQuantityChange = async (newQuantity: number) => {
    setLoading(true)
    try {
      const response = await fetch('/api/cart/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, quantity: newQuantity }),
      })
      if (!response.ok) throw new Error('Update failed')
      router.refresh()
    } catch (error) {
      console.error('Error updating cart:', error)
      alert('Sepet güncellenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/cart/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId }),
      })
      if (!response.ok) throw new Error('Remove failed')
      router.refresh()
    } catch (error) {
      console.error('Error removing item:', error)
      alert('Ürün silinirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-2 flex items-center gap-4">
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleQuantityChange(quantity - 1)}
          disabled={loading}
          className="w-8 h-8 rounded-md border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
        >
          −
        </button>
        <span className="w-12 text-center">{quantity}</span>
        <button
          onClick={() => handleQuantityChange(quantity + 1)}
          disabled={loading || quantity >= maxStock}
          className="w-8 h-8 rounded-md border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
        >
          +
        </button>
      </div>

      <button
        onClick={handleRemove}
        disabled={loading}
        className="text-red-600 hover:text-red-700 text-sm disabled:opacity-50"
      >
        Sil
      </button>
    </div>
  )
}
