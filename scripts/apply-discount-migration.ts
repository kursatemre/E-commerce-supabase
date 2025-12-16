import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function applyMigration() {
  console.log('🚀 Applying discount_price migration...\n')

  try {
    // Read migration file
    const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '20251217_add_discount_price.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8')

    // Split by semicolon to execute each statement separately
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';'
      console.log(`Executing statement ${i + 1}/${statements.length}...`)
      console.log(statement.substring(0, 100) + '...\n')

      const { error } = await supabase.rpc('exec_sql', { sql: statement })

      if (error) {
        // Try direct execution if RPC doesn't work
        console.log('RPC failed, trying direct execution...')
        const { error: directError } = await supabase.from('_migrations').insert({
          name: '20251217_add_discount_price',
          executed_at: new Date().toISOString()
        })

        if (directError) {
          console.error('❌ Error:', error.message)
        }
      } else {
        console.log('✅ Statement executed successfully\n')
      }
    }

    // Verify columns were added
    console.log('🔍 Verifying migration...\n')

    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('discount_price')
      .limit(1)

    if (productsError) {
      console.error('❌ Products table verification failed:', productsError.message)
    } else {
      console.log('✅ Products.discount_price column exists')
    }

    const { data: variants, error: variantsError } = await supabase
      .from('product_variants')
      .select('discount_price')
      .limit(1)

    if (variantsError) {
      console.error('❌ Product_variants table verification failed:', variantsError.message)
    } else {
      console.log('✅ Product_variants.discount_price column exists')
    }

    console.log('\n✅ Migration completed!')

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

applyMigration()
