import { Metadata } from 'next'
import { Briefcase, Heart, TrendingUp, Users } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Kariyer | E-Ticaret',
  description: 'Ekibimize katılın! Açık pozisyonlar, çalışan avantajları ve başvuru bilgileri.',
}

const openPositions = [
  {
    title: 'Kıdemli Frontend Developer',
    department: 'Teknoloji',
    location: 'İstanbul (Hibrit)',
    type: 'Tam Zamanlı',
  },
  {
    title: 'Dijital Pazarlama Uzmanı',
    department: 'Pazarlama',
    location: 'İstanbul',
    type: 'Tam Zamanlı',
  },
  {
    title: 'Müşteri Deneyimi Uzmanı',
    department: 'Müşteri Hizmetleri',
    location: 'Uzaktan',
    type: 'Tam Zamanlı',
  },
  {
    title: 'Ürün Tasarımcısı',
    department: 'Tasarım',
    location: 'İstanbul',
    type: 'Tam Zamanlı',
  },
]

export default function KariyerPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-brand-dark text-white py-16 md:py-24">
        <div className="section-container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-heading text-4xl md:text-5xl font-bold mb-6">
              Ekibimize Katılın
            </h1>
            <p className="text-xl text-white/80 leading-relaxed">
              Sakin çekiciliğin gücüne inanan, yenilikçi ve tutkulu bir ekiple
              çalışmak ister misiniz? Sizi aramızda görmekten mutluluk duyarız.
            </p>
          </div>
        </div>
      </div>

      {/* Why Work With Us */}
      <div className="section-container py-16 md:py-20">
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-brand-dark mb-12 text-center">
          Neden Bizimle Çalışmalısınız?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="card text-center">
            <div className="w-16 h-16 bg-action/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-action" />
            </div>
            <h3 className="font-heading font-bold text-xl text-brand-dark mb-3">
              Gelişim Fırsatları
            </h3>
            <p className="text-brand-dark/60 text-sm">
              Eğitim programları, mentorluk ve kariyer gelişim planları
            </p>
          </div>

          <div className="card text-center">
            <div className="w-16 h-16 bg-action/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-action" />
            </div>
            <h3 className="font-heading font-bold text-xl text-brand-dark mb-3">
              İş-Yaşam Dengesi
            </h3>
            <p className="text-brand-dark/60 text-sm">
              Esnek çalışma saatleri ve uzaktan çalışma imkanı
            </p>
          </div>

          <div className="card text-center">
            <div className="w-16 h-16 bg-action/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-action" />
            </div>
            <h3 className="font-heading font-bold text-xl text-brand-dark mb-3">
              Harika Ekip
            </h3>
            <p className="text-brand-dark/60 text-sm">
              Destekleyici, yenilikçi ve çeşitli bir çalışma ortamı
            </p>
          </div>

          <div className="card text-center">
            <div className="w-16 h-16 bg-action/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-8 h-8 text-action" />
            </div>
            <h3 className="font-heading font-bold text-xl text-brand-dark mb-3">
              Rekabetçi Maaş
            </h3>
            <p className="text-brand-dark/60 text-sm">
              Piyasa üstü ücret, ikramiye ve yan haklar
            </p>
          </div>
        </div>
      </div>

      {/* Open Positions */}
      <div className="bg-surface-light py-16 md:py-20">
        <div className="section-container">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-brand-dark mb-12 text-center">
            Açık Pozisyonlar
          </h2>
          <div className="max-w-4xl mx-auto space-y-4">
            {openPositions.map((position, index) => (
              <div key={index} className="card hover:shadow-lg transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-heading text-xl font-bold text-brand-dark mb-2">
                      {position.title}
                    </h3>
                    <div className="flex flex-wrap gap-3 text-sm text-brand-dark/60">
                      <span>{position.department}</span>
                      <span>•</span>
                      <span>{position.location}</span>
                      <span>•</span>
                      <span>{position.type}</span>
                    </div>
                  </div>
                  <Link
                    href="/iletisim"
                    className="btn-secondary whitespace-nowrap text-center"
                  >
                    Başvur
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="section-container py-16 md:py-20">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-brand-dark mb-6">
            Uygun Pozisyon Bulamadınız mı?
          </h2>
          <p className="text-brand-dark/70 mb-8">
            Aradığınız pozisyonu listede göremediniz mi? Yine de sizinle
            tanışmaktan mutluluk duyarız. CV'nizi bizimle paylaşın!
          </p>
          <Link href="/iletisim" className="btn-cta inline-block">
            Özgeçmişinizi Gönderin
          </Link>
        </div>
      </div>
    </div>
  )
}
