'use client'

import { useState } from 'react'
import { Mail, Phone, MapPin, Clock } from 'lucide-react'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setSubmitted(true)
    setIsSubmitting(false)
    setFormData({ name: '', email: '', message: '' })

    setTimeout(() => setSubmitted(false), 5000)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const contactInfo = [
    {
      icon: Mail,
      title: 'E-posta',
      value: 'destek@example.com',
      description: '2 saat içinde yanıt veriyoruz',
    },
    {
      icon: Phone,
      title: 'Telefon',
      value: '+90 (212) 123 45 67',
      description: 'Hafta içi 09:00 - 18:00',
    },
    {
      icon: MapPin,
      title: 'Adres',
      value: 'Maslak Mahallesi, Sarıyer',
      description: 'İstanbul, Türkiye',
    },
    {
      icon: Clock,
      title: 'Çalışma Saatleri',
      value: 'Pazartesi - Cuma',
      description: '09:00 - 18:00',
    },
  ]

  return (
    <div className="min-h-screen py-12 md:py-20">
      <div className="section-container">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h1 className="font-heading text-h1 font-semibold text-brand-dark mb-4">
            Bize Ulaşın
          </h1>
          <p className="text-base md:text-lg text-brand-dark/70 max-w-2xl mx-auto">
            Sorularınız, önerileriniz veya her türlü konuda bizimle iletişime geçebilirsiniz
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Contact Form */}
          <div>
            <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8">
              <div className="mb-6">
                <h2 className="font-heading text-h3 font-semibold text-brand-dark mb-2">
                  Mesaj Gönderin
                </h2>
                <p className="text-sm text-action font-medium">
                  ⏱️ Ortalama yanıt süresi: 2 saat
                </p>
              </div>

              {submitted && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 text-sm font-medium">
                    ✓ Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-brand-dark mb-2">
                    Adınız Soyadınız
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-surface-light border border-gray-200 rounded-button focus:outline-none focus:border-action focus:ring-2 focus:ring-action/20 transition-all"
                    placeholder="Adınızı girin"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-brand-dark mb-2">
                    E-posta Adresiniz
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-surface-light border border-gray-200 rounded-button focus:outline-none focus:border-action focus:ring-2 focus:ring-action/20 transition-all"
                    placeholder="ornek@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-brand-dark mb-2">
                    Mesajınız
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 bg-surface-light border border-gray-200 rounded-button focus:outline-none focus:border-action focus:ring-2 focus:ring-action/20 transition-all resize-none"
                    placeholder="Mesajınızı buraya yazın..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-6 py-3 bg-action text-white font-semibold rounded-button shadow-button-depth hover:bg-action-hover hover:shadow-button-depth-hover hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none"
                >
                  {isSubmitting ? 'Gönderiliyor...' : 'Mesaj Gönder'}
                </button>
              </form>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h2 className="font-heading text-h3 font-semibold text-brand-dark mb-6">
              İletişim Bilgileri
            </h2>

            <div className="space-y-4">
              {contactInfo.map((info) => {
                const Icon = info.icon
                return (
                  <div
                    key={info.title}
                    className="flex items-start gap-4 p-5 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex-shrink-0 w-12 h-12 bg-action/10 rounded-full flex items-center justify-center">
                      <Icon className="w-6 h-6 text-action" />
                    </div>
                    <div>
                      <h3 className="font-medium text-brand-dark mb-1">{info.title}</h3>
                      <p className="text-brand-dark font-semibold mb-0.5">{info.value}</p>
                      <p className="text-sm text-brand-dark/60">{info.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Map Placeholder */}
            <div className="mt-8 rounded-2xl overflow-hidden border border-gray-200">
              <div className="aspect-video bg-surface-light flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-12 h-12 text-brand-dark/40 mx-auto mb-2" />
                  <p className="text-sm text-brand-dark/60">Harita Görünümü</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
