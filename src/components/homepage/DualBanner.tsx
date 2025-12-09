import Link from 'next/link'
import Image from 'next/image'

interface BannerItem {
  title: string
  link: string
  imageSrc: string
  imageAlt: string
}

interface DualBannerProps {
  leftBanner: BannerItem
  rightBanner: BannerItem
}

export function DualBanner({ leftBanner, rightBanner }: DualBannerProps) {
  return (
    <section className="section-container py-8 md:py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <BannerCard {...leftBanner} />
        <BannerCard {...rightBanner} />
      </div>
    </section>
  )
}

function BannerCard({ title, link, imageSrc, imageAlt }: BannerItem) {
  return (
    <Link
      href={link}
      className="group relative h-[300px] md:h-[400px] overflow-hidden rounded-2xl"
    >
      <div className="absolute inset-0">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col justify-end p-6 md:p-8">
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mb-3">
          {title}
        </h2>
        <div className="inline-flex items-center text-white font-semibold group-hover:text-action transition-colors">
          Alışveriş Yap
          <svg
            className="ml-2 w-5 h-5 transform group-hover:translate-x-1 transition-transform"
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
        </div>
      </div>
    </Link>
  )
}
