import { TrendyolIntegrationForm } from '@/components/omnichannel/TrendyolForm'
import { TrendyolProductTable } from '@/components/omnichannel/TrendyolProductTable'
import { TrendyolStatus } from '@/components/omnichannel/TrendyolStatus'
import { TrendyolSyncHistory } from '@/components/omnichannel/TrendyolSyncHistory'
import { getTrendyolOverview, getTrendyolProducts, getTrendyolSyncRuns } from '@/lib/omnichannel/service'

export default async function IntegrationsPage() {
  const [overview, products, syncRuns] = await Promise.all([
    getTrendyolOverview(),
    getTrendyolProducts(15),
    getTrendyolSyncRuns(6),
  ])

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-wide text-cyan-200">Omnichannel</p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Marketplace Entegrasyonları</h1>
            <p className="text-sm text-gray-400">İlk olarak Trendyol bağlantısını aktif hale getirin, ardından diğer kanallar eklenecek.</p>
          </div>
          <span className="inline-flex rounded-full border border-cyan-400/30 px-3 py-1 text-xs font-semibold text-cyan-200">Beta · Sadece iç kullanım</span>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <TrendyolIntegrationForm initialData={overview.integration} />
        </div>
        <div className="lg:col-span-2">
          <TrendyolStatus overview={overview} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <TrendyolProductTable products={products} />
        </div>
        <div className="lg:col-span-2">
          <TrendyolSyncHistory runs={syncRuns} />
        </div>
      </div>
    </div>
  )
}
