'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { SlidersHorizontal } from 'lucide-react'
import { useState } from 'react'

type Category = {
  id: string
  name: string
  slug: string
}

type CategoryFilterProps = {
  categories: Category[]
}

export function CategoryFilter({ categories }: CategoryFilterProps) {
  const searchParams = useSearchParams()
  const currentCategory = searchParams.get('category') || ''
  const [showFilterModal, setShowFilterModal] = useState(false)

  return (
    <>
      {/* Desktop: Horizontal Scrollable Tags */}
      <div className="hidden md:block mb-6">
        <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
          <Link
            href="/"
            className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
              !currentCategory
                ? 'bg-action text-white shadow-button'
                : 'bg-surface-light text-brand-dark hover:bg-surface-light/80'
            }`}
          >
            Tümü
          </Link>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/?category=${category.slug}`}
              className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                currentCategory === category.slug
                  ? 'bg-action text-white shadow-button'
                  : 'bg-surface-light text-brand-dark hover:bg-surface-light/80'
              }`}
            >
              {category.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile: Horizontal Scrollable + Filter Button */}
      <div className="md:hidden mb-4">
        <div className="flex items-center gap-2">
          {/* Scrollable Categories */}
          <div className="flex-1 overflow-x-auto scrollbar-hide">
            <div className="flex gap-2 pb-1">
              <Link
                href="/"
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  !currentCategory
                    ? 'bg-action text-white'
                    : 'bg-surface-light text-brand-dark'
                }`}
              >
                Tümü
              </Link>
              {categories.slice(0, 5).map((category) => (
                <Link
                  key={category.id}
                  href={`/?category=${category.slug}`}
                  className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    currentCategory === category.slug
                      ? 'bg-action text-white'
                      : 'bg-surface-light text-brand-dark'
                  }`}
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Filter Button */}
          {categories.length > 5 && (
            <button
              onClick={() => setShowFilterModal(true)}
              className="flex-shrink-0 p-2 bg-surface-light rounded-full text-brand-dark"
            >
              <SlidersHorizontal className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Mobile Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 z-50 bg-black/60 md:hidden" onClick={() => setShowFilterModal(false)}>
          <div
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[70vh] overflow-y-auto animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-semibold text-lg text-brand-dark">Kategoriler</h3>
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="text-brand-dark/60"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-2">
              <Link
                href="/"
                onClick={() => setShowFilterModal(false)}
                className={`block px-4 py-3 rounded-button text-sm font-semibold ${
                  !currentCategory
                    ? 'bg-action text-white'
                    : 'bg-surface-light text-brand-dark'
                }`}
              >
                Tüm Ürünler
              </Link>
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/?category=${category.slug}`}
                  onClick={() => setShowFilterModal(false)}
                  className={`block px-4 py-3 rounded-button text-sm font-semibold ${
                    currentCategory === category.slug
                      ? 'bg-action text-white'
                      : 'bg-surface-light text-brand-dark'
                  }`}
                >
                  {category.name}
                </Link>
              ))}
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
              <button
                onClick={() => setShowFilterModal(false)}
                className="w-full btn-cta"
              >
                Uygula
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
