# E-Ticaret Pazarlama & Entegrasyon Kurulum Rehberi

Bu rehber, e-ticaret projenize eklenen tüm pazarlama araçları ve entegrasyonların nasıl yapılandırılacağını adım adım açıklar.

## 📋 İçindekiler

1. [Veritabanı Migrasyonları](#veritabanı-migrasyonları)
2. [Google Entegrasyonları](#google-entegrasyonları)
3. [Meta (Facebook/Instagram) Entegrasyonu](#meta-entegrasyonu)
4. [Trendyol Marketplace Entegrasyonu](#trendyol-entegrasyonu)
5. [Güvenlik ve RLS Politikaları](#güvenlik)
6. [Background Workers](#background-workers)
7. [API Endpoints](#api-endpoints)
8. [Environment Variables](#environment-variables)

---

## 🗄️ Veritabanı Migrasyonları

### Migrasyonları Uygulama

```bash
# Supabase CLI ile
supabase db push

# Veya Supabase Dashboard'dan SQL Editor kullanarak
```

### Eklenen Tablolar

#### Google Entegrasyonları
- `google_integrations` - GA4, Search Console, Google Ads kimlik bilgileri

#### Meta Entegrasyonları
- `meta_tokens` - Meta API access token'ları
- `meta_assets` - Pixel ID, Catalog ID vb.

#### Trendyol Marketplace
- `trendyol_products` - Marketplace ürün senkronizasyonu
- `trendyol_orders` - Marketplace siparişleri
- `trendyol_order_items` - Sipariş kalemleri
- `trendyol_sync_runs` - Senkronizasyon logları
- `trendyol_webhook_events` - Webhook olayları

#### Genel Marketplace
- `marketplace_integrations` - Tüm marketplace kimlik bilgileri

---

## 🔍 Google Entegrasyonları

### 1. Google Analytics 4 (GA4)

#### Adımlar:

1. **GA4 Property Oluştur**
   - https://analytics.google.com/ adresine git
   - Admin > Create Property
   - Property ID'yi kopyala (örn: `properties/123456789`)

2. **Measurement ID Al**
   - Admin > Data Streams > Web Stream seç
   - Measurement ID'yi kopyala (örn: `G-ABCDE12345`)

3. **Environment Variables Ekle**
   ```bash
   NEXT_PUBLIC_GA4_MEASUREMENT_ID=G-ABCDE12345
   ```

4. **Panelden Kaydet**
   - `/admin/marketing` sayfasına git
   - "Google Entegrasyonları" formunu doldur
   - GA4 Property ID ve Measurement ID'yi gir

#### Otomatik Tracking:

Aşağıdaki eventler otomatik olarak track edilir:
- ✅ Page Views (Her sayfa yüklendiğinde)
- ✅ Meta Pixel olayları (varsa)

#### Manual Event Tracking:

```typescript
import { trackViewItem, trackAddToCart, trackPurchase } from '@/lib/analytics/ga4'

// Ürün görüntüleme
trackViewItem({
  item_id: 'prod_123',
  item_name: 'Ürün Adı',
  price: 149.99,
  currency: 'TRY',
  item_category: 'Ayakkabı',
  item_brand: 'Nike',
})

// Sepete ekleme
trackAddToCart({
  item_id: 'prod_123',
  item_name: 'Ürün Adı',
  price: 149.99,
  quantity: 1,
  currency: 'TRY',
})

// Satın alma
trackPurchase({
  transaction_id: 'order_456',
  value: 299.98,
  currency: 'TRY',
  tax: 53.99,
  shipping: 15.00,
  items: [...]
})
```

### 2. Google Tag Manager (GTM)

#### Adımlar:

1. **GTM Hesabı Oluştur**
   - https://tagmanager.google.com/ adresine git
   - Create Account > Create Container
   - Container ID'yi kopyala (örn: `GTM-XXXXXXX`)

2. **Environment Variables Ekle**
   ```bash
   NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
   ```

3. **GTM Container Yapılandır**
   - Tags > New > Google Analytics: GA4 Configuration
   - Measurement ID'yi gir
   - Triggers > All Pages seç
   - Submit ve Publish

GTM script'leri otomatik olarak tüm sayfalara eklenir.

### 3. Google Search Console

#### Adımlar:

1. **Service Account Oluştur**
   - https://console.cloud.google.com/ adresine git
   - IAM & Admin > Service Accounts
   - Create Service Account
   - JSON key indir

2. **Search Console'a Ekle**
   - https://search.google.com/search-console adresine git
   - Property seç > Settings > Users and Permissions
   - Service account email'ini "Owner" olarak ekle

3. **Panelden Kaydet**
   - `/admin/marketing` sayfasına git
   - "Google Entegrasyonları" formunu doldur
   - Service Account Email ve Private Key gir
   - Search Console site URL'sini gir (örn: `https://your-domain.com/`)

#### API Kullanımı:

```bash
# SEO metriklerini çek
GET /api/seo/search-console?days=30

# Response:
{
  "success": true,
  "data": {
    "totalMetrics": {
      "clicks": 1250,
      "impressions": 45000,
      "ctr": 0.028,
      "position": 14.2
    },
    "topQueries": [
      {
        "query": "sürdürülebilir ayakkabı",
        "clicks": 120,
        "impressions": 3500,
        "ctr": 0.034,
        "position": 8.5
      }
    ],
    "period": {
      "startDate": "2024-11-06",
      "endDate": "2024-12-06"
    }
  }
}
```

---

## 📘 Meta Entegrasyonu

### 1. Meta Pixel

#### Adımlar:

1. **Pixel Oluştur**
   - https://business.facebook.com/events_manager2 adresine git
   - Data Sources > Pixels > Add
   - Pixel ID'yi kopyala (15 haneli sayı)

2. **Environment Variables Ekle**
   ```bash
   NEXT_PUBLIC_META_PIXEL_ID=123456789012345
   ```

3. **Panelden Kaydet**
   - `/admin/marketing` sayfasına git
   - "Meta Asset ID'leri" formunu doldur
   - Pixel ID gir

Pixel script'i otomatik olarak tüm sayfalara eklenir ve PageView eventi gönderir.

### 2. Conversions API (CAPI)

#### Adımlar:

1. **System User Token Oluştur**
   - https://business.facebook.com/settings/system-users adresine git
   - Add System User
   - Generate Token butonuna bas
   - İzinler: `ads_management`, `business_management`, `catalog_management`
   - Token'ı kopyala

2. **Panelden Kaydet**
   - `/admin/marketing` sayfasına git
   - "CAPI Access Token" formunu doldur
   - Token ve bitiş tarihini gir

3. **CAPI App ID Al**
   - https://developers.facebook.com/apps adresine git
   - App seç > Settings > Basic
   - App ID kopyala

### 3. Meta Catalog Feed

#### Product Feed Oluşturma:

```bash
# Meta product feed oluştur
npm run sync:meta-feed

# Çıktı: public/meta-product-feed.xml
```

#### Feed URL'sini Meta'ya Ekle:

1. https://business.facebook.com/commerce_manager adresine git
2. Catalog seç > Data Sources > Add Product Feed
3. Feed URL: `https://your-domain.com/meta-product-feed.xml`
4. Schedule: Daily

#### Cron Job (Production):

```bash
# Günlük saat 3:00'te çalıştır
0 3 * * * cd /path/to/project && npm run sync:meta-feed
```

---

## 🛒 Trendyol Entegrasyonu

### 1. API Credentials

#### Adımlar:

1. **Trendyol Seller Portal**
   - https://sellerpublic.trendyol.com/ adresine git
   - Login > Entegrasyonlar > API
   - API Key ve API Secret al
   - Supplier ID'yi not al

2. **Panelden Kaydet**
   - `/admin/integrations` sayfasına git (yakında eklenecek)
   - Veya doğrudan veritabanına ekle:

```sql
INSERT INTO marketplace_integrations (channel, api_key, api_secret, supplier_id, status)
VALUES ('trendyol', 'YOUR_API_KEY', 'YOUR_API_SECRET', 'YOUR_SUPPLIER_ID', 'active');
```

### 2. Ürün Senkronizasyonu

```bash
# Trendyol ürünlerini senkronize et
npm run sync:trendyol

# Çıktı:
# 🔄 Starting Trendyol product sync...
# ✅ Retrieved Trendyol credentials
# 📦 Fetching page 0...
# ✅ Processed 100 products from page 0
# ✅ Sync completed successfully!
# 📊 Processed: 250, Errors: 0
```

#### Cron Job (Production):

```bash
# Her 6 saatte bir çalıştır
0 */6 * * * cd /path/to/project && npm run sync:trendyol
```

### 3. Webhook Kurulumu

#### Trendyol'da Webhook Ekle:

1. Seller Portal > Entegrasyonlar > Webhook
2. Webhook URL: `https://your-domain.com/api/webhooks/trendyol`
3. Events: Order Created, Order Updated, Product Updated, Stock Updated
4. Secret key'i not al

#### Webhook Signature Doğrulama:

Webhook endpoint otomatik olarak signature doğrulaması yapar:

```typescript
// Webhook gelen istek
POST /api/webhooks/trendyol
Headers:
  x-trendyol-signature: sha256_hash

// Otomatik işlenir:
✅ Signature doğrulanır
✅ Event loglara kaydedilir
✅ İlgili handler çalıştırılır
✅ Veritabanı güncellenir
```

---

## 🔒 Güvenlik

### Row Level Security (RLS) Politikaları

Tüm hassas tablolarda RLS aktif edildi:

```sql
-- Sadece service role erişebilir (backend only)
google_integrations    ✅ Service role only
meta_tokens           ✅ Service role only
marketplace_integrations ✅ Service role only
trendyol_webhook_events ✅ Service role only

-- Service role yazabilir, authenticated okuyabilir
meta_assets           ✅ Read-only for authenticated
trendyol_products     ✅ Read-only for authenticated
trendyol_orders       ✅ Read-only for authenticated
```

### Credential Güvenliği

- ✅ API keys ve secrets JSONB alanında saklanır
- ✅ Private keys şifrelenmeden saklanır ama RLS ile korunur
- ✅ Frontend hiçbir zaman credential'lara erişemez
- ✅ Service role key sadece backend'de kullanılır

### Rate Limiting

Tüm API endpoint'leri rate limit korumalıdır:

```typescript
// API routes: 10 req / 10 saniye
// Webhooks: 100 req / 60 saniye
// Auth: 5 req / 60 saniye

// Otomatik header'lar:
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 2024-12-06T10:30:00Z
Retry-After: 8
```

---

## ⚙️ Background Workers

### 1. Notification Worker

```bash
npm run notifications:worker
```

SMS ve email bildirimleri gönderir.

### 2. Trendyol Sync Worker

```bash
npm run sync:trendyol
```

Trendyol ürünlerini senkronize eder.

### 3. Meta Feed Generator

```bash
npm run sync:meta-feed
```

Meta Catalog için XML feed oluşturur.

### Production Deployment (PM2)

```bash
# pm2 kur
npm install -g pm2

# Workers başlat
pm2 start scripts/notification-worker.mjs --name notifications
pm2 start scripts/sync-trendyol-products.mjs --name trendyol-sync --cron "0 */6 * * *"
pm2 start scripts/generate-meta-feed.mjs --name meta-feed --cron "0 3 * * *"

# Otomatik başlatma
pm2 save
pm2 startup
```

---

## 🌐 API Endpoints

### Search Console

```bash
GET /api/seo/search-console?days=30
```

### Trendyol Webhook

```bash
POST /api/webhooks/trendyol
Headers: x-trendyol-signature
```

---

## 🔑 Environment Variables

`.env.example` dosyasını kopyalayın:

```bash
cp .env.example .env.local
```

Gerekli değerleri doldurun:

### Zorunlu

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL`

### Google (Opsiyonel)

- `NEXT_PUBLIC_GA4_MEASUREMENT_ID`
- `NEXT_PUBLIC_GTM_ID`
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`

### Meta (Opsiyonel)

- `NEXT_PUBLIC_META_PIXEL_ID`
- `META_SYSTEM_USER_TOKEN`
- `META_PIXEL_ID`
- `META_CATALOG_ID`

### Trendyol (Opsiyonel)

- `TRENDYOL_API_KEY`
- `TRENDYOL_API_SECRET`
- `TRENDYOL_SUPPLIER_ID`

### Rate Limiting (Opsiyonel)

- `UPSTASH_REDIS_REST_URL` - Yoksa in-memory fallback kullanılır
- `UPSTASH_REDIS_REST_TOKEN`

---

## 🚀 Hızlı Başlangıç

```bash
# 1. Dependencies kur
npm install

# 2. Environment variables ayarla
cp .env.example .env.local
# .env.local dosyasını düzenle

# 3. Database migration'ları uygula
supabase db push

# 4. Development server başlat
npm run dev

# 5. Marketing paneline git
http://localhost:3001/admin/marketing

# 6. Google ve Meta credentials'ları formlara gir
```

---

## 📚 Daha Fazla Bilgi

- [Meta Graph API Docs](https://developers.facebook.com/docs/graph-api)
- [Google Analytics 4 Docs](https://developers.google.com/analytics/devguides/collection/ga4)
- [Google Search Console API](https://developers.google.com/webmaster-tools/search-console-api-original)
- [Trendyol API Docs](https://sellerpublic.trendyol.com/dev-guide)

---

## ✅ Checklist

- [ ] Supabase migration'ları uygulandı
- [ ] `.env.local` dosyası yapılandırıldı
- [ ] Google Analytics 4 kuruldu
- [ ] Google Tag Manager eklendi
- [ ] Google Search Console bağlandı
- [ ] Meta Pixel kuruldu
- [ ] Meta CAPI token eklendi
- [ ] Meta Catalog Feed URL'si eklendi
- [ ] Trendyol API credentials kaydedildi
- [ ] Trendyol webhook yapılandırıldı
- [ ] Workers production'da çalışıyor
- [ ] Rate limiting test edildi

---

## 🐛 Sorun Giderme

### GA4 events gözükmüyor

1. DebugView'i aktif et: `?debug_mode=true`
2. Browser console'da hata var mı kontrol et
3. `NEXT_PUBLIC_GA4_MEASUREMENT_ID` doğru mu?

### Search Console API 403 hatası

1. Service account Search Console'a owner olarak eklendi mi?
2. Private key doğru formatta mı? (`\n` karakterleri korunmalı)
3. API enabled mi? (Google Cloud Console > APIs & Services)

### Trendyol webhook çalışmıyor

1. Webhook URL public erişilebilir mi?
2. Signature doğrulama başarısız mı? Log kontrol et
3. `trendyol_webhook_events` tablosunda kayıt var mı?

### Rate limit çok düşük

1. Redis credentials doğru mu?
2. In-memory fallback kullanılıyor mu?
3. `src/middleware/rate-limit.ts` değerlerini artırın

---

**🎉 Kurulum Tamamlandı!**

Sorularınız için: [GitHub Issues](https://github.com/your-repo/issues)
