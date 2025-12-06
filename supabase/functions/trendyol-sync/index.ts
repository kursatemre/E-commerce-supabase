import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'

type IntegrationRow = {
  id: string
  channel: string
  supplier_id: string | null
  warehouse_id: string | null
  api_key: string | null
  api_secret: string | null
  metadata: Record<string, unknown> | null
}

type SyncRun = {
  id: string
}

type TrendyolProduct = {
  id?: number | string
  productId?: number | string
  stockCode?: string
  barcode?: string
  title?: string
  quantity?: number
  quantityInfo?: { quantity?: number }
  price?: number
  listPrice?: number
  salePrice?: number
  vatRate?: number
  currencyType?: string
  brand?: string
  lastUpdateDate?: string
  status?: string
}

type TrendyolOrder = {
  id?: number | string
  orderNumber?: string
  status?: string
  orderDate?: string
  shipmentPackageId?: string | number
  buyerName?: string
  buyerEmail?: string
  totalPrice?: number
  currency?: string
  shippingAddress?: Record<string, unknown>
  billingAddress?: Record<string, unknown>
  lines?: Array<TrendyolOrderLine>
}

type TrendyolOrderLine = {
  id?: number | string
  productId?: number | string
  quantity?: number
  price?: number
  discount?: number
  vatRate?: number
  barcode?: string
  merchantSku?: string
  lineItemStatus?: string
}

type RequestBody = {
  type?: 'products' | 'orders'
  size?: number
  statuses?: string[]
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const TRENDYOL_BASE_URL = Deno.env.get('TRENDYOL_BASE_URL') ?? 'https://api.trendyol.com/sapigw'
const DEFAULT_PAGE_SIZE = 200

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables')
}

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false },
})

serve(async (req) => {
  if (req.method !== 'POST') {
    return jsonResponse({ success: false, message: 'Only POST is allowed' }, 405)
  }

  let body: RequestBody = {}
  try {
    body = (await req.json()) as RequestBody
  } catch (_err) {
    body = {}
  }

  const syncType = body.type ?? 'products'
  const pageSize = body.size && body.size > 0 ? Math.min(body.size, 200) : DEFAULT_PAGE_SIZE

  let syncRun: SyncRun | null = null

  try {
    const integration = await getTrendyolIntegration()
    if (!integration) {
      return jsonResponse({ success: false, message: 'Trendyol entegrasyonu bulunamadı.' }, 400)
    }

    syncRun = await startSyncRun(syncType)

    let result
    if (syncType === 'orders') {
      result = await syncOrders(integration, pageSize, body.statuses)
    } else {
      result = await syncProducts(integration, pageSize)
    }

    await finishSyncRun(syncRun, syncType, 'success', result.processed, result.errors)
    await touchMarketplaceIntegration(integration.id)

    return jsonResponse({ success: true, syncType, ...result })
  } catch (error) {
    console.error('[TrendyolSync] failed', error)
    if (syncRun) {
      await finishSyncRun(syncRun, syncType, 'failed', 0, 1, error instanceof Error ? error.message : String(error))
    } else {
      const fallbackRun = await startSyncRun(syncType)
      await finishSyncRun(fallbackRun, syncType, 'failed', 0, 1, error instanceof Error ? error.message : String(error))
    }
    return jsonResponse({ success: false, message: 'Trendyol senkronu başarısız.' }, 500)
  }
})

async function getTrendyolIntegration(): Promise<IntegrationRow | null> {
  const { data, error } = await supabase
    .from('marketplace_integrations')
    .select('id, channel, supplier_id, warehouse_id, api_key, api_secret, metadata')
    .eq('channel', 'trendyol')
    .maybeSingle()

  if (error) {
    console.error('[TrendyolSync] marketplace_integrations error', error)
    return null
  }

  if (!data?.api_key || !data.api_secret || !data.supplier_id) {
    console.warn('[TrendyolSync] missing api credentials or supplier id')
    return null
  }

  return data as IntegrationRow
}

