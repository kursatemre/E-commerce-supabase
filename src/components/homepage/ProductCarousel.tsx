'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart } from 'lucide-react'
import { QuickAddModal } from '@/components/shop/QuickAddModal'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  images: Array<{ url: string; alt: string | null }> | null
  variants?: Array<{
    id: string
    name: string
    options: string[]
  }>
}

interface ProductCarouselProps {
  title: string
  subtitle?: string
  products: Product[]
  viewAllLink?: string
  badge?: 'bestseller' | 'new' | 'limited' | null
}

export function ProductCarousel({
  title,
  subtitle,
  products,
  viewAllLink,
  badge = 'bestseller',
}: ProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return

    const scrollAmount = 300
    const newScrollLeft =
      scrollRef.current.scrollLeft +
      (direction === 'left' ? -scrollAmount : scrollAmount)

    scrollRef.current.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth',
    })
  }

  const currencyFormatter = new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })

  const getBadgeText = (badgeType: typeof badge) => {
    switch (badgeType) {
      case 'bestseller':
        return 'Çok Satan'
      case 'new':
        return 'Yeni'
      case 'limited':
        return 'Sınırlı Stok'
      default:
        return null
    }
  }

  const badgeText = getBadgeText(badge)

  return (
    <section className="section-container py-8 md:py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <div>
          <h2 className="font-heading text-h2 md:text-h2 font-semibold text-brand-dark mb-1">
            {title}
          </h2>
          {subtitle && (
            <p className="text-brand-dark/60 text-sm md:text-base">{subtitle}</p>
          )}
        </div>

        {viewAllLink && (
          <Link
            href={viewAllLink}
            className="hidden md:flex items-center gap-2 px-4 py-2 border-2 border-brand-dark text-brand-dark font-medium text-sm rounded-button hover:bg-action hover:border-action hover:text-white transition-all"
          >
            Tümünü Gör
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        )}
      </div>

      {/* Carousel Container */}
      <div className="relative">
        {/* Navigation Buttons (Desktop) */}
        <button
          onClick={() => scroll('left')}
          className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 items-center justify-center bg-white rounded-full shadow-md hover:shadow-lg hover:bg-surface-light transition-all"
          aria-label="Önceki"
        >
          <svg
            className="w-5 h-5 text-brand-dark"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <button
          onClick={() => scroll('right')}
          className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 items-center justify-center bg-white rounded-full shadow-md hover:shadow-lg hover:bg-surface-light transition-all"
          aria-label="Sonraki"
        >
          <svg
            className="w-5 h-5 text-brand-dark"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>

        {/* Products Scroll Container */}
        <div
          ref={scrollRef}
          className="flex gap-3 md:gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4 -mx-4 px-4 md:mx-0 md:px-0"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {products.map((product, index) => {
            const isHovered = hoveredProduct === product.id
            const hasSecondImage = product.images && product.images.length > 1

            return (
              <div
                key={product.id}
                className="group flex-none w-[45%] md:w-[240px]"
                onMouseEnter={() => setHoveredProduct(product.id)}
                onMouseLeave={() => setHoveredProduct(null)}
              >
                {/* Product Card */}
                <div className="bg-white rounded-lg overflow-hidden">
                  {/* Image Container */}
                  <Link href={`/${product.slug}`} className="block relative aspect-[3/4] bg-surface-light overflow-hidden rounded-button">
                    {/* Badge */}
                    {badgeText && index < 3 && (
                      <div className="absolute top-3 left-3 z-10 px-3 py-1 bg-action text-white text-xs font-semibold rounded-full">
                        {badgeText}
                      </div>
                    )}

                    {/* First Image */}
                    {product.images && product.images.length > 0 ? (
                      <>
                        <Image
                          src={product.images[0].url}
                          alt={product.images[0].alt || product.name}
                          fill
                          className={`object-cover transition-opacity duration-300 ${
                            hasSecondImage && isHovered ? 'opacity-0' : 'opacity-100'
                          }`}
                          sizes="(max-width: 768px) 45vw, 240px"
                        />

                        {/* Second Image (Hover) */}
                        {hasSecondImage && (
                          <Image
                            src={product.images[1].url}
                            alt={product.images[1].alt || product.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 45vw, 240px"
                          />
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">
                        📦
                      </div>
                    )}
                  </Link>

                  {/* Product Info */}
                  <div className="p-3 md:p-4">
                    <Link href={`/${product.slug}`}>
                      <h3 className="font-medium text-sm md:text-base text-brand-dark mb-2 line-clamp-2 group-hover:text-action transition-colors">
                        {product.name}
                      </h3>
                    </Link>

                    <div className="flex items-center justify-between">
                      <p className="text-base md:text-lg font-bold text-brand-dark">
                        {currencyFormatter.format(product.price)}
                      </p>

                      {/* Quick Add to Cart Button */}
                      <button
                        className="w-9 h-9 bg-action text-white rounded-full flex items-center justify-center shadow-button-depth hover:bg-action-hover hover:shadow-button-depth-hover hover:-translate-y-0.5 transition-all active:scale-95"
                        onClick={(e) => {
                          e.preventDefault()
                          setSelectedProduct(product)
                          setIsModalOpen(true)
                        }}
                        aria-label="Sepete Ekle"
                      >
                        <ShoppingCart className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Scroll Hint (Mobile) */}
        <div className="md:hidden absolute top-1/2 right-0 -translate-y-1/2 w-12 h-24 bg-gradient-to-l from-white to-transparent pointer-events-none" />
      </div>

      {/* View All Link (Mobile) */}
      {viewAllLink && (
        <div className="md:hidden mt-6 text-center">
          <Link
            href={viewAllLink}
            className="inline-block px-8 py-3 bg-surface-light text-brand-dark font-semibold rounded-button hover:bg-gray-200 transition-colors"
          >
            Tümünü Gör
          </Link>
        </div>
      )}

      {/* Quick Add Modal */}
      {selectedProduct && (
        <QuickAddModal
          product={{
            id: selectedProduct.id,
            name: selectedProduct.name,
            price: selectedProduct.price,
            image: selectedProduct.images?.[0]?.url,
            variants: selectedProduct.variants,
          }}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedProduct(null)
          }}
        />
      )}
    </section>
  )
}
