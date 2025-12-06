import Link from 'next/link'

const steps = [
  {
    title: '1. Meta Business Manager hazırlığı',
    actions: [
      'Business Settings > Business Info kısmındaki işletme doğrulamasını tamamlayın.',
      'System Users sekmesinden "Server-to-Server" yetkisine sahip yeni bir kullanıcı oluşturun.',
      'Bu kullanıcıya Ads Account, Catalog ve Pixel için "Manage" izinlerini verin.',
    ],
  },
  {
    title: '2. System User Token üretimi',
    actions: [
      'Business Settings > Users > System Users bölümünde oluşturduğunuz kullanıcıyı seçin.',
      'Add Assets butonuyla ilgili uygulamayı ilişkileyip Generate Token diyerek uzun süreli bir erişim anahtarı oluşturun.',
      'Token en az "ads_management", "business_management" ve "pages_read_engagement" izinlerini içermeli.',
      'Token ve bitiş tarihini `/admin/marketing` ekranındaki "System User Token" formuna kaydedin.',
    ],
  },
  {
    title: '3. Pixel ve Conversions API eşleştirme',
    actions: [
      'Events Manager > Pixels sekmesinden bir Pixel ID oluşturun veya mevcut ID’yi not alın.',
      'Conversions API > Settings alanında, server event URL’lerinizi ve test event kodlarınızı alın.',
      'Pixel ID ve CAPI App ID bilgilerini "Meta Asset ID" formuna kaydedin.',
      'Server tarafı worker’ın Conversions API endpoint’ine `system_user_token` ile istek atabildiğini test edin.',
    ],
  },
  {
    title: '4. Catalog feed hazırlığı',
    actions: [
      'Commerce Manager > Catalogs içine girip Products > Data Sources menüsünden feed planını oluşturun.',
      'Feed URL’si Supabase Storage veya harici CDN’de herkesçe erişilebilir olmalı.',
      'Catalog ID’yi formda saklayın; feed hataları “Catalog Feed Takip” kartında görünecek.',
    ],
  },
  {
    title: '5. Cron / token yenileme',
    actions: [
      'System user tokenları 60 günde bir yenilenir; worker’da Cronitor ID `meta-sync-02` ile kontrol edin.',
      'Token yenileyemediğiniz durumlarda `.env` üzerinden geçici token girip panelden güncelleyin.',
    ],
  },
]

export default function MetaGuidePage() {
  return (
    <div className="space-y-6 text-white">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-wide text-gray-400">Dokümantasyon</p>
        <h1 className="text-3xl font-semibold">Meta Bağlantı Rehberi</h1>
        <p className="text-sm text-gray-400">
          Bu sayfa PDF rehberin yerine geçer. Meta Business Suite tarafında gerekli tüm adımları özetler ve panelde hangi alanların doldurulacağını belirtir.
        </p>
        <Link
          href="/admin/marketing"
          className="inline-flex items-center gap-2 text-sm text-emerald-300 hover:text-emerald-200"
        >
          ← Pazarlama paneline dön
        </Link>
      </header>

      <section className="rounded-2xl border border-white/10 bg-gray-900/60 p-6">
        <h2 className="text-xl font-semibold">Adım adım kurulum</h2>
        <div className="mt-4 space-y-4">
          {steps.map((step) => (
            <article key={step.title} className="rounded-2xl border border-white/10 bg-gray-950/40 p-5 shadow">
              <h3 className="text-lg font-semibold text-white">{step.title}</h3>
              <ul className="mt-3 list-decimal space-y-2 pl-5 text-sm text-gray-300">
                {step.actions.map((action) => (
                  <li key={action}>{action}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6 text-sm text-amber-100">
        <h2 className="text-lg font-semibold">API & güvenlik notları</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>Token’ları Supabase `meta_tokens` tablosunda tutuyoruz; yetki sadece backend servis key ile okunabilir.</li>
          <li>Prod ortamında `.env` içindeki `META_SYSTEM_USER_TOKEN_EXPIRES_AT` değişkenini güncelleyin ki dashboard kalan süreyi gösterebilsin.</li>
          <li>Server worker Conversions API çağrılarını `scripts/notification-worker.mjs` içindeki queue mekanizmasından tetikler. Logları `notification_logs` tablosundan takip edin.</li>
        </ul>
      </section>
    </div>
  )
}
