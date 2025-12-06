import { jsPDF } from 'jspdf'

type GuideSection = {
  title: string
  content?: string[]
  subsections?: {
    title: string
    content?: string[]
    steps?: string[]
    code?: string
    warning?: string
    tips?: string[]
  }[]
}

export function generateMarketingGuide() {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  const contentWidth = pageWidth - margin * 2
  let yPosition = margin

  // Sayfa numarası ekleme fonksiyonu
  const addPageNumber = () => {
    const pageCount = doc.getNumberOfPages()
    doc.setFontSize(9)
    doc.setTextColor(150, 150, 150)
    doc.text(`Sayfa ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' })
  }

  // Yeni sayfa kontrolü
  const checkNewPage = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      addPageNumber()
      doc.addPage()
      yPosition = margin
      return true
    }
    return false
  }

  // Kapak Sayfası
  doc.setFillColor(17, 24, 39) // gray-900
  doc.rect(0, 0, pageWidth, pageHeight, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(32)
  doc.text('Pazarlama & SEO', pageWidth / 2, 80, { align: 'center' })

  doc.setFontSize(24)
  doc.text('Kullanım Rehberi', pageWidth / 2, 100, { align: 'center' })

  doc.setFontSize(12)
  doc.setTextColor(156, 163, 175)
  doc.text('Meta Pixel, Conversions API, Catalog Feed ve SEO Araçları', pageWidth / 2, 120, {
    align: 'center',
  })

  doc.setFontSize(10)
  doc.text(`Oluşturulma Tarihi: ${new Date().toLocaleDateString('tr-TR')}`, pageWidth / 2, 140, {
    align: 'center',
  })

  // Çizgi
  doc.setDrawColor(59, 130, 246)
  doc.setLineWidth(0.5)
  doc.line(margin, 150, pageWidth - margin, 150)

  doc.setFontSize(9)
  doc.setTextColor(209, 213, 219)
  doc.text('E-Ticaret Admin Panel', pageWidth / 2, 160, { align: 'center' })

  // Yeni sayfa - İçindekiler
  addPageNumber()
  doc.addPage()
  yPosition = margin

  doc.setFillColor(255, 255, 255)
  doc.setTextColor(17, 24, 39)
  doc.setFontSize(20)
  doc.text('İçindekiler', margin, yPosition)
  yPosition += 15

  const tableOfContents = [
    { section: '1. Giriş ve Genel Bakış', page: '3' },
    { section: '2. Meta Pixel Kurulumu', page: '4' },
    { section: '3. Conversions API (CAPI) Yapılandırması', page: '7' },
    { section: '4. Catalog Feed Yönetimi', page: '10' },
    { section: '5. Pazarlama Panel Özellikleri', page: '13' },
    { section: '6. SEO Metrikleri ve Takibi', page: '16' },
    { section: '7. Kampanya Yönetimi ve Checklist', page: '18' },
    { section: '8. Sık Sorulan Sorular', page: '20' },
    { section: '9. Sorun Giderme', page: '22' },
  ]

  doc.setFontSize(11)
  tableOfContents.forEach((item) => {
    checkNewPage(10)
    doc.text(item.section, margin + 5, yPosition)
    doc.text(item.page, pageWidth - margin - 10, yPosition)
    yPosition += 8
  })

  // Ana İçerik Başlangıcı
  const sections: GuideSection[] = [
    {
      title: '1. Giriş ve Genel Bakış',
      content: [
        'Bu rehber, e-ticaret sitenizin pazarlama ve SEO araçlarını etkin bir şekilde kullanmanız için hazırlanmıştır.',
        '',
        'Pazarlama & SEO paneli, Meta (Facebook/Instagram) entegrasyonlarınızı, katalog feed durumunuzu, SEO metriklerinizi ve kampanya yönetiminizi tek bir ekranda toplamanızı sağlar.',
      ],
      subsections: [
        {
          title: 'Panel Yapısı',
          content: [
            'Panel başlıca 6 ana bölümden oluşur:',
            '',
            '• Meta İzinleri: Business Suite erişim yönetimi',
            '• Meta Entegrasyon Durumu: Pixel, CAPI, Catalog durumu',
            '• Catalog Feed Takip: Commerce Manager senkronizasyonları',
            '• CAPI Aktivasyon: Server-side event yapılandırması',
            '• SEO Metrikleri: Organik trafik ve performans',
            '• Kampanya Checklist: Ekip koordinasyonu',
          ],
        },
        {
          title: 'Ön Gereksinimler',
          content: [
            'Bu araçları kullanabilmek için:',
            '',
            '• Meta Business hesabı (business.facebook.com)',
            '• Meta App (developers.facebook.com/apps)',
            '• System User Token (Business Settings)',
            '• Pixel ID (Events Manager)',
            '• Catalog ID (Commerce Manager - opsiyonel)',
          ],
        },
      ],
    },
    {
      title: '2. Meta Pixel Kurulumu',
      content: [
        'Meta Pixel, sitenizde ziyaretçi davranışlarını takip eden JavaScript kodudur. Reklam optimizasyonu için kritik öneme sahiptir.',
      ],
      subsections: [
        {
          title: 'Pixel ID Nasıl Bulunur?',
          steps: [
            '1. https://business.facebook.com/events_manager2 adresine gidin',
            '2. Sol menüden "Data Sources" bölümünü açın',
            '3. İlgili Pixel\'inizi seçin',
            '4. Sağ üst köşede "Settings" butonuna tıklayın',
            '5. "Pixel ID" alanındaki 15 haneli numarayı kopyalayın',
          ],
          content: ['Pixel ID formatı: 123456789012345 (15 haneli sayı)'],
        },
        {
          title: 'Pixel ID Panele Ekleme',
          steps: [
            '1. Pazarlama & SEO sayfasına gidin',
            '2. "Meta Asset ID\'leri" formunu bulun',
            '3. "Pixel ID" alanına kopyaladığınız ID\'yi yapıştırın',
            '4. "ID\'leri Güncelle" butonuna tıklayın',
          ],
          content: ['', 'Not: ID eklendikten sonra sistem otomatik olarak Pixel durumunu Graph API üzerinden çekmeye başlar.'],
        },
        {
          title: 'Pixel Durumu Kontrolü',
          content: [
            'ID eklendikten sonra "Meta Entegrasyon Durumu" kartında Pixel bilgilerinizi görebilirsiniz:',
            '',
            '• Aktif: Son 24 saat içinde event tetiklenmiş',
            '• Beklemede: 24 saatten uzun süredir event yok',
            '• Hazırlanıyor: Henüz event tetiklenmemiş',
          ],
          warning: 'Pixel sadece frontend\'e kurulduğunda event gönderebilir. Şu anda sistem sadece Pixel durumunu izlemektedir.',
        },
        {
          title: 'Event Match Quality (EMQ)',
          content: [
            'Event Match Quality, Meta\'nın gönderilen event verilerinin kalitesini ölçen bir metriktir (0-10 arası).',
            '',
            'Yüksek EMQ için gönderilmesi gerekenler:',
            '• email (hash\'lenmiş)',
            '• phone (hash\'lenmiş)',
            '• external_id (kullanıcı ID)',
            '• client_user_agent',
            '• fbc (Facebook Click ID)',
            '• fbp (Facebook Browser ID)',
          ],
          tips: [
            'EMQ 6\'nın üzerinde olmalıdır',
            'Kişisel verileri SHA-256 ile hash\'leyin',
            'Her event için mümkün olduğunca çok parametre gönderin',
          ],
        },
      ],
    },
    {
      title: '3. Conversions API (CAPI) Yapılandırması',
      content: [
        'Conversions API, browser tabanlı Pixel\'in yanında sunucu tarafından event göndermenizi sağlar. iOS 14.5+ güncellemeleri nedeniyle kritik önem kazanmıştır.',
      ],
      subsections: [
        {
          title: 'System User Token Oluşturma',
          steps: [
            '1. https://business.facebook.com/settings/system-users adresine gidin',
            '2. "Add" butonuna tıklayarak yeni System User oluşturun',
            '3. İsim verin (örn: "E-commerce CAPI")',
            '4. Role olarak "Admin" seçin',
            '5. Oluşturulan kullanıcıya tıklayın',
            '6. "Generate New Token" butonuna basın',
            '7. İlgili App\'inizi seçin',
            '8. Şu izinleri seçin:',
            '   • ads_management',
            '   • business_management',
            '   • catalog_management',
            '9. Token süresini seçin (60 gün veya Never Expire)',
            '10. Token\'ı kopyalayın ve güvenli bir yere kaydedin',
          ],
          warning: 'Token sadece bir kere gösterilir! Kaybederseniz yeni token oluşturmanız gerekir.',
        },
        {
          title: 'Token Panele Ekleme',
          steps: [
            '1. Pazarlama & SEO sayfasına gidin',
            '2. "CAPI Access Token" formunu bulun',
            '3. "Access Token" alanına token\'ı yapıştırın',
            '4. "Token Bitiş Tarihi" alanına süresini girin (opsiyonel)',
            '5. "Scopes" alanına izinleri yazın (opsiyonel)',
            '6. "Token\'ı Kaydet" butonuna tıklayın',
          ],
          content: [
            '',
            'Token kaydedildikten sonra:',
            '• "Meta Entegrasyon Durumu" altında "Conversions API" kartı belirir',
            '• Token kalan süresini görebilirsiniz',
            '• Token 2 günden az kaldığında uyarı alırsınız',
          ],
        },
        {
          title: 'Conversions API App ID',
          content: [
            'CAPI için ayrı bir App ID gerekir. Bunu almak için:',
            '',
            '1. https://developers.facebook.com/apps adresine gidin',
            '2. İlgili App\'inize tıklayın',
            '3. Sol menüden "Settings" > "Basic" seçin',
            '4. "App ID" değerini kopyalayın',
            '',
            'Bu ID\'yi "Meta Asset ID\'leri" formunda "Conversions API App ID" alanına girin.',
          ],
        },
        {
          title: 'CAPI Event Gönderimi',
          content: [
            'CAPI eventleri sunucu tarafından gönderilir. Tipik event akışı:',
            '',
            '1. Kullanıcı sitenizde bir aksiyon yapar (ürün görüntüleme, sepete ekleme)',
            '2. Frontend, backend\'e istek gönderir',
            '3. Backend, hem veritabanına kaydeder hem Meta CAPI\'ye event gönderir',
            '4. Meta, event\'i işler ve reklam optimizasyonunda kullanır',
          ],
          code: `// Örnek CAPI event gönderimi
const response = await fetch(
  'https://graph.facebook.com/v19.0/{pixel-id}/events',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      data: [{
        event_name: 'Purchase',
        event_time: Math.floor(Date.now() / 1000),
        user_data: {
          em: 'hash_email',
          ph: 'hash_phone',
          external_id: 'user_123'
        },
        custom_data: {
          value: 129.99,
          currency: 'TRY',
          content_ids: ['product_456'],
          content_type: 'product'
        }
      }],
      access_token: 'YOUR_SYSTEM_USER_TOKEN'
    })
  }
)`,
        },
        {
          title: 'CAPI Test Tool',
          content: [
            'Meta, CAPI eventlerinizi test etmeniz için bir araç sunar:',
            '',
            '1. https://business.facebook.com/events_manager2/test_events adresine gidin',
            '2. İlgili Pixel\'inizi seçin',
            '3. "Test Events" sekmesine gidin',
            '4. Test event gönderdiğinizde burada görünecektir',
            '5. Event detaylarını inceleyerek doğru gönderildiğini kontrol edin',
          ],
          tips: [
            'Test eventlerinde "test_event_code" parametresi kullanın',
            'Canlıya geçmeden önce mutlaka test edin',
            'Event Match Quality skorunu kontrol edin',
          ],
        },
      ],
    },
    {
      title: '4. Catalog Feed Yönetimi',
      content: [
        'Catalog Feed, ürün verilerinizi Meta\'ya otomatik olarak senkronize eder. Dinamik reklamlar ve Instagram Shopping için gereklidir.',
      ],
      subsections: [
        {
          title: 'Catalog ID Nasıl Bulunur?',
          steps: [
            '1. https://business.facebook.com/commerce_manager adresine gidin',
            '2. Sol menüden "Catalogs" seçin',
            '3. İlgili kataloğunuza tıklayın',
            '4. Sağ üst "Settings" butonuna basın',
            '5. "Catalog ID" değerini kopyalayın',
          ],
        },
        {
          title: 'Catalog ID Panele Ekleme',
          steps: [
            '1. Pazarlama & SEO sayfasına gidin',
            '2. "Meta Asset ID\'leri" formunu bulun',
            '3. "Catalog ID" alanına ID\'yi yapıştırın',
            '4. "ID\'leri Güncelle" butonuna tıklayın',
          ],
          content: ['', 'Catalog eklendikten sonra "Catalog Feed Takip" bölümünde feed durumlarınızı görebilirsiniz.'],
        },
        {
          title: 'Feed Senkronizasyon Durumları',
          content: [
            '"Catalog Feed Takip" kartında her feed için:',
            '',
            '• Senkron: Feed başarıyla güncellenmiş',
            '• Devam Ediyor: Feed şu anda işleniyor',
            '• Beklemede: Feed hataya düştü veya güncellenmeyi bekliyor',
            '',
            'Feed detayları:',
            '• Plan: Feed güncelleme sıklığı (Saatlik, Günlük, Haftalık)',
            '• Son çalıştırma: Feed\'in son güncellenme zamanı',
            '• Uyarılar: Varsa feed hataları',
          ],
        },
        {
          title: 'Product Feed Formatı',
          content: [
            'Meta, product feed için şu formatları kabul eder:',
            '',
            '• XML (RSS/Atom)',
            '• CSV',
            '• TSV',
            '',
            'Zorunlu alanlar:',
            '• id: Ürün benzersiz kimliği',
            '• title: Ürün adı',
            '• description: Ürün açıklaması',
            '• availability: Stok durumu (in stock, out of stock)',
            '• condition: Ürün durumu (new, refurbished, used)',
            '• price: Fiyat (örn: "129.99 TRY")',
            '• link: Ürün sayfası URL',
            '• image_link: Ürün görseli URL',
            '• brand: Marka',
          ],
        },
        {
          title: 'Feed URL Oluşturma',
          content: [
            'Siteniz için otomatik product feed oluşturmak üzere:',
            '',
            '1. Backend\'de /api/feed.xml endpoint\'i oluşturun',
            '2. Bu endpoint, veritabanındaki tüm ürünleri XML formatında döndürsün',
            '3. Meta Commerce Manager\'da bu URL\'yi feed olarak ekleyin',
            '4. Feed planını (güncelleme sıklığı) ayarlayın',
          ],
          code: `// Örnek feed URL
