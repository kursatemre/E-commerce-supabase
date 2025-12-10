import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Kullanım Koşulları | E-Ticaret',
  description: 'Web sitemizin kullanım koşulları, kullanıcı sorumlulukları ve yasal bilgiler.',
}

export default function KullanimKosullariPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="section-container py-16 md:py-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-brand-dark mb-8">
            Kullanım Koşulları
          </h1>

          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <p className="text-brand-dark/70 mb-6">
                <strong>Son Güncelleme:</strong> 10 Aralık 2024
              </p>
              <p className="text-brand-dark/70 leading-relaxed">
                Bu web sitesini kullanarak aşağıdaki şartları kabul etmiş sayılırsınız.
                Şartları kabul etmiyorsanız, lütfen siteyi kullanmayınız.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-bold text-brand-dark mb-4">
                1. Genel Hükümler
              </h2>
              <p className="text-brand-dark/70 leading-relaxed">
                Bu web sitesi E-Ticaret tarafından işletilmektedir. Siteyi kullanarak,
                bu kullanım koşullarını, gizlilik politikamızı ve diğer ilgili politikaları
                kabul etmiş olursunuz. Şirketimiz, bu koşulları önceden haber vermeksizin
                değiştirme hakkını saklı tutar.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-bold text-brand-dark mb-4">
                2. Üyelik ve Hesap Güvenliği
              </h2>
              <ul className="list-disc pl-6 space-y-2 text-brand-dark/70">
                <li>Üyelik için verdiğiniz bilgilerin doğru ve güncel olması gerekmektedir</li>
                <li>Hesap şifrenizi gizli tutmak sizin sorumluluğunuzdadır</li>
                <li>Hesabınızda gerçekleşen tüm aktivitelerden siz sorumlusunuz</li>
                <li>18 yaşından küçükseniz, yasal bir velinin izni ile üye olabilirsiniz</li>
                <li>Hesabınızı başkasına devredemez veya satamazsınız</li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-bold text-brand-dark mb-4">
                3. Sipariş ve Ödeme
              </h2>
              <p className="text-brand-dark/70 leading-relaxed mb-4">
                Sipariş süreciyle ilgili kurallar:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-brand-dark/70">
                <li>Sipariş verdiğinizde yasal olarak bağlayıcı bir sözleşme yapmış olursunuz</li>
                <li>Fiyatlar önceden haber verilmeksizin değiştirilebilir</li>
                <li>Stok durumuna göre sipariş iptal edilebilir</li>
                <li>Ödeme bilgileriniz güvenli şekilde işlenir</li>
                <li>Sahte veya dolandırıcılık amaçlı siparişler iptal edilir</li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-bold text-brand-dark mb-4">
                4. Fikri Mülkiyet Hakları
              </h2>
              <p className="text-brand-dark/70 leading-relaxed">
                Web sitesindeki tüm içerik (metinler, görseller, logolar, tasarımlar) E-Ticaret&apos;in
                veya lisans verenlerin mülkiyetindedir. İzinsiz kullanım, kopyalama veya dağıtım
                yasaktır ve yasal işlem başlatılmasına neden olabilir.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-bold text-brand-dark mb-4">
                5. Yasak Kullanımlar
              </h2>
              <p className="text-brand-dark/70 leading-relaxed mb-4">
                Aşağıdaki eylemler kesinlikle yasaktır:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-brand-dark/70">
                <li>Sisteme zarar verecek virüs, malware veya zararlı kod yüklemek</li>
                <li>Diğer kullanıcıların hesaplarına yetkisiz erişim sağlamak</li>
                <li>Sahte kimlik veya bilgilerle işlem yapmak</li>
                <li>Spam veya istenmeyen mesajlar göndermek</li>
                <li>Telif hakkı ihlali yapan içerik paylaşmak</li>
                <li>Siteyi otomatik araçlarla (bot, scraper) kullanmak</li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-bold text-brand-dark mb-4">
                6. Sorumluluk Reddi
              </h2>
              <p className="text-brand-dark/70 leading-relaxed">
                Web sitemiz &quot;olduğu gibi&quot; sunulmaktadır. Ürün açıklamalarının doğruluğunu
                sağlamaya çalışsak da, bilgilerde hatalar olabilir. Üçüncü taraf bağlantılardan
                veya kullanıcı yorumlarından sorumlu değiliz. Teknik aksaklıklar veya kesintiler
                yaşanabilir.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-bold text-brand-dark mb-4">
                7. İade ve İptal
              </h2>
              <p className="text-brand-dark/70 leading-relaxed">
                İade ve iptal işlemleri{' '}
                <Link href="/iade-degisim" className="text-action hover:underline">
                  İade ve Değişim Politikamızda
                </Link>{' '}
                belirtilen kurallara tabidir. Lütfen detaylı bilgi için ilgili sayfayı inceleyin.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-bold text-brand-dark mb-4">
                8. Kişisel Verilerin Korunması
              </h2>
              <p className="text-brand-dark/70 leading-relaxed">
                Kişisel verileriniz{' '}
                <Link href="/gizlilik-politikasi" className="text-action hover:underline">
                  Gizlilik Politikamız
                </Link>{' '}
                ve{' '}
                <Link href="/kvkk" className="text-action hover:underline">
                  KVKK Aydınlatma Metni
                </Link>{' '}
                kapsamında işlenmektedir.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-bold text-brand-dark mb-4">
                9. Uyuşmazlık Çözümü
              </h2>
              <p className="text-brand-dark/70 leading-relaxed">
                Bu sözleşmeden doğan uyuşmazlıklarda İstanbul Mahkemeleri ve İcra Daireleri
                yetkilidir. Tüketici haklarınız saklıdır ve Tüketici Hakem Heyetleri ve Tüketici
                Mahkemelerine başvurabilirsiniz.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-bold text-brand-dark mb-4">
                10. İletişim
              </h2>
              <p className="text-brand-dark/70 leading-relaxed mb-4">
                Kullanım koşulları hakkında sorularınız için:
              </p>
              <div className="bg-surface-light p-6 rounded-xl">
                <p className="text-brand-dark/70">
                  <strong>E-posta:</strong> info@e-ticaret.com<br />
                  <strong>Telefon:</strong> +90 (212) 555 01 23<br />
                  <strong>Adres:</strong> Teşvikiye Mahallesi, Halaskargazi Caddesi No:123, Şişli, İstanbul
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
