import { Metadata } from 'next'
import { MapPin, Phone, Clock } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Mağazalarımız | E-Ticaret',
  description: 'Fiziksel mağazalarımızı ziyaret edin. Adresler, çalışma saatleri ve iletişim bilgileri.',
}

const stores = [
  {
    name: 'İstanbul - Kadıköy Mağazası',
    address: 'Bahariye Caddesi No:123, Kadıköy, İstanbul',
    phone: '+90 (216) 555 01 23',
    hours: 'Pazartesi - Cumartesi: 10:00 - 20:00\nPazar: 11:00 - 19:00',
    mapUrl: 'https://maps.google.com',
  },
  {
    name: 'İstanbul - Nişantaşı Mağazası',
    address: 'Teşvikiye Caddesi No:45, Şişli, İstanbul',
    phone: '+90 (212) 555 04 56',
    hours: 'Pazartesi - Cumartesi: 10:00 - 20:00\nPazar: 11:00 - 19:00',
    mapUrl: 'https://maps.google.com',
  },
  {
    name: 'Ankara - Çankaya Mağazası',
    address: 'Tunalı Hilmi Caddesi No:67, Çankaya, Ankara',
    phone: '+90 (312) 555 07 89',
    hours: 'Pazartesi - Cumartesi: 10:00 - 20:00\nPazar: 11:00 - 19:00',
    mapUrl: 'https://maps.google.com',
  },
  {
    name: 'İzmir - Alsancak Mağazası',
    address: 'Kıbrıs Şehitleri Caddesi No:89, Konak, İzmir',
    phone: '+90 (232) 555 03 45',
    hours: 'Pazartesi - Cumartesi: 10:00 - 20:00\nPazar: 11:00 - 19:00',
    mapUrl: 'https://maps.google.com',
  },
]

export default function MagazalarimizPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-brand-dark text-white py-16 md:py-24">
        <div className="section-container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-heading text-4xl md:text-5xl font-bold mb-6">
              Mağazalarımız
            </h1>
            <p className="text-xl text-white/80 leading-relaxed">
              Ürünlerimizi yakından görmek, deneyimlemek ve uzman ekibimizden
              destek almak için mağazalarımızı ziyaret edebilirsiniz.
            </p>
          </div>
        </div>
      </div>

      {/* Stores Grid */}
      <div className="section-container py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {stores.map((store, index) => (
            <div key={index} className="card hover:shadow-lg transition-shadow">
              <h2 className="font-heading text-2xl font-bold text-brand-dark mb-6">
                {store.name}
              </h2>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <MapPin className="w-5 h-5 text-action flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-brand-dark text-sm mb-1">Adres</p>
                    <p className="text-brand-dark/70 text-sm">{store.address}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Phone className="w-5 h-5 text-action flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-brand-dark text-sm mb-1">Telefon</p>
                    <a
                      href={`tel:${store.phone.replace(/\s/g, '')}`}
                      className="text-brand-dark/70 text-sm hover:text-action transition-colors"
                    >
                      {store.phone}
                    </a>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Clock className="w-5 h-5 text-action flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-brand-dark text-sm mb-1">Çalışma Saatleri</p>
                    <p className="text-brand-dark/70 text-sm whitespace-pre-line">{store.hours}</p>
                  </div>
                </div>
              </div>

              <a
                href={store.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary w-full mt-6 text-center inline-block"
              >
                Haritada Görüntüle
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-surface-light py-12">
        <div className="section-container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-heading text-2xl font-bold text-brand-dark mb-4">
              Mağazalarımızda Neler Sunuyoruz?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div>
                <p className="font-semibold text-brand-dark mb-2">Ürün Deneyimi</p>
                <p className="text-sm text-brand-dark/60">
                  Tüm ürünlerimizi yakından inceleyebilir ve deneyebilirsiniz
                </p>
              </div>
              <div>
                <p className="font-semibold text-brand-dark mb-2">Uzman Destek</p>
                <p className="text-sm text-brand-dark/60">
                  Deneyimli ekibimiz size en uygun ürünleri bulmada yardımcı olur
                </p>
              </div>
              <div>
                <p className="font-semibold text-brand-dark mb-2">Hızlı Teslimat</p>
                <p className="text-sm text-brand-dark/60">
                  Mağazadan alım yaparak ürününüze anında sahip olun
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
