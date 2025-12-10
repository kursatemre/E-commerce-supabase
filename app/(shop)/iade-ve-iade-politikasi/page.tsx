import Link from 'next/link'
import { Package, Clock, CreditCard } from 'lucide-react'

export default function RefundPolicyPage() {
  const keyPoints = [
    {
      icon: Clock,
      title: 'İade Süresi',
      value: '30 Gün',
      description: 'Teslim tarihinden itibaren',
    },
    {
      icon: Package,
      title: 'İade Şartı',
      value: 'Etiketi Üzerinde',
      description: 'Kullanılmamış ve hasarsız',
    },
    {
      icon: CreditCard,
      title: 'İade Bedeli',
      value: 'Ücretsiz İade',
      description: '3-5 iş günü içinde iade',
    },
  ]

  return (
    <div className="min-h-screen py-12 md:py-20">
      <div className="section-container max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-heading text-h1 font-semibold text-brand-dark mb-4">
            İade ve Geri Ödeme Politikası
          </h1>
          <p className="text-base md:text-lg text-brand-dark/70">
            Güvenle alışveriş yapın. İade işlemleriniz kolayca gerçekleştirin
          </p>
        </div>

        {/* Key Points */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {keyPoints.map((point) => {
            const Icon = point.icon
            return (
              <div
                key={point.title}
                className="text-center p-6 bg-white border border-gray-200 rounded-xl hover:shadow-lg transition-shadow"
              >
                <div className="w-16 h-16 bg-action/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-8 h-8 text-action" />
                </div>
                <h3 className="font-semibold text-brand-dark mb-1">{point.title}</h3>
                <p className="text-2xl font-bold text-action mb-1">{point.value}</p>
                <p className="text-sm text-brand-dark/60">{point.description}</p>
              </div>
            )
          })}
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none space-y-8">
          <section className="space-y-4">
            <h2 className="font-heading text-h2 font-semibold text-brand-dark">
              1. Cayma Hakkı
            </h2>
            <p className="text-brand-dark/80 leading-relaxed">
              Mesafeli Satış Sözleşmesi kapsamında, ürün(ler)i teslim aldığınız tarihten itibaren <strong>30 gün</strong> içerisinde herhangi bir gerekçe göstermeden ve cezai şart ödemeden cayma hakkınızı kullanabilirsiniz.
            </p>
            <p className="text-brand-dark/80 leading-relaxed">
              Cayma hakkı süresi, sizin veya tarafınızca belirlenen üçüncü kişinin ürünü teslim aldığı günden itibaren başlar.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-heading text-h2 font-semibold text-brand-dark">
              2. İade Şartları
            </h2>
            <p className="text-brand-dark/80 leading-relaxed">
              İade edilecek ürün(ler) için aşağıdaki şartların sağlanması gerekmektedir:
            </p>
            <ul className="list-disc list-inside space-y-2 text-brand-dark/80 ml-4">
              <li>Ürün ambalajı açılmamış, bozulmamış ve ürün kullanılmamış olmalıdır</li>
              <li>Ürün etiketi ve ambalajı hasarsız olmalıdır</li>
              <li>İç giyim ve mayo ürünlerinde hijyen bandı açılmamış olmalıdır</li>
              <li>Ürünle birlikte gönderilen hediye, aksesuar ve ek ürünler eksiksiz olmalıdır</li>
              <li>Faturanın iade edilmesi gerekmektedir</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-heading text-h2 font-semibold text-brand-dark">
              3. İade Süreci
            </h2>
            <div className="space-y-3">
              <div className="p-4 bg-surface-light rounded-lg">
                <h4 className="font-semibold text-brand-dark mb-2">Adım 1: İade Talebi Oluşturun</h4>
                <p className="text-sm text-brand-dark/70">
                  Hesabım sayfasından &quot;Siparişlerim&quot; bölümüne girerek iade etmek istediğiniz ürünü seçin ve &quot;İade Et&quot; butonuna tıklayın.
                </p>
              </div>
              <div className="p-4 bg-surface-light rounded-lg">
                <h4 className="font-semibold text-brand-dark mb-2">Adım 2: Ürünü Paketleyin</h4>
                <p className="text-sm text-brand-dark/70">
                  Ürünü orijinal ambalajı ile birlikte özenle paketleyin. Faturanın aslını pakete ekleyin.
                </p>
              </div>
              <div className="p-4 bg-surface-light rounded-lg">
                <h4 className="font-semibold text-brand-dark mb-2">Adım 3: Kargoya Verin</h4>
                <p className="text-sm text-brand-dark/70">
                  İade kodunuz ile birlikte ürünü Aras Kargo şubesine teslim edin veya adresinizden alım talep edin. İade kargo ücreti tarafımızca karşılanacaktır.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="font-heading text-h2 font-semibold text-brand-dark">
              4. Geri Ödeme
            </h2>
            <p className="text-brand-dark/80 leading-relaxed">
              İade ettiğiniz ürün depomıza ulaştıktan ve ürün kontrolü tamamlandıktan sonra <strong>3-5 iş günü</strong> içerisinde iade bedeli ödeme yaptığınız kredi kartı veya banka hesabınıza iade edilir.
            </p>
            <p className="text-brand-dark/80 leading-relaxed">
              Kredi kartına yapılan iadelerde, banka tarafından hesabınıza yansıma süresi 2-4 hafta arasında değişiklik gösterebilir.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-heading text-h2 font-semibold text-brand-dark">
              5. Cayma Hakkı Kullanılamayacak Ürünler
            </h2>
            <p className="text-brand-dark/80 leading-relaxed">
              Aşağıdaki durumlarda cayma hakkı kullanılamaz:
            </p>
            <ul className="list-disc list-inside space-y-2 text-brand-dark/80 ml-4">
              <li>Hijyen bandı açılmış iç giyim, mayo ve kozmetik ürünleri</li>
              <li>Tek kullanımlık ürünler</li>
              <li>Hızla bozulabilir veya son kullanma tarihi geçebilecek ürünler</li>
              <li>Tüketicinin istekleri doğrultusunda özel olarak hazırlanmış ürünler</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-heading text-h2 font-semibold text-brand-dark">
              6. Değişim
            </h2>
            <p className="text-brand-dark/80 leading-relaxed">
              Beden veya renk değişimi için öncelikle iade işlemi başlatmanız, ardından istediğiniz yeni ürün için sipariş vermeniz gerekmektedir. İade işlemi tamamlandıktan sonra yeni siparişinizin ödemesi yapılacaktır.
            </p>
          </section>
        </div>

        {/* Contact CTA */}
        <div className="mt-12 p-8 bg-action/5 rounded-2xl text-center">
          <h3 className="font-heading text-xl font-semibold text-brand-dark mb-3">
            İade Konusunda Yardıma mı İhtiyacınız Var?
          </h3>
          <p className="text-brand-dark/70 mb-6">
            Müşteri hizmetlerimiz her zaman yardımınıza hazır
          </p>
          <Link
            href="/iletisim"
            className="inline-block px-8 py-3 bg-action text-white font-semibold rounded-button shadow-button-depth hover:bg-action-hover hover:shadow-button-depth-hover hover:-translate-y-0.5 transition-all"
          >
            Bize Ulaşın
          </Link>
        </div>
      </div>
    </div>
  )
}
