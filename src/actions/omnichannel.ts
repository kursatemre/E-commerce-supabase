'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'

export type MarketplaceActionResult = { success: boolean; message?: string }
export type TrendyolStockActionResult = MarketplaceActionResult

type TrendyolProductRecord = {
  id: string
  marketplace_product_id: string
  sku: string | null
  barcode: string | null
  currency: string | null
  stock: number | null
  price: number | null
  discounted_price: number | null
  products?: {
    id: string
    name?: string | null
    stock: number | null
    price: number | null
  } | null
}

const sanitize = (value: FormDataEntryValue | null) => {
  if (!value) return null
  const text = String(value).trim()
  return text.length ? text : null
}

export async function saveTrendyolIntegration(_: MarketplaceActionResult, formData: FormData): Promise<MarketplaceActionResult> {
  const storeName = sanitize(formData.get('store_name'))
  const supplierId = sanitize(formData.get('supplier_id'))
  const warehouseId = sanitize(formData.get('warehouse_id'))
  const apiKey = sanitize(formData.get('api_key'))
  const apiSecret = sanitize(formData.get('api_secret'))
  const callbackUrl = sanitize(formData.get('callback_url'))
  const region = sanitize(formData.get('region')) ?? 'TR'

  if (!storeName || !supplierId || !apiKey || !apiSecret) {
    return { success: false, message: 'Mağaza adı, tedarikçi ID, App Key ve App Secret zorunludur.' }
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from('marketplace_integrations')
    .upsert(
      {
        channel: 'trendyol',
        store_name: storeName,
        supplier_id: supplierId,
        warehouse_id: warehouseId,
        api_key: apiKey,
        api_secret: apiSecret,
        status: apiKey && apiSecret ? 'active' : 'inactive',
        metadata: {
          callback_url: callbackUrl,
          region,
        },
      },
      { onConflict: 'channel' }
    )

  if (error) {
    console.error('[Omnichannel] Trendyol kaydedilemedi', error)
    return { success: false, message: 'Trendyol bilgileri kaydedilemedi.' }
  }

  revalidatePath('/admin/integrations')
  return { success: true, message: 'Trendyol bilgileri güncellendi.' }
}

const TRENDYOL_BASE_URL = process.env.TRENDYOL_BASE_URL ?? 'https://api.trendyol.com/sapigw'

export async function pushTrendyolStock(_: TrendyolStockActionResult, formData: FormData): Promise<TrendyolStockActionResult> {
  const trendyolProductId = sanitize(formData.get('trendyol_product_id'))

  if (!trendyolProductId) {
    return { success: false, message: 'Ürün kimliği bulunamadı.' }
  }

  const supabase = await createClient()

  const [{ data: product, error: productError }, { data: integration, error: integrationError }] = await Promise.all([
    supabase
      .from('trendyol_products')
      .select('id, marketplace_product_id, sku, barcode, currency, stock, price, discounted_price, product_id, products ( id, name, stock, price )')
      .eq('id', trendyolProductId)
      .maybeSingle<TrendyolProductRecord>(),
    supabase
      .from('marketplace_integrations')
      .select('id, supplier_id, api_key, api_secret, metadata')
      .eq('channel', 'trendyol')
      .maybeSingle(),
  ])

  if (productError || !product) {
    console.error('[Omnichannel] Trendyol ürünü bulunamadı', productError)
    return { success: false, message: 'Ürün kaydı bulunamadı.' }
  }

  if (integrationError || !integration || !integration.api_key || !integration.api_secret || !integration.supplier_id) {
    console.error('[Omnichannel] Trendyol credential eksik', integrationError)
    return { success: false, message: 'Trendyol API bilgileri eksik.' }
  }

  const quantity = resolveQuantity(product)
  const salePrice = resolvePrice(product)
  const listPrice = product.price ?? salePrice

  const payload = {
    items: [
      {
        barcode: product.barcode ?? undefined,
        stockCode: product.sku ?? undefined,
        quantity,
        salePrice,
        listPrice,
        currencyType: product.currency ?? 'TRY',
      },
    ],
  }

  try {
    const response = await fetch(`${TRENDYOL_BASE_URL}/suppliers/${integration.supplier_id}/products/price-and-inventory`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: buildBasicAuth(integration.api_key, integration.api_secret),
        'User-Agent': 'OmnichannelDashboard/1.0',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const text = await response.text()
      console.error('[Omnichannel] Trendyol stok push hatası', response.status, text)
      return { success: false, message: 'Trendyol API hatası: ' + response.status }
    }

    await supabase
      .from('trendyol_products')
      .update({ last_synced_at: new Date().toISOString(), stock: quantity, discounted_price: salePrice })
      .eq('id', product.id)

    revalidatePath('/admin/integrations')
    return { success: true, message: 'Stok Trendyol ile paylaşıldı.' }
  } catch (error) {
    console.error('[Omnichannel] Trendyol stok push başarısız', error)
    return { success: false, message: 'Stok gönderimi başarısız.' }
  }
}

function resolveQuantity(product: TrendyolProductRecord) {
  if (product.products?.stock !== undefined && product.products?.stock !== null) {
    return product.products.stock
  }
  if (product.stock !== undefined && product.stock !== null) {
    return product.stock
  }
  return 0
}

function resolvePrice(product: TrendyolProductRecord) {
  if (product.products?.price !== undefined && product.products?.price !== null) {
    return product.products.price
  }
  if (product.discounted_price !== undefined && product.discounted_price !== null) {
    return product.discounted_price
  }
  if (product.price !== undefined && product.price !== null) {
    return product.price
  }
  return null
}

function buildBasicAuth(apiKey: string, apiSecret: string) {
  if (typeof Buffer !== 'undefined') {
    return `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')}`
  }
  return `Basic ${btoa(`${apiKey}:${apiSecret}`)}`
}
