import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function seedVariants() {
  console.log('🌱 Starting variant seeding...')

  try {
    // Get first active product
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name')
      .eq('is_active', true)
      .limit(3)

    if (productsError) throw productsError
    if (!products || products.length === 0) {
      console.log('❌ No products found. Please seed products first.')
      return
    }

    console.log(`📦 Found ${products.length} products`)

    // For each product, add variant types and options
    for (const product of products) {
      console.log(`\n➡️  Adding variants to: ${product.name}`)

      // Create "Beden" (Size) variant type
      const { data: sizeType, error: sizeTypeError } = await supabase
        .from('variant_types')
        .insert({
          product_id: product.id,
          name: 'Beden',
          sort_order: 1,
          is_active: true,
        })
        .select()
        .single()

      if (sizeTypeError) {
        console.log('⚠️  Size type might already exist:', sizeTypeError.message)
        continue
      }

      console.log('   ✅ Created variant type: Beden')

      // Create size options
      const sizeOptions = ['XS', 'S', 'M', 'L', 'XL']
      const { data: sizeOptionsData, error: sizeOptionsError } = await supabase
        .from('variant_options')
        .insert(
          sizeOptions.map((size, index) => ({
            variant_type_id: sizeType.id,
            value: size,
            sort_order: index + 1,
            is_active: true,
          }))
        )
        .select()

      if (sizeOptionsError) throw sizeOptionsError
      console.log(`   ✅ Created ${sizeOptions.length} size options`)

      // Create "Renk" (Color) variant type
      const { data: colorType, error: colorTypeError } = await supabase
        .from('variant_types')
        .insert({
          product_id: product.id,
          name: 'Renk',
          sort_order: 2,
          is_active: true,
        })
        .select()
        .single()

      if (colorTypeError) throw colorTypeError
      console.log('   ✅ Created variant type: Renk')

      // Create color options
      const colorOptions = ['Siyah', 'Beyaz', 'Lacivert']
      const { data: colorOptionsData, error: colorOptionsError } = await supabase
        .from('variant_options')
        .insert(
          colorOptions.map((color, index) => ({
            variant_type_id: colorType.id,
            value: color,
            sort_order: index + 1,
            is_active: true,
          }))
        )
        .select()

      if (colorOptionsError) throw colorOptionsError
      console.log(`   ✅ Created ${colorOptions.length} color options`)

      // Create product variants (all combinations)
      const productVariants = []
      for (const sizeOption of sizeOptionsData || []) {
        for (const colorOption of colorOptionsData || []) {
          productVariants.push({
            product_id: product.id,
            sku: `${product.id.substring(0, 8)}-${sizeOption.value}-${colorOption.value}`,
            price: null, // Will use product's base price
            stock: Math.floor(Math.random() * 20) + 5, // Random stock 5-25
            is_active: true,
          })
        }
      }

      const { data: variantsData, error: variantsError } = await supabase
        .from('product_variants')
        .insert(productVariants)
        .select()

      if (variantsError) throw variantsError
      console.log(`   ✅ Created ${productVariants.length} product variants`)

      // Create variant_option_values linking
      const variantOptionValues = []
      let variantIndex = 0
      for (const sizeOption of sizeOptionsData || []) {
        for (const colorOption of colorOptionsData || []) {
          if (variantsData && variantsData[variantIndex]) {
            variantOptionValues.push(
              {
                product_variant_id: variantsData[variantIndex].id,
                variant_option_id: sizeOption.id,
              },
              {
                product_variant_id: variantsData[variantIndex].id,
                variant_option_id: colorOption.id,
              }
            )
          }
          variantIndex++
        }
      }

      const { error: valuesError } = await supabase
        .from('variant_option_values')
        .insert(variantOptionValues)

      if (valuesError) throw valuesError
      console.log(`   ✅ Created ${variantOptionValues.length} variant option values`)
    }

    console.log('\n✅ Variant seeding completed successfully!')
  } catch (error) {
    console.error('❌ Error seeding variants:', error)
    process.exit(1)
  }
}

seedVariants()
