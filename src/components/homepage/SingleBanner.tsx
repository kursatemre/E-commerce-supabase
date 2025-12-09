import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'

interface SingleBannerProps {
  title: string
  subtitle?: string
  ctaText: string
  ctaLink: string
  imageSrc: string
  imageAlt: string
  theme?: 'light' | 'dark'
}

export function SingleBanner({
  title,
  subtitle,
  ctaText,
  ctaLink,
  imageSrc,
  imageAlt,
  theme = 'dark',
}: SingleBannerProps) {
  const isDark = theme === 'dark'

  return (
    <section className="section-container py-8 md:py-12">
      <Link
        href={ctaLink}
        className="group relative block h-[400px] md:h-[500px] overflow-hidden rounded-2xl"
      >
        <div className="absolute inset-0">
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="100vw"
          />
          {/* Overlay */}
          <div
            className={`absolute inset-0 ${
              isDark
                ? 'bg-gradient-to-r from-black/70 via-black/50 to-transparent'
                : 'bg-gradient-to-r from-white/90 via-white/70 to-transparent'
            }`}
          />
        </div>

        {/* Content */}
        <div className="relative h-full flex items-center">
          <div className="section-container max-w-2xl">
            <h2
              className={`font-heading text-3xl md:text-5xl font-bold mb-4 ${
                isDark ? 'text-white' : 'text-brand-dark'
              }`}
            >
              {title}
            </h2>
            {subtitle && (
              <p
                className={`text-lg md:text-xl mb-6 ${
                  isDark ? 'text-white/90' : 'text-brand-dark/80'
                }`}
              >
                {subtitle}
              </p>
            )}
            <Button
              size="lg"
              variant={isDark ? 'primary' : 'secondary'}
              className="group-hover:scale-105 transition-transform"
            >
              {ctaText}
            </Button>
          </div>
        </div>
      </Link>
    </section>
  )
}
