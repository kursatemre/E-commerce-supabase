interface TrustBadge {
  icon: string
  title: string
  description: string
}

const defaultBadges: TrustBadge[] = [
  {
    icon: '🚚',
    title: 'Hızlı Kargo',
    description: '2-3 gün içinde kapınızda',
  },
  {
    icon: '✨',
    title: 'Kalite Garantisi',
    description: 'Premium ürün kalitesi',
  },
  {
    icon: '↩️',
    title: 'Kolay İade',
    description: '14 gün içinde ücretsiz',
  },
  {
    icon: '🔒',
    title: 'Güvenli Ödeme',
    description: '256-bit SSL şifreleme',
  },
]

interface TrustStripProps {
  badges?: TrustBadge[]
}

export function TrustStrip({ badges = defaultBadges }: TrustStripProps) {
  return (
    <section className="bg-surface-light py-8 md:py-12 border-y border-gray-200">
      <div className="section-container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {badges.map((badge, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center group"
            >
              <div className="text-3xl md:text-4xl mb-3 transform transition-transform duration-300 group-hover:scale-110">
                {badge.icon}
              </div>
              <h3 className="font-heading text-base md:text-lg font-semibold text-brand-dark mb-1">
                {badge.title}
              </h3>
              <p className="text-sm text-gray-600">
                {badge.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
