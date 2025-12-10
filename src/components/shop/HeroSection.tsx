'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

type HeroSlide = {
  id: number
  title: string
  subtitle: string
  ctaText: string
  ctaLink: string
  image: string
  mobileImage?: string
}

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const slides: HeroSlide[] = [
    {
      id: 1,
      title: 'Sessiz Devrim',
      subtitle: 'Zamansız tasarımlarımızla tanışın',
      ctaText: 'Koleksiyonu Keşfet',
      ctaLink: '/categories/kadin-elbiseleri',
      image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1920&q=80',
      mobileImage: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80'
    },
    {
      id: 2,
      title: 'Minimalist Şıklık',
      subtitle: 'Her detayda zarafet',
      ctaText: 'Şimdi Keşfet',
      ctaLink: '/categories/erkek-dis-giyim',
      image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&q=80',
      mobileImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80'
    }
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 6000)

    return () => clearInterval(timer)
  }, [slides.length])

  const currentHero = slides[currentSlide]

  return (
    <section className="relative h-[70vh] md:h-[80vh] w-full overflow-hidden">
      {/* Hero Images - Transition between slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Desktop Image */}
          <div
            className="hidden md:block absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${slide.image}')` }}
          />
          {/* Mobile Image */}
          <div
            className="md:hidden absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${slide.mobileImage || slide.image}')` }}
          />
          {/* Overlay for text contrast - Opak Siyah */}
          <div className="absolute inset-0 bg-overlay-dark" />
        </div>
      ))}

      {/* Hero Content */}
      <div className="relative h-full flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold mb-4 md:mb-6 animate-fade-in">
            {currentHero.title}
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl mb-8 md:mb-12 font-light max-w-2xl mx-auto animate-fade-in">
            {currentHero.subtitle}
          </p>
          <Link
            href={currentHero.ctaLink}
            className="inline-block px-8 md:px-12 py-3 md:py-4 bg-action text-white font-semibold text-base md:text-lg rounded-button shadow-button-depth hover:bg-action-hover hover:shadow-button-depth-hover hover:-translate-y-0.5 transition-all duration-200 animate-fade-in"
          >
            {currentHero.ctaText}
          </Link>
        </div>
      </div>

      {/* Slide Indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center gap-2 z-10">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'bg-white w-8'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Optional: Horizontal scroll hint for additional slides */}
      {slides.length > 2 && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-4">
          {slides.slice(1, 3).map((slide, idx) => (
            <button
              key={slide.id}
              onClick={() => setCurrentSlide(idx + 1)}
              className={`w-16 h-24 rounded-lg overflow-hidden border-2 transition-all ${
                currentSlide === idx + 1
                  ? 'border-action scale-110'
                  : 'border-white/30 hover:border-white/60'
              }`}
            >
              <div
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: `url('${slide.image}')` }}
              />
            </button>
          ))}
        </div>
      )}
    </section>
  )
}
