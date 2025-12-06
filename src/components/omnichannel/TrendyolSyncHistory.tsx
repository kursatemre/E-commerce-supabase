import type { TrendyolSyncRun } from '@/lib/omnichannel/service'

export function TrendyolSyncHistory({ runs }: { runs: TrendyolSyncRun[] }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-gray-900/70 p-5">
      <header className="mb-4">
        <p className="text-xs uppercase tracking-wide text-cyan-200">Senkronizasyon Geçmişi</p>
        <h3 className="text-lg font-semibold text-white">Cron job günlükleri</h3>
        <p className="text-sm text-gray-400">Son {runs.length || 0} çalışmanın durumunu görüntülüyorsunuz.</p>
      </header>

      {runs.length === 0 ? (
        <p className="rounded-xl border border-dashed border-white/10 px-4 py-6 text-sm text-gray-300">
          Henüz kayıtlı cron çalışması yok. Cron etkinleştiğinde detaylar burada listelenecek.
        </p>
      ) : (
        <ul className="space-y-3">
          {runs.map((run) => (
            <li key={run.id} className="rounded-xl border border-white/10 px-4 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">{labelForType(run.syncType)}</p>
                  <p className="text-xs text-gray-400">{formatDate(run.startedAt)} → {run.finishedAt ? formatDate(run.finishedAt) : 'Devam ediyor'}</p>
                </div>
                <StatusBadge status={run.status} errorCount={run.errorCount} />
              </div>
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-300">
                <span className="rounded-full border border-white/10 px-2 py-0.5">İşlenen: {run.processedCount}</span>
                <span className="rounded-full border border-white/10 px-2 py-0.5">Hata: {run.errorCount}</span>
                {run.errorMessage && <span className="rounded-full border border-red-500/30 px-2 py-0.5 text-red-300">{run.errorMessage}</span>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function labelForType(type: string) {
  return type === 'orders' ? 'Sipariş Senkronu' : 'Ürün Senkronu'
}

function StatusBadge({ status, errorCount }: { status: string; errorCount: number }) {
  const normalized = status.toLowerCase()
  const isSuccess = normalized === 'success' && errorCount === 0
  const base = 'rounded-full px-3 py-1 text-xs font-semibold'
  if (normalized === 'running') {
    return <span className={`${base} bg-yellow-500/20 text-yellow-200`}>Çalışıyor</span>
  }
  if (isSuccess) {
    return <span className={`${base} bg-emerald-500/20 text-emerald-300`}>Başarılı</span>
  }
  if (normalized === 'failed' || errorCount > 0) {
    return <span className={`${base} bg-red-500/20 text-red-300`}>Hatalı</span>
  }
  return <span className={`${base} bg-gray-700 text-gray-200`}>{status}</span>
}

function formatDate(value: string | null) {
  if (!value) return '—'
  try {
    return new Intl.DateTimeFormat('tr-TR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value))
  } catch {
    return value
  }
}
