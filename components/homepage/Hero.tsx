import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'

interface HeroProps {
  title: string
  subtitle?: string
  ctaText: string
  ctaLink: string
  imageSrc: string
  imageAlt: string
}

export function Hero({
  title,
  subtitle,
  ctaText,
  ctaLink,
  imageSrc,
  imageAlt,
}: HeroProps) {
  return (
    <section className="relative h-[70vh] md:h-[80vh] overflow-hidden bg-surface-light">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        {/* Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
      </div>

      {/* Content */}
      <div className="relative h-full flex items-center justify-center">
        <div className="section-container text-center text-white">
          <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold mb-4 md:mb-6 animate-fade-in">
            {title}
          </h1>
          {subtitle && (
            <p className="text-lg md:text-xl lg:text-2xl mb-8 md:mb-10 max-w-2xl mx-auto opacity-90 animate-fade-in">
              {subtitle}
            </p>
          )}
          <Link href={ctaLink} className="inline-block animate-fade-in">
            <Button size="lg" className="text-lg px-10 py-5">
              {ctaText}
            </Button>
          </Link>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <svg
          className="w-6 h-6 text-white opacity-75"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
        </svg>
      </div>
    </section>
  )
}
