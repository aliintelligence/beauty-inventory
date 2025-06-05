import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../../../lib/supabase'

export async function GET(_request: NextRequest) {
  try {
    console.log('🧪 Testing recommendation system components...')
    
    const tests = []
    
    // Test 1: Database connection and tables
    try {
      const { error: productsError } = await supabase
        .from('products')
        .select('count')
        .single()
      
      tests.push({
        name: 'Products Table',
        status: productsError ? 'FAIL' : 'PASS',
        details: productsError?.message || 'Connected successfully'
      })
    } catch {
      tests.push({
        name: 'Products Table',
        status: 'FAIL',
        details: 'Connection failed'
      })
    }
    
    // Test 2: Supplier products table
    try {
      const { error: supplierError } = await supabase
        .from('supplier_products')
        .select('count')
        .single()
      
      tests.push({
        name: 'Supplier Products Table',
        status: supplierError ? 'FAIL' : 'PASS',
        details: supplierError?.message || 'Table accessible'
      })
    } catch {
      tests.push({
        name: 'Supplier Products Table',
        status: 'FAIL',
        details: 'Table not accessible'
      })
    }
    
    // Test 3: Recommendations table
    try {
      const { error: recError } = await supabase
        .from('product_recommendations')
        .select('count')
        .single()
      
      tests.push({
        name: 'Recommendations Table',
        status: recError ? 'FAIL' : 'PASS',
        details: recError?.message || 'Table accessible'
      })
    } catch {
      tests.push({
        name: 'Recommendations Table',
        status: 'FAIL',
        details: 'Table not accessible'
      })
    }
    
    // Test 4: Recommendation details view
    try {
      const { data: viewData, error: viewError } = await supabase
        .from('recommendation_details')
        .select('*')
        .limit(1)
      
      tests.push({
        name: 'Recommendation Details View',
        status: viewError ? 'FAIL' : 'PASS',
        details: viewError?.message || `View accessible (${viewData?.length || 0} records)`
      })
    } catch {
      tests.push({
        name: 'Recommendation Details View',
        status: 'FAIL',
        details: 'View not accessible'
      })
    }
    
    // Test 5: Sales summary view
    try {
      const { data: salesData, error: salesError } = await supabase
        .from('product_sales_summary')
        .select('*')
        .limit(1)
      
      tests.push({
        name: 'Sales Summary View',
        status: salesError ? 'FAIL' : 'PASS',
        details: salesError?.message || `View accessible (${salesData?.length || 0} records)`
      })
    } catch {
      tests.push({
        name: 'Sales Summary View',
        status: 'FAIL',
        details: 'View not accessible'
      })
    }
    
    const allPassed = tests.every(test => test.status === 'PASS')
    
    return NextResponse.json({
      success: allPassed,
      message: allPassed ? 'All tests passed!' : 'Some tests failed',
      tests,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Test error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Test execution failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}