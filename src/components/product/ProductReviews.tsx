'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { Button } from '@/components/ui/Button'

// Mock data - İleride Supabase'den çekilecek
const mockReviews = [
  {
    id: '1',
    userName: 'Ayşe K.',
    rating: 5,
    comment: 'Harika bir ürün! Kumaş kalitesi çok iyi ve bedenleme tam oturuyor.',
    date: '2025-01-05',
    verified: true,
  },
  {
    id: '2',
    userName: 'Mehmet Y.',
    rating: 4,
    comment: 'Ürün güzel ama kargo biraz geç geldi. Kalite çok iyi.',
    date: '2025-01-03',
    verified: true,
  },
  {
    id: '3',
    userName: 'Zeynep D.',
    rating: 5,
    comment: 'Beklentilerimi fazlasıyla karşıladı. Kesinlikle tavsiye ederim!',
    date: '2024-12-28',
    verified: false,
  },
]

export function ProductReviews() {
  const [showAll, setShowAll] = useState(false)

  const averageRating = 4.7
  const totalReviews = mockReviews.length

  const displayedReviews = showAll ? mockReviews : mockReviews.slice(0, 2)

  return (
    <div className="mt-12 md:mt-16">
      <div className="border-t border-gray-200 pt-8">
        {/* Header with Stats */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h2 className="font-heading text-2xl font-bold text-brand-dark mb-2">
              Müşteri Yorumları
            </h2>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= Math.round(averageRating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-2xl font-bold text-brand-dark">{averageRating.toFixed(1)}</span>
              <span className="text-sm text-brand-dark/60">
                ({totalReviews} değerlendirme)
              </span>
            </div>
          </div>

          <Button variant="secondary" size="sm">
            Yorum Yaz
          </Button>
        </div>

        {/* Reviews List */}
        <div className="space-y-6">
          {displayedReviews.map((review) => (
            <div
              key={review.id}
              className="p-6 bg-surface-light rounded-2xl"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-brand-dark">
                      {review.userName}
                    </span>
                    {review.verified && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        ✓ Doğrulanmış Alıcı
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= review.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-brand-dark/60">
                      {new Date(review.date).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-sm md:text-base text-brand-dark/80 leading-relaxed">
                {review.comment}
              </p>
            </div>
          ))}
        </div>

        {/* Show More Button */}
        {mockReviews.length > 2 && !showAll && (
          <div className="mt-6 text-center">
            <Button
              variant="ghost"
              onClick={() => setShowAll(true)}
            >
              Tüm Yorumları Göster ({mockReviews.length - 2} yorum daha)
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
