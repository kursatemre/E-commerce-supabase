import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mesafeli Satış Sözleşmesi | E-Ticaret',
  description: '6502 sayılı Tüketicinin Korunması Hakkında Kanun kapsamında mesafeli satış sözleşmesi.',
}

export default function MesafeliSatisSozlesmesiPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="section-container py-16 md:py-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-brand-dark mb-8">
            Mesafeli Satış Sözleşmesi
          </h1>

          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <p className="text-brand-dark/70 leading-relaxed">
                İşbu Sözleşme, 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve
                Mesafeli Sözleşmeler Yönetmeliği hükümleri gereğince düzenlenmiştir.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-bold text-brand-dark mb-4">
                Madde 1: Taraflar
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-surface-light p-6 rounded-xl">
                  <h3 className="font-bold text-brand-dark mb-3">SATICI BİLGİLERİ</h3>
                  <p className="text-brand-dark/70 text-sm">
                    <strong>Ünvan:</strong> E-Ticaret A.Ş.<br />
                    <strong>Adres:</strong> Teşvikiye Mah., Halaskargazi Cad. No:123, Şişli/İstanbul<br />
                    <strong>Telefon:</strong> +90 (212) 555 01 23<br />
                    <strong>E-posta:</strong> info@e-ticaret.com<br />
                    <strong>Mersis No:</strong> 0123456789012345
                  </p>
                </div>

                <div className="bg-surface-light p-6 rounded-xl">
                  <h3 className="font-bold text-brand-dark mb-3">ALICI BİLGİLERİ</h3>
                  <p className="text-brand-dark/70 text-sm">
                    Sipariş sürecinde belirtilen alıcı bilgileri geçerlidir.
                    Alıcı bilgileri, sipariş onayı ve fatura ile birlikte
                    kayıt altına alınmaktadır.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-bold text-brand-dark mb-4">
                Madde 2: Sözleşme Konusu
              </h2>
              <p className="text-brand-dark/70 leading-relaxed">
                İşbu Sözleşme, ALICI&apos;nın SATICI&apos;ya ait www.e-ticaret.com internet sitesinden
                elektronik ortamda siparişini yaptığı aşağıda nitelikleri belirtilen ürün/ün
                satışı ve teslimi ile ilgili olarak 6502 sayılı Tüketicinin Korunması Hakkında
                Kanun ve Mesafeli Sözleşmelere Dair Yönetmelik hükümleri gereğince tarafların
                hak ve yükümlülüklerini düzenler.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-bold text-brand-dark mb-4">
                Madde 3: Sözleşme Konusu Ürün/Hizmet Bilgileri
              </h2>
              <p className="text-brand-dark/70 leading-relaxed mb-4">
                Sipariş edilen ürün/ürünlerin temel özellikleri (türü, miktarı, marka/modeli,
                rengi, adedi) sipariş formunda ve sipariş onayında belirtilmiştir. Ürünün temel
                özelliklerini SATICI&apos;nın sitesinde inceleyebilirsiniz.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-brand-dark/70 text-sm">
                  <strong>Not:</strong> Listelenen ve sitede ilan edilen fiyatlar satış fiyatıdır.
                  İlan edilen fiyatlar ve vaatler güncelleme yapılana kadar geçerlidir.
                </p>
              </div>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-bold text-brand-dark mb-4">
                Madde 4: Genel Hükümler
              </h2>
              <ul className="list-decimal pl-6 space-y-3 text-brand-dark/70">
                <li>
                  ALICI, sözleşme konusu ürünün temel nitelikleri, satış fiyatı, ödeme şekli ve
                  teslimat bilgileri hakkında bilgi sahibi olduğunu ve elektronik ortamda gerekli
                  teyidi verdiğini beyan eder.
                </li>
                <li>
                  Sözleşme konusu ürün, yasal 30 günlük süreyi aşmamak koşulu ile her bir ürün
                  için ALICI&apos;nın yerleşim yerinin uzaklığına bağlı olarak ön bilgiler içinde
                  açıklanan süre içinde ALICI veya gösterdiği adresteki kişi/kuruluşa teslim edilir.
                </li>
                <li>
                  Sözleşme konusu ürün, ALICI&apos;dan başka bir kişi/kuruluşa teslim edilecek ise,
                  teslim edilecek kişi/kuruluşun teslimatı kabul etmemesinden SATICI sorumlu tutulamaz.
                </li>
                <li>
                  SATICI, sözleşme konusu ürünün sağlam, eksiksiz, siparişte belirtilen niteliklere
                  uygun ve varsa garanti belgeleri ve kullanım kılavuzları ile teslim edilmesinden
                  sorumludur.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-bold text-brand-dark mb-4">
                Madde 5: Cayma Hakkı
              </h2>
              <p className="text-brand-dark/70 leading-relaxed mb-4">
                ALICI, sözleşme konusu ürünün kendisine veya gösterdiği adresteki kişi/kuruluşa
                tesliminden itibaren 14 (on dört) gün içinde, SATICI&apos;ya bildirmek şartıyla hiçbir
                hukuki ve cezai sorumluluk üstlenmeksizin ve hiçbir gerekçe göstermeksizin malı
                reddederek sözleşmeden cayma hakkını kullanabilir.
              </p>

              <div className="bg-surface-light p-6 rounded-xl">
                <h3 className="font-bold text-brand-dark mb-3">Cayma Hakkı Süresi</h3>
                <ul className="space-y-2 text-brand-dark/70 text-sm">
                  <li>• Mal teslimatında: Teslim tarihinden itibaren 14 gün</li>
                  <li>• Hizmet sunumunda: Sözleşmenin imzalandığı tarihten itibaren 14 gün</li>
                </ul>
              </div>

              <div className="mt-6">
                <h3 className="font-bold text-brand-dark mb-3">Cayma Hakkının Kullanılması</h3>
                <p className="text-brand-dark/70 leading-relaxed mb-4">
                  Cayma hakkının kullanılması için bu süre içinde SATICI&apos;ya;
                </p>
                <ul className="list-disc pl-6 space-y-2 text-brand-dark/70 text-sm">
                  <li>E-posta: iade@e-ticaret.com</li>
                  <li>Telefon: +90 (212) 555 01 23</li>
                  <li>Hesabım &gt; Siparişlerim bölümünden</li>
                </ul>
                <p className="text-brand-dark/70 leading-relaxed mt-4">
                  yoluyla yazılı olarak veya cayma hakkı formunu doldurarak bildirimde bulunulması
                  gerekmektedir.
                </p>
              </div>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-bold text-brand-dark mb-4">
                Madde 6: Cayma Hakkı Kullanılamayacak Ürünler
              </h2>
              <p className="text-brand-dark/70 leading-relaxed mb-4">
                Aşağıdaki ürünlerde cayma hakkı kullanılamaz:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-brand-dark/70">
                <li>Fiyatı finansal piyasalardaki dalgalanmalara bağlı olarak değişen ürünler</li>
                <li>Tüketicinin istekleri veya kişisel ihtiyaçları doğrultusunda hazırlanan ürünler</li>
                <li>Çabuk bozulabilen veya son kullanma tarihi geçebilecek ürünler</li>
                <li>Tesliminden sonra ambalajı açılmış olan ürünlerden; iade edilmesi sağlık ve hijyen açısından uygun olmayanlar</li>
                <li>Tesliminden sonra başka ürünlerle karışan ve doğası gereği ayrıştırılması mümkün olmayan ürünler</li>
                <li>Ambalajı açılmış olan (CD, DVD, VHS, yazılım) ürünler</li>
                <li>Abonelik sözleşmesi kapsamında sağlanmayan gazete ve dergiler</li>
                <li>Elektronik ortamda anında ifa edilen hizmetler</li>
                <li>Cayma hakkı süresi sona ermeden önce tüketicinin onayı ile ifasına başlanan hizmetler</li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-bold text-brand-dark mb-4">
                Madde 7: Temerrüt ve Hukuki Sonuçları
              </h2>
              <p className="text-brand-dark/70 leading-relaxed mb-4">
                ALICI, ödeme işlemlerini kredi kartı ile yaptığı durumda temerrüde düştüğü
                takdirde, kart sahibi banka ile arasındaki kredi kartı sözleşmesi çerçevesinde
                faiz ödeyeceğini ve bankaya karşı sorumlu olacağını kabul, beyan ve taahhüt eder.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-bold text-brand-dark mb-4">
                Madde 8: Yetkili Mahkeme
              </h2>
              <p className="text-brand-dark/70 leading-relaxed">
                İşbu Sözleşme&apos;nin uygulanmasında, Sanayi ve Ticaret Bakanlığınca ilan edilen
                değere kadar ALICI&apos;nın yerleşim yerindeki Tüketici Hakem Heyetleri ile
                Tüketici Mahkemeleri yetkilidir.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-bold text-brand-dark mb-4">
                Madde 9: Yürürlük
              </h2>
              <p className="text-brand-dark/70 leading-relaxed">
                ALICI, işbu sözleşmeyi elektronik ortamda kabul etmekle, sipariş konusu ürünün
                temel nitelikleri, satış fiyatı, ödeme şekli, teslimat şartları ve SATICI&apos;nın
                kimlik bilgileri gibi ön bilgileri de doğru ve eksiksiz olarak okuduğunu ve
                elektronik ortamda gerekli teyidi verdiğini beyan eder.
              </p>
            </section>

            <section className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="font-bold text-brand-dark mb-3">Sözleşme Onayı</h3>
              <p className="text-brand-dark/70 text-sm">
                Sipariş sürecinde &quot;Siparişi Onayla&quot; butonuna tıklamakla işbu sözleşmenin
                tüm şartlarını kabul etmiş sayılırsınız. Sözleşme metni, siparişinizin
                onaylanmasının ardından e-posta adresinize gönderilecektir.
              </p>
            </section>

            <section>
              <div className="flex justify-between items-start gap-8 pt-8 border-t border-gray-200">
                <div>
                  <p className="font-bold text-brand-dark mb-2">SATICI</p>
                  <p className="text-brand-dark/70 text-sm">E-Ticaret A.Ş.</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-brand-dark mb-2">ALICI</p>
                  <p className="text-brand-dark/70 text-sm">Sipariş sahibi</p>
                </div>
              </div>
              <p className="text-brand-dark/60 text-xs text-center mt-6">
                Bu sözleşme elektronik ortamda akdedilmiş olup, her iki tarafı da bağlar.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
