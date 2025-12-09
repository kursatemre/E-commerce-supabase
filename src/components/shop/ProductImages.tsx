'use client'

import Image from 'next/image'
import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type ProductImage = {
  id: string
  url: string
  alt: string | null
  sort_order: number | null
}

type ProductImagesProps = {
  images: ProductImage[]
  productName: string
}

export function ProductImages({ images, productName }: ProductImagesProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const sortedImages = useMemo(() => {
    if (!images || images.length === 0) return []
    return [...images].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
  }, [images])

  const goToPrevious = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? sortedImages.length - 1 : prev - 1
    )
  }

  const goToNext = () => {
    setCurrentImageIndex((prev) =>
      prev === sortedImages.length - 1 ? 0 : prev + 1
    )
  }

  if (!sortedImages || sortedImages.length === 0) {
    return (
      <div className="aspect-[3/4] bg-surface-light rounded-2xl flex items-center justify-center">
        <div className="text-6xl opacity-40">📦</div>
      </div>
    )
  }

  const currentImage = sortedImages[currentImageIndex] || sortedImages[0]

  return (
    <div className="space-y-3">
      {/* Main Image */}
      <div className="relative aspect-[3/4] bg-surface-light rounded-2xl overflow-hidden group">
        <Image
          src={currentImage.url}
          alt={currentImage.alt || productName}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
          priority
        />

        {/* Navigation Arrows - Desktop */}
        {sortedImages.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full shadow-button flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex hover:bg-white"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5 text-brand-dark" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full shadow-button flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex hover:bg-white"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5 text-brand-dark" />
            </button>
          </>
        )}

        {/* Image Counter - Mobile */}
        {sortedImages.length > 1 && (
          <div className="absolute bottom-3 right-3 px-3 py-1.5 bg-black/60 text-white text-xs font-semibold rounded-full md:hidden">
            {currentImageIndex + 1} / {sortedImages.length}
          </div>
        )}
      </div>

      {/* Thumbnail Gallery - Desktop Only */}
      {sortedImages.length > 1 && (
        <div className="hidden md:grid grid-cols-5 gap-3">
          {sortedImages.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setCurrentImageIndex(index)}
              className={`aspect-[3/4] bg-surface-light rounded-xl overflow-hidden relative transition-all ${
                index === currentImageIndex
                  ? 'ring-2 ring-action'
                  : 'hover:ring-2 hover:ring-gray-300'
              }`}
            >
              <Image
                src={image.url}
                alt={image.alt || `${productName} - ${index + 1}`}
                fill
                sizes="10vw"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Swipe Dots - Mobile Only */}
      {sortedImages.length > 1 && (
        <div className="flex justify-center gap-2 md:hidden">
          {sortedImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentImageIndex
                  ? 'bg-action w-6'
                  : 'bg-gray-300'
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
