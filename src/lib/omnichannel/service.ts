import { canUseServiceClient, getServiceClient } from '@/lib/supabase/service'

export type TrendyolOverview = {
  integration: TrendyolIntegration | null
  readiness: Array<{ title: string; status: 'ready' | 'pending'; description: string }>
  nextSteps: Array<{ title: string; detail: string }>
}

export type TrendyolIntegration = {
  storeName: string | null
  supplierId: string | null
  warehouseId: string | null
  status: string
  region: string | null
  callbackUrl: string | null
  lastSyncAt: string | null
}

export type TrendyolProductRow = {
  id: string
  marketplaceProductId: string
  productId: string | null
  sku: string | null
  barcode: string | null
  title: string | null
  price: number | null
  discountedPrice: number | null
  stock: number | null
  currency: string
  status: string
  lastSyncedAt: string | null
  product?: {
    id: string
    name: string | null
    stock: number | null
    price: number | null
  } | null
}

export type TrendyolSyncRun = {
  id: string
  syncType: string
  status: string
  processedCount: number
  errorCount: number
  errorMessage: string | null
  startedAt: string
  finishedAt: string | null
}

export async function getTrendyolOverview(): Promise<TrendyolOverview> {
  const integration = await fetchIntegration()
  const readiness = buildReadiness(integration)
  const nextSteps = buildNextSteps(integration)

  return {
    integration,
    readiness,
    nextSteps,
  }
}

async function fetchIntegration(): Promise<TrendyolIntegration | null> {
  if (!canUseServiceClient()) {
    return null
  }

  try {
    const supabase = getServiceClient()
    const { data, error } = await supabase
      .from('marketplace_integrations')
      .select('store_name, supplier_id, warehouse_id, status, metadata, last_sync_at, updated_at')
      .eq('channel', 'trendyol')
      .maybeSingle()

    if (error) {
      console.error('[TrendyolOverview] marketplace_integrations sorgusu başarısız', error)
      return null
    }

    if (!data) return null

    return {
      storeName: data.store_name ?? null,
      supplierId: data.supplier_id ?? null,
      warehouseId: data.warehouse_id ?? null,
      status: data.status ?? 'inactive',
      region: data.metadata?.region ?? null,
      callbackUrl: data.metadata?.callback_url ?? null,
      lastSyncAt: data.last_sync_at ?? data.updated_at ?? null,
    }
  } catch (error) {
    console.error('[TrendyolOverview] marketplace_integrations okunamadı', error)
    return null
  }
}

function buildReadiness(integration: TrendyolIntegration | null): Array<{ title: string; status: 'ready' | 'pending'; description: string }> {
  return [
    {
      title: 'API Anahtarları',
      status: integration?.status === 'active' ? ('ready' as const) : ('pending' as const),
      description: integration?.status === 'active'
        ? 'Trendyol Partner Panel > Integration Management üzerinden App Key & Secret kaydedildi.'
        : 'Partner panelinden App Key ve App Secret oluşturup kaydedin.',
    },
    {
      title: 'Tedarikçi / Warehouse',
      status: integration?.supplierId && integration?.warehouseId ? ('ready' as const) : ('pending' as const),
      description: integration?.supplierId && integration?.warehouseId
        ? `Supplier ${integration.supplierId}, Warehouse ${integration.warehouseId}`
        : 'Supplier ID ve Warehouse ID değerlerini Trendyol Operasyon panelinden kopyalayın.',
    },
    {
      title: 'Callback & Order Status',
      status: integration?.callbackUrl ? ('ready' as const) : ('pending' as const),
      description: integration?.callbackUrl
        ? `Callback URL: ${integration.callbackUrl}`
        : 'Sipariş durum web hook URL’sini panelde tanımlayın.',
    },
  ]
}

function buildNextSteps(integration: TrendyolIntegration | null) {
  const steps = [
    { title: 'Sipariş çekme cronunu planla', detail: 'Her 10 dakikada bir yeni Trendyol siparişlerini Supabase queue’ya al.' },
    { title: 'Stok senkronizasyonu', detail: 'Supabase ürün stoklarını `/suppliers/{id}/stocks` endpoint’iyle güncelle.' },
    { title: 'Fatura / irsaliye yüklemesi', detail: 'Trendyol API’ye PDF linkini göndererek irsaliyeleri ilet.' },
  ]

  if (!integration) {
    steps.unshift({ title: 'Trendyol API erişimini aktifleştir', detail: 'Formu doldurup App Key/Secret kaydedin.' })
  }

  return steps
}

export async function getTrendyolProducts(limit = 20): Promise<TrendyolProductRow[]> {
  if (!canUseServiceClient()) {
    return []
  }

  try {
    const supabase = getServiceClient()
    const { data, error } = await supabase
      .from('trendyol_products')
      .select(
        'id, marketplace_product_id, product_id, sku, barcode, title, currency, price, discounted_price, stock, status, last_synced_at, products ( id, name, stock, price )'
      )
      .order('updated_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('[TrendyolOverview] trendyol_products sorgusu başarısız', error)
      return []
    }

    return (data ?? []).map((row) => ({
      id: row.id,
      marketplaceProductId: row.marketplace_product_id,
      productId: row.product_id,
      sku: row.sku ?? null,
      barcode: row.barcode ?? null,
      title: row.title ?? null,
      price: row.price ?? null,
      discountedPrice: row.discounted_price ?? null,
      stock: row.stock ?? null,
      currency: row.currency ?? 'TRY',
      status: row.status ?? 'passive',
      lastSyncedAt: row.last_synced_at ?? null,
      product: (() => {
        if (!row.products) return null
        const prod = Array.isArray(row.products) ? row.products[0] : row.products
        if (!prod) return null
        return {
          id: prod.id ?? '',
          name: prod.name ?? null,
          stock: prod.stock ?? null,
          price: prod.price ?? null,
        }
      })(),
    }))
  } catch (error) {
    console.error('[TrendyolOverview] trendyol_products okunamadı', error)
    return []
  }
}

export async function getTrendyolSyncRuns(limit = 6): Promise<TrendyolSyncRun[]> {
  if (!canUseServiceClient()) {
    return []
  }

  try {
    const supabase = getServiceClient()
    const { data, error } = await supabase
      .from('trendyol_sync_runs')
      .select('id, sync_type, status, processed_count, error_count, error_message, started_at, finished_at')
      .order('started_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('[TrendyolOverview] trendyol_sync_runs sorgusu başarısız', error)
      return []
    }

    return (data ?? []).map((row) => ({
      id: row.id,
      syncType: row.sync_type,
      status: row.status,
      processedCount: row.processed_count ?? 0,
      errorCount: row.error_count ?? 0,
      errorMessage: row.error_message ?? null,
      startedAt: row.started_at,
      finishedAt: row.finished_at ?? null,
    }))
  } catch (error) {
    console.error('[TrendyolOverview] trendyol_sync_runs okunamadı', error)
    return []
  }
}