async function syncProducts(integration: IntegrationRow, size: number) {
  let page = 0
  let processed = 0
  let errors = 0
  let hasNext = true

  while (hasNext) {
    const response = await trendyolFetch(`/suppliers/${integration.supplier_id}/products`, integration, {
      page,
      size,
    })

    if (!response.ok) {
      errors += 1
      throw new Error(`Trendyol products request failed (${response.status})`)
    }

    const payload = await response.json()
    const items: TrendyolProduct[] = payload?.content ?? []
    if (!items.length) {
      hasNext = false
      break
    }

    const skuMap = await findProductIdsBySku(items.map((item) => item.stockCode).filter(Boolean) as string[])
    const upserts = items.map((item) => mapProduct(item, skuMap))

    const { error } = await supabase.from('trendyol_products').upsert(upserts, { onConflict: 'marketplace_product_id' })
    if (error) {
      errors += 1
      console.error('[TrendyolSync] product upsert failed', error)
    } else {
      processed += items.length
    }

    hasNext = payload?.page?.totalPages ? page + 1 < payload.page.totalPages : items.length === size
    page += 1
  }

  return { processed, errors }
}

async function syncOrders(integration: IntegrationRow, size: number, statuses?: string[]) {
  const statusList = statuses?.length ? statuses : ['Created']
  let processed = 0
  let errors = 0

  for (const status of statusList) {
    let page = 0
    let hasNext = true

    while (hasNext) {
      const response = await trendyolFetch(`/suppliers/${integration.supplier_id}/orders`, integration, {
        page,
        size,
        status,
      })

      if (!response.ok) {
        errors += 1
        throw new Error(`Trendyol orders request failed (${response.status})`)
      }

      const payload = await response.json()
      const orders: TrendyolOrder[] = payload?.content ?? []
      if (!orders.length) {
        hasNext = false
        break
      }

      const mappedOrders = orders.map(mapOrderRow)
      const { data: insertedOrders, error: orderError } = await supabase
        .from('trendyol_orders')
        .upsert(mappedOrders, { onConflict: 'marketplace_order_id' })
        .select('id, marketplace_order_id')

      if (orderError) {
        errors += 1
        console.error('[TrendyolSync] order upsert failed', orderError)
      } else if (insertedOrders?.length) {
        await syncOrderItems(orders, insertedOrders)
        processed += orders.length
      }

      hasNext = payload?.page?.totalPages ? page + 1 < payload.page.totalPages : orders.length === size
      page += 1
    }
  }

  return { processed, errors }
}

async function syncOrderItems(sourceOrders: TrendyolOrder[], storedOrders: Array<{ id: string; marketplace_order_id: string }>) {
  const orderIdMap = new Map(storedOrders.map((row) => [row.marketplace_order_id, row.id]))

  for (const order of sourceOrders) {
    const marketplaceId = String(order.id ?? order.orderNumber)
    const orderId = orderIdMap.get(marketplaceId)
    if (!orderId || !order.lines?.length) continue

    const itemsPayload = order.lines.map((line) => ({
      trendyol_order_id: orderId,
      marketplace_order_item_id: line.id ? String(line.id) : null,
      trendyol_product_id: line.productId ? String(line.productId) : null,
      product_id: null,
      sku: line.merchantSku ?? null,
      quantity: line.quantity ?? 1,
      unit_price: line.price ?? null,
      vat_rate: line.vatRate ?? null,
      discount: line.discount ?? null,
      status: line.lineItemStatus ?? null,
      metadata: line ? line : null,
    }))

    await supabase.from('trendyol_order_items').delete().eq('trendyol_order_id', orderId)
    const { error } = await supabase.from('trendyol_order_items').insert(itemsPayload)
    if (error) {
      console.error('[TrendyolSync] order items insert failed', error)
    }
  }
}

