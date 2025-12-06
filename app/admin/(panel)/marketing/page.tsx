import Link from 'next/link'

import { GoogleIntegrationForm } from '@/components/google/GoogleForms'
import { MetaAssetForm, MetaTokenForm } from '@/components/meta/MetaForms'
import { getGoogleOverview } from '@/lib/google/service'
import { getMetaOverview, type MetaOverview } from '@/lib/meta/service'

type MetaIntegrationCard = {
  name: string
  id: string
  status: 'aktif' | 'beklemede' | 'hazırlanıyor'
  sync: string
  coverage: string
}

type CatalogFeedCard = {
  id: string
  title: string
  schedule: string
  lastRun: string
  status: string
  issues: string[]
}

const metaActionLinks = [
  {
    label: 'Meta Pixel Bağla',
    href: 'https://business.facebook.com/events_manager2/list/pixel',
    hint: 'Events Manager > Pixel',
  },
  {
    label: 'Catalog Feed Ekle',
    href: 'https://business.facebook.com/commerce_manager/',
    hint: 'Commerce Manager > Catalogs',
  },
  {
    label: 'Conversions API Yetkilendir',
    href: 'https://developers.facebook.com/apps/',
    hint: 'Meta for Developers > App Dashboard',
  },
]

const seoMetrics = [
  {
    label: 'Organik Trafik',
    value: '24.6K',
    delta: '+12% (30g)',
  },
  {
    label: 'Anahtar Kelime Sayısı',
    value: '182',
    delta: '+8 yeni kelime',
  },
  {
    label: 'Dönüşüm Oranı',
    value: '2.4%',
    delta: '+0.3 puan',
  },
  {
    label: 'Ortalama Konum',
    value: '14.2',
    delta: 'İyileşme: 1.1 sırada',
  },
]

const keywordBacklog = [
  { keyword: 'sürdürülebilir spor ayakkabı', volume: 2400, position: 9, intent: 'Satın alma' },
  { keyword: 'minimalist sneaker', volume: 1600, position: 13, intent: 'Araştırma' },
  { keyword: 'organik pamuk sweatshirt', volume: 720, position: 6, intent: 'Satın alma' },
  { keyword: 'eko dostu giyim', volume: 1100, position: 18, intent: 'Farkındalık' },
]

const campaignChecklist = [
  {
    title: 'Black Friday Landing',
    owner: 'SEO',
    status: 'devam ediyor',
    tasks: ['Schema güncelle', 'AMP sürümü kontrol et', 'PageSpeed >90'],
  },
  {
    title: 'Influencer UTM Takibi',
    owner: 'Marketing',
    status: 'hazır',
    tasks: ['UTM parametreleri', 'Supabase events tablosu', 'Google Sheet raporu'],
  },
  {
    title: 'Blog İçerik Sprinti',
    owner: 'Content',
    status: 'blokede',
    tasks: ['4x kategori yazısı', 'TOFU lead magnet', 'Newsletter CTA entegrasyonu'],
  },
]

export default async function MarketingPage() {
  const overview = await getMetaOverview()
  const googleOverview = await getGoogleOverview()
  const metaIntegrations = buildMetaIntegrationCards(overview)
  const catalogFeeds = buildCatalogFeedCards(overview)
  const capiTasks = buildCapiTasks(overview)
  const asOfLabel = formatHeaderDate(overview.generatedAt)
  const adAccount = findAssetDisplayValue(overview, 'ad_account') ?? '#82419902'

  return (
    <div className="space-y-6 text-white">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-400">Büyüme Operasyonları</p>
          <h1 className="text-3xl font-semibold">Pazarlama & SEO Kontrol Paneli</h1>
          <p className="text-sm text-gray-400">
            Organik görünürlük, kampanyalar ve içerik görevleri tek ekranda. Meta Graph API verileri gerçek zamanlı olarak çekiliyor.
          </p>
        </div>
        <div className="flex flex-col items-end gap-3">
          <span className="rounded-full border border-green-500/40 bg-green-500/10 px-4 py-2 text-xs font-semibold text-green-200">
            Güncel • {asOfLabel}
          </span>
          <Link
            href="/admin/marketing/meta-guide"
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-200 transition hover:bg-emerald-500/20"
          >
            Meta Rehberi Görüntüle
          </Link>
        </div>
      </header>

      {overview.errors.length > 0 && (
        <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-100">
          <p className="font-semibold">Meta bağlantısı uyarıları</p>
          <ul className="mt-2 list-disc space-y-1 pl-4">
            {overview.errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <section className="grid gap-6 xl:grid-cols-3">
        <MetaTokenForm />
        <MetaAssetForm />
        <GoogleIntegrationForm />
      </section>

      {googleOverview.warnings.length > 0 && (
        <div className="rounded-2xl border border-cyan-400/40 bg-cyan-500/10 p-4 text-sm text-cyan-50">
          <p className="font-semibold">Google entegrasyon uyarıları</p>
          <ul className="mt-2 list-disc space-y-1 pl-4">
            {googleOverview.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      )}

      <section className="rounded-2xl border border-white/10 bg-gray-900/70 p-6 shadow">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Google Entegrasyon Durumu</h2>
            <p className="text-sm text-gray-400">GA4, Search Console ve Google Ads yapılandırmaları.</p>
          </div>
          <span className="rounded-full bg-gray-800 px-3 py-1 text-xs text-gray-300">{googleOverview.cards.length} öğe</span>
        </header>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {googleOverview.cards.map((card) => (
            <article key={card.label} className="rounded-2xl border border-white/10 bg-gray-900/80 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-400">{card.label}</p>
              <p className="mt-2 text-lg font-semibold text-white">{card.id}</p>
              <p className="text-xs text-gray-400">{card.note}</p>
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className={`rounded-full px-3 py-1 ${card.status === 'aktif' ? 'bg-emerald-500/10 text-emerald-300' : 'bg-amber-500/10 text-amber-300'}`}>
                  {card.status}
                </span>
                <span className="text-gray-400">{card.sync}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <article className="rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-950/60 via-gray-900 to-gray-900 p-6 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-blue-200/70">Meta Business Suite</p>
              <h2 className="text-2xl font-semibold text-white">Meta İzinleri</h2>
              <p className="text-sm text-blue-100/80">Pixel, Conversions API ve katalog erişimi tek ekranda yönetilir.</p>
            </div>
            <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs text-blue-200">Ad Account: {adAccount}</span>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            {metaActionLinks.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                target="_blank"
                rel="noreferrer"
                title={action.hint}
                className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:border-white/40 hover:bg-white/10"
              >
                {action.label}
              </Link>
            ))}
          </div>
          <p className="mt-4 text-xs text-blue-100/70">
            Graph API app id: <span className="font-semibold">{process.env.META_APP_ID ?? '452719903481762'}</span> • Token kaynağı: {overview.token?.source ?? 'tanımsız'}
          </p>
        </article>

        <article className="lg:col-span-2 rounded-2xl border border-white/10 bg-gray-900/70 p-6 shadow">
          <header className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Meta Entegrasyon Durumu</h2>
              <p className="text-sm text-gray-400">Pixel + CAPI + Catalog verileri Graph API üzerinden alındı.</p>
            </div>
            <span className="rounded-full bg-gray-800 px-3 py-1 text-xs text-gray-300">{metaIntegrations.length} entegrasyon</span>
          </header>
          <div className="mt-4 space-y-3">
            {metaIntegrations.length === 0 && (
              <p className="text-sm text-gray-400">Meta varlığı bulunamadı. `meta_assets` tablosuna kayıt ekleyin veya ortam değişkeni tanımlayın.</p>
            )}
            {metaIntegrations.map((integration) => (
              <div key={integration.name} className="rounded-xl border border-white/5 bg-gray-900/70 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-white">{integration.name}</p>
                    <p className="text-xs text-gray-500">ID: {integration.id}</p>
                  </div>
                  <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs capitalize text-emerald-300">
                    {integration.status}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between text-xs text-gray-300">
                  <p>Son senkron: {integration.sync}</p>
                  <p>{integration.coverage}</p>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <article className="lg:col-span-2 rounded-2xl border border-white/10 bg-gray-900/70 p-6 shadow">
          <header className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Catalog Feed Takip</h2>
              <p className="text-sm text-gray-400">Meta Commerce Manager senkronizasyonları.</p>
            </div>
            <span className="rounded-full bg-gray-800 px-3 py-1 text-xs text-gray-300">{catalogFeeds.length} feed</span>
          </header>
          <div className="mt-4 space-y-4">
            {catalogFeeds.length === 0 && (
              <p className="text-sm text-gray-400">Catalog feed verisi alınamadı. Catalog asset ID ve Graph erişim tokenı kontrol edin.</p>
            )}
            {catalogFeeds.map((feed) => (
              <div key={feed.id} className="rounded-xl border border-white/5 bg-gray-900/60 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-white">{feed.title}</p>
                    <p className="text-xs text-gray-400">Plan: {feed.schedule}</p>
                  </div>
                  <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs text-amber-300 capitalize">{feed.status}</span>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between text-xs text-gray-300">
                  <p>Son çalıştırma: {feed.lastRun}</p>
                  <p>Uyarılar:</p>
                </div>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-gray-300">
                  {feed.issues.length ? feed.issues.map((issue) => <li key={issue}>{issue}</li>) : <li>Hata bildirilmedi</li>}
                </ul>
              </div>
            ))}
          </div>
        </article>
        <article className="rounded-2xl border border-white/10 bg-gray-900/70 p-6 shadow">
          <h2 className="text-lg font-semibold">CAPI Aktivasyon Adımları</h2>
          <p className="text-sm text-gray-400">Server-side event tetikleyicileri.</p>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-xs text-gray-300">
            {capiTasks.map((task) => (
              <li key={task}>{task}</li>
            ))}
          </ul>
          <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-xs text-emerald-100">
            Access token storage: `supabase.meta_tokens` • worker refresh job Cronitor ID `meta-sync-02`.
          </div>
        </article>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {seoMetrics.map((metric) => (
          <article key={metric.label} className="rounded-2xl border border-white/10 bg-gradient-to-br from-gray-800 to-gray-900 px-4 py-5 shadow">
            <p className="text-xs uppercase tracking-wide text-gray-400">{metric.label}</p>
            <p className="mt-2 text-3xl font-semibold">{metric.value}</p>
            <p className="text-xs text-emerald-300">{metric.delta}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-5">
        <article className="lg:col-span-3 rounded-2xl border border-white/10 bg-gray-900/70 p-6 shadow">
          <header className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Anahtar Kelime Backlog&apos;u</h2>
              <p className="text-sm text-gray-400">Hedeflenmesi planlanan kelimeler ve fırsat metriği.</p>
            </div>
            <span className="rounded-full bg-gray-800 px-3 py-1 text-xs text-gray-300">4 hedef</span>
          </header>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-200">
              <thead className="text-xs uppercase text-gray-500">
                <tr>
                  <th className="py-2">Anahtar Kelime</th>
                  <th className="py-2">Hacim</th>
                  <th className="py-2">Konum</th>
                  <th className="py-2">Niyet</th>
                </tr>
              </thead>
              <tbody>
                {keywordBacklog.map((row) => (
                  <tr key={row.keyword} className="border-t border-white/5">
                    <td className="py-3 font-semibold text-white">{row.keyword}</td>
                    <td className="py-3">{row.volume.toLocaleString('tr-TR')}</td>
                    <td className="py-3">#{row.position}</td>
                    <td className="py-3 text-xs text-gray-300">{row.intent}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl border border-white/10 bg-gray-900/70 p-5 shadow">
            <h2 className="text-lg font-semibold">Kampanya Checklist</h2>
            <p className="text-sm text-gray-400">SEO + Pazarlama koordinasyonu</p>
            <div className="mt-4 space-y-4">
              {campaignChecklist.map((campaign) => (
                <div key={campaign.title} className="rounded-xl border border-white/5 bg-gray-900/60 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white">{campaign.title}</p>
                      <p className="text-xs text-gray-400">Sorumlu: {campaign.owner}</p>
                    </div>
                    <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs capitalize text-emerald-300">
                      {campaign.status}
                    </span>
                  </div>
                  <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-gray-300">
                    {campaign.tasks.map((task) => (
                      <li key={task}>{task}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5 shadow">
            <h2 className="text-lg font-semibold text-amber-100">İçerik Optimizasyon Notları</h2>
            <p className="text-sm text-amber-200">Önümüzdeki sprintte uygulanacak maddeler:</p>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-amber-100/90">
              <li>Ürün detay sayfalarına FAQ schema ekle</li>
              <li>Blog içeriği için dahili linklemeyi %20 artır</li>
              <li>UTM&apos;li kampanya linkleri için Supabase event log&apos;u oluştur</li>
            </ul>
          </div>
        </article>
      </section>
    </div>
  )
}

function buildMetaIntegrationCards(overview: MetaOverview): MetaIntegrationCard[] {
  const cards: MetaIntegrationCard[] = []
  const hasAssets = (type: string) => overview.assets.some((asset) => asset.asset_type === type)
  const pixelAsset = overview.assets.find((asset) => asset.asset_type === 'pixel')
  const catalogAsset = overview.assets.find((asset) => asset.asset_type === 'catalog')

  if (pixelAsset) {
    if (overview.pixel) {
      cards.push({
        name: pixelAsset.display_name ?? 'Meta Pixel',
        id: overview.pixel.id,
        status: determinePixelStatus(overview.pixel.last_fired_time),
        sync: overview.pixel.last_fired_time ? formatRelative(overview.pixel.last_fired_time) : 'Event bekleniyor',
        coverage: overview.pixel.last_fired_time ? `Son tetikleme ${formatDateLabel(overview.pixel.last_fired_time, true)}` : 'Henüz tetikleme yok',
      })
    } else {
      cards.push({
        name: pixelAsset.display_name ?? 'Meta Pixel',
        id: pixelAsset.external_id,
        status: 'hazırlanıyor',
        sync: 'Graph API verisi bulunamadı',
        coverage: 'Pixel ID kayıtlı fakat event alınamadı',
      })
    }
  }

  const tokenDaysRemaining = overview.token?.daysRemaining
  cards.push({
    name: 'Conversions API',
    id: overview.assets.find((asset) => asset.asset_type === 'conversions_api')?.external_id ?? 'System User Token',
    status: determineCapiStatus(overview.token),
    sync: typeof tokenDaysRemaining === 'number' ? `Token ${formatDays(tokenDaysRemaining)} sonra` : 'Süre bilgisi yok',
    coverage: overview.token ? `Kaynak: ${overview.token.source}` : 'Token eksik',
  })

  if (catalogAsset) {
    if (overview.catalog) {
      const productCount = overview.catalog.product_count ?? 0
      const feedIssue = overview.feeds.some((feed) => (feed.error_count ?? 0) > 0)
      cards.push({
        name: overview.catalog.name ?? catalogAsset.display_name ?? 'Catalog',
        id: overview.catalog.id,
        status: feedIssue ? 'beklemede' : 'aktif',
        sync: overview.feeds[0]?.last_upload_time ? formatRelative(overview.feeds[0].last_upload_time) : 'Feed tetiklenmedi',
        coverage: `${productCount.toLocaleString('tr-TR')} ürün indeksli`,
      })
    } else {
      cards.push({
        name: catalogAsset.display_name ?? 'Catalog',
        id: catalogAsset.external_id,
        status: 'hazırlanıyor',
        sync: 'Catalog Graph API yanıtı yok',
        coverage: 'Feed bağlantısını kontrol edin',
      })
    }
  }

  if (!pixelAsset && !catalogAsset && !hasAssets('conversions_api')) {
    cards.push({
      name: 'Meta Varlıkları',
      id: 'Tanımlı değil',
      status: 'beklemede',
      sync: 'meta_assets tablosu boş',
      coverage: 'ID ve token bilgilerini girin',
    })
  }

  return cards
}

function buildCatalogFeedCards(overview: MetaOverview): CatalogFeedCard[] {
  if (!overview.feeds.length) {
    return []
  }

  return overview.feeds.map((feed) => ({
    id: feed.id,
    title: feed.name,
    schedule: describeSchedule(feed.schedule),
    lastRun: feed.last_upload_time ? formatDateLabel(feed.last_upload_time, true) : 'Henüz yüklenmedi',
    status: determineFeedStatus(feed),
    issues: extractFeedIssues(feed),
  }))
}

function buildCapiTasks(overview: MetaOverview) {
  const tasks = [
    'Node worker içinde Meta access token yenileme cron ekle',
    'Test events tool ile Purchase/PDP View doğrula',
    'Supabase events tablosunu CAPI logları ile eşle',
  ]

  if (!overview.token) {
    tasks.unshift('System user token oluştur ve meta_tokens tablosuna kaydet')
  } else if (overview.token.daysRemaining !== null) {
    const message = overview.token.daysRemaining <= 2
      ? 'Token süresi kritik: 48 saat içinde yenile'
      : `Token kalan süre: ${overview.token.daysRemaining} gün`
    tasks.unshift(message)
  }

  return tasks.filter((task, index) => tasks.indexOf(task) === index)
}

function determinePixelStatus(lastFired?: string) {
  if (!lastFired) return 'hazırlanıyor'
  const hours = hoursSince(lastFired)
  return hours <= 24 ? 'aktif' : 'beklemede'
}

function determineCapiStatus(token: MetaOverview['token']) {
  if (!token) return 'beklemede'
  if (token.daysRemaining !== null && token.daysRemaining <= 2) {
    return 'hazırlanıyor'
  }
  return 'aktif'
}

function determineFeedStatus(feed: MetaOverview['feeds'][number]) {
  if ((feed.error_count ?? 0) > 0) {
    return 'beklemede'
  }
  if (feed.status?.toLowerCase() === 'in_progress') {
    return 'devam ediyor'
  }
  return 'senkron'
}

function extractFeedIssues(feed: MetaOverview['feeds'][number]) {
  if (feed.error_summary) {
    return feed.error_summary.split(/\r?\n|;\s*/).filter(Boolean)
  }
  if ((feed.error_count ?? 0) > 0) {
    return ['Feed yüklemesi hata verdi']
  }
  return []
}

function describeSchedule(schedule?: string | null) {
  if (!schedule) return 'Planlanıyor'
  const normalized = schedule.toLowerCase()
  if (normalized.includes('hour')) return 'Saatlik'
  if (normalized.includes('day')) return 'Günlük'
  if (normalized.includes('week')) return 'Haftalık'
  return schedule
}

function formatRelative(dateInput?: string | null) {
  if (!dateInput) return 'Bilgi yok'
  const diff = Date.now() - new Date(dateInput).getTime()
  const minutes = Math.max(Math.round(diff / 60000), 0)
  if (minutes < 1) return 'az önce'
  if (minutes < 60) return `${minutes} dk önce`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} sa önce`
  const days = Math.round(hours / 24)
  return `${days} g önce`
}

function hoursSince(dateInput: string) {
  const diff = Date.now() - new Date(dateInput).getTime()
  return diff / (1000 * 60 * 60)
}

function formatDateLabel(dateInput: string, includeTime = false) {
  const date = new Date(dateInput)
  const options: Intl.DateTimeFormatOptions = includeTime
    ? { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }
    : { day: 'numeric', month: 'short' }
  return date.toLocaleString('tr-TR', options)
}

function formatHeaderDate(dateInput: string) {
  const date = new Date(dateInput)
  return date.toLocaleDateString('tr-TR', { month: 'long', day: 'numeric' })
}

function formatDays(days: number) {
  if (days <= 0) return 'hemen'
  return `${days} gün`
}

function findAssetDisplayValue(overview: MetaOverview, type: string) {
  const asset = overview.assets.find((item) => item.asset_type === type)
  return asset?.metadata?.ad_account_id ?? asset?.external_id ?? null
}
