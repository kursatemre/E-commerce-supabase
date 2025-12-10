import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'KVKK Aydınlatma Metni | E-Ticaret',
  description: '6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında aydınlatma metni.',
}

export default function KVKKPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="section-container py-16 md:py-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-brand-dark mb-8">
            KVKK Aydınlatma Metni
          </h1>

          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <p className="text-brand-dark/70 mb-6">
                <strong>Son Güncelleme:</strong> 10 Aralık 2024
              </p>
              <p className="text-brand-dark/70 leading-relaxed">
                6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) uyarınca, kişisel
                verilerinizin işlenmesine ilişkin olarak veri sorumlusu sıfatıyla sizi
                bilgilendirmek isteriz.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-bold text-brand-dark mb-4">
                1. Veri Sorumlusu
              </h2>
              <div className="bg-surface-light p-6 rounded-xl">
                <p className="text-brand-dark/70">
                  <strong>Şirket Adı:</strong> E-Ticaret A.Ş.<br />
                  <strong>Adres:</strong> Teşvikiye Mahallesi, Halaskargazi Caddesi No:123, Şişli, İstanbul<br />
                  <strong>E-posta:</strong> kvkk@e-ticaret.com<br />
                  <strong>Telefon:</strong> +90 (212) 555 01 23<br />
                  <strong>Mersis No:</strong> 0123456789012345
                </p>
              </div>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-bold text-brand-dark mb-4">
                2. Kişisel Verilerin Toplanma Yöntemi ve Hukuki Sebebi
              </h2>
              <p className="text-brand-dark/70 leading-relaxed mb-4">
                Kişisel verileriniz aşağıdaki yöntemlerle toplanmaktadır:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-brand-dark/70">
                <li>Web sitemiz ve mobil uygulamamız üzerinden elektronik ortamda</li>
                <li>Çağrı merkezi ve e-posta yoluyla</li>
                <li>Mağazalarımızda fiziksel formlar aracılığıyla</li>
                <li>Sosyal medya platformları ve kampanyalar üzerinden</li>
                <li>Kargo ve ödeme hizmet sağlayıcılarından</li>
              </ul>
              <p className="text-brand-dark/70 leading-relaxed mt-4">
                Kişisel verileriniz, KVKK&apos;nın 5. ve 6. maddelerinde belirtilen veri işleme
                şartları kapsamında işlenmektedir.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-bold text-brand-dark mb-4">
                3. İşlenen Kişisel Veriler
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-brand-dark mb-2">Kimlik Bilgileri</h3>
                  <p className="text-brand-dark/70 text-sm">Ad, soyad, T.C. kimlik numarası (fatura için), doğum tarihi</p>
                </div>
                <div>
                  <h3 className="font-bold text-brand-dark mb-2">İletişim Bilgileri</h3>
                  <p className="text-brand-dark/70 text-sm">E-posta adresi, telefon numarası, adres bilgileri</p>
                </div>
                <div>
                  <h3 className="font-bold text-brand-dark mb-2">Müşteri İşlem Bilgileri</h3>
                  <p className="text-brand-dark/70 text-sm">Sipariş geçmişi, sepet bilgileri, ürün tercihleri, yorum ve değerlendirmeler</p>
                </div>
                <div>
                  <h3 className="font-bold text-brand-dark mb-2">Finansal Bilgiler</h3>
                  <p className="text-brand-dark/70 text-sm">Ödeme bilgileri (güvenli ödeme sistemleri aracılığıyla şifrelenmiş)</p>
                </div>
                <div>
                  <h3 className="font-bold text-brand-dark mb-2">İşlem Güvenliği Bilgileri</h3>
                  <p className="text-brand-dark/70 text-sm">IP adresi, çerez bilgileri, cihaz bilgileri, log kayıtları</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-bold text-brand-dark mb-4">
                4. Kişisel Verilerin İşlenme Amaçları
              </h2>
              <ul className="list-disc pl-6 space-y-2 text-brand-dark/70">
                <li>Üyelik işlemlerinin gerçekleştirilmesi</li>
                <li>Sipariş ve teslimat süreçlerinin yönetilmesi</li>
                <li>Ödeme ve fatura işlemlerinin yapılması</li>
                <li>Müşteri hizmetlerinin sunulması</li>
                <li>İade ve değişim işlemlerinin yürütülmesi</li>
                <li>Kampanya ve promosyon faaliyetlerinin yürütülmesi (izniniz ile)</li>
                <li>Ürün ve hizmet kalitesinin iyileştirilmesi</li>
                <li>Dolandırıcılık ve kötüye kullanımın önlenmesi</li>
                <li>Yasal yükümlülüklerin yerine getirilmesi</li>
                <li>İstatistik ve analiz çalışmaları</li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-bold text-brand-dark mb-4">
                5. Kişisel Verilerin Aktarılması
              </h2>
              <p className="text-brand-dark/70 leading-relaxed mb-4">
                Kişisel verileriniz aşağıdaki taraflara aktarılabilmektedir:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-brand-dark/70">
                <li><strong>Kargo şirketleri:</strong> Teslimat işlemleri için</li>
                <li><strong>Ödeme kuruluşları:</strong> Ödeme işlemlerinin gerçekleştirilmesi için</li>
                <li><strong>Bankalar:</strong> Finansal işlemler için</li>
                <li><strong>Pazarlama hizmet sağlayıcıları:</strong> Kampanya yönetimi için (izniniz ile)</li>
                <li><strong>Bulut hizmet sağlayıcıları:</strong> Veri depolama ve yedekleme için</li>
                <li><strong>Hukuki danışmanlar:</strong> Hukuki süreçler için</li>
                <li><strong>Kamu kurum ve kuruluşları:</strong> Yasal yükümlülükler çerçevesinde</li>
              </ul>
              <p className="text-brand-dark/70 leading-relaxed mt-4">
                Yurt dışına veri aktarımı yapılması durumunda, KVKK&apos;nın 9. maddesinde
                öngörülen şartlara uygun hareket edilmektedir.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-bold text-brand-dark mb-4">
                6. Kişisel Veri Sahibinin Hakları
              </h2>
              <p className="text-brand-dark/70 leading-relaxed mb-4">
                KVKK&apos;nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-brand-dark/70">
                <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
                <li>Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme</li>
                <li>Kişisel verilerinizin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme</li>
                <li>Yurt içinde veya yurt dışında kişisel verilerinizin aktarıldığı üçüncü kişileri bilme</li>
                <li>Kişisel verilerinizin eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme</li>
                <li>KVKK&apos;nın 7. maddesinde öngörülen şartlar çerçevesinde kişisel verilerinizin silinmesini veya yok edilmesini isteme</li>
                <li>Düzeltme, silme veya yok etme işlemlerinin kişisel verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme</li>
                <li>İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme</li>
                <li>Kişisel verilerinizin kanuna aykırı olarak işlenmesi sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme</li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-bold text-brand-dark mb-4">
                7. Başvuru Yöntemi
              </h2>
              <p className="text-brand-dark/70 leading-relaxed mb-4">
                Yukarıda belirtilen haklarınızı kullanmak için başvurunuzu aşağıdaki yöntemlerle iletebilirsiniz:
              </p>

              <div className="space-y-4">
                <div className="bg-surface-light p-6 rounded-xl">
                  <h3 className="font-bold text-brand-dark mb-3">Yazılı Başvuru</h3>
                  <p className="text-brand-dark/70 text-sm">
                    Kimliğinizi tespit edici belgeler ile birlikte &quot;KVKK Başvurusu&quot; başlığı altında:<br />
                    <strong>Adres:</strong> Teşvikiye Mahallesi, Halaskargazi Caddesi No:123, Şişli, İstanbul
                  </p>
                </div>

                <div className="bg-surface-light p-6 rounded-xl">
                  <h3 className="font-bold text-brand-dark mb-3">Elektronik Başvuru</h3>
                  <p className="text-brand-dark/70 text-sm">
                    Kayıtlı elektronik posta (KEP) adresinizden:<br />
                    <strong>KEP Adresi:</strong> eticaret@hs03.kep.tr
                  </p>
                </div>

                <div className="bg-surface-light p-6 rounded-xl">
                  <h3 className="font-bold text-brand-dark mb-3">Güvenli E-posta</h3>
                  <p className="text-brand-dark/70 text-sm">
                    Sistemimizde kayıtlı e-posta adresinizden mobil imza veya güvenli elektronik imza ile:<br />
                    <strong>E-posta:</strong> kvkk@e-ticaret.com
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-6">
                <h3 className="font-bold text-brand-dark mb-2">📋 Başvuru Süreci</h3>
                <p className="text-brand-dark/70 text-sm">
                  Başvurularınız, talebin niteliğine göre en geç 30 gün içinde
                  ücretsiz olarak sonuçlandırılacaktır. İşlemin ayrıca bir maliyet
                  gerektirmesi halinde, Kişisel Verileri Koruma Kurulu tarafından
                  belirlenen tarifedeki ücret alınabilir.
                </p>
              </div>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-bold text-brand-dark mb-4">
                8. Veri Güvenliği
              </h2>
              <p className="text-brand-dark/70 leading-relaxed">
                Kişisel verilerinizin güvenliğini sağlamak için gerekli teknik ve idari
                tedbirler alınmaktadır. SSL/TLS şifrelemesi, güvenlik duvarları, erişim
                kontrolleri ve düzenli güvenlik denetimleri gibi önlemler uygulanmaktadır.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-bold text-brand-dark mb-4">
                9. İletişim
              </h2>
              <div className="bg-surface-light p-6 rounded-xl">
                <p className="text-brand-dark/70">
                  <strong>KVKK Sorumlusu:</strong> Av. Ayşe Yılmaz<br />
                  <strong>E-posta:</strong> kvkk@e-ticaret.com<br />
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
