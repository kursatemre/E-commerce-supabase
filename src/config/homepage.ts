/**
 * HOMEPAGE İÇERİK YÖNETİMİ
 *
 * Bu dosya, ana sayfanın tüm içeriklerini merkezi bir yerden yönetmenizi sağlar.
 * Görselleri, metinleri, linkleri buradan kolayca değiştirebilirsiniz.
 *
 * İleride admin panel ile bu içerikleri veritabanından yönetebilirsiniz.
 */

export const homepageConfig = {
  // HERO SECTION
  hero: {
    title: 'Yeniden Keşfet',
    subtitle: 'Sakin çekiciliğin gücünü yaşayın',
    ctaText: 'Koleksiyonu Keşfet',
    ctaLink: '/shop?page=2', // Değiştirilebilir: '/shop?category=yeni-sezon'
    imageSrc: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&h=1080&fit=crop',
    imageAlt: 'Hero görseli - Yeni koleksiyon',
  },

  // TRUST STRIP (Güven Rozetleri)
  trustBadges: [
    {
      icon: '🚚',
      title: 'Hızlı Kargo',
      description: '2-3 gün içinde kapınızda',
    },
    {
      icon: '✨',
      title: 'Kalite Garantisi',
      description: 'Premium ürün kalitesi',
    },
    {
      icon: '↩️',
      title: 'Kolay İade',
      description: '14 gün içinde ücretsiz',
    },
    {
      icon: '🔒',
      title: 'Güvenli Ödeme',
      description: '256-bit SSL şifreleme',
    },
  ],

  // DUAL BANNER (Çift Banner)
  dualBanner: {
    left: {
      title: 'Kadın Koleksiyonu',
      link: '/shop?category=kadin',
      imageSrc: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&h=1000&fit=crop',
      imageAlt: 'Kadın koleksiyonu',
    },
    right: {
      title: 'Erkek Koleksiyonu',
      link: '/shop?category=erkek',
      imageSrc: 'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=800&h=1000&fit=crop',
      imageAlt: 'Erkek koleksiyonu',
    },
  },

  // PRODUCT CAROUSEL 1 (Öne Çıkan Ürünler)
  featuredSection: {
    title: 'Size Özel Seçtiklerimiz',
    subtitle: 'En yeni ve popüler ürünler',
    viewAllLink: '/shop?page=2',
  },

  // SINGLE BANNER (Tek Banner - Kampanya/Sürdürülebilirlik)
  singleBanner: {
    title: 'Sürdürülebilir Moda',
    subtitle: 'Doğaya saygılı, stilden ödün vermeyen koleksiyonumuz',
    ctaText: 'Keşfet',
    ctaLink: '/shop?category=surdurulebilir',
    imageSrc: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1920&h=1000&fit=crop',
    imageAlt: 'Sürdürülebilir koleksiyon',
    theme: 'light' as const, // 'light' veya 'dark'
  },

  // PRODUCT CAROUSEL 2 (Popüler Ürünler)
  popularSection: {
    title: 'Popüler Ürünler',
    subtitle: 'Müşterilerimizin favorileri',
    viewAllLink: '/shop?page=2',
  },
}

/**
 * İÇERİK GÜNCELLEME KILAVUZU:
 *
 * 1. GÖRSELLER:
 *    - Unsplash URL'lerini kendi ürün görsellerinizle değiştirin
 *    - Veya veritabanınızdan dinamik olarak çekin
 *
 * 2. METİNLER:
 *    - title, subtitle, ctaText alanlarını markanıza göre özelleştirin
 *    - SEO için imageAlt açıklamalarını güncelleyin
 *
 * 3. LİNKLER:
 *    - ctaLink ve link alanlarını gerçek kategorilerinize göre ayarlayın
 *    - Örnek: '/shop?category=kadin' → gerçek kategori slug'ınız
 *
 * 4. İLERİ SEVİYE:
 *    - Bu config'i veritabanına taşıyıp admin panelden yönetin
 *    - Supabase'de bir 'homepage_content' tablosu oluşturun
 *    - O zaman server component içinde fetch edip kullanın
 */

// Örnek: Farklı Sezonlara Göre Config
export const seasonalConfigs = {
  summer: {
    hero: {
      title: 'Yaz Koleksiyonu',
      subtitle: 'Sıcak günlerin hafif şıklığı',
      ctaText: 'Yaz Ürünlerini Gör',
      ctaLink: '/shop?category=yaz',
      imageSrc: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1920&h=1080&fit=crop',
      imageAlt: 'Yaz koleksiyonu',
    },
  },
  winter: {
    hero: {
      title: 'Kış Koleksiyonu',
      subtitle: 'Sıcak tutan, şık gösteren',
      ctaText: 'Kış Ürünlerini Gör',
      ctaLink: '/shop?category=kis',
      imageSrc: 'https://images.unsplash.com/photo-1483058712412-4245e9b90334?w=1920&h=1080&fit=crop',
      imageAlt: 'Kış koleksiyonu',
    },
  },
}
