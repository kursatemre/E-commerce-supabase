import { Metadata } from 'next'
import { Building2, Heart, Leaf, Users } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Hakkımızda | E-Ticaret',
  description: 'Markamızın hikayesi, değerlerimiz ve misyonumuz. Sakin çekiciliğin gücünü yaşayın.',
}

export default function HakkimizdaPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-brand-dark text-white py-16 md:py-24">
        <div className="section-container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-heading text-4xl md:text-5xl font-bold mb-6">
              Sakin Çekiciliğin Gücü
            </h1>
            <p className="text-xl text-white/80 leading-relaxed">
              Kaliteli, sürdürülebilir ve stil sahibi ürünlerle hayatınıza değer katıyoruz.
              2020 yılından bu yana, sadeliği ve kaliteyi bir araya getirerek
              müşterilerimize benzersiz bir alışveriş deneyimi sunuyoruz.
            </p>
          </div>
        </div>
      </div>

      {/* Story Section */}
      <div className="section-container py-16 md:py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-brand-dark mb-8 text-center">
            Hikayemiz
          </h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-brand-dark/70 leading-relaxed mb-6">
              E-Ticaret, 2020 yılında &quot;sakin çekicilik&quot; felsefesiyle yola çıktı.
              Gürültülü ve agresif pazarlama taktiklerinin aksine, kaliteli ürünlerin
              ve içten hizmetin kendini göstereceğine inanıyoruz.
            </p>
            <p className="text-brand-dark/70 leading-relaxed mb-6">
              Başlangıçta küçük bir ekiple hayata geçirdiğimiz projemiz, bugün binlerce
              müşteriye hizmet veren, güvenilir bir marka haline geldi. Her ürünü özenle
              seçiyor, her müşteri deneyimini titizlikle tasarlıyoruz.
            </p>
            <p className="text-brand-dark/70 leading-relaxed">
              Vizyonumuz, sürdürülebilir, kaliteli ve estetik ürünlerin herkes için
              erişilebilir olduğu bir dünya yaratmak. Bu yolculukta bize eşlik ettiğiniz
              için teşekkür ederiz.
            </p>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="bg-surface-light py-16 md:py-20">
        <div className="section-container">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-brand-dark mb-12 text-center">
            Değerlerimiz
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="card text-center">
              <div className="w-16 h-16 bg-action/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-action" />
              </div>
              <h3 className="font-heading font-bold text-xl text-brand-dark mb-3">
                Müşteri Odaklılık
              </h3>
              <p className="text-brand-dark/60 text-sm">
                Her kararımızda müşterilerimizin memnuniyetini ve ihtiyaçlarını
                ön planda tutuyoruz.
              </p>
            </div>

            <div className="card text-center">
              <div className="w-16 h-16 bg-action/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Leaf className="w-8 h-8 text-action" />
              </div>
              <h3 className="font-heading font-bold text-xl text-brand-dark mb-3">
                Sürdürülebilirlik
              </h3>
              <p className="text-brand-dark/60 text-sm">
                Çevreye duyarlı üretim ve ambalajlama süreçleriyle geleceğe
                katkıda bulunuyoruz.
              </p>
            </div>

            <div className="card text-center">
              <div className="w-16 h-16 bg-action/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-action" />
              </div>
              <h3 className="font-heading font-bold text-xl text-brand-dark mb-3">
                Kalite
              </h3>
              <p className="text-brand-dark/60 text-sm">
                Her ürünü titizlikle seçiyor, kalite kontrollerinden geçiriyoruz.
              </p>
            </div>

            <div className="card text-center">
              <div className="w-16 h-16 bg-action/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-action" />
              </div>
              <h3 className="font-heading font-bold text-xl text-brand-dark mb-3">
                Şeffaflık
              </h3>
              <p className="text-brand-dark/60 text-sm">
                Açık iletişim, dürüst fiyatlandırma ve net politikalarla
                güven inşa ediyoruz.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="section-container py-16 md:py-20">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-brand-dark mb-6">
            Bizimle İletişime Geçin
          </h2>
          <p className="text-brand-dark/70 mb-8">
            Sorularınız, önerileriniz veya iş birliği teklifleriniz için
            her zaman buradayız.
          </p>
          <Link href="/iletisim" className="btn-cta inline-block">
            İletişim
          </Link>
        </div>
      </div>
    </div>
  )
}
