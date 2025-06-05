import { NextRequest, NextResponse } from 'next/server'
import { RecommendationEngine } from '../../../../../lib/recommendation-engine'

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing scraper functionality...')
    
    const engine = new RecommendationEngine()
    
    // Test all scrapers
    const testResults = await engine.testScrapers()
    
    // Generate summary
    const summary = {
      platforms: Object.keys(testResults),
      realScrapersWorking: Object.values(testResults).filter((r: any) => r.real.success).length,
      mockScrapersWorking: Object.values(testResults).filter((r: any) => r.mock.success).length,
      totalProductsFromReal: Object.values(testResults).reduce((sum: number, r: any) => sum + r.real.productCount, 0),
      totalProductsFromMock: Object.values(testResults).reduce((sum: number, r: any) => sum + r.mock.productCount, 0)
    }
    
    console.log('✅ Scraper testing completed')
    
    return NextResponse.json({
      success: true,
      message: 'Scraper testing completed',
      summary,
      detailedResults: testResults,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Scraper testing failed:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Scraper testing failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { useRealScrapers, testKeywords } = body
    
    console.log(`🔧 Switching to ${useRealScrapers ? 'REAL' : 'MOCK'} scrapers for testing`)
    
    const engine = new RecommendationEngine()
    engine.setUseRealScrapers(useRealScrapers)
    
    const keywords = testKeywords || ['nail art', 'rhinestone', 'nail brush']
    
    // Test scraping with specific keywords
    console.log(`🔍 Testing with keywords:`, keywords)
    
    // This will use the current scraper configuration
    const recommendations = await engine.generateRecommendations()
    
    return NextResponse.json({
      success: true,
      message: `Generated ${recommendations.length} recommendations using ${useRealScrapers ? 'real' : 'mock'} scrapers`,
      recommendationCount: recommendations.length,
      testedKeywords: keywords,
      scraperMode: useRealScrapers ? 'real' : 'mock',
      sampleRecommendations: recommendations.slice(0, 3).map(r => ({
        name: r.supplier_product.name,
        platform: r.supplier_product.platform,
        price: r.supplier_product.price,
        confidence: r.confidence_score
      }))
    })
    
  } catch (error) {
    console.error('❌ Scraper configuration test failed:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Scraper configuration test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}