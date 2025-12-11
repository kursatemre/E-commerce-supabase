import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkProductVariants() {
  console.log('🔍 Checking which products have variants...\n')

  try {
    // Get all active products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(10)

    if (productsError) {
      console.error('❌ Error fetching products:', productsError)
      return
    }

    console.log(`📦 Found ${products?.length || 0} products\n`)

    // For each product, check variants
    for (const product of products || []) {
      const { data: variants, error: variantsError } = await supabase
        .from('product_variants')
        .select('id, size, color, sku, stock, price')
        .eq('product_id', product.id)
        .eq('is_active', true)

      if (variantsError) {
        console.error(`❌ Error fetching variants for ${product.name}:`, variantsError)
        continue
      }

      console.log(`\n📌 Product: ${product.name}`)
      console.log(`   ID: ${product.id}`)

      if (variants && variants.length > 0) {
        console.log(`   ✅ Has ${variants.length} variant(s):`)
        variants.forEach((v, i) => {
          console.log(`      ${i + 1}. Size: ${v.size || 'N/A'}, Color: ${v.color || 'N/A'}, Stock: ${v.stock}, Price: ${v.price}`)
        })

        // Extract unique sizes and colors
        const sizes = new Set(variants.map(v => v.size).filter(s => s && s.trim()))
        const colors = new Set(variants.map(v => v.color).filter(c => c && c.trim()))

        console.log(`   📊 Unique sizes: ${Array.from(sizes).join(', ') || 'None'}`)
        console.log(`   📊 Unique colors: ${Array.from(colors).join(', ') || 'None'}`)
      } else {
        console.log(`   ⚠️  No variants found`)
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

checkProductVariants()
