const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSchema() {
  console.log('🔍 Checking products table schema...')
  
  try {
    // Get a sample product to see the current schema
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .limit(1)

    if (error) {
      console.error('Error:', error)
      return
    }

    if (data && data.length > 0) {
      console.log('📋 Current products table columns:')
      Object.keys(data[0]).forEach(column => {
        console.log(`- ${column}`)
      })
    } else {
      console.log('📋 No products found. Let me try to describe the table structure...')
      
      // Try to insert a minimal product to see what columns are required
      const { error: insertError } = await supabase
        .from('products')
        .insert([{ name: 'Test', price: 1, cost: 1, inventory_quantity: 1 }])
        .select()

      if (insertError) {
        console.log('Insert error (this helps us see the schema):', insertError)
      }
    }

  } catch (error) {
    console.error('❌ Error checking schema:', error)
  }
}

checkSchema()