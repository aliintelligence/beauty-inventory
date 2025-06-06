const { ScraperManager } = require('../lib/scrapers/scraper-manager')
const { AlibabaScraper } = require('../lib/scrapers/alibaba-scraper')

async function testScrapers() {
  console.log('🧪 Testing scrapers directly...')
  
  try {
    // Test the mock Alibaba scraper directly
    console.log('\n1️⃣ Testing AlibabaScraper directly:')
    const alibabaScraper = new AlibabaScraper()
    const alibabaResult = await alibabaScraper.scrapeProducts(['rhinestone', 'nail art'])
    console.log('Result:', {
      success: alibabaResult.success,
      totalFound: alibabaResult.total_found,
      platform: alibabaResult.platform,
      products: alibabaResult.products.slice(0, 2).map(p => ({
        name: p.name,
        price: p.price,
        platform: p.platform
      }))
    })
    
    // Test the ScraperManager
    console.log('\n2️⃣ Testing ScraperManager:')
    const scraperManager = new ScraperManager({ useRealScrapers: false })
    const products = await scraperManager.getRecommendationProducts(['rhinestone', 'nail picker'])
    console.log('ScraperManager results:', {
      totalProducts: products.length,
      platforms: [...new Set(products.map(p => p.platform))],
      samples: products.slice(0, 3).map(p => ({
        name: p.name,
        price: p.price,
        platform: p.platform
      }))
    })
    
    // Test the scrapeAllPlatforms method
    console.log('\n3️⃣ Testing scrapeAllPlatforms:')
    const allPlatforms = await scraperManager.scrapeAllPlatforms(['nail rhinestone'])
    console.log('All platforms result:', {
      summary: allPlatforms.summary,
      platformResults: Object.entries(allPlatforms.results).map(([platform, result]) => ({
        platform,
        success: result.success,
        found: result.total_found
      }))
    })
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testScrapers()