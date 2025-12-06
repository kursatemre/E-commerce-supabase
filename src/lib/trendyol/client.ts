import { canUseServiceClient, getServiceClient } from '@/lib/supabase/service'

type TrendyolCredentials = {
  api_key: string
  api_secret: string
  supplier_id: string
}

const TRENDYOL_BASE_URL = 'https://api.trendyol.com/sapigw'

async function getCredentials(): Promise<TrendyolCredentials> {
  if (!canUseServiceClient()) {
    throw new Error('Supabase service client not available')
  }

  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from('marketplace_integrations')
    .select('api_key, api_secret, supplier_id')
    .eq('channel', 'trendyol')
    .maybeSingle()

  if (error || !data) {
    throw new Error('Trendyol credentials not found')
  }

  if (!data.api_key || !data.api_secret || !data.supplier_id) {
    throw new Error('Trendyol credentials incomplete')
  }

  return {
    api_key: data.api_key,
    api_secret: data.api_secret,
    supplier_id: data.supplier_id,
  }
}

function createAuthHeader(apiKey: string, apiSecret: string): string {
  const credentials = `${apiKey}:${apiSecret}`
  return `Basic ${Buffer.from(credentials).toString('base64')}`
}

async function trendyolFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const credentials = await getCredentials()
  const url = `${TRENDYOL_BASE_URL}${endpoint}`

  const headers = {
    'Content-Type': 'application/json',
    'User-Agent': 'E-Ticaret-Supabase/1.0',
    Authorization: createAuthHeader(credentials.api_key, credentials.api_secret),
    ...options.headers,
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('[Trendyol] API error:', response.status, errorText)
    throw new Error(`Trendyol API error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

// Product Management
export type TrendyolProduct = {
  barcode: string
  title: string
  productMainId: string
  brandId: number
  categoryId: number
  quantity: number
  stockCode: string
  dimensionalWeight: number
  description: string
  currencyType: string
  listPrice: number
  salePrice: number
  vatRate: number
  cargoCompanyId: number
  images: Array<{ url: string }>
  attributes: Array<{ attributeId: number; attributeValueId: number }>
}

export async function fetchProducts(page: number = 0, size: number = 50) {
  const credentials = await getCredentials()
  return trendyolFetch<{ content: TrendyolProduct[]; totalElements: number }>(
    `/suppliers/${credentials.supplier_id}/products?page=${page}&size=${size}`
  )
}

export async function fetchProductByBarcode(barcode: string) {
  const credentials = await getCredentials()
  return trendyolFetch<TrendyolProduct>(
    `/suppliers/${credentials.supplier_id}/products?barcode=${barcode}`
  )
}

export async function updateProductPrice(barcode: string, salePrice: number, listPrice?: number) {
  const credentials = await getCredentials()
  return trendyolFetch(
    `/suppliers/${credentials.supplier_id}/products/price-and-inventory`,
    {
      method: 'POST',
      body: JSON.stringify({
        items: [
          {
            barcode,
            salePrice,
            listPrice: listPrice ?? salePrice,
          },
        ],
      }),
    }
  )
}

export async function updateProductStock(barcode: string, quantity: number) {
  const credentials = await getCredentials()
  return trendyolFetch(
    `/suppliers/${credentials.supplier_id}/products/price-and-inventory`,
    {
      method: 'POST',
      body: JSON.stringify({
        items: [
          {
            barcode,
            quantity,
          },
        ],
      }),
    }
  )
}

// Order Management
export type TrendyolOrder = {
  orderNumber: string
  grossAmount: number
  totalDiscount: number
  totalPrice: number
  taxNumber: string
  invoiceAddress: {
    firstName: string
    lastName: string
    address: string
    city: string
    district: string
  }
  shipmentAddress: {
    firstName: string
    lastName: string
    address: string
    city: string
    district: string
  }
  lines: Array<{
    productName: string
    barcode: string
    quantity: number
    price: number
    discount: number
    vatRate: number
  }>
  orderDate: number
  status: string
  shipmentPackageStatus: string
}

export async function fetchOrders(
  startDate: string,
  endDate: string,
  page: number = 0,
  size: number = 50
) {
  const credentials = await getCredentials()
  return trendyolFetch<{ content: TrendyolOrder[]; totalElements: number }>(
    `/suppliers/${credentials.supplier_id}/orders?startDate=${startDate}&endDate=${endDate}&page=${page}&size=${size}`
  )
}

export async function fetchOrderByNumber(orderNumber: string) {
  const credentials = await getCredentials()
  return trendyolFetch<TrendyolOrder>(
    `/suppliers/${credentials.supplier_id}/orders/${orderNumber}`
  )
}

export async function updateOrderShipmentStatus(
  orderNumber: string,
  status: 'Created' | 'Picking' | 'Shipped' | 'Delivered' | 'Cancelled'
) {
  const credentials = await getCredentials()
  return trendyolFetch(
    `/suppliers/${credentials.supplier_id}/orders/${orderNumber}/status`,
    {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }
  )
}

// Webhook signature verification
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const crypto = require('crypto')
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')

  return signature === expectedSignature
}

// Category and Brand helpers
export async function fetchCategories() {
  return trendyolFetch<Array<{ id: number; name: string; subCategories: any[] }>>(
    '/product-categories'
  )
}

export async function fetchBrands() {
  return trendyolFetch<Array<{ id: number; name: string }>>('/brands')
}

export async function fetchCategoryAttributes(categoryId: number) {
  return trendyolFetch<Array<{
    attribute: { id: number; name: string }
    attributeValues: Array<{ id: number; name: string }>
    required: boolean
  }>>(`/product-categories/${categoryId}/attributes`)
}
