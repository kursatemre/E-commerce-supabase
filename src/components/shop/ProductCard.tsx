'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Heart, Plus } from 'lucide-react'
import { useState } from 'react'

type ProductCardProps = {
  product: {
    id: string
    name: string
    slug: string
    description?: string | null
    price: number
    stock: number
    category?: { name: string } | null
    brand?: { name: string } | null
    images?: Array<{ url: string; alt?: string | null }> | null
  }
  priceRange?: {
    minPrice: number
    maxPrice: number
  } | null
}

const currencyFormatter = new Intl.NumberFormat('tr-TR', {
  style: 'currency',
  currency: 'TRY',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

export function ProductCard({ product, priceRange }: ProductCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [imageIndex, setImageIndex] = useState(0)

  const firstImage = product.images?.[0]
  const secondImage = product.images?.[1]
  const hasMultipleImages = product.images && product.images.length > 1

  const showRange = priceRange && priceRange.minPrice !== priceRange.maxPrice
  const displayPrice = priceRange
    ? showRange
      ? `${currencyFormatter.format(priceRange.minPrice)} - ${currencyFormatter.format(priceRange.maxPrice)}`
      : currencyFormatter.format(priceRange.minPrice)
    : currencyFormatter.format(product.price)

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id }),
      })

      if (response.ok) {
        // Show success feedback
        window.location.reload()
      }
    } catch (error) {
      console.error('Quick add error:', error)
    }
  }

  return (
    <div className="group relative bg-surface-white">
      {/* Image Container */}
      <Link
        href={`/shop/product/${product.slug}`}
        className="relative block aspect-[3/4] overflow-hidden bg-surface-light"
        onMouseEnter={() => hasMultipleImages && setImageIndex(1)}
        onMouseLeave={() => setImageIndex(0)}
      >
        {firstImage ? (
          <>
            <Image
              src={imageIndex === 0 ? firstImage.url : secondImage?.url || firstImage.url}
              alt={firstImage.alt || product.name}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              className="object-cover transition-opacity duration-300"
              priority={false}
            />

            {/* Stock Badge */}
            {product.stock <= 5 && product.stock > 0 && (
              <div className="absolute top-3 left-3 px-2 py-1 bg-action text-white text-xs font-semibold rounded">
                Son {product.stock} Ürün
              </div>
            )}
            {product.stock === 0 && (
              <div className="absolute top-3 left-3 px-2 py-1 bg-brand-dark text-white text-xs font-semibold rounded">
                Tükendi
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-6xl opacity-20">📦</span>
          </div>
        )}

        {/* Hover Actions */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
            {/* Quick Add Button */}
            {product.stock > 0 && (
              <button
                onClick={handleQuickAdd}
                className="flex-1 mr-2 flex items-center justify-center gap-2 bg-action hover:bg-action-hover text-white font-semibold py-2.5 px-4 rounded-button shadow-button-hover transition-all duration-200 hover:-translate-y-0.5"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm">Hızlı Ekle</span>
              </button>
            )}

            {/* Like Button */}
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setIsLiked(!isLiked)
              }}
              className={`p-2.5 rounded-full transition-all ${
                isLiked ? 'bg-action text-white' : 'bg-white/90 text-brand-dark hover:bg-white'
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-4">
        {/* Category & Brand */}
        <div className="flex items-center gap-2 mb-2 text-xs text-brand-dark/60">
          {product.category?.name && <span>{product.category.name}</span>}
          {product.category?.name && product.brand?.name && <span>•</span>}
          {product.brand?.name && <span>{product.brand.name}</span>}
        </div>

        {/* Product Name */}
        <h3 className="font-heading font-semibold text-brand-dark mb-2 line-clamp-2 hover:text-action transition-colors">
          <Link href={`/shop/product/${product.slug}`}>
            {product.name}
          </Link>
        </h3>

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-brand-dark">
            {displayPrice}
          </span>
          {showRange && (
            <span className="text-xs text-brand-dark/60">den başlayan</span>
          )}
        </div>
      </div>
    </div>
  )
}
