#!/usr/bin/env node
/**
 * Trendyol Product Sync Worker
 *
 * Bu script Trendyol'daki ürünleri yerel veritabanıyla senkronize eder.
 * Çalıştırma: node scripts/sync-trendyol-products.mjs
 *
 * Cron: Her 6 saatte bir çalıştırılması önerilir
 */

import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const TRENDYOL_BASE_URL = 'https://api.trendyol.com/sapigw'

async function getTrendyolCredentials() {
  const { data, error } = await supabase
    .from('marketplace_integrations')
    .select('api_key, api_secret, supplier_id, status')
    .eq('channel', 'trendyol')
    .maybeSingle()

  if (error || !data) {
    throw new Error('Trendyol credentials not found in database')
  }

  if (data.status !== 'active') {
    throw new Error('Trendyol integration is not active')
  }

  return {
    apiKey: data.api_key,
    apiSecret: data.api_secret,
    supplierId: data.supplier_id,
  }
}

async function fetchTrendyolProducts(credentials, page = 0, size = 100) {
  const auth = Buffer.from(`${credentials.apiKey}:${credentials.apiSecret}`).toString('base64')
  const url = `${TRENDYOL_BASE_URL}/suppliers/${credentials.supplierId}/products?page=${page}&size=${size}`

  const response = await fetch(url, {
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Trendyol API error: ${response.status} ${errorText}`)
  }

  return response.json()
}

async function syncProducts() {
  const syncId = crypto.randomUUID()
  let processedCount = 0
  let errorCount = 0

  console.log(`🔄 [${syncId}] Starting Trendyol product sync...`)

  // Create sync run record
  const { data: syncRun, error: syncError } = await supabase
    .from('trendyol_sync_runs')
    .insert({
      id: syncId,
      sync_type: 'products',
      status: 'running',
      started_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (syncError) {
    console.error('❌ Failed to create sync run:', syncError)
    return
  }

  try {
    const credentials = await getTrendyolCredentials()
    console.log(`✅ Retrieved Trendyol credentials for supplier: ${credentials.supplierId}`)

    let currentPage = 0
    let hasMore = true

    while (hasMore) {
      console.log(`📦 Fetching page ${currentPage}...`)

      const response = await fetchTrendyolProducts(credentials, currentPage, 100)
      const products = response.content || []
      const totalElements = response.totalElements || 0

      if (products.length === 0) {
        hasMore = false
        break
      }

      // Process each product
      for (const product of products) {
        try {
          // Match with local product by SKU/barcode
          const { data: localProduct } = await supabase
            .from('products')
            .select('id')
            .or(`sku.eq.${product.stockCode},barcode.eq.${product.barcode}`)
            .maybeSingle()

          // Upsert to trendyol_products
          const { error: upsertError } = await supabase
            .from('trendyol_products')
            .upsert(
              {
                marketplace_product_id: product.productMainId,
                product_id: localProduct?.id || null,
                sku: product.stockCode,
                barcode: product.barcode,
                title: product.title,
                currency: product.currencyType || 'TRY',
                price: product.salePrice,
                discounted_price: product.listPrice,
                stock: product.quantity,
                status: product.approved ? 'active' : 'passive',
                last_synced_at: new Date().toISOString(),
                metadata: {
                  brandId: product.brandId,
                  categoryId: product.categoryId,
                  vatRate: product.vatRate,
                  images: product.images,
                },
              },
              { onConflict: 'marketplace_product_id' }
            )

          if (upsertError) {
            console.error(`❌ Failed to upsert product ${product.productMainId}:`, upsertError)
            errorCount++
          } else {
            processedCount++
          }
        } catch (productError) {
          console.error(`❌ Error processing product ${product.productMainId}:`, productError)
          errorCount++
        }
      }

      console.log(`✅ Processed ${products.length} products from page ${currentPage}`)
      console.log(`📊 Progress: ${processedCount + errorCount} / ${totalElements}`)

      currentPage++

      // Check if there are more pages
      if (processedCount + errorCount >= totalElements) {
        hasMore = false
      }

      // Rate limiting: wait 1 second between pages
      if (hasMore) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }

    // Update sync run as completed
    await supabase
      .from('trendyol_sync_runs')
      .update({
        status: 'completed',
        finished_at: new Date().toISOString(),
        processed_count: processedCount,
        error_count: errorCount,
      })
      .eq('id', syncId)

    console.log(`✅ [${syncId}] Sync completed successfully!`)
    console.log(`📊 Processed: ${processedCount}, Errors: ${errorCount}`)

    // Update marketplace integration last_sync_at
    await supabase
      .from('marketplace_integrations')
      .update({ last_sync_at: new Date().toISOString() })
      .eq('channel', 'trendyol')

  } catch (error) {
    console.error(`❌ [${syncId}] Sync failed:`, error)

    // Update sync run as failed
    await supabase
      .from('trendyol_sync_runs')
      .update({
        status: 'failed',
        finished_at: new Date().toISOString(),
        processed_count: processedCount,
        error_count: errorCount,
        error_message: error instanceof Error ? error.message : 'Unknown error',
      })
      .eq('id', syncId)

    process.exit(1)
  }
}

// Run the sync
syncProducts().catch((error) => {
  console.error('💥 Fatal error:', error)
  process.exit(1)
})
