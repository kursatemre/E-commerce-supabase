'use client'

import { useState, useEffect } from 'react'
import { X, Check } from 'lucide-react'
import Image from 'next/image'
import { addToCartQuick, findVariantByOptions } from '@/actions/shop'

type Variant = {
  id: string
  name: string
  options: string[]
}

type Product = {
  id: string
  name: string
  price: number
  image?: string
  variants?: Variant[]
}

type QuickAddModalProps = {
  product: Product
  isOpen: boolean
  onClose: () => void
}

export function QuickAddModal({ product, isOpen, onClose }: QuickAddModalProps) {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
  const [isAdding, setIsAdding] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const currencyFormatter = new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })

  useEffect(() => {
    if (isOpen) {
      setSelectedOptions({})
      setShowSuccess(false)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleAddToCart = async () => {
    setIsAdding(true)

    try {
      let variantId: string | undefined

      // If product has variants, find the matching variant ID
      if (product.variants && product.variants.length > 0) {
        const foundVariantId = await findVariantByOptions(product.id, selectedOptions)
        if (!foundVariantId) {
          console.error('Could not find matching variant')
          setIsAdding(false)
          return
        }
        variantId = foundVariantId
      }

      const result = await addToCartQuick(product.id, variantId)

      if (!result.success) {
        console.error('Failed to add to cart:', result.error)
        setIsAdding(false)
        return
      }

      setShowSuccess(true)
      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (error) {
      console.error('Error adding to cart:', error)
      setIsAdding(false)
    }
  }

  const allOptionsSelected = product.variants
    ? product.variants.every((variant) => selectedOptions[variant.id])
    : true

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden animate-slide-up">
        {showSuccess ? (
          /* Success State */
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="font-heading text-xl font-semibold text-brand-dark mb-2">
              Sepete Eklendi!
            </h3>
            <p className="text-sm text-brand-dark/60">
              Ürün başarıyla sepetinize eklendi
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="font-heading text-lg font-semibold text-brand-dark">
                Hızlı Sepete Ekle
              </h3>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-light transition-colors"
              >
                <X className="w-5 h-5 text-brand-dark/60" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Product Info */}
              <div className="flex items-start gap-4">
                {product.image && (
                  <div className="w-20 h-20 bg-surface-light rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-brand-dark line-clamp-2 mb-1">
                    {product.name}
                  </h4>
                  <p className="text-lg font-bold text-action">
                    {currencyFormatter.format(product.price)}
                  </p>
                </div>
              </div>

              {/* Variant Options */}
              {product.variants && product.variants.length > 0 && (
                <div className="space-y-4">
                  {product.variants.map((variant) => (
                    <div key={variant.id}>
                      <label className="block text-sm font-medium text-brand-dark mb-2">
                        {variant.name}
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {variant.options.map((option) => {
                          const isSelected = selectedOptions[variant.id] === option
                          return (
                            <button
                              key={option}
                              onClick={() =>
                                setSelectedOptions((prev) => ({
                                  ...prev,
                                  [variant.id]: option,
                                }))
                              }
                              className={`px-4 py-2 rounded-button text-sm font-medium transition-all ${
                                isSelected
                                  ? 'bg-action text-white'
                                  : 'bg-surface-light text-brand-dark hover:bg-gray-200'
                              }`}
                            >
                              {option}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={!allOptionsSelected || isAdding}
                className="w-full px-6 py-3 bg-action text-white font-semibold rounded-button hover:bg-action-hover hover:shadow-button-hover hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {isAdding ? 'Ekleniyor...' : 'Sepete Ekle'}
              </button>

              {!allOptionsSelected && (
                <p className="text-xs text-center text-brand-dark/60">
                  Lütfen tüm seçenekleri seçin
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
