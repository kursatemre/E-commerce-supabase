import { Metadata } from 'next'
import Link from 'next/link'
import { Mail, MapPin, Phone, Clock } from 'lucide-react'

export const metadata: Metadata = {
  title: 'İletişim | E-Ticaret',
  description: 'Bizimle iletişime geçin. İletişim formu, telefon, e-posta ve adres bilgileri.',
}

export default function IletisimPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-brand-dark text-white py-16 md:py-24">
        <div className="section-container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-heading text-4xl md:text-5xl font-bold mb-6">
              İletişim
            </h1>
            <p className="text-xl text-white/80 leading-relaxed">
              Sorularınız, önerileriniz veya geri bildirimleriniz için
              bizimle iletişime geçebilirsiniz. Size yardımcı olmaktan mutluluk duyarız.
            </p>
          </div>
        </div>
      </div>

      <div className="section-container py-16 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <h2 className="font-heading text-2xl font-bold text-brand-dark mb-6">
              Mesaj Gönderin
            </h2>
            <form className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-brand-dark mb-2">
                  Ad Soyad *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full px-4 py-3 rounded-button border border-gray-300 focus:border-action focus:ring-2 focus:ring-action/50 focus:outline-none transition-colors"
                  placeholder="Adınız ve soyadınız"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-brand-dark mb-2">
                  E-posta *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full px-4 py-3 rounded-button border border-gray-300 focus:border-action focus:ring-2 focus:ring-action/50 focus:outline-none transition-colors"
                  placeholder="ornek@email.com"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-brand-dark mb-2">
                  Telefon
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="w-full px-4 py-3 rounded-button border border-gray-300 focus:border-action focus:ring-2 focus:ring-action/50 focus:outline-none transition-colors"
                  placeholder="+90 (5XX) XXX XX XX"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-semibold text-brand-dark mb-2">
                  Konu *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  required
                  className="w-full px-4 py-3 rounded-button border border-gray-300 focus:border-action focus:ring-2 focus:ring-action/50 focus:outline-none transition-colors"
                  placeholder="Mesajınızın konusu"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-brand-dark mb-2">
                  Mesaj *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={6}
                  className="w-full px-4 py-3 rounded-button border border-gray-300 focus:border-action focus:ring-2 focus:ring-action/50 focus:outline-none transition-colors resize-none"
                  placeholder="Mesajınızı buraya yazın..."
                />
              </div>

              <button type="submit" className="btn-cta w-full">
                Mesajı Gönder
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div>
            <h2 className="font-heading text-2xl font-bold text-brand-dark mb-6">
              İletişim Bilgileri
            </h2>
            <div className="space-y-6">
              <div className="card">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-action/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-action" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-brand-dark mb-2">Telefon</h3>
                    <p className="text-brand-dark/70 text-sm mb-1">
                      <a href="tel:+902125550123" className="hover:text-action transition-colors">
                        +90 (212) 555 01 23
                      </a>
                    </p>
                    <p className="text-brand-dark/70 text-sm">
                      <a href="tel:+905551234567" className="hover:text-action transition-colors">
                        +90 (555) 123 45 67
                      </a>
                    </p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-action/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-action" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-brand-dark mb-2">E-posta</h3>
                    <p className="text-brand-dark/70 text-sm mb-1">
                      <a href="mailto:info@e-ticaret.com" className="hover:text-action transition-colors">
                        info@e-ticaret.com
                      </a>
                    </p>
                    <p className="text-brand-dark/70 text-sm">
                      <a href="mailto:destek@e-ticaret.com" className="hover:text-action transition-colors">
                        destek@e-ticaret.com
                      </a>
                    </p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-action/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-action" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-brand-dark mb-2">Adres</h3>
                    <p className="text-brand-dark/70 text-sm">
                      Merkez Ofis: Teşvikiye Mahallesi,<br />
                      Halaskargazi Caddesi No:123<br />
                      Şişli, İstanbul 34357
                    </p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-action/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-action" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-brand-dark mb-2">Çalışma Saatleri</h3>
                    <p className="text-brand-dark/70 text-sm">
                      Pazartesi - Cuma: 09:00 - 18:00<br />
                      Cumartesi: 10:00 - 17:00<br />
                      Pazar: Kapalı
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Link */}
      <div className="bg-surface-light py-12">
        <div className="section-container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-heading text-2xl font-bold text-brand-dark mb-4">
              Sıkça Sorulan Sorular
            </h2>
            <p className="text-brand-dark/70 mb-6">
              Aradığınız cevabı bulamadınız mı? Sıkça sorulan sorular sayfamızı ziyaret edin.
            </p>
            <Link href="/sss" className="btn-secondary inline-block">
              SSS&apos;yi İncele
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
