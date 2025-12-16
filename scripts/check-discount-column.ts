import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkColumns() {
  console.log('🔍 Checking if discount_price columns exist...\n')

  try {
    // Try to select discount_price from products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, price, discount_price')
      .limit(1)

    if (productsError) {
      console.log('❌ products.discount_price does NOT exist')
      console.log('   Error:', productsError.message)
      console.log('\n📝 You need to run the migration in Supabase SQL Editor:')
      console.log('   1. Go to Supabase Dashboard → SQL Editor')
      console.log('   2. Copy the content from: supabase/migrations/20251217_add_discount_price.sql')
      console.log('   3. Paste and Run\n')
    } else {
      console.log('✅ products.discount_price EXISTS')
      if (products && products.length > 0) {
        console.log('   Sample:', products[0])
      }
    }

    // Try to select discount_price from product_variants
    const { data: variants, error: variantsError } = await supabase
      .from('product_variants')
      .select('id, price, discount_price')
      .limit(1)

    if (variantsError) {
      console.log('\n❌ product_variants.discount_price does NOT exist')
      console.log('   Error:', variantsError.message)
    } else {
      console.log('\n✅ product_variants.discount_price EXISTS')
      if (variants && variants.length > 0) {
        console.log('   Sample:', variants[0])
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

checkColumns()