function mapProduct(item: TrendyolProduct, skuMap: Map<string, string>) {
  const sku = item.stockCode ?? null
  const price = item.salePrice ?? item.price ?? item.listPrice ?? null
  const discounted = item.price ?? null

  return {
    marketplace_product_id: item.productId ? String(item.productId) : String(item.id),
    product_id: sku && skuMap.has(sku) ? skuMap.get(sku) : null,
    sku,
    barcode: item.barcode ?? null,
    title: item.title ?? null,
    currency: item.currencyType ?? 'TRY',
    price,
    discounted_price: discounted,
    stock: item.quantity ?? item.quantityInfo?.quantity ?? null,
    status: item.status ?? 'passive',
    last_synced_at: new Date().toISOString(),
    metadata: item,
  }
}

function mapOrderRow(order: TrendyolOrder) {
  return {
    marketplace_order_id: order.id ? String(order.id) : String(order.orderNumber),
    order_number: order.orderNumber ?? null,
    marketplace_status: order.status ?? 'created',
    order_date: order.orderDate ? new Date(order.orderDate).toISOString() : null,
    shipment_package_id: order.shipmentPackageId ? String(order.shipmentPackageId) : null,
    buyer_name: order.buyerName ?? null,
    buyer_email: order.buyerEmail ?? null,
    total_price: order.totalPrice ?? null,
    currency: order.currency ?? 'TRY',
    shipping_address: order.shippingAddress ?? null,
    billing_address: order.billingAddress ?? null,
    raw_payload: order,
    last_status_synced_at: new Date().toISOString(),
  }
}

async function findProductIdsBySku(skus: string[]) {
  const uniqueSkus = Array.from(new Set(skus)).filter(Boolean)
  const map = new Map<string, string>()
  if (!uniqueSkus.length) return map

  const { data, error } = await supabase.from('products').select('id, sku').in('sku', uniqueSkus)
  if (error) {
    console.error('[TrendyolSync] product lookup failed', error)
    return map
  }

  data?.forEach((row) => {
    if (row.sku) {
      map.set(row.sku, row.id)
    }
  })

  return map
}

async function startSyncRun(syncType: string): Promise<SyncRun> {
  const { data, error } = await supabase
    .from('trendyol_sync_runs')
    .insert({ sync_type: syncType })
    .select('id')
    .single()

  if (error || !data) {
    console.error('[TrendyolSync] start sync run failed', error)
    throw new Error('Senkron başlatılamadı')
  }

  return data
}

async function finishSyncRun(syncRun: SyncRun, syncType: string, status: string, processed: number, errorCount: number, errorMessage?: string) {
  const { error } = await supabase
    .from('trendyol_sync_runs')
    .update({
      finished_at: new Date().toISOString(),
      status,
      processed_count: processed,
      error_count: errorCount,
      error_message: errorMessage ?? null,
    })
    .eq('id', syncRun.id)

  if (error) {
    console.error('[TrendyolSync] finish sync run failed', error)
  }
}

async function touchMarketplaceIntegration(integrationId: string) {
  const { error } = await supabase
    .from('marketplace_integrations')
    .update({ last_sync_at: new Date().toISOString() })
    .eq('id', integrationId)

  if (error) {
    console.error('[TrendyolSync] marketplace update failed', error)
  }
}

async function trendyolFetch(path: string, integration: IntegrationRow, query: Record<string, string | number>) {
  const headers = new Headers()
  headers.set('Accept', 'application/json')
  headers.set('User-Agent', 'SupabaseTrendyolSync/1.0')
  headers.set('Authorization', buildAuthHeader(integration))

  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue
    search.append(key, String(value))
  }

  const url = `${TRENDYOL_BASE_URL}${path}?${search.toString()}`
  return fetch(url, {
    method: 'GET',
    headers,
  })
}

function buildAuthHeader(integration: IntegrationRow) {
  const token = btoa(`${integration.api_key}:${integration.api_secret}`)
  return `Basic ${token}`
}

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}
