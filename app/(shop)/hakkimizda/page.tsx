import Link from 'next/link'
import Image from 'next/image'

export default function AboutPage() {
  const values = [
    {
      icon: '🌱',
      title: 'Sürdürülebilirlik',
      description: 'Çevre dostu üretim ve malzemelerle geleceği koruyoruz',
    },
    {
      icon: '✨',
      title: 'Kalite',
      description: 'Her detayda mükemmellik için özenle üretiyoruz',
    },
    {
      icon: '🤝',
      title: 'Güven',
      description: 'Müşterilerimizle uzun vadeli ilişkiler kuruyoruz',
    },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[40vh] md:h-[50vh] bg-surface-light overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/50" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-semibold mb-4">
              Hikayemiz
            </h1>
            <p className="text-lg md:text-xl max-w-2xl mx-auto">
              Zamansız tasarımlar ve kaliteli üretimle başlayan bir yolculuk
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="section-container py-12 md:py-20">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Our Beginning */}
          <div className="space-y-4">
            <h2 className="font-heading text-h2 font-semibold text-brand-dark">
              Başlangıç
            </h2>
            <p className="text-base md:text-lg text-brand-dark/80 leading-relaxed">
              2020 yılında, modanın sadece giyim değil, bir yaşam tarzı olduğuna inanan bir ekip olarak yola çıktık.
              Hedefimiz, kaliteden ödün vermeden, herkesin ulaşabileceği zamansız tasarımlar sunmaktı.
            </p>
            <p className="text-base md:text-lg text-brand-dark/80 leading-relaxed">
              Küçük bir atölyede başlayan yolculuğumuz, bugün binlerce mutlu müşteriyle devam ediyor.
              Her ürünümüzde, tasarımdan üretim aşamasına kadar gösterdiğimiz özeni hissedebilirsiniz.
            </p>
          </div>

          {/* Our Values */}
          <div className="space-y-8">
            <h2 className="font-heading text-h2 font-semibold text-brand-dark text-center">
              Değerlerimiz
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {values.map((value) => (
                <div
                  key={value.title}
                  className="text-center p-6 rounded-2xl bg-surface-light hover:shadow-lg transition-shadow"
                >
                  <div className="text-5xl mb-4">{value.icon}</div>
                  <h3 className="font-heading text-xl font-semibold text-brand-dark mb-2">
                    {value.title}
                  </h3>
                  <p className="text-sm text-brand-dark/70">{value.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Our Mission */}
          <div className="space-y-4 bg-action/5 p-8 md:p-12 rounded-2xl">
            <h2 className="font-heading text-h2 font-semibold text-brand-dark">
              Misyonumuz
            </h2>
            <p className="text-base md:text-lg text-brand-dark/80 leading-relaxed">
              Her gün daha iyi olmak, müşterilerimize en kaliteli ürünleri sunmak ve modayı herkes için
              erişilebilir kılmak. Sürdürülebilir üretim anlayışımızla, geleceğe değer katıyoruz.
            </p>
          </div>

          {/* Team Section */}
          <div className="space-y-4">
            <h2 className="font-heading text-h2 font-semibold text-brand-dark">
              Ekibimiz
            </h2>
            <p className="text-base md:text-lg text-brand-dark/80 leading-relaxed">
              50+ kişilik tutkulu ekibimiz, tasarımdan müşteri hizmetlerine kadar her aşamada sizin için çalışıyor.
              Her birimiz, modanın insanlara dokunduğu noktada fark yaratmak için buradayız.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-container py-12 md:py-16">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="font-heading text-2xl md:text-3xl font-semibold text-brand-dark">
            Hikayemizin Bir Parçası Olun
          </h2>
          <p className="text-base md:text-lg text-brand-dark/70">
            Kaliteli ve zamansız tasarımlarımızı keşfedin
          </p>
          <Link
            href="/"
            className="inline-block px-8 md:px-12 py-3 md:py-4 bg-action text-white font-semibold text-base md:text-lg rounded-button hover:bg-action-hover hover:shadow-button-hover hover:-translate-y-0.5 transition-all"
          >
            Alışverişe Başla
          </Link>
        </div>
      </section>
    </div>
  )
}
