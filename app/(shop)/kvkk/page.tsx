import Link from 'next/link'

export default function KVKKPage() {
  return (
    <div className="min-h-screen py-12 md:py-20">
      <div className="section-container max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="font-heading text-h1 font-semibold text-brand-dark mb-4">
            KVKK Aydınlatma Metni
          </h1>
          <p className="text-sm text-brand-dark/60">Kişisel Verilerin Korunması Kanunu</p>
        </div>

        <div className="prose prose-lg max-w-none space-y-8 text-brand-dark/80">
          <section className="space-y-4">
            <h2 className="font-heading text-h2 font-semibold text-brand-dark">1. Veri Sorumlusu</h2>
            <p className="leading-relaxed">
              6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) uyarınca, kişisel verileriniz veri sorumlusu sıfatıyla şirketimiz tarafından aşağıda açıklanan kapsamda işlenebilecektir.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-heading text-h2 font-semibold text-brand-dark">2. Kişisel Verilerin İşlenme Amacı</h2>
            <p className="leading-relaxed">Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Üyelik işlemlerinin gerçekleştirilmesi</li>
              <li>Sipariş ve teslimat süreçlerinin yürütülmesi</li>
              <li>Müşteri ilişkilerinin yönetimi ve müşteri memnuniyetinin sağlanması</li>
              <li>Kampanya ve tanıtım faaliyetlerinin gerçekleştirilmesi</li>
              <li>İstatistiksel analiz ve raporlama yapılması</li>
              <li>Yasal yükümlülüklerin yerine getirilmesi</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-heading text-h2 font-semibold text-brand-dark">3. İşlenen Kişisel Veriler</h2>
            <p className="leading-relaxed">İşlenen kişisel veri kategorileri:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Kimlik Bilgileri:</strong> Ad, soyad, T.C. kimlik numarası</li>
              <li><strong>İletişim Bilgileri:</strong> Telefon, e-posta, adres</li>
              <li><strong>Müşteri İşlem Bilgileri:</strong> Sipariş geçmişi, ödeme bilgileri</li>
              <li><strong>İşlem Güvenliği Bilgileri:</strong> IP adresi, çerez kaydı, log kayıtları</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-heading text-h2 font-semibold text-brand-dark">4. Verilerin Aktarımı</h2>
            <p className="leading-relaxed">
              Kişisel verileriniz, yukarıda belirtilen amaçların gerçekleştirilmesi doğrultusunda kargo şirketleri, ödeme hizmeti sağlayıcıları ve yasal merciler ile paylaşılabilir.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-heading text-h2 font-semibold text-brand-dark">5. Veri Toplama Yöntemi</h2>
            <p className="leading-relaxed">
              Kişisel verileriniz, web sitemiz, mobil uygulamamız, çağrı merkezi, e-posta ve sosyal medya kanalları üzerinden toplanmaktadır.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-heading text-h2 font-semibold text-brand-dark">6. Kişisel Veri Sahibinin Hakları</h2>
            <p className="leading-relaxed">KVKK&apos;nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
              <li>İşlenmiş ise bilgi talep etme</li>
              <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</li>
              <li>Yurt içinde veya yurt dışında aktarılan üçüncü kişileri bilme</li>
              <li>Eksik veya yanlış işlenmiş verilerin düzeltilmesini isteme</li>
              <li>KVKK&apos;nın 7. maddesinde öngörülen şartlar çerçevesinde silinmesini veya yok edilmesini isteme</li>
              <li>Aktarıldığı üçüncü kişilere yukarıdaki işlemlerin bildirilmesini isteme</li>
              <li>Münhasıran otomatik sistemler ile analiz edilmesi nedeniyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme</li>
              <li>Kanuna aykırı olarak işlenmesi sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-heading text-h2 font-semibold text-brand-dark">7. Başvuru Yöntemi</h2>
            <p className="leading-relaxed">
              Yukarıda belirtilen haklarınızı kullanmak için kimliğinizi tespit edici belgeler ile birlikte <Link href="/iletisim" className="text-action hover:underline">iletişim sayfamızdan</Link> tarafımıza başvurabilirsiniz.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
