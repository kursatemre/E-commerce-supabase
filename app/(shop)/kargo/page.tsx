import { Metadata } from 'next'
import { Truck, Package, MapPin, Clock } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Kargo Bilgileri | E-Ticaret',
  description: 'Kargo süreleri, teslimat bölgeleri ve gönderi takibi hakkında bilgi alın.',
}

export default function KargoPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-brand-dark text-white py-16 md:py-24">
        <div className="section-container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-heading text-4xl md:text-5xl font-bold mb-6">
              Kargo Bilgileri
            </h1>
            <p className="text-xl text-white/80 leading-relaxed">
              Siparişleriniz hızlı ve güvenli bir şekilde adresinize ulaşıyor.
            </p>
          </div>
        </div>
      </div>

      {/* Key Features */}
      <div className="section-container py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="card text-center">
            <div className="w-16 h-16 bg-action/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Truck className="w-8 h-8 text-action" />
            </div>
            <h3 className="font-bold text-brand-dark mb-2">Hızlı Teslimat</h3>
            <p className="text-sm text-brand-dark/60">1-3 iş günü</p>
          </div>

          <div className="card text-center">
            <div className="w-16 h-16 bg-action/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-action" />
            </div>
            <h3 className="font-bold text-brand-dark mb-2">Ücretsiz Kargo</h3>
            <p className="text-sm text-brand-dark/60">500 TL ve üzeri</p>
          </div>

          <div className="card text-center">
            <div className="w-16 h-16 bg-action/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-action" />
            </div>
            <h3 className="font-bold text-brand-dark mb-2">Türkiye Geneli</h3>
            <p className="text-sm text-brand-dark/60">Tüm illere gönderim</p>
          </div>

          <div className="card text-center">
            <div className="w-16 h-16 bg-action/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-action" />
            </div>
            <h3 className="font-bold text-brand-dark mb-2">Canlı Takip</h3>
            <p className="text-sm text-brand-dark/60">Anlık bildirimler</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-12">
          {/* Kargo Ücretleri */}
          <section>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-brand-dark mb-6">
              Kargo Ücretleri
            </h2>
            <div className="card">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-brand-dark">Sipariş Tutarı</th>
                      <th className="text-left py-3 px-4 font-semibold text-brand-dark">Kargo Ücreti</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4 text-brand-dark/70">500 TL ve üzeri</td>
                      <td className="py-3 px-4 font-semibold text-green-600">Ücretsiz</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4 text-brand-dark/70">500 TL altı</td>
                      <td className="py-3 px-4 text-brand-dark/70">29,90 TL</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Teslimat Süreleri */}
          <section className="bg-surface-light p-8 rounded-xl">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-brand-dark mb-6">
              Teslimat Süreleri
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-2 h-2 bg-action rounded-full mt-2 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-brand-dark mb-1">Büyükşehirler</h3>
                  <p className="text-brand-dark/70 text-sm">
                    İstanbul, Ankara, İzmir: 1-2 iş günü
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-2 h-2 bg-action rounded-full mt-2 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-brand-dark mb-1">Diğer İller</h3>
                  <p className="text-brand-dark/70 text-sm">
                    2-3 iş günü
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-2 h-2 bg-action rounded-full mt-2 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-brand-dark mb-1">Uzak Bölgeler</h3>
                  <p className="text-brand-dark/70 text-sm">
                    3-5 iş günü (dağ köyleri, adalar vb.)
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-6">
              <p className="text-sm text-brand-dark/70">
                <strong>Not:</strong> Teslimat süreleri, ürünün stokta olması durumunda geçerlidir.
                Özel üretim veya tedarikçiden gelen ürünlerde teslimat süresi değişiklik gösterebilir.
              </p>
            </div>
          </section>

          {/* Kargo Takibi */}
          <section>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-brand-dark mb-6">
              Kargo Takibi
            </h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-brand-dark/70 mb-4">
                Siparişiniz kargoya verildikten sonra:
              </p>
              <ul className="space-y-3 text-brand-dark/70">
                <li>E-posta ve SMS ile kargo takip numaranız gönderilir</li>
                <li>&quot;Hesabım&quot; &gt; &quot;Siparişlerim&quot; bölümünden kargo durumunu görüntüleyebilirsiniz</li>
                <li>Kargo firmasının web sitesinden anlık takip yapabilirsiniz</li>
                <li>Teslimattan önce kargo görevlisi sizi arayacaktır</li>
              </ul>
            </div>
          </section>

          {/* Kargo Firmaları */}
          <section className="card">
            <h2 className="font-heading text-2xl font-bold text-brand-dark mb-4">
              Çalıştığımız Kargo Firmaları
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="border border-gray-200 rounded-lg p-4 text-center">
                <p className="font-semibold text-brand-dark text-sm">Yurtiçi Kargo</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 text-center">
                <p className="font-semibold text-brand-dark text-sm">Aras Kargo</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 text-center">
                <p className="font-semibold text-brand-dark text-sm">MNG Kargo</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 text-center">
                <p className="font-semibold text-brand-dark text-sm">PTT Kargo</p>
              </div>
            </div>
          </section>

          {/* Teslimat Bilgileri */}
          <section className="bg-blue-50 border border-blue-200 rounded-xl p-8">
            <h2 className="font-heading text-2xl font-bold text-brand-dark mb-4">
              Teslimat Sırasında Dikkat Edilmesi Gerekenler
            </h2>
            <ul className="space-y-3 text-brand-dark/70">
              <li>• Ürünü teslim alırken kargo görevlisinin yanında açıp kontrol edin</li>
              <li>• Hasar veya eksiklik varsa &quot;Hasarlı Teslim Tutanağı&quot; tutturu</li>
              <li>• Fatura ve kargo evraklarını saklayın</li>
              <li>• Teslimat adresi değişiklikleri için kargo firmasını arayın</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}
