import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Çerez Politikası | E-Ticaret',
  description: 'Web sitemizde kullanılan çerezler hakkında detaylı bilgi.',
}

export default function CerezPolitikasiPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="section-container py-16 md:py-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-brand-dark mb-8">
            Çerez Politikası
          </h1>

          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <p className="text-brand-dark/70 mb-6">
                <strong>Son Güncelleme:</strong> 10 Aralık 2024
              </p>
              <p className="text-brand-dark/70 leading-relaxed">
                Bu çerez politikası, E-Ticaret web sitesinde kullanılan çerezler hakkında
                sizi bilgilendirmek amacıyla hazırlanmıştır.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-bold text-brand-dark mb-4">
                Çerez Nedir?
              </h2>
              <p className="text-brand-dark/70 leading-relaxed">
                Çerezler, bir web sitesini ziyaret ettiğinizde cihazınıza (bilgisayar, tablet,
                telefon) kaydedilen küçük metin dosyalarıdır. Çerezler, web sitesinin daha
                işlevsel çalışmasını sağlar ve kullanıcı deneyimini iyileştirir.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-bold text-brand-dark mb-4">
                Çerez Türleri
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-brand-dark mb-2">1. Zorunlu Çerezler</h3>
                  <p className="text-brand-dark/70">
                    Web sitesinin düzgün çalışması için gereklidir. Bu çerezler olmadan
                    site fonksiyonlarının çoğu kullanılamaz.
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-1 text-brand-dark/70 text-sm">
                    <li>Oturum çerezleri (session cookies)</li>
                    <li>Güvenlik çerezleri</li>
                    <li>Yük dengeleme çerezleri</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold text-brand-dark mb-2">2. Fonksiyonel Çerezler</h3>
                  <p className="text-brand-dark/70">
                    Tercihlerinizi hatırlayarak daha kişiselleştirilmiş bir deneyim sunar.
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-1 text-brand-dark/70 text-sm">
                    <li>Dil tercihleri</li>
                    <li>Bölge/konum ayarları</li>
                    <li>Görüntüleme tercihleri</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold text-brand-dark mb-2">3. Performans Çerezleri</h3>
                  <p className="text-brand-dark/70">
                    Site kullanımını analiz ederek performansı iyileştirmemize yardımcı olur.
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-1 text-brand-dark/70 text-sm">
                    <li>Ziyaretçi sayıları</li>
                    <li>En çok ziyaret edilen sayfalar</li>
                    <li>Kullanıcı akış analizi</li>
                    <li>Hata raporlama</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold text-brand-dark mb-2">4. Reklam ve Hedefleme Çerezleri</h3>
                  <p className="text-brand-dark/70">
                    İlgi alanlarınıza uygun reklamlar göstermek için kullanılır.
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-1 text-brand-dark/70 text-sm">
                    <li>Retargeting/remarketing</li>
                    <li>Kişiselleştirilmiş reklamlar</li>
                    <li>Reklam performans ölçümü</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-bold text-brand-dark mb-4">
                Kullandığımız Çerezler
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-200">
                  <thead className="bg-surface-light">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold text-brand-dark border-b">
                        Çerez Adı
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-brand-dark border-b">
                        Tür
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-brand-dark border-b">
                        Süre
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-brand-dark border-b">
                        Amaç
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    <tr className="border-b">
                      <td className="py-3 px-4">session_id</td>
                      <td className="py-3 px-4">Zorunlu</td>
                      <td className="py-3 px-4">Oturum</td>
                      <td className="py-3 px-4">Kullanıcı oturumunu tanımlar</td>
                    </tr>
                    <tr className="border-b bg-surface-light/30">
                      <td className="py-3 px-4">cart</td>
                      <td className="py-3 px-4">Zorunlu</td>
                      <td className="py-3 px-4">30 gün</td>
                      <td className="py-3 px-4">Sepet içeriğini saklar</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">preferences</td>
                      <td className="py-3 px-4">Fonksiyonel</td>
                      <td className="py-3 px-4">1 yıl</td>
                      <td className="py-3 px-4">Kullanıcı tercihlerini hatırlar</td>
                    </tr>
                    <tr className="border-b bg-surface-light/30">
                      <td className="py-3 px-4">_ga, _gid</td>
                      <td className="py-3 px-4">Performans</td>
                      <td className="py-3 px-4">2 yıl / 24 saat</td>
                      <td className="py-3 px-4">Google Analytics</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4">_fbp</td>
                      <td className="py-3 px-4">Reklam</td>
                      <td className="py-3 px-4">3 ay</td>
                      <td className="py-3 px-4">Facebook Pixel</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-bold text-brand-dark mb-4">
                Çerezleri Nasıl Kontrol Edebilirsiniz?
              </h2>
              <p className="text-brand-dark/70 leading-relaxed mb-4">
                Çerezleri kontrol etmek için birkaç seçeneğiniz var:
              </p>

              <div className="space-y-4">
                <div className="bg-surface-light p-6 rounded-xl">
                  <h3 className="font-bold text-brand-dark mb-3">1. Tarayıcı Ayarları</h3>
                  <p className="text-brand-dark/70 text-sm mb-2">
                    Tarayıcınızın ayarlarından çerezleri kontrol edebilirsiniz:
                  </p>
                  <ul className="space-y-2 text-sm text-brand-dark/70">
                    <li>• <strong>Chrome:</strong> Ayarlar → Gizlilik ve güvenlik → Çerezler</li>
                    <li>• <strong>Firefox:</strong> Ayarlar → Gizlilik ve Güvenlik → Çerezler ve Site Verileri</li>
                    <li>• <strong>Safari:</strong> Tercihler → Gizlilik → Çerezleri Yönet</li>
                    <li>• <strong>Edge:</strong> Ayarlar → Gizlilik, arama ve hizmetler → Çerezler</li>
                  </ul>
                </div>

                <div className="bg-surface-light p-6 rounded-xl">
                  <h3 className="font-bold text-brand-dark mb-3">2. Çerez Onay Paneli</h3>
                  <p className="text-brand-dark/70 text-sm">
                    İlk ziyaretinizde gördüğünüz çerez onay panelinden tercihlerinizi
                    belirleyebilirsiniz. İstediğiniz zaman bu panele tekrar erişerek
                    seçimlerinizi değiştirebilirsiniz.
                  </p>
                </div>

                <div className="bg-surface-light p-6 rounded-xl">
                  <h3 className="font-bold text-brand-dark mb-3">3. Üçüncü Taraf Araçları</h3>
                  <p className="text-brand-dark/70 text-sm mb-2">
                    Bazı üçüncü taraf çerezleri için özel ayar sayfaları:
                  </p>
                  <ul className="space-y-1 text-sm text-brand-dark/70">
                    <li>• Google Analytics: <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener" className="text-action hover:underline">Devre dışı bırak</a></li>
                    <li>• Facebook: <a href="https://www.facebook.com/settings?tab=ads" target="_blank" rel="noopener" className="text-action hover:underline">Reklam ayarları</a></li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="bg-amber-50 border border-amber-200 rounded-xl p-6">
              <h3 className="font-bold text-brand-dark mb-3">⚠️ Önemli Not</h3>
              <p className="text-brand-dark/70 text-sm">
                Zorunlu çerezleri devre dışı bırakırsanız, web sitemizin bazı işlevlerini
                kullanamazsınız. Örneğin sepetinize ürün ekleyemez, oturum açamaz veya
                sipariş veremeyebilirsiniz.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-bold text-brand-dark mb-4">
                İletişim
              </h2>
              <p className="text-brand-dark/70 leading-relaxed mb-4">
                Çerez politikamız hakkında sorularınız için:
              </p>
              <div className="bg-surface-light p-6 rounded-xl">
                <p className="text-brand-dark/70">
                  <strong>E-posta:</strong> gizlilik@e-ticaret.com<br />
                  <strong>Telefon:</strong> +90 (212) 555 01 23
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
