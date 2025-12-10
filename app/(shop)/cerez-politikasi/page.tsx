import Link from 'next/link'

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen py-12 md:py-20">
      <div className="section-container max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="font-heading text-h1 font-semibold text-brand-dark mb-4">
            Çerez Politikası
          </h1>
          <p className="text-sm text-brand-dark/60">Son Güncellenme: 10 Aralık 2025</p>
        </div>

        <div className="prose prose-lg max-w-none space-y-8 text-brand-dark/80">
          <section className="space-y-4">
            <h2 className="font-heading text-h2 font-semibold text-brand-dark">1. Çerez Nedir?</h2>
            <p className="leading-relaxed">
              Çerezler, ziyaret ettiğiniz internet siteleri tarafından tarayıcılar aracılığıyla cihazınıza veya ağ sunucusuna depolanan küçük metin dosyalarıdır. Web sitemizi ziyaret ettiğinizde, kişisel verilerinizi içerebilecek çerezler cihazınıza yerleştirilebilir.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-heading text-h2 font-semibold text-brand-dark">2. Çerez Kullanım Amacımız</h2>
            <p className="leading-relaxed">Web sitemizde çerezleri aşağıdaki amaçlarla kullanmaktayız:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Web sitesinin düzgün çalışmasını sağlamak</li>
              <li>Kullanıcı deneyimini iyileştirmek ve kişiselleştirmek</li>
              <li>Web sitesi performansını analiz etmek ve geliştirmek</li>
              <li>Pazarlama ve reklam faaliyetlerini yönetmek</li>
              <li>Güvenlik önlemlerini sağlamak</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-heading text-h2 font-semibold text-brand-dark">3. Kullandığımız Çerez Türleri</h2>

            <div className="space-y-6">
              <div className="p-4 bg-surface-light rounded-lg">
                <h4 className="font-semibold text-brand-dark mb-2">Zorunlu Çerezler</h4>
                <p className="text-sm leading-relaxed">
                  Web sitesinin temel işlevlerini yerine getirebilmesi için gerekli olan çerezlerdir. Bu çerezler olmadan web sitesi düzgün çalışamaz. Oturum yönetimi, güvenlik ve erişilebilirlik için kullanılır.
                </p>
              </div>

              <div className="p-4 bg-surface-light rounded-lg">
                <h4 className="font-semibold text-brand-dark mb-2">Performans ve Analitik Çerezler</h4>
                <p className="text-sm leading-relaxed">
                  Ziyaretçilerin web sitesini nasıl kullandığını anlamamıza yardımcı olur. Hangi sayfaların en çok ziyaret edildiği, kullanıcıların sitede ne kadar zaman geçirdiği gibi bilgileri toplar. Bu veriler anonim olarak toplanır.
                </p>
              </div>

              <div className="p-4 bg-surface-light rounded-lg">
                <h4 className="font-semibold text-brand-dark mb-2">İşlevsel Çerezler</h4>
                <p className="text-sm leading-relaxed">
                  Kullanıcı tercihlerinizi hatırlamak ve daha kişiselleştirilmiş bir deneyim sunmak için kullanılır. Dil seçimi, bölge tercihi gibi ayarları saklar.
                </p>
              </div>

              <div className="p-4 bg-surface-light rounded-lg">
                <h4 className="font-semibold text-brand-dark mb-2">Hedefleme ve Reklam Çerezleri</h4>
                <p className="text-sm leading-relaxed">
                  İlgi alanlarınıza uygun reklamlar göstermek için kullanılır. Ayrıca reklam kampanyalarının etkinliğini ölçmek için de kullanılabilir.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="font-heading text-h2 font-semibold text-brand-dark">4. Üçüncü Taraf Çerezler</h2>
            <p className="leading-relaxed">
              Web sitemizde, analiz ve pazarlama amaçlı üçüncü taraf hizmet sağlayıcılarının (Google Analytics, Facebook Pixel vb.) çerezleri kullanılabilir.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-heading text-h2 font-semibold text-brand-dark">5. Çerezleri Kontrol Etme</h2>
            <p className="leading-relaxed">
              Tarayıcınızın ayarlarından çerezleri kontrol edebilir, engelleyebilir veya silebilirsiniz. Ancak çerezleri devre dışı bırakmanız durumunda web sitesinin bazı özellikleri düzgün çalışmayabilir.
            </p>

            <div className="p-4 bg-action/5 rounded-lg mt-4">
              <p className="text-sm font-medium text-brand-dark mb-2">Popüler tarayıcılarda çerez ayarları:</p>
              <ul className="text-sm space-y-1">
                <li>• <strong>Chrome:</strong> Ayarlar → Gizlilik ve güvenlik → Çerezler</li>
                <li>• <strong>Firefox:</strong> Ayarlar → Gizlilik ve Güvenlik → Çerezler</li>
                <li>• <strong>Safari:</strong> Tercihler → Gizlilik → Çerezler</li>
                <li>• <strong>Edge:</strong> Ayarlar → Gizlilik → Çerezler</li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="font-heading text-h2 font-semibold text-brand-dark">6. İletişim</h2>
            <p className="leading-relaxed">
              Çerez politikamız ile ilgili sorularınız için <Link href="/iletisim" className="text-action hover:underline">iletişim sayfamızdan</Link> bize ulaşabilirsiniz.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
