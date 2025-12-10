import { Metadata } from 'next'
import { Package, RefreshCw, Clock, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'İade ve Değişim Politikası | E-Ticaret',
  description: '30 gün içinde koşulsuz iade. Ücretsiz kargo ile iade ve değişim süreciniz hakkında detaylı bilgi.',
}

export default function IadeVeDegisimPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-brand-dark text-white py-16 md:py-24">
        <div className="section-container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-heading text-4xl md:text-5xl font-bold mb-6">
              İade ve Değişim Politikası
            </h1>
            <p className="text-xl text-white/80 leading-relaxed">
              Memnuniyetiniz bizim için çok önemli. 30 gün içinde koşulsuz iade
              ve ücretsiz kargo hizmetimizden yararlanabilirsiniz.
            </p>
          </div>
        </div>
      </div>

      {/* Key Highlights */}
      <div className="section-container py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="card text-center">
            <div className="w-16 h-16 bg-action/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-action" />
            </div>
            <h3 className="font-bold text-brand-dark mb-2">30 Gün</h3>
            <p className="text-sm text-brand-dark/60">İade süresi</p>
          </div>

          <div className="card text-center">
            <div className="w-16 h-16 bg-action/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-action" />
            </div>
            <h3 className="font-bold text-brand-dark mb-2">Ücretsiz Kargo</h3>
            <p className="text-sm text-brand-dark/60">İade ve değişimde</p>
          </div>

          <div className="card text-center">
            <div className="w-16 h-16 bg-action/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <RefreshCw className="w-8 h-8 text-action" />
            </div>
            <h3 className="font-bold text-brand-dark mb-2">Kolay Süreç</h3>
            <p className="text-sm text-brand-dark/60">Hızlı işlem</p>
          </div>

          <div className="card text-center">
            <div className="w-16 h-16 bg-action/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-action" />
            </div>
            <h3 className="font-bold text-brand-dark mb-2">Hızlı İade</h3>
            <p className="text-sm text-brand-dark/60">3-5 iş günü</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-12">
          {/* İade Koşulları */}
          <section>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-brand-dark mb-6">
              İade Koşulları
            </h2>
            <div className="prose prose-lg max-w-none">
              <ul className="space-y-3 text-brand-dark/70">
                <li>Ürün teslim tarihinden itibaren 30 gün içinde iade talebinde bulunabilirsiniz</li>
                <li>Ürün kullanılmamış, denenmemiş ve orijinal ambalajında olmalıdır</li>
                <li>Ürün etiketi, aksesuarları ve varsa hediyesi eksiksiz olmalıdır</li>
                <li>Kişisel hijyen gerektiren ürünler (iç giyim, kozmetik vb.) ambalajı açılmamış olmalıdır</li>
                <li>Özel üretim veya kişiselleştirilmiş ürünler iade edilemez</li>
              </ul>
            </div>
          </section>

          {/* İade Süreci */}
          <section className="bg-surface-light p-8 rounded-xl">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-brand-dark mb-6">
              İade Nasıl Yapılır?
            </h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-action text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-bold text-brand-dark mb-2">İade Talebinde Bulunun</h3>
                  <p className="text-brand-dark/70 text-sm">
                    Hesabınıza giriş yaparak "Siparişlerim" sayfasından iade etmek istediğiniz ürünü seçin
                    ve iade talebinde bulunun.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 bg-action text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-bold text-brand-dark mb-2">Kargo Kodunu Alın</h3>
                  <p className="text-brand-dark/70 text-sm">
                    İade talebiniz onaylandıktan sonra size ücretsiz kargo kodu gönderilecektir.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 bg-action text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-bold text-brand-dark mb-2">Ürünü Kargoya Verin</h3>
                  <p className="text-brand-dark/70 text-sm">
                    Ürünü orijinal ambalajında kargo firmasına teslim edin. Kargo ücreti tarafımızca karşılanacaktır.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 bg-action text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                  4
                </div>
                <div>
                  <h3 className="font-bold text-brand-dark mb-2">İadenizi Alın</h3>
                  <p className="text-brand-dark/70 text-sm">
                    Ürün depomuz ulaştıktan sonra 3-5 iş günü içinde ödemeniz iade edilecektir.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Değişim Süreci */}
          <section>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-brand-dark mb-6">
              Değişim Süreci
            </h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-brand-dark/70 mb-4">
                Beden veya renk değişimi yapmak istiyorsanız:
              </p>
              <ul className="space-y-3 text-brand-dark/70">
                <li>Yukarıdaki iade sürecini takip ederek ürünü iade edin</li>
                <li>İstediğiniz yeni ürünü web sitemizden sipariş verin</li>
                <li>İade onaylandıktan sonra ödemeniz hesabınıza aktarılacaktır</li>
                <li>Yeni siparişiniz hemen kargoya verilecektir</li>
              </ul>
            </div>
          </section>

          {/* Özel Durumlar */}
          <section className="bg-amber-50 border border-amber-200 rounded-xl p-8">
            <h2 className="font-heading text-2xl font-bold text-brand-dark mb-4">
              Hasarlı veya Hatalı Ürün
            </h2>
            <p className="text-brand-dark/70 mb-4">
              Ürününüz hasarlı veya hatalı geldi mi? Hemen bizimle iletişime geçin:
            </p>
            <ul className="space-y-2 text-brand-dark/70 text-sm mb-6">
              <li>• Telefon: +90 (212) 555 01 23</li>
              <li>• E-posta: iade@e-ticaret.com</li>
              <li>• WhatsApp: +90 (555) 123 45 67</li>
            </ul>
            <p className="text-brand-dark/70 text-sm">
              Hasarlı veya hatalı ürünlerde tüm masraflar tarafımızca karşılanır ve en kısa sürede
              değişim yapılır.
            </p>
          </section>

          {/* İade Bedeli */}
          <section>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-brand-dark mb-6">
              İade Bedeli Nasıl Alınır?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="font-bold text-brand-dark mb-3">Kredi Kartı ile Ödeme</h3>
                <p className="text-brand-dark/70 text-sm">
                  Kredi kartınıza iade, banka tarafından 3-10 iş günü içinde hesabınıza yansıyacaktır.
                </p>
              </div>

              <div className="card">
                <h3 className="font-bold text-brand-dark mb-3">Havale/EFT ile Ödeme</h3>
                <p className="text-brand-dark/70 text-sm">
                  Banka hesabınıza iade, 3-5 iş günü içinde gerçekleştirilecektir.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-surface-light py-12">
        <div className="section-container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-heading text-2xl font-bold text-brand-dark mb-4">
              Başka Sorunuz Var mı?
            </h2>
            <p className="text-brand-dark/70 mb-6">
              İade ve değişim ile ilgili daha fazla bilgi için müşteri hizmetlerimizle iletişime geçin.
            </p>
            <Link href="/iletisim" className="btn-cta inline-block">
              İletişime Geçin
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
