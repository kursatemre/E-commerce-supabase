import { DiscountBadge } from './DiscountBadge'

interface PriceDisplayProps {
  price: number
  discountPrice?: number | null
  showBadge?: boolean
  priceClassName?: string
  discountPriceClassName?: string
  badgeClassName?: string
}

export function PriceDisplay({
  price,
  discountPrice,
  showBadge = true,
  priceClassName = '',
  discountPriceClassName = '',
  badgeClassName = ''
}: PriceDisplayProps) {
  const hasDiscount = discountPrice != null && discountPrice > 0 && discountPrice < price

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(value)
  }

  if (!hasDiscount) {
    return <span className={priceClassName}>{formatPrice(price)}</span>
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className={discountPriceClassName}>{formatPrice(discountPrice)}</span>
      <span className={`line-through text-gray-400 ${priceClassName}`}>{formatPrice(price)}</span>
      {showBadge && (
        <DiscountBadge
          originalPrice={price}
          discountPrice={discountPrice}
          className={badgeClassName}
        />
      )}
    </div>
  )
}
