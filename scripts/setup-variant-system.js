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

async function setupVariantSystem() {
  console.log('🎨 Setting up variant system...')

  // 1. Create variant types
  console.log('📝 Creating variant types...')
  const variantTypes = [
    { code: 'color', name: 'Renk', sort_order: 1 },
    { code: 'size', name: 'Beden', sort_order: 2 },
  ]

  const variantTypeIds = {}
  for (const vt of variantTypes) {
    const { data, error } = await supabase
      .from('variant_types')
      .upsert(vt, { onConflict: 'code' })
      .select()
      .single()

    if (error) {
      console.error(`❌ Error creating variant type (${vt.name}):`, error)
    } else {
      variantTypeIds[vt.code] = data.id
      console.log(`✅ Variant type: ${vt.name}`)
    }
  }

  // 2. Create variant options
  console.log('🎨 Creating variant options...')
  const variantOptions = {
    color: [
      'Mavi', 'Bej', 'Mercan', 'Siyah', 'Bordo', 'Zümrüt Yeşili',
      'Krem', 'Gri', 'Haki', 'Koyu Gri', 'Taba', 'Lacivert',
      'Asker Yeşili', 'Antrasit', 'Yeşil', 'Füme', 'Petrol Yeşili',
      'Koyu Mavi', 'Kahverengi', 'Beyaz', 'Turuncu', 'Sarı'
    ],
    size: [
      'XS', 'S', 'M', 'L', 'XL', 'XXL',
      '26', '27', '28', '29', '30', '31',
      '34', '36', '38', '40', '42', '44',
      '46', '48', '50', '52', '54', '56',
      'Standart'
    ]
  }

  const variantOptionIds = { color: {}, size: {} }
  for (const [typeCode, values] of Object.entries(variantOptions)) {
    for (const value of values) {
      const { data, error } = await supabase
        .from('variant_options')
        .upsert({
          variant_type_id: variantTypeIds[typeCode],
          value,
          sort_order: values.indexOf(value) + 1,
          is_active: true
        }, { onConflict: 'variant_type_id,value' })
        .select()
        .single()

      if (error) {
        console.error(`❌ Error creating variant option (${value}):`, error)
      } else {
        variantOptionIds[typeCode][value] = data.id
      }
    }
  }
  console.log(`✅ Created ${variantOptions.color.length} colors and ${variantOptions.size.length} sizes`)

  console.log('🎉 Variant system setup completed!')
  console.log('Variant type IDs:', variantTypeIds)
  console.log('\nNow you can use the admin panel to assign variants to products!')
}

setupVariantSystem().catch(console.error)
