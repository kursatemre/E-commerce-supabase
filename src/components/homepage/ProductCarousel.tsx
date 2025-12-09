'use client'

import { useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  images: Array<{ url: string; alt: string | null }> | null
}

interface ProductCarouselProps {
  title: string
  subtitle?: string
  products: Product[]
  viewAllLink?: string
}

export function ProductCarousel({
  title,
  subtitle,
  products,
  viewAllLink,
}: ProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

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
  })

  return (
    <section className="section-container py-8 md:py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <div>
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-brand-dark mb-1">
            {title}
          </h2>
          {subtitle && (
            <p className="text-gray-600 text-sm md:text-base">{subtitle}</p>
          )}
        </div>

        {viewAllLink && (
          <Link href={viewAllLink} className="hidden md:block">
            <Button variant="ghost">
              Tümünü Gör
              <svg
                className="ml-2 w-4 h-4"
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
            </Button>
          </Link>
        )}
      </div>

      {/* Carousel Container */}
      <div className="relative">
        {/* Navigation Buttons (Desktop) */}
        <button
          onClick={() => scroll('left')}
          className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 items-center justify-center bg-white rounded-full shadow-lg hover:bg-surface-light transition-colors"
          aria-label="Önceki"
        >
          <svg
            className="w-6 h-6 text-brand-dark"
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
          className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 items-center justify-center bg-white rounded-full shadow-lg hover:bg-surface-light transition-colors"
          aria-label="Sonraki"
        >
          <svg
            className="w-6 h-6 text-brand-dark"
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
          className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
        >
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/shop/products/${product.slug}`}
              className="group flex-none w-[200px] md:w-[250px]"
            >
              {/* Product Card */}
              <div className="product-card">
                {/* Image Container */}
                <div className="relative aspect-square bg-surface-light overflow-hidden">
                  {product.images && product.images.length > 0 ? (
                    <Image
                      src={product.images[0].url}
                      alt={product.images[0].alt || product.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      sizes="(max-width: 768px) 200px, 250px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">
                      📦
                    </div>
                  )}

                  {/* Quick Add to Cart (Hidden, shows on hover) */}
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      className="w-10 h-10 bg-action text-white rounded-full flex items-center justify-center hover:bg-action-hover transition-colors shadow-lg"
                      onClick={(e) => {
                        e.preventDefault()
                        // TODO: Implement quick add to cart
                        console.log('Add to cart:', product.id)
                      }}
                      aria-label="Sepete Ekle"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <h3 className="font-medium text-brand-dark mb-2 line-clamp-2 group-hover:text-action transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-lg font-bold text-action">
                    {currencyFormatter.format(product.price)}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* View All Link (Mobile) */}
      {viewAllLink && (
        <div className="md:hidden mt-6 text-center">
          <Link href={viewAllLink}>
            <Button variant="secondary" className="w-full">
              Tümünü Gör
            </Button>
          </Link>
        </div>
      )}
    </section>
  )
}