https://siteniz.com/api/feed.xml

// Örnek XML çıktısı
<?xml version="1.0"?>
<rss version="2.0">
  <channel>
    <item>
      <id>product_123</id>
      <title>Sürdürülebilir Spor Ayakkabı</title>
      <description>Organik malzemeler...</description>
      <availability>in stock</availability>
      <condition>new</condition>
      <price>449.99 TRY</price>
      <link>https://siteniz.com/shop/products/ayakkabi-123</link>
      <image_link>https://siteniz.com/images/ayakkabi.jpg</image_link>
      <brand>Marka Adı</brand>
    </item>
  </channel>
</rss>`,
        },
        {
          title: 'Feed Hataları ve Çözümleri',
          content: [
            'Yaygın feed hataları:',
            '',
            '• Missing required field: Zorunlu alan eksik → Tüm zorunlu alanları ekleyin',
            '• Invalid URL: Geçersiz URL → URL\'lerin https:// ile başladığından emin olun',
            '• Image not accessible: Görsel yüklenemedi → Görsel URL\'lerinin erişilebilir olduğunu kontrol edin',
            '• Price format error: Fiyat formatı hatalı → "129.99 TRY" formatını kullanın',
            '• Duplicate ID: Tekrar eden ID → Her ürün için benzersiz ID kullanın',
          ],
          tips: [
            'Feed URL\'iniz herkese açık olmalı (kimlik doğrulama gerektirmemeli)',
            'Feed boyutu maksimum 100MB olmalı',
            'Ürün sayısı 1 milyondan az olmalı',
            'Feed güncellemesi maksimum 24 saatte bir otomatik yapılır',
          ],
        },
      ],
    },
    {
      title: '5. Pazarlama Panel Özellikleri',
      content: [
        'Pazarlama & SEO paneli, tüm pazarlama araçlarınızı merkezi bir konumda yönetmenizi sağlar.',
      ],
      subsections: [
        {
          title: 'Meta İzinleri Bölümü',
          content: [
            'Bu bölüm, Meta Business Suite erişim yönetiminizi gösterir:',
            '',
            '• Ad Account: Reklam hesabı ID\'niz',
            '• Meta Pixel Bağla: Events Manager\'a hızlı erişim',
            '• Catalog Feed Ekle: Commerce Manager\'a hızlı erişim',
            '• Conversions API Yetkilendir: Developers paneline hızlı erişim',
            '',
            'Graph API App ID ve Token kaynağı bilgileri de burada görüntülenir.',
          ],
        },
        {
          title: 'Meta Entegrasyon Durumu',
          content: [
            'Tüm Meta varlıklarınızın (Pixel, CAPI, Catalog) durumunu tek bakışta gösterir:',
            '',
            'Her entegrasyon için:',
            '• Varlık adı ve ID',
            '• Durum badge (Aktif, Beklemede, Hazırlanıyor)',
            '• Son senkronizasyon zamanı',
            '• Kapsam bilgisi (örn: kaç ürün indeksli)',
            '',
            'Varlık yoksa uyarı mesajı görüntülenir.',
          ],
        },
        {
          title: 'Catalog Feed Takip',
          content: [
            'Meta Commerce Manager\'daki feed senkronizasyonlarınızı izler:',
            '',
            'Her feed için:',
            '• Feed adı',
            '• Güncelleme planı (Saatlik, Günlük, Haftalık)',
            '• Son çalıştırma zamanı',
            '• Durum (Senkron, Devam Ediyor, Beklemede)',
            '• Uyarılar ve hatalar',
            '',
            'Feed verisi yoksa bilgilendirme mesajı gösterilir.',
          ],
        },
        {
          title: 'CAPI Aktivasyon Adımları',
          content: [
            'Conversions API kurulumu için yapılması gereken adımları listeler:',
            '',
            '• Token yenileme cron job\'ı kurulumu',
            '• Test events ile Purchase/PDP View doğrulaması',
            '• Supabase events tablosu ile CAPI loglarının eşlenmesi',
            '• Token süre uyarıları (2 günden az kaldığında)',
            '',
            'Token eksikse veya süresi doluyorsa uyarı gösterir.',
          ],
        },
        {
          title: 'Meta Bağlantı Rehberi',
          content: [
            'Panel üst kısmında, Meta entegrasyonu için adım adım rehber bulunur:',
            '',
            '1. System User Token oluşturma',
            '2. Pixel ID öğrenme',
            '3. Catalog ve Feed ID\'lerini alma',
            '4. App ID & Reklam hesabı bilgilerini bulma',
            '',
            'Her adım için:',
            '• Kaynak (nereden alınacağı)',
            '• Açıklama (nasıl yapılacağı)',
            '• Kayıt yeri (nereye yazılacağı)',
          ],
        },
        {
          title: 'Form Kullanımı',
          content: [
            'Panel iki ana form içerir:',
            '',
            '1. CAPI Access Token Formu:',
            '   • Access Token alanı (zorunlu)',
            '   • Token Bitiş Tarihi (opsiyonel)',
            '   • Scopes (opsiyonel)',
            '   • Token\'ı Kaydet butonu',
            '',
            '2. Meta Asset ID\'leri Formu:',
            '   • Pixel ID',
            '   • Catalog ID',
            '   • Conversions API App ID',
            '   • Meta App ID',
            '   • Reklam Hesabı ID (act_...)',
            '   • ID\'leri Güncelle butonu',
            '',
            'Formlar gönderildikten sonra başarı/hata mesajı gösterilir ve sayfa otomatik yenilenir.',
          ],
        },
      ],
    },
    {
      title: '6. SEO Metrikleri ve Takibi',
      content: [
        'Pazarlama paneli, sitenizin organik performansını izlemek için SEO metrikleri de içerir.',
      ],
      subsections: [
        {
          title: 'SEO Metrik Kartları',
          content: [
            'Panel 4 ana SEO metriği gösterir:',
            '',
            '1. Organik Trafik:',
            '   • Son 30 gündeki toplam organik ziyaretçi',
            '   • Önceki döneme göre yüzde değişim',
            '',
            '2. Anahtar Kelime Sayısı:',
            '   • Sitenizin sıralandığı toplam kelime sayısı',
            '   • Yeni eklenen kelime sayısı',
            '',
            '3. Dönüşüm Oranı:',
            '   • Organik trafikten gelen dönüşüm yüzdesi',
            '   • Önceki döneme göre puan değişimi',
            '',
            '4. Ortalama Konum:',
            '   • Tüm kelimelerde ortalama sıralama',
            '   • İyileşme/kötüleşme bilgisi',
          ],
          warning: 'Şu anda bu metrikler demo verisidir. Gerçek veriler için Google Analytics 4 veya Google Search Console entegrasyonu gerekir.',
        },
        {
          title: 'Anahtar Kelime Backlog\'u',
          content: [
            'Hedeflenmesi planlanan anahtar kelimeleri tabloda gösterir:',
            '',
            'Her kelime için:',
            '• Anahtar Kelime: Hedeflenen arama terimi',
            '• Hacim: Aylık arama sayısı',
            '• Konum: Mevcut sıralama',
            '• Niyet: Kullanıcı amacı (Satın alma, Araştırma, Farkındalık)',
            '',
            'Bu tablo, içerik stratejisi planlaması için kullanılır.',
          ],
          tips: [
            'Satın alma niyetli kelimelere öncelik verin',
            'Hacim ve rekabet dengesine dikkat edin',
            'Mevcut konumunuz 20\'den düşükse optimizasyon fırsatı vardır',
          ],
        },
        {
          title: 'Google Search Console Entegrasyonu',
          content: [
            'Gerçek SEO metriklerini göstermek için Google Search Console (GSC) entegrasyonu önerilir:',
            '',
            '1. GSC API\'yi etkinleştirin',
            '2. Servis hesabı oluşturup kimlik bilgilerini alın',
            '3. Backend\'de GSC API client kurulumu yapın',
            '4. Panel, GSC\'den veri çekmeye başlar',
            '',
            'GSC\'den alınabilecek metrikler:',
            '• Toplam tıklama',
            '• Toplam gösterim',
            '• Ortalama CTR',
            '• Ortalama konum',
            '• Kelime bazında performans',
          ],
        },
      ],
    },
    {
      title: '7. Kampanya Yönetimi ve Checklist',
      content: [
        'Panel, pazarlama ve SEO ekipleri arasında koordinasyonu sağlamak için kampanya yönetimi araçları sunar.',
      ],
      subsections: [
        {
          title: 'Kampanya Checklist Kartları',
          content: [
            'Her kampanya kartı şunları içerir:',
            '',
            '• Kampanya başlığı',
            '• Sorumlu ekip (SEO, Marketing, Content)',
            '• Durum badge (Devam ediyor, Hazır, Blokede)',
            '• Görev listesi (checklist)',
            '',
            'Örnek kampanyalar:',
            '• Black Friday Landing: SEO optimize landing page hazırlığı',
            '• Influencer UTM Takibi: Influencer linklerinin izlenmesi',
            '• Blog İçerik Sprinti: İçerik üretimi planlaması',
          ],
        },
        {
          title: 'İçerik Optimizasyon Notları',
          content: [
            'Önümüzdeki sprintte uygulanacak optimizasyon maddeleri:',
            '',
            '• Ürün detay sayfalarına FAQ schema ekleme',
            '• Blog içeriği için dahili linklemeyi %20 artırma',
            '• UTM\'li kampanya linkleri için Supabase event log\'u oluşturma',
            '',
            'Bu notlar, ekip arasında teknik SEO görevlerinin takibi için kullanılır.',
          ],
        },
        {
          title: 'Kampanya Koordinasyon İpuçları',
          content: [
            'Başarılı kampanya yönetimi için:',
            '',
            '• Her kampanya için net sahiplik atayın',
            '• Görevleri küçük, ölçülebilir parçalara bölün',
            '• Bağımlılıkları belirleyin (hangisi hangi görevi bekliyor)',
            '• Düzenli durum güncellemeleri yapın',
            '• Tamamlanan görevleri hemen işaretleyin',
          ],
          tips: [
            'Haftalık sprint planlaması yapın',
            'Blokede kalan görevleri önceliklendirin',
            'Ekipler arası iletişimi güçlendirin',
          ],
        },
      ],
    },
    {
      title: '8. Sık Sorulan Sorular',
      content: [],
      subsections: [
        {
          title: 'Meta Pixel neden veri göstermiyor?',
          content: [
            'Olası nedenler:',
            '',
            '• Pixel ID yanlış girilmiş → ID\'yi Events Manager\'dan tekrar kontrol edin',
            '• Pixel henüz frontend\'e kurulmamış → Pixel kodunu site layout\'una ekleyin',
            '• Event tetiklenmemiş → Sitenizi ziyaret edin ve eventleri tetikleyin',
            '• Access token geçersiz → Token\'ın süresini ve izinlerini kontrol edin',
          ],
        },
        {
          title: 'Conversions API token ne kadar sürede yenilenmeli?',
          content: [
            'Token süresi oluştururken seçtiğiniz süreye bağlıdır:',
            '',
            '• 60 gün: En yaygın seçenek, her 2 ayda bir yenileyin',
            '• Never Expire: Güvenlik riski taşır, önerilmez',
            '',
            'Panel, token süresi 2 günden az kaldığında otomatik uyarı gösterir.',
          ],
        },
        {
          title: 'Catalog feed neden hata veriyor?',
          content: [
            'Yaygın feed hataları:',
            '',
            '• Feed URL\'si erişilebilir değil → URL\'yi tarayıcıda açıp test edin',
            '• Zorunlu alanlar eksik → XML/CSV\'de tüm zorunlu alanları kontrol edin',
            '• Ürün görselleri yüklenemiyor → Görsel URL\'lerinin https olduğundan emin olun',
            '• ID formatı hatalı → Benzersiz ID kullandığınızdan emin olun',
            '',
            'Detaylı hata mesajları "Catalog Feed Takip" kartındaki "Uyarılar" bölümünde görünür.',
          ],
        },
        {
          title: 'SEO metrikleri neden statik?',
          content: [
            'Şu anda SEO metrikleri demo verisi olarak gösteriliyor.',
            '',
            'Gerçek verileri göstermek için:',
            '• Google Analytics 4 entegrasyonu kurun',
            '• Google Search Console API\'yi bağlayın',
            '• Backend\'de metrik çekme endpoint\'i oluşturun',
            '',
            'Entegrasyon sonrası metrikler otomatik güncellenecektir.',
          ],
        },
        {
          title: 'Panel verileri ne sıklıkta güncellenir?',
          content: [
            'Veri güncelleme sıklıkları:',
            '',
            '• Meta entegrasyon durumu: Her sayfa yüklemesinde (gerçek zamanlı)',
            '• Catalog feed durumu: Meta\'nın güncelleme sıklığına göre (saatlik/günlük)',
            '• Token bilgileri: Veritabanından gerçek zamanlı',
            '• SEO metrikleri: Entegrasyon sonrası günlük',
            '',
            'Sayfa yenileme butonu ile manuel güncelleme de yapabilirsiniz.',
          ],
        },
      ],
    },
    {
      title: '9. Sorun Giderme',
      content: [
        'Panel kullanımında karşılaşabileceğiniz sorunlar ve çözümleri:',
      ],
      subsections: [
        {
          title: 'Meta Graph API Hatası',
          content: [
            'Hata mesajı: "Meta Graph API access token bulunamadı"',
            '',
            'Çözüm:',
            '1. System User Token oluşturup panele ekleyin',
            '2. Token\'ın geçerli olduğundan emin olun',
            '3. Token izinlerini kontrol edin (ads_management, business_management)',
            '4. Sayfayı yenileyin',
          ],
        },
        {
          title: 'Token Süre Uyarısı',
          content: [
            'Hata mesajı: "Token süresi kritik: 48 saat içinde yenile"',
            '',
            'Çözüm:',
            '1. Meta Business Settings > System Users\'a gidin',
            '2. Mevcut system user için yeni token oluşturun',
            '3. Yeni token\'ı panele ekleyin',
            '4. Eski token otomatik olarak güncellenir',
          ],
        },
        {
          title: 'Varlık Bulunamadı',
          content: [
            'Hata mesajı: "Meta varlığı bulunamadı"',
            '',
            'Çözüm:',
            '1. Pixel ID, Catalog ID gibi varlık ID\'lerini panele ekleyin',
            '2. ID\'lerin doğru olduğundan emin olun',
            '3. Access token\'ın bu varlıklara erişim izni olduğunu kontrol edin',
            '4. Sayfayı yenileyin',
          ],
        },
        {
          title: 'Form Gönderme Hatası',
          content: [
            'Hata mesajı: "Token/ID kaydedilemedi"',
            '',
            'Çözüm:',
            '1. Tarayıcı konsolunu açın (F12) ve hata mesajını kontrol edin',
            '2. Supabase bağlantınızın aktif olduğundan emin olun',
            '3. Veritabanı tablolarının (meta_tokens, meta_assets) var olduğunu kontrol edin',
            '4. Kullanıcınızın yeterli yetkisi olduğundan emin olun',
            '5. Tekrar deneyin',
          ],
        },
        {
          title: 'Sayfa Yüklenmiyor',
          content: [
            'Panel sayfası yükleniyorsa ancak içerik gösterilmiyorsa:',
            '',
            'Kontrol listesi:',
            '• Tarayıcı konsolunda JavaScript hatası var mı?',
            '• Network sekmesinde API istekleri başarılı mı?',
            '• Supabase servis hesabı yapılandırıldı mı?',
            '• Backend sunucusu çalışıyor mu?',
            '',
            'Hata devam ederse, tarayıcı geliştirici araçlarındaki hata mesajını inceleyin.',
          ],
        },
        {
          title: 'Destek ve Yardım',
          content: [
            'Sorun çözemediyseniz:',
            '',
            '• Meta Business Help Center: https://www.facebook.com/business/help',
            '• Meta Developers Docs: https://developers.facebook.com/docs',
            '• Graph API Explorer: https://developers.facebook.com/tools/explorer',
            '',
            'Teknik destek için admin paneli sağ üst köşesindeki "Yardım" butonunu kullanabilirsiniz.',
          ],
        },
      ],
    },
  ]

  // Ana içeriği render et
  sections.forEach((section, sectionIndex) => {
    addPageNumber()
    doc.addPage()
    yPosition = margin

    // Bölüm başlığı
    doc.setFontSize(18)
    doc.setTextColor(17, 24, 39)
    doc.text(section.title, margin, yPosition)
    yPosition += 10

    // Bölüm içeriği
    doc.setFontSize(10)
    doc.setTextColor(55, 65, 81)
    if (section.content && section.content.length > 0) {
      section.content.forEach((paragraph) => {
        if (paragraph === '') {
          yPosition += 4
          return
        }
        checkNewPage(10)
        const lines = doc.splitTextToSize(paragraph, contentWidth)
        doc.text(lines, margin, yPosition)
        yPosition += lines.length * 5
      })
    }

    yPosition += 5

    // Alt bölümler
    section.subsections?.forEach((subsection) => {
      checkNewPage(15)

      // Alt başlık
      doc.setFontSize(12)
      doc.setTextColor(37, 99, 235)
      doc.text(subsection.title, margin, yPosition)
      yPosition += 7

      // Alt bölüm içeriği
      doc.setFontSize(10)
      doc.setTextColor(55, 65, 81)
      if (subsection.content && subsection.content.length > 0) {
        subsection.content.forEach((paragraph) => {
          if (paragraph === '') {
            yPosition += 3
            return
          }
          checkNewPage(8)
          const lines = doc.splitTextToSize(paragraph, contentWidth)
          doc.text(lines, margin, yPosition)
          yPosition += lines.length * 4.5
        })
      }

      // Adımlar
      if (subsection.steps) {
        yPosition += 3
        subsection.steps.forEach((step) => {
          checkNewPage(8)
          const lines = doc.splitTextToSize(step, contentWidth - 5)
          doc.text(lines, margin + 5, yPosition)
          yPosition += lines.length * 4.5
        })
      }

      // Kod bloğu
      if (subsection.code) {
        checkNewPage(40)
        yPosition += 3
        doc.setFillColor(243, 244, 246)
        doc.rect(margin, yPosition - 3, contentWidth, 35, 'F')
        doc.setFontSize(8)
        doc.setTextColor(17, 24, 39)
        const codeLines = subsection.code.split('\n')
        codeLines.forEach((line) => {
          if (yPosition > pageHeight - margin - 5) {
            addPageNumber()
            doc.addPage()
            yPosition = margin
          }
          doc.text(line, margin + 2, yPosition)
          yPosition += 3.5
        })
        yPosition += 5
      }

      // Uyarı
      if (subsection.warning) {
        checkNewPage(12)
        yPosition += 3
        doc.setFillColor(254, 243, 199)
        doc.setDrawColor(251, 191, 36)
        doc.rect(margin, yPosition - 3, contentWidth, 10, 'FD')
        doc.setFontSize(9)
        doc.setTextColor(120, 53, 15)
        doc.text('⚠️ UYARI:', margin + 2, yPosition + 1)
        const warnLines = doc.splitTextToSize(subsection.warning, contentWidth - 20)
        doc.text(warnLines, margin + 18, yPosition + 1)
        yPosition += 12
      }

      // İpuçları
      if (subsection.tips && subsection.tips.length > 0) {
        checkNewPage(15)
        yPosition += 3
        doc.setFillColor(220, 252, 231)
        doc.setFontSize(9)
        doc.setTextColor(21, 128, 61)
        doc.text('💡 İpuçları:', margin + 2, yPosition)
        yPosition += 5
        subsection.tips.forEach((tip) => {
          checkNewPage(8)
          const tipLines = doc.splitTextToSize(`• ${tip}`, contentWidth - 10)
          doc.text(tipLines, margin + 5, yPosition)
          yPosition += tipLines.length * 4
        })
        yPosition += 5
      }

      yPosition += 5
    })
  })

  // Son sayfa - İletişim
  addPageNumber()
  doc.addPage()
  yPosition = margin

  doc.setFillColor(239, 246, 255)
  doc.rect(0, 0, pageWidth, pageHeight, 'F')

  doc.setFontSize(20)
  doc.setTextColor(37, 99, 235)
  doc.text('İletişim ve Destek', pageWidth / 2, yPosition + 20, { align: 'center' })

  yPosition += 40
  doc.setFontSize(11)
  doc.setTextColor(55, 65, 81)
  doc.text('Bu rehber hakkında sorularınız için:', pageWidth / 2, yPosition, { align: 'center' })

  yPosition += 15
  doc.setFontSize(10)
  doc.text('E-Ticaret Admin Panel', pageWidth / 2, yPosition, { align: 'center' })
  yPosition += 6
  doc.text('Pazarlama & SEO Modülü', pageWidth / 2, yPosition, { align: 'center' })

  yPosition += 15
  doc.setTextColor(37, 99, 235)
  doc.text('Meta Business Help Center', pageWidth / 2, yPosition, { align: 'center' })
  yPosition += 5
  doc.setFontSize(9)
  doc.setTextColor(107, 114, 128)
  doc.text('https://www.facebook.com/business/help', pageWidth / 2, yPosition, { align: 'center' })

  yPosition += 10
  doc.setFontSize(10)
  doc.setTextColor(37, 99, 235)
  doc.text('Meta Developers Documentation', pageWidth / 2, yPosition, { align: 'center' })
  yPosition += 5
  doc.setFontSize(9)
  doc.setTextColor(107, 114, 128)
  doc.text('https://developers.facebook.com/docs', pageWidth / 2, yPosition, { align: 'center' })

  yPosition += 20
  doc.setFontSize(8)
  doc.setTextColor(156, 163, 175)
  doc.text(`Rehber Oluşturma Tarihi: ${new Date().toLocaleDateString('tr-TR')}`, pageWidth / 2, yPosition, {
    align: 'center',
  })
  yPosition += 4
  doc.text('Versiyon 1.0', pageWidth / 2, yPosition, { align: 'center' })

  addPageNumber()

  return doc
}
