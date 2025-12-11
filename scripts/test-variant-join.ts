import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function testJoin() {
  const { data, error } = await supabase
    .from('product_variants')
    .select(`
      id,
      product_id,
      variant_option_values(
        variant_option_id,
        variant_options(
          id,
          value,
          variant_type_id,
          variant_types(id, name, code)
        )
      )
    `)
    .eq('is_active', true)
    .limit(1)

  if (error) {
    console.error('Error:', error)
    return
  }

  console.log('Full result structure:')
  console.log(JSON.stringify(data, null, 2))

  if (data && data.length > 0) {
    const first = data[0]
    console.log('\n\nFirst variant_option_value:')
    console.log(JSON.stringify(first.variant_option_values?.[0], null, 2))
  }
}

testJoin()
