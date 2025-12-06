# 🛍️ Modern E-Ticaret Platformu

**Next.js 15 + Supabase** ile geliştirilmiş, kurumsal düzeyde özelliklerle donatılmış, tam kapsamlı e-ticaret çözümü.

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8)](https://tailwindcss.com/)

---

## ✨ Öne Çıkan Özellikler

### 🎯 Pazarlama & Analitik Entegrasyonları
- **Google Analytics 4** - Gelişmiş kullanıcı davranış analizi ve e-ticaret takibi
- **Google Tag Manager** - Merkezi tag yönetimi ve dönüşüm optimizasyonu
- **Google Search Console** - SEO performans metrikleri ve organik trafik analizi
- **Meta Pixel** - Facebook/Instagram reklam takibi ve retargeting
- **Meta Conversions API** - Server-side event tracking ile iOS 14+ uyumluluğu
- **Meta Catalog Feed** - Otomatik ürün feed'i dinamik reklam kampanyaları için

### 🏪 Marketplace Entegrasyonları
- **Trendyol API** - Tam otomatik ürün senkronizasyonu
  - Gerçek zamanlı stok ve fiyat güncelleme
  - Webhook ile sipariş bildirimleri
  - Çift yönlü envanter yönetimi
  - Detaylı senkronizasyon geçmişi

### 🛒 E-Ticaret Özellikleri
- **Ürün Yönetimi** - Varyantlar, kategoriler, markalar, SEO optimizasyonu
- **Gelişmiş Varyant Sistemi** - Renk, beden, materyal gibi özelleştirilebilir varyantlar
- **Sipariş Yönetimi** - Sipariş takibi, durum güncelleme, müşteri bildirimleri
- **Müşteri Paneli** - Sipariş geçmişi, adres yönetimi, profil ayarları
- **Sepet & Ödeme** - Güvenli ödeme akışı, sepet yönetimi
- **Envanter Takibi** - Gerçek zamanlı stok kontrolü ve uyarıları

### 🔐 Güvenlik & Performans
- **Row Level Security (RLS)** - Veritabanı seviyesinde güvenlik
- **Rate Limiting** - API koruma (Upstash Redis + in-memory fallback)
- **Webhook Security** - HMAC signature doğrulama
- **Type-Safe** - End-to-end TypeScript güvenliği
- **Server Components** - Optimize edilmiş Next.js 15 App Router

### 📊 Admin Panel
- **Dashboard** - Satış, sipariş, müşteri metrikleri
- **Pazarlama Merkezi** - Tüm entegrasyonların tek noktadan yönetimi
- **Ürün Katalogu** - Toplu işlemler, filtreleme, arama
- **Müşteri Yönetimi** - CRM özellikleri, sipariş geçmişi
- **Entegrasyon Ayarları** - API credentials, webhook yapılandırma

---

## 🚀 Hızlı Başlangıç

### Gereksinimler

- Node.js 18+
- Supabase hesabı (ücretsiz plan yeterli)
- Git

### Kurulum

```bash
# Repository'yi klonlayın
git clone https://github.com/kursatemre/E-commerce-supabase.git
cd E-commerce-supabase

# Bağımlılıkları yükleyin
npm install

# Environment variables ayarlayın
cp .env.example .env.local
# .env.local dosyasını düzenleyip Supabase bilgilerinizi girin

# Development server'ı başlatın
npm run dev
```

Tarayıcınızda http://localhost:3000 adresini açın.

### Veritabanı Kurulumu

1. Supabase Dashboard'a gidin
2. SQL Editor'ü açın
3. `supabase/migrations/` klasöründeki migration dosyalarını sırayla çalıştırın:
   - `20251203_variant_schema.sql`
   - `20251203_crm_enhancements.sql`
   - `20251205_trendyol_sync.sql`
   - `20251206_rls_security.sql`

Detaylı kurulum için: [SETUP-GUIDE.md](./SETUP-GUIDE.md)

---

## 📦 Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework

### Backend & Database
- **Supabase** - PostgreSQL database, Authentication, Storage
- **Server Actions** - Type-safe server mutations
- **Edge Functions** - Serverless background jobs

### Entegrasyonlar
- **Google APIs** - Analytics, Tag Manager, Search Console
- **Meta Graph API** - Pixel, CAPI, Catalog Feed
- **Trendyol API** - Marketplace sync
- **Upstash Redis** - Rate limiting (optional)

### DevOps
- **Vercel** - Deployment & hosting
- **GitHub Actions** - CI/CD (planned)
- **PM2** - Background workers management

---

## 🎨 Özellik Detayları

### Pazarlama Otomasyonu

#### Google Analytics 4
```typescript
import { trackViewItem, trackAddToCart, trackPurchase } from '@/lib/analytics/ga4'

// Ürün görüntüleme
trackViewItem({
  item_id: 'prod_123',
  item_name: 'Sürdürülebilir Ayakkabı',
  price: 299.99,
  currency: 'TRY'
})

// Sepete ekleme
trackAddToCart({
  item_id: 'prod_123',
  quantity: 1,
  price: 299.99
})

// Satın alma
trackPurchase({
  transaction_id: 'order_456',
  value: 299.99,
  items: [...]
})
```

#### Meta Conversions API
Server-side event tracking ile iOS 14+ güncelleme etkilerini minimize edin.

#### Otomatik Product Feed
```bash
# Meta Catalog için XML feed oluştur
npm run sync:meta-feed
```

### Trendyol Marketplace

#### Otomatik Senkronizasyon
```bash
# Ürünleri Trendyol'dan çek ve yerel veritabanıyla eşleştir
npm run sync:trendyol
```

#### Webhook Desteği
- Sipariş oluşturma/güncelleme bildirimleri
- Stok değişikliği bildirimleri
- Ürün durumu güncelleme
- HMAC signature doğrulama ile güvenli

### Varyant Sistemi

Esnek ve genişletilebilir varyant yönetimi:
- Renk, beden, materyal gibi tip tanımlama
- Her tip için seçenek ekleme
- Otomatik SKU kombinasyonu oluşturma
- Varyant bazlı fiyat/stok yönetimi

---

## 📁 Proje Yapısı

```
e-ticaret-supabase/
├── app/                      # Next.js App Router
│   ├── admin/               # Admin panel sayfaları
│   │   ├── marketing/       # Pazarlama entegrasyonları
│   │   ├── products/        # Ürün yönetimi
│   │   ├── orders/          # Sipariş yönetimi
│   │   └── integrations/    # Marketplace entegrasyonları
│   ├── shop/                # E-ticaret vitrin
│   ├── api/                 # API routes
│   │   ├── webhooks/        # Webhook endpoints
│   │   └── seo/            # SEO API'leri
│   └── auth/                # Kimlik doğrulama
├── src/
│   ├── actions/             # Server Actions
│   ├── components/          # React bileşenleri
│   ├── lib/                 # Utility fonksiyonlar
│   │   ├── analytics/       # Google Analytics
│   │   ├── google/          # Google API clients
│   │   ├── meta/            # Meta Graph API
│   │   ├── trendyol/        # Trendyol API client
│   │   └── supabase/        # Supabase clients
│   └── middleware/          # Rate limiting
├── supabase/
│   ├── migrations/          # Veritabanı şemaları
│   └── functions/           # Edge Functions
├── scripts/                 # Background workers
│   ├── sync-trendyol-products.mjs
│   ├── generate-meta-feed.mjs
│   └── notification-worker.mjs
└── docs/                    # Dokümantasyon
```

---

## 🔧 Environment Variables

### Zorunlu

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Site
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### Opsiyonel (Pazarlama)

```env
# Google
NEXT_PUBLIC_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
GOOGLE_SERVICE_ACCOUNT_EMAIL=...
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=...

# Meta
NEXT_PUBLIC_META_PIXEL_ID=123456789012345
META_SYSTEM_USER_TOKEN=...
META_CATALOG_ID=...

# Trendyol
TRENDYOL_API_KEY=your_api_key
TRENDYOL_API_SECRET=your_api_secret
TRENDYOL_SUPPLIER_ID=your_supplier_id

# Rate Limiting (Opsiyonel)
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
```

Tüm değişkenler için: [.env.example](./.env.example)

---

## 📚 Dokümantasyon

- **[Kurulum Rehberi](./SETUP-GUIDE.md)** - Detaylı kurulum ve yapılandırma
- **[API Dokümantasyonu](./docs/)** - Endpoint referansları
- **Marketing Guide** - `/admin/marketing/meta-guide` (uygulama içi)

---

## 🛠️ Geliştirme Komutları

```bash
# Development
npm run dev              # Development server başlat

# Production
npm run build            # Production build
npm run start            # Production server başlat

# Background Workers
npm run sync:trendyol    # Trendyol ürün senkronizasyonu
npm run sync:meta-feed   # Meta product feed oluştur
npm run notifications:worker  # Bildirim worker'ı başlat
```

---

## 🚢 Production Deployment

### Vercel (Önerilen)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/kursatemre/E-commerce-supabase)

1. GitHub'a push yapın
2. Vercel'de import edin
3. Environment variables ekleyin
4. Deploy!

### Diğer Platformlar

- **Railway** - Node.js apps için optimize
- **Render** - Background workers için uygundur
- **DigitalOcean App Platform** - Managed deployment

---

## 🔒 Güvenlik

- ✅ Row Level Security (RLS) tüm tablolarda aktif
- ✅ API credentials Supabase'de şifreli saklanır
- ✅ Rate limiting ile DDoS koruması
- ✅ Webhook HMAC signature doğrulama
- ✅ Type-safe server actions
- ✅ CORS politikaları

---

## 🤝 Katkıda Bulunma

Katkılarınızı bekliyoruz! Lütfen şu adımları izleyin:

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'feat: Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

---

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](./LICENSE) dosyasına bakın.

---

## 🙏 Teşekkürler

- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend as a Service
- [Vercel](https://vercel.com/) - Deployment platform
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework

---

## 📧 İletişim

Sorularınız veya önerileriniz için:

- GitHub Issues: [Issues](https://github.com/kursatemre/E-commerce-supabase/issues)
- Email: your-email@example.com

---

<div align="center">

**⭐ Projeyi beğendiyseniz yıldız vermeyi unutmayın!**

Made with ❤️ using Next.js & Supabase

</div>
