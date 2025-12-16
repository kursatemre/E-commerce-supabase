interface DiscountBadgeProps {
  originalPrice: number
  discountPrice: number
  className?: string
}

export function DiscountBadge({ originalPrice, discountPrice, className = '' }: DiscountBadgeProps) {
  const discountPercentage = Math.round(((originalPrice - discountPrice) / originalPrice) * 100)

  if (discountPercentage <= 0) return null

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500 text-white ${className}`}
    >
      -{discountPercentage}%
    </span>
  )
}
