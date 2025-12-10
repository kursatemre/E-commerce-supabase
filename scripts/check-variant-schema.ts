import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSchema() {
  console.log('🔍 Checking variant_types schema...\n')

  try {
    // Try to query variant_types
    const { data, error } = await supabase
      .from('variant_types')
      .select('*')
      .limit(1)

    if (error) {
      console.error('❌ Error querying variant_types:', error.message)
      console.log('\n📋 Available columns might be different.')
      console.log('   Please check Supabase dashboard for the actual schema.')
      return
    }

    if (data && data.length > 0) {
      console.log('✅ variant_types table exists!')
      console.log('📊 Sample row:', JSON.stringify(data[0], null, 2))
      console.log('\n📋 Detected columns:', Object.keys(data[0]).join(', '))
    } else {
      console.log('⚠️  variant_types table is empty')
    }

    // Check variant_options
    console.log('\n🔍 Checking variant_options schema...\n')
    const { data: optionsData, error: optionsError } = await supabase
      .from('variant_options')
      .select('*')
      .limit(1)

    if (optionsError) {
      console.error('❌ Error querying variant_options:', optionsError.message)
    } else if (optionsData && optionsData.length > 0) {
      console.log('✅ variant_options table exists!')
      console.log('📊 Sample row:', JSON.stringify(optionsData[0], null, 2))
      console.log('\n📋 Detected columns:', Object.keys(optionsData[0]).join(', '))
    } else {
      console.log('⚠️  variant_options table is empty')
    }

    // Check product_variants
    console.log('\n🔍 Checking product_variants schema...\n')
    const { data: variantsData, error: variantsError } = await supabase
      .from('product_variants')
      .select('*')
      .limit(1)

    if (variantsError) {
      console.error('❌ Error querying product_variants:', variantsError.message)
    } else if (variantsData && variantsData.length > 0) {
      console.log('✅ product_variants table exists!')
      console.log('📊 Sample row:', JSON.stringify(variantsData[0], null, 2))
      console.log('\n📋 Detected columns:', Object.keys(variantsData[0]).join(', '))
    } else {
      console.log('⚠️  product_variants table is empty')
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

checkSchema()
