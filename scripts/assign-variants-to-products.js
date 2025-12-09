const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Read .env.local file
const envPath = path.join(__dirname, '..', '.env.local')
const envFile = fs.readFileSync(envPath, 'utf-8')
const envVars = {}
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/)
  if (match) {
    envVars[match[1].trim()] = match[2].trim()
  }
})

const supabase = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL,
  envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function assignVariants() {
  console.log('🎨 Assigning variants to products...')

  // Get variant types
  const { data: variantTypes } = await supabase
    .from('variant_types')
    .select('id, code')

  const colorTypeId = variantTypes.find(vt => vt.code === 'color')?.id
  const sizeTypeId = variantTypes.find(vt => vt.code === 'size')?.id

  if (!colorTypeId || !sizeTypeId) {
    console.error('❌ Variant types not found!')
    return
  }

  // Get all variant options
  const { data: allOptions } = await supabase
    .from('variant_options')
    .select('id, value, variant_type_id')

  const colorOptions = allOptions.filter(o => o.variant_type_id === colorTypeId)
  const sizeOptions = allOptions.filter(o => o.variant_type_id === sizeTypeId)

  // Product variant configurations
  const productVariants = {
    'midi-boy-cicekli-viskon-elbise': {
      colors: ['Mavi', 'Bej', 'Mercan'],
      sizes: ['S', 'M', 'L', 'XL']
    },
    'siyah-uzun-kollu-kadife-elbise': {
      colors: ['Siyah', 'Bordo', 'Zümrüt Yeşili'],
      sizes: ['XS', 'S', 'M', 'L']
    },
    'orgu-desenli-triko-kislik-elbise': {
      colors: ['Krem', 'Gri', 'Haki'],
      sizes: ['S', 'M', 'L']
    },
    'klasik-yun-kaban': {
      colors: ['Siyah', 'Koyu Gri', 'Taba'],
      sizes: ['48', '50', '52', '54', '56']
    },
    'su-gecirmez-kapusonlu-mont': {
      colors: ['Lacivert', 'Asker Yeşili', 'Antrasit'],
      sizes: ['S', 'M', 'L', 'XL', 'XXL']
    },
    'yuksek-bel-skinny-jean': {
      colors: ['Koyu Mavi', 'Siyah', 'Açık Gri'],
      sizes: ['26', '27', '28', '29', '30', '31']
    },
    'pileli-midi-boy-suni-deri-etek': {
      colors: ['Siyah', 'Kahverengi'],
      sizes: ['S', 'M', 'L']
    },
    'basic-bisiklet-yaka-t-shirt': {
      colors: ['Beyaz', 'Siyah', 'Gri'],
      sizes: ['S', 'M', 'L', 'XL', 'XXL']
    },
    'kapusonlu-logolu-sweatshirt': {
      colors: ['Koyu Gri', 'Sarı', 'Mavi'],
      sizes: ['S', 'M', 'L', 'XL']
    },
    'minimalist-deri-capraz-canta': {
      colors: ['Siyah', 'Taba', 'Krem'],
      sizes: ['Standart']
    },
    'unisex-spor-beyaz-sneaker': {
      colors: ['Beyaz'],
      sizes: ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45']
    },
  }

  // Get all products
  const { data: products } = await supabase
    .from('products')
    .select('id, slug, name, price')
    .order('created_at', { ascending: true })

  for (const product of products) {
    const config = productVariants[product.slug]
    if (!config) {
      console.log(`⚠️  No variant config for: ${product.name}`)
      continue
    }

    console.log(`\n📦 Processing: ${product.name}`)

    // 1. Assign variant types to product
    await supabase.from('product_variant_types').delete().eq('product_id', product.id)

    const { error: typeError } = await supabase
      .from('product_variant_types')
      .insert([
        { product_id: product.id, variant_type_id: colorTypeId, sort_order: 1 },
        { product_id: product.id, variant_type_id: sizeTypeId, sort_order: 2 }
      ])

    if (typeError) {
      console.error(`❌ Error assigning types:`, typeError)
      continue
    }

    // 2. Assign variant options to product
    await supabase.from('product_variant_options').delete().eq('product_id', product.id)

    const productColorOptions = colorOptions.filter(o => config.colors.includes(o.value))
    const productSizeOptions = sizeOptions.filter(o => config.sizes.includes(o.value))

    const optionsToInsert = [
      ...productColorOptions.map(o => ({ product_id: product.id, variant_option_id: o.id })),
      ...productSizeOptions.map(o => ({ product_id: product.id, variant_option_id: o.id }))
    ]

    const { error: optionError } = await supabase
      .from('product_variant_options')
      .insert(optionsToInsert)

    if (optionError) {
      console.error(`❌ Error assigning options:`, optionError)
      continue
    }

    // 3. Create SKU combinations
    await supabase.from('product_variants').delete().eq('product_id', product.id)
    await supabase.from('variant_option_product_variants').delete().in(
      'product_variant_id',
      (await supabase.from('product_variants').select('id').eq('product_id', product.id)).data?.map(v => v.id) || []
    )

    const skus = []
    const skuRelations = []

    for (const color of productColorOptions) {
      for (const size of productSizeOptions) {
        const skuName = `${color.value} - ${size.value}`
        const stock = Math.floor(Math.random() * 15) + 5 // Random stock 5-20

        skus.push({
          product_id: product.id,
          name: skuName,
          price: product.price,
          stock: stock,
          is_active: true
        })
      }
    }

    const { data: insertedSkus, error: skuError } = await supabase
      .from('product_variants')
      .insert(skus)
      .select('id, name')

    if (skuError) {
      console.error(`❌ Error creating SKUs:`, skuError)
      continue
    }

    // 4. Create relationships between SKUs and variant options
    for (const sku of insertedSkus) {
      // Parse SKU name to get color and size
      const [color, size] = sku.name.split(' - ')
      const colorOption = productColorOptions.find(o => o.value === color)
      const sizeOption = productSizeOptions.find(o => o.value === size)

      if (colorOption && sizeOption) {
        skuRelations.push(
          { product_variant_id: sku.id, variant_option_id: colorOption.id },
          { product_variant_id: sku.id, variant_option_id: sizeOption.id }
        )
      }
    }

    const { error: relationError } = await supabase
      .from('variant_option_product_variants')
      .insert(skuRelations)

    if (relationError) {
      console.error(`❌ Error creating SKU relations:`, relationError)
      continue
    }

    console.log(`✅ Created ${insertedSkus.length} SKUs with ${config.colors.length} colors and ${config.sizes.length} sizes`)
  }

  console.log('\n🎉 Variant assignment completed!')
}

assignVariants().catch(console.error)
