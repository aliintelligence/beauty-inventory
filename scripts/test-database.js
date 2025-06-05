const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testDatabase() {
  console.log('🧪 Testing Supabase connection and tables...\n')
  
  const tests = []
  
  // Test 1: Products table
  try {
    const { count, error } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
    
    tests.push({
      name: 'Products table',
      status: error ? '❌ FAIL' : '✅ PASS',
      details: error ? error.message : `${count || 0} products found`
    })
  } catch (e) {
    tests.push({
      name: 'Products table',
      status: '❌ FAIL',
      details: e.message
    })
  }
  
  // Test 2: Supplier products table
  try {
    const { count, error } = await supabase
      .from('supplier_products')
      .select('*', { count: 'exact', head: true })
    
    tests.push({
      name: 'Supplier products table',
      status: error ? '❌ FAIL' : '✅ PASS',
      details: error ? error.message : `${count || 0} supplier products found`
    })
  } catch (e) {
    tests.push({
      name: 'Supplier products table',
      status: '❌ FAIL',
      details: e.message
    })
  }
  
  // Test 3: Recommendations table
  try {
    const { count, error } = await supabase
      .from('product_recommendations')
      .select('*', { count: 'exact', head: true })
    
    tests.push({
      name: 'Recommendations table',
      status: error ? '❌ FAIL' : '✅ PASS',
      details: error ? error.message : `${count || 0} recommendations found`
    })
  } catch (e) {
    tests.push({
      name: 'Recommendations table',
      status: '❌ FAIL',
      details: e.message
    })
  }
  
  // Test 4: Recommendation details view
  try {
    const { data, error } = await supabase
      .from('recommendation_details')
      .select('*')
      .limit(1)
    
    tests.push({
      name: 'Recommendation details view',
      status: error ? '❌ FAIL' : '✅ PASS',
      details: error ? error.message : 'View is accessible'
    })
  } catch (e) {
    tests.push({
      name: 'Recommendation details view',
      status: '❌ FAIL',
      details: e.message
    })
  }
  
  // Test 5: Product sales summary
  try {
    const { data, error } = await supabase
      .from('product_sales_summary')
      .select('*')
      .limit(5)
    
    tests.push({
      name: 'Product sales summary',
      status: error ? '❌ FAIL' : '✅ PASS',
      details: error ? error.message : `${data?.length || 0} best sellers found`
    })
  } catch (e) {
    tests.push({
      name: 'Product sales summary',
      status: '❌ FAIL',
      details: e.message
    })
  }
  
  // Print results
  console.log('📊 Test Results:')
  console.log('================\n')
  
  tests.forEach(test => {
    console.log(`${test.status} ${test.name}`)
    console.log(`   Details: ${test.details}\n`)
  })
  
  const passed = tests.filter(t => t.status.includes('PASS')).length
  const failed = tests.filter(t => t.status.includes('FAIL')).length
  
  console.log('================')
  console.log(`Summary: ${passed} passed, ${failed} failed`)
  
  if (failed === 0) {
    console.log('\n✅ All tests passed! Your database is ready for recommendations.')
  } else {
    console.log('\n⚠️  Some tests failed. Please run the migration SQL in Supabase.')
  }
}

testDatabase().catch(console.error)