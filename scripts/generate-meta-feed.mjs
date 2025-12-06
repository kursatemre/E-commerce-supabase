#!/usr/bin/env node
/**
 * Meta Product Feed Generator
 *
 * Bu script yerel ürünlerden Meta Catalog için XML feed oluşturur.
 * Çalıştırma: node scripts/generate-meta-feed.mjs
 *
 * Cron: Her gün çalıştırılması önerilir
 */

import { createClient } from '@supabase/supabase-js'
import { writeFileSync } from 'fs'
import { join } from 'path'
import 'dotenv/config'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

function escapeXml(str) {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

async function fetchProducts() {
  const { data: products, error } = await supabase
    .from('products')
    .select(
      `
      id,
      name,
      slug,
      description,
      price,
      compare_at_price,
      sku,
      barcode,
      is_active,
      stock_quantity,
      images,
      categories (name),
      brands (name),
      product_variants (
        id,
        sku,
        barcode,
        price,
        stock_quantity,
        is_active
      )
    `
    )
    .eq('is_active', true)
    .gte('stock_quantity', 1)

  if (error) {
    throw new Error(`Failed to fetch products: ${error.message}`)
  }

  return products || []
}

function generateProductXml(product) {
  const productUrl = `${siteUrl}/shop/products/${product.slug}`
  const imageUrl = product.images?.[0] || `${siteUrl}/placeholder.jpg`
  const brand = product.brands?.name || 'Generic'
  const category = product.categories?.name || 'General'

  // If product has variants, create separate items for each variant
  if (product.product_variants && product.product_variants.length > 0) {
    return product.product_variants
      .filter((variant) => variant.is_active && variant.stock_quantity > 0)
      .map((variant) => {
        const variantId = `${product.id}_${variant.id}`
        const availability = variant.stock_quantity > 0 ? 'in stock' : 'out of stock'
        const price = `${variant.price} TRY`

        return `    <item>
      <g:id>${escapeXml(variantId)}</g:id>
      <g:title>${escapeXml(product.name)}</g:title>
      <g:description>${escapeXml(product.description || product.name)}</g:description>
      <g:link>${escapeXml(productUrl)}</g:link>
      <g:image_link>${escapeXml(imageUrl)}</g:image_link>
      <g:condition>new</g:condition>
      <g:availability>${availability}</g:availability>
      <g:price>${price}</g:price>
      <g:brand>${escapeXml(brand)}</g:brand>
      <g:google_product_category>${escapeXml(category)}</g:google_product_category>
      <g:product_type>${escapeXml(category)}</g:product_type>
      <g:item_group_id>${escapeXml(product.id)}</g:item_group_id>
      ${variant.sku ? `<g:mpn>${escapeXml(variant.sku)}</g:mpn>` : ''}
      ${variant.barcode ? `<g:gtin>${escapeXml(variant.barcode)}</g:gtin>` : ''}
    </item>`
      })
      .join('\n')
  }

  // Single product without variants
  const availability = product.stock_quantity > 0 ? 'in stock' : 'out of stock'
  const price = `${product.price} TRY`

  return `    <item>
      <g:id>${escapeXml(product.id)}</g:id>
      <g:title>${escapeXml(product.name)}</g:title>
      <g:description>${escapeXml(product.description || product.name)}</g:description>
      <g:link>${escapeXml(productUrl)}</g:link>
      <g:image_link>${escapeXml(imageUrl)}</g:image_link>
      <g:condition>new</g:condition>
      <g:availability>${availability}</g:availability>
      <g:price>${price}</g:price>
      <g:brand>${escapeXml(brand)}</g:brand>
      <g:google_product_category>${escapeXml(category)}</g:google_product_category>
      <g:product_type>${escapeXml(category)}</g:product_type>
      ${product.sku ? `<g:mpn>${escapeXml(product.sku)}</g:mpn>` : ''}
      ${product.barcode ? `<g:gtin>${escapeXml(product.barcode)}</g:gtin>` : ''}
    </item>`
}

async function generateFeed() {
  console.log('🔄 Starting Meta product feed generation...')

  const products = await fetchProducts()
  console.log(`✅ Fetched ${products.length} products`)

  const productXmls = products.map(generateProductXml).join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>E-Ticaret Product Feed</title>
    <link>${siteUrl}</link>
    <description>Product catalog for Meta integration</description>
${productXmls}
  </channel>
</rss>`

  const outputPath = join(process.cwd(), 'public', 'meta-product-feed.xml')
  writeFileSync(outputPath, xml, 'utf-8')

  console.log(`✅ Feed generated successfully: ${outputPath}`)
  console.log(`📊 Total products: ${products.length}`)
  console.log(`🌐 Feed URL: ${siteUrl}/meta-product-feed.xml`)

  // Update meta_assets table with feed info
  const { error: updateError } = await supabase
    .from('meta_assets')
    .update({
      last_synced_at: new Date().toISOString(),
      metadata: {
        product_count: products.length,
        last_generated: new Date().toISOString(),
        feed_url: `${siteUrl}/meta-product-feed.xml`,
      },
    })
    .eq('asset_type', 'catalog')

  if (updateError) {
    console.warn('⚠️ Failed to update meta_assets:', updateError)
  }
}

generateFeed().catch((error) => {
  console.error('💥 Fatal error:', error)
  process.exit(1)
})
