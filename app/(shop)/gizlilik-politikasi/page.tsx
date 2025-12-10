import Link from 'next/link'

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen py-12 md:py-20">
      <div className="section-container max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="font-heading text-h1 font-semibold text-brand-dark mb-4">
            Gizlilik Politikası
          </h1>
          <p className="text-sm text-brand-dark/60">Son Güncellenme: 10 Aralık 2025</p>
        </div>

        <div className="prose prose-lg max-w-none space-y-8 text-brand-dark/80">
          <section className="space-y-4">
            <h2 className="font-heading text-h2 font-semibold text-brand-dark">1. Giriş</h2>
            <p className="leading-relaxed">
              Bu Gizlilik Politikası, web sitemizi ziyaret eden kullanıcıların kişisel verilerinin nasıl toplandığını, kullanıldığını, saklandığını ve korunduğunu açıklamaktadır.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-heading text-h2 font-semibold text-brand-dark">2. Toplanan Bilgiler</h2>
            <p className="leading-relaxed">Aşağıdaki kişisel bilgilerinizi toplayabiliriz:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Kimlik Bilgileri:</strong> Ad, soyad, T.C. kimlik numarası</li>
              <li><strong>İletişim Bilgileri:</strong> E-posta adresi, telefon numarası, adres</li>
              <li><strong>Sipariş Bilgileri:</strong> Satın alma geçmişi, sepet içeriği</li>
              <li><strong>Ödeme Bilgileri:</strong> Kart bilgileri (şifreli olarak saklanır)</li>
              <li><strong>Teknik Bilgiler:</strong> IP adresi, tarayıcı bilgisi, çerez verileri</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-heading text-h2 font-semibold text-brand-dark">3. Verilerin Kullanım Amaçları</h2>
            <p className="leading-relaxed">Topladığımız veriler aşağıdaki amaçlarla kullanılır:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Sipariş işlemlerinin gerçekleştirilmesi ve teslimatın sağlanması</li>
              <li>Müşteri hizmetleri desteğinin sunulması</li>
              <li>Kampanya ve tanıtım bilgilerinin iletilmesi (onay vermeniz halinde)</li>
              <li>Yasal yükümlülüklerin yerine getirilmesi</li>
              <li>Web sitesinin iyileştirilmesi ve kişiselleştirilmesi</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-heading text-h2 font-semibold text-brand-dark">4. Verilerin Paylaşılması</h2>
            <p className="leading-relaxed">
              Kişisel verileriniz, açık rızanız olmadan üçüncü kişilerle paylaşılmaz. Ancak aşağıdaki durumlarda verileriniz paylaşılabilir:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Kargo ve lojistik firmaları ile teslimat için</li>
              <li>Ödeme hizmeti sağlayıcıları ile ödeme işlemleri için</li>
              <li>Yasal mercilerin talebi üzerine</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-heading text-h2 font-semibold text-brand-dark">5. Veri Güvenliği</h2>
            <p className="leading-relaxed">
              Kişisel verilerinizin güvenliğini sağlamak için endüstri standartlarında teknik ve idari önlemler alınmaktadır. Verileriniz SSL şifrelemesi ile korunmaktadır.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-heading text-h2 font-semibold text-brand-dark">6. Çerezler</h2>
            <p className="leading-relaxed">
              Web sitemiz, kullanıcı deneyimini iyileştirmek için çerezler kullanmaktadır. Detaylı bilgi için <Link href="/cerez-politikasi" className="text-action hover:underline">Çerez Politikamızı</Link> inceleyebilirsiniz.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-heading text-h2 font-semibold text-brand-dark">7. Haklarınız</h2>
            <p className="leading-relaxed">KVKK kapsamında aşağıdaki haklara sahipsiniz:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
              <li>İşlenmiş ise bilgi talep etme</li>
              <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</li>
              <li>Yurt içinde veya yurt dışında aktarılan üçüncü kişileri bilme</li>
              <li>Eksik veya yanlış işlenmiş verilerin düzeltilmesini isteme</li>
              <li>Verilerin silinmesini veya yok edilmesini isteme</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-heading text-h2 font-semibold text-brand-dark">8. İletişim</h2>
            <p className="leading-relaxed">
              Gizlilik politikamız ile ilgili sorularınız için bize <Link href="/iletisim" className="text-action hover:underline">iletişim sayfamızdan</Link> ulaşabilirsiniz.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
