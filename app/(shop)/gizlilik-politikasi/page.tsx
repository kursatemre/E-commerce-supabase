import { Metadata } from 'next/link'

export const metadata: Metadata = {
  title: 'Gizlilik Politikası | E-Ticaret',
  description: 'Kişisel verilerinizin toplanması, kullanımı ve korunması hakkında bilgi.',
}

export default function GizlilikPolitikasiPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="section-container py-16 md:py-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-brand-dark mb-8">
            Gizlilik Politikası
          </h1>

          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <p className="text-brand-dark/70 mb-6">
                <strong>Son Güncelleme:</strong> 10 Aralık 2024
              </p>
              <p className="text-brand-dark/70 leading-relaxed">
                E-Ticaret olarak, kişisel verilerinizin gizliliğini korumayı taahhüt ediyoruz.
                Bu gizlilik politikası, web sitemizi ziyaret ettiğinizde ve hizmetlerimizi
                kullandığınızda kişisel verilerinizin nasıl toplandığını, kullanıldığını ve
                korunduğunu açıklamaktadır.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-bold text-brand-dark mb-4">
                1. Toplanan Bilgiler
              </h2>
              <p className="text-brand-dark/70 leading-relaxed mb-4">
                Web sitemizi kullanırken aşağıdaki bilgileri toplayabiliriz:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-brand-dark/70">
                <li>Ad, soyad</li>
                <li>E-posta adresi</li>
                <li>Telefon numarası</li>
                <li>Teslimat ve fatura adresleri</li>
                <li>Ödeme bilgileri (güvenli ödeme sağlayıcımız aracılığıyla)</li>
                <li>Sipariş geçmişi</li>
                <li>IP adresi ve tarayıcı bilgileri</li>
                <li>Çerez verileri</li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-bold text-brand-dark mb-4">
                2. Bilgilerin Kullanım Amaçları
              </h2>
              <p className="text-brand-dark/70 leading-relaxed mb-4">
                Toplanan bilgiler aşağıdaki amaçlarla kullanılır:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-brand-dark/70">
                <li>Siparişlerinizi işlemek ve teslim etmek</li>
                <li>Müşteri hizmetleri sağlamak</li>
                <li>Size özel teklifler ve kampanyalar hakkında bilgi vermek (izniniz ile)</li>
                <li>Web sitemizi iyileştirmek ve kişiselleştirmek</li>
                <li>Yasal yükümlülüklerimizi yerine getirmek</li>
                <li>Dolandırıcılığı önlemek ve güvenliği sağlamak</li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-bold text-brand-dark mb-4">
                3. Bilgilerin Paylaşımı
              </h2>
              <p className="text-brand-dark/70 leading-relaxed mb-4">
                Kişisel bilgilerinizi aşağıdaki durumlar dışında üçüncü taraflarla paylaşmayız:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-brand-dark/70">
                <li>Siparişlerinizi teslim etmek için kargo firmaları ile</li>
                <li>Ödemeleri işlemek için ödeme sağlayıcıları ile</li>
                <li>Yasal zorunluluklar gereği resmi makamlar ile</li>
                <li>Açık onayınız ile belirttiğiniz üçüncü taraflar ile</li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-bold text-brand-dark mb-4">
                4. Veri Güvenliği
              </h2>
              <p className="text-brand-dark/70 leading-relaxed">
                Kişisel verilerinizi korumak için endüstri standardı güvenlik önlemleri alıyoruz.
                Bunlar arasında SSL şifrelemesi, güvenli sunucular ve düzenli güvenlik denetimleri
                bulunmaktadır. Ancak, internet üzerinden veri iletiminin %100 güvenli olmadığını
                unutmayın.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-bold text-brand-dark mb-4">
                5. Çerezler (Cookies)
              </h2>
              <p className="text-brand-dark/70 leading-relaxed">
                Web sitemiz, kullanıcı deneyimini iyileştirmek için çerezler kullanır.
                Çerezler hakkında daha fazla bilgi için{' '}
                <a href="/cerez-politikasi" className="text-action hover:underline">
                  Çerez Politikamızı
                </a>{' '}
                inceleyebilirsiniz.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-bold text-brand-dark mb-4">
                6. Haklarınız
              </h2>
              <p className="text-brand-dark/70 leading-relaxed mb-4">
                KVKK kapsamında aşağıdaki haklara sahipsiniz:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-brand-dark/70">
                <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
                <li>İşlenmişse buna ilişkin bilgi talep etme</li>
                <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</li>
                <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme</li>
                <li>Eksik veya yanlış işlenmişse düzeltilmesini isteme</li>
                <li>İlgili mevzuatta öngörülen şartlar çerçevesinde silinmesini isteme</li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-bold text-brand-dark mb-4">
                7. İletişim
              </h2>
              <p className="text-brand-dark/70 leading-relaxed">
                Gizlilik politikamız hakkında sorularınız varsa veya haklarınızı kullanmak
                istiyorsanız, bizimle iletişime geçebilirsiniz:
              </p>
              <div className="bg-surface-light p-6 rounded-xl mt-4">
                <p className="text-brand-dark/70">
                  <strong>E-posta:</strong> gizlilik@e-ticaret.com<br />
                  <strong>Telefon:</strong> +90 (212) 555 01 23<br />
                  <strong>Adres:</strong> Teşvikiye Mahallesi, Halaskargazi Caddesi No:123, Şişli, İstanbul
                </p>
              </div>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-bold text-brand-dark mb-4">
                8. Politika Değişiklikleri
              </h2>
              <p className="text-brand-dark/70 leading-relaxed">
                Bu gizlilik politikasını zaman zaman güncelleyebiliriz. Önemli değişiklikler
                olduğunda sizi e-posta veya web sitemizde duyuru yoluyla bilgilendireceğiz.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
