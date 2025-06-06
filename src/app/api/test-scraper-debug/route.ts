import { NextRequest, NextResponse } from 'next/server'
import { ScraperManager } from '../../../../lib/scrapers/scraper-manager'
import { AlibabaScraper } from '../../../../lib/scrapers/alibaba-scraper'
import { RecommendationEngine } from '../../../../lib/recommendation-engine'
import { SalesAnalyzer } from '../../../../lib/sales-analyzer'

export async function GET(_request: NextRequest) {
  try {
    console.log('🧪 Debug: Testing recommendation system components...')
    
    const debug: any = {}
    
    // 1. Test sales analyzer
    console.log('1️⃣ Testing SalesAnalyzer...')
    const salesAnalyzer = new SalesAnalyzer()
    const bestSellers = await salesAnalyzer.getBestSellingProducts()
    debug.salesAnalyzer = {
      bestSellersCount: bestSellers.length,
      topProduct: bestSellers[0]?.name || 'None',
      topProductSold: bestSellers[0]?.total_sold || 0
    }
    
    // 2. Extract keywords
    console.log('2️⃣ Testing keyword extraction...')
    const keywords = await salesAnalyzer.extractKeywords(bestSellers.slice(0, 2))
    debug.keywords = {
      count: keywords.length,
      sample: keywords.slice(0, 5)
    }
    
    // 3. Test scraper directly
    console.log('3️⃣ Testing AlibabaScraper directly...')
    const alibabaScraper = new AlibabaScraper()
    const alibabaResult = await alibabaScraper.scrapeProducts(['rhinestone'])
    debug.directScraper = {
      success: alibabaResult.success,
      found: alibabaResult.total_found,
      products: alibabaResult.products.slice(0, 2).map(p => ({
        name: p.name,
        price: p.price
      }))
    }
    
    // 4. Test ScraperManager
    console.log('4️⃣ Testing ScraperManager...')
    const scraperManager = new ScraperManager({ useRealScrapers: false })
    const products = await scraperManager.getRecommendationProducts(['rhinestone'])
    debug.scraperManager = {
      totalProducts: products.length,
      platforms: [...new Set(products.map(p => p.platform))],
      sample: products.slice(0, 2).map(p => ({
        name: p.name,
        price: p.price,
        platform: p.platform
      }))
    }
    
    // 5. Test full recommendation flow with minimal data
    console.log('5️⃣ Testing minimal recommendation generation...')
    const engine = new RecommendationEngine()
    engine.setUseRealScrapers(false) // Ensure using mock scrapers
    
    // Try with just one keyword
    const scraperManagerTest = new ScraperManager({ useRealScrapers: false })
    const testProducts = await scraperManagerTest.getRecommendationProducts(['nail rhinestone'])
    debug.recommendationTest = {
      scraperProducts: testProducts.length,
      platforms: [...new Set(testProducts.map(p => p.platform))]
    }
    
    return NextResponse.json({
      success: true,
      message: 'Debug information collected',
      debug,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Debug error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Debug failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}