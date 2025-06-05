import { NextRequest, NextResponse } from 'next/server'
import { SalesAnalyzer } from '../../../../../lib/sales-analyzer'

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Fetching product insights...')
    
    const salesAnalyzer = new SalesAnalyzer()
    const insights = await salesAnalyzer.getProductInsights()
    
    // Get trending categories
    const trendingCategories = await salesAnalyzer.getTrendingCategories()
    
    // Calculate summary statistics
    const summary = {
      topPerformersCount: insights.topPerformers.length,
      underPerformersCount: insights.underPerformers.length,
      totalOpportunities: insights.opportunities.length,
      trendingCategoriesCount: trendingCategories.length
    }
    
    console.log('✅ Insights fetched successfully')
    
    return NextResponse.json({
      success: true,
      ...insights,
      trendingCategories,
      summary
    })
    
  } catch (error) {
    console.error('❌ Error fetching insights:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch insights',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}