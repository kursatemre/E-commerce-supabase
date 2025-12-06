import type { TrendyolOverview } from '@/lib/omnichannel/service'

export function TrendyolStatus({ overview }: { overview: TrendyolOverview }) {
  const { integration, readiness, nextSteps } = overview

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-white/10 bg-gray-900/70 p-5">
        <header className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-cyan-200">Trendyol Durum</p>
            <h3 className="text-lg font-semibold text-white">{integration?.storeName ?? 'Mağaza henüz tanımlı değil'}</h3>
            <p className="text-sm text-gray-400">{integration ? 'Son güncelleme zamanı ve bağlantı statüsü.' : 'Formu doldurduğunuzda bağlantı detayları burada listelenecek.'}</p>
          </div>
          <StatusPill status={integration?.status ?? 'inactive'} />
        </header>

        <dl className="mt-5 grid grid-cols-2 gap-4 text-sm text-gray-300">
          <div>
            <dt className="text-gray-400">Supplier / Warehouse</dt>
            <dd className="font-semibold text-white">
              {integration?.supplierId ? `#${integration.supplierId}` : '—'}
              {integration?.warehouseId ? ` · WH ${integration.warehouseId}` : ''}
            </dd>
          </div>
          <div>
            <dt className="text-gray-400">Bölge</dt>
            <dd className="font-semibold text-white">{integration?.region ?? 'TR'}</dd>
          </div>
          <div>
            <dt className="text-gray-400">Callback URL</dt>
            <dd className="font-semibold text-white">{integration?.callbackUrl ?? 'Tanımlı değil'}</dd>
          </div>
          <div>
            <dt className="text-gray-400">Son Senkron</dt>
            <dd className="font-semibold text-white">{formatDateTime(integration?.lastSyncAt)}</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-2xl border border-white/10 bg-gray-900/70 p-5">
        <header className="mb-4">
          <p className="text-xs uppercase tracking-wide text-cyan-200">Hazırlık Kontrol Listesi</p>
          <h4 className="text-lg font-semibold text-white">Canlıya geçmeden önce</h4>
        </header>
        <ul className="space-y-4">
          {readiness.map((item) => (
            <li key={item.title} className="flex gap-3">
              <span className={`mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full text-xs ${item.status === 'ready' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-yellow-500/20 text-yellow-200'}`}>
                {item.status === 'ready' ? '✓' : '!'}
              </span>
              <div>
                <p className="text-sm font-semibold text-white">{item.title}</p>
                <p className="text-sm text-gray-400">{item.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-white/10 bg-gray-900/70 p-5">
        <header className="mb-3">
          <p className="text-xs uppercase tracking-wide text-cyan-200">Sonraki Adımlar</p>
          <h4 className="text-lg font-semibold text-white">Opsiyonel otomasyonlar</h4>
        </header>
        <ol className="space-y-3">
          {nextSteps.map((step, index) => (
            <li key={step.title} className="flex gap-3 text-sm text-gray-300">
              <span className="text-cyan-300">{String(index + 1).padStart(2, '0')}.</span>
              <div>
                <p className="font-semibold text-white">{step.title}</p>
                <p>{step.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}

function StatusPill({ status }: { status: string }) {
  const isActive = status === 'active'
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-gray-700 text-gray-300'}`}>
      {isActive ? 'Aktif' : 'Pasif'}
    </span>
  )
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return 'Henüz senkron yok'
  try {
    return new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
  } catch {
    return value
  }
}
