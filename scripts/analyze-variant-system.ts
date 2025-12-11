import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function analyzeVariantSystem() {
  console.log('🔍 Analyzing full variant system...\n')

  try {
    // 1. Check global variant_types
    console.log('📋 STEP 1: Global Variant Types')
    const { data: variantTypes } = await supabase
      .from('variant_types')
      .select('*')
      .eq('is_active', true)

    console.log(`Found ${variantTypes?.length || 0} variant types:`)
    variantTypes?.forEach(vt => {
      console.log(`  - ${vt.name} (code: ${vt.code})`)
    })

    // 2. Check variant_options for each type
    console.log('\n📋 STEP 2: Variant Options for each type')
    for (const vt of variantTypes || []) {
      const { data: options } = await supabase
        .from('variant_options')
        .select('*')
        .eq('variant_type_id', vt.id)
        .eq('is_active', true)
        .order('sort_order')

      console.log(`\n  ${vt.name} options:`)
      options?.forEach(opt => {
        console.log(`    - ${opt.value}`)
      })
    }

    // 3. Get a sample product
    console.log('\n📋 STEP 3: Sample Product with Full Variant Info')
    const { data: products } = await supabase
      .from('products')
      .select('id, name')
      .eq('is_active', true)
      .limit(1)

    if (!products || products.length === 0) {
      console.log('No products found')
      return
    }

    const sampleProduct = products[0]
    console.log(`\nAnalyzing: ${sampleProduct.name}`)
    console.log(`Product ID: ${sampleProduct.id}`)

    // 4. Get product_variants for this product
    const { data: productVariants } = await supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', sampleProduct.id)
      .eq('is_active', true)

    console.log(`\nFound ${productVariants?.length || 0} product variants`)

    // 5. For each product variant, get its variant_option_values
    if (productVariants && productVariants.length > 0) {
      const firstVariant = productVariants[0]
      console.log(`\nDetailed view of first variant:`)
      console.log(`  Variant ID: ${firstVariant.id}`)
      console.log(`  SKU: ${firstVariant.sku}`)
      console.log(`  Price: ${firstVariant.price}`)
      console.log(`  Stock: ${firstVariant.stock}`)

      const { data: variantOptionValues } = await supabase
        .from('variant_option_values')
        .select(`
          *,
          variant_options(
            id,
            value,
            variant_types(name, code)
          )
        `)
        .eq('product_variant_id', firstVariant.id)

      console.log(`\n  This variant has ${variantOptionValues?.length || 0} option values:`)
      variantOptionValues?.forEach((vov: any) => {
        const option = vov.variant_options
        const type = option?.variant_types
        console.log(`    - ${type?.name}: ${option?.value}`)
      })
    }

    // 6. Show the complete structure for understanding
    console.log('\n\n📊 COMPLETE VARIANT STRUCTURE FOR HOMEPAGE:')
    console.log('='.repeat(60))
    console.log('To fetch variants for a product, we need to:')
    console.log('1. Get all product_variants for the product')
    console.log('2. For each product_variant, get variant_option_values')
    console.log('3. Join with variant_options to get the actual values')
    console.log('4. Join with variant_types to get the type names (Beden, Renk)')
    console.log('5. Group by variant_type to extract unique options')

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

analyzeVariantSystem()
