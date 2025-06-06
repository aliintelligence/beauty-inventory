const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function setupDatabase() {
  console.log('🚀 Setting up database for AI recommendations...')
  
  try {
    // First, let's add the missing columns to the products table
    console.log('📝 Adding missing columns to products table...')
    
    const alterTableSQL = `
      ALTER TABLE products 
      ADD COLUMN IF NOT EXISTS category TEXT,
      ADD COLUMN IF NOT EXISTS supplier TEXT,
      ADD COLUMN IF NOT EXISTS sku TEXT,
      ADD COLUMN IF NOT EXISTS weight DECIMAL(8,2),
      ADD COLUMN IF NOT EXISTS dimensions TEXT,
      ADD COLUMN IF NOT EXISTS color TEXT,
      ADD COLUMN IF NOT EXISTS material TEXT;
    `
    
    const { error: alterError } = await supabase.rpc('execute_sql', { sql: alterTableSQL })
    
    if (alterError) {
      console.log('Note: Column addition via RPC not available, columns may already exist or need manual addition')
      console.log('Error:', alterError)
    } else {
      console.log('✅ Added missing columns')
    }

    // Now let's add simplified test products without the extra columns first
    console.log('📦 Adding test products...')
    const { data: products, error: productsError } = await supabase
      .from('products')
      .insert([
        {
          name: 'Rose Gold Rhinestone Mixed Set',
          description: 'Premium mixed size rhinestones for nail art. Contains 1440 pieces in various sizes (SS6-SS16)',
          price: 45.00,
          cost: 18.50,
          customs_cost: 4.25,
          inventory_quantity: 17
        },
        {
          name: 'Crystal AB Flatback Rhinestones',
          description: 'High quality Austrian-style crystal AB flatback rhinestones, 1440 pieces',
          price: 38.00,
          cost: 15.20,
          customs_cost: 3.50,
          inventory_quantity: 27
        },
        {
          name: 'Professional Rhinestone Picker Tool',
          description: 'Dual-ended picker tool with wax tip and dotting end. Essential for rhinestone application',
          price: 28.00,
          cost: 11.20,
          customs_cost: 2.60,
          inventory_quantity: 31
        },
        {
          name: 'Gold 3D Nail Charms Set',
          description: 'Assorted 3D metal charms for nail decoration. 50 pieces mixed designs',
          price: 32.00,
          cost: 12.80,
          customs_cost: 2.95,
          inventory_quantity: 37
        },
        {
          name: '36W UV LED Nail Lamp',
          description: 'Dual light source nail curing lamp. Works with gel polish and extensions',
          price: 125.00,
          cost: 50.00,
          customs_cost: 11.50,
          inventory_quantity: 14
        },
        {
          name: 'Nail Art Brush Set 15pc',
          description: 'Professional nail art brushes including liner, detailing, and flat brushes',
          price: 52.00,
          cost: 20.80,
          customs_cost: 4.80,
          inventory_quantity: 19
        }
      ])
      .select()

    if (productsError) {
      console.error('Error adding products:', productsError)
      return
    }

    console.log(`✅ Added ${products.length} products`)

    // Add test orders
    console.log('📋 Adding test orders...')
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .insert([
        {
          customer_name: 'Sarah Johnson',
          customer_phone: '868-123-4567',
          customer_address: 'Chaguanas, Trinidad',
          total_amount: 73.00,
          created_at: new Date(Date.now() - 65 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          customer_name: 'Michelle Rodriguez',
          customer_phone: '868-234-5678',
          customer_address: 'San Fernando, Trinidad',
          total_amount: 70.00,
          created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          customer_name: 'Sarah Johnson',
          customer_phone: '868-123-4567',
          customer_address: 'Chaguanas, Trinidad',
          total_amount: 167.00,
          created_at: new Date(Date.now() - 49 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          customer_name: 'Keisha Williams',
          customer_phone: '868-345-6789',
          customer_address: 'Port of Spain, Trinidad',
          total_amount: 125.00,
          created_at: new Date(Date.now() - 42 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          customer_name: 'Priya Sharma',
          customer_phone: '868-567-8901',
          customer_address: 'Couva, Trinidad',
          total_amount: 77.00,
          created_at: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          customer_name: 'Sarah Johnson',
          customer_phone: '868-123-4567',
          customer_address: 'Chaguanas, Trinidad',
          total_amount: 83.00,
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          customer_name: 'Alicia Mohammed',
          customer_phone: '868-456-7890',
          customer_address: 'Arima, Trinidad',
          total_amount: 118.00,
          created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        }
      ])
      .select()

    if (ordersError) {
      console.error('Error adding orders:', ordersError)
      return
    }

    console.log(`✅ Added ${orders.length} orders`)

    // Get product IDs for order items
    const rhinestoneProduct = products.find(p => p.name.includes('Rose Gold Rhinestone'))
    const crystalProduct = products.find(p => p.name.includes('Crystal AB'))
    const pickerProduct = products.find(p => p.name.includes('Picker Tool'))
    const charmsProduct = products.find(p => p.name.includes('3D Nail Charms'))
    const lampProduct = products.find(p => p.name.includes('UV LED'))
    const brushProduct = products.find(p => p.name.includes('Brush Set'))

    // Add order items
    console.log('🛒 Adding order items...')
    const orderItems = [
      // Order 1: Rhinestone set + picker
      { order_id: orders[0].id, product_id: rhinestoneProduct.id, quantity: 1, unit_price: 45.00 },
      { order_id: orders[0].id, product_id: pickerProduct.id, quantity: 1, unit_price: 28.00 },
      
      // Order 2: Crystal + charms
      { order_id: orders[1].id, product_id: crystalProduct.id, quantity: 1, unit_price: 38.00 },
      { order_id: orders[1].id, product_id: charmsProduct.id, quantity: 1, unit_price: 32.00 },
      
      // Order 3: Big rhinestone order + brushes
      { order_id: orders[2].id, product_id: rhinestoneProduct.id, quantity: 2, unit_price: 45.00 },
      { order_id: orders[2].id, product_id: brushProduct.id, quantity: 1, unit_price: 52.00 },
      { order_id: orders[2].id, product_id: pickerProduct.id, quantity: 1, unit_price: 28.00 },
      
      // Order 4: UV Lamp
      { order_id: orders[3].id, product_id: lampProduct.id, quantity: 1, unit_price: 125.00 },
      
      // Order 5: Rhinestone + charms
      { order_id: orders[4].id, product_id: rhinestoneProduct.id, quantity: 1, unit_price: 45.00 },
      { order_id: orders[4].id, product_id: charmsProduct.id, quantity: 1, unit_price: 32.00 },
      
      // Order 6: Another rhinestone order
      { order_id: orders[5].id, product_id: rhinestoneProduct.id, quantity: 1, unit_price: 45.00 },
      { order_id: orders[5].id, product_id: crystalProduct.id, quantity: 1, unit_price: 38.00 },
      
      // Order 7: Multiple rhinestone sets
      { order_id: orders[6].id, product_id: rhinestoneProduct.id, quantity: 2, unit_price: 45.00 },
      { order_id: orders[6].id, product_id: pickerProduct.id, quantity: 1, unit_price: 28.00 }
    ]

    const { data: orderItemsData, error: orderItemsError } = await supabase
      .from('order_items')
      .insert(orderItems)
      .select()

    if (orderItemsError) {
      console.error('Error adding order items:', orderItemsError)
      return
    }

    console.log(`✅ Added ${orderItemsData.length} order items`)

    // Update inventory quantities to reflect sales
    console.log('📊 Updating inventory quantities...')
    await supabase.from('products').update({ inventory_quantity: 9 }).eq('id', rhinestoneProduct.id) // 8 units sold
    await supabase.from('products').update({ inventory_quantity: 24 }).eq('id', crystalProduct.id) // 3 units sold
    await supabase.from('products').update({ inventory_quantity: 27 }).eq('id', pickerProduct.id) // 4 units sold
    await supabase.from('products').update({ inventory_quantity: 34 }).eq('id', charmsProduct.id) // 3 units sold
    await supabase.from('products').update({ inventory_quantity: 13 }).eq('id', lampProduct.id) // 1 unit sold
    await supabase.from('products').update({ inventory_quantity: 18 }).eq('id', brushProduct.id) // 1 unit sold

    console.log('✅ Updated inventory quantities')

    // Verify the data
    const { data: salesSummary } = await supabase
      .from('product_sales_summary')
      .select('*')
      .order('total_sold', { ascending: false })
      .limit(5)

    console.log('\n📈 Sales Summary (Top 5):')
    if (salesSummary && salesSummary.length > 0) {
      salesSummary.forEach(product => {
        console.log(`- ${product.name}: ${product.total_sold} sold, $${product.total_revenue} revenue`)
      })
    } else {
      console.log('No sales summary available yet - the view may need time to update')
    }

    console.log('\n🎉 Test data setup complete!')
    console.log('💡 The AI recommendation system now has data to work with!')
    console.log('🔍 Best seller: Rose Gold Rhinestone Mixed Set (8 units sold)')
    console.log('📊 Try generating recommendations now!')

  } catch (error) {
    console.error('❌ Error setting up test data:', error)
  }
}

// Run the script
setupDatabase()