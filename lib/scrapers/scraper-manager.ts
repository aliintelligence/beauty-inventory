import { RealAlibabaScraper } from './real-alibaba-scraper'
import { RealTemuScraper } from './real-temu-scraper'
import { RealSheinScraper } from './real-shein-scraper'
import { AlibabaScraper } from './alibaba-scraper'
import { TemuScraper } from './temu-scraper'
import { SheinScraper } from './shein-scraper'
import { SupplierProduct, ScrapingResult } from './types'

interface ScrapingConfig {
  useRealScrapers: boolean
  maxRetries: number
  concurrentLimit: number
  rateLimitMs: number
  enableFallback: boolean
}

export class ScraperManager {
  private config: ScrapingConfig
  private realScrapers: { [key: string]: any }
  private mockScrapers: { [key: string]: any }

  constructor(config: Partial<ScrapingConfig> = {}) {
    this.config = {
      useRealScrapers: false, // Always use mock scrapers for now to avoid timeouts
      maxRetries: parseInt(process.env.SCRAPER_MAX_RETRIES || '2'),
      concurrentLimit: 2,
      rateLimitMs: parseInt(process.env.SCRAPER_RATE_LIMIT_MS || '1000'),
      enableFallback: true,
      ...config
    }

    // Initialize real scrapers
    this.realScrapers = {
      alibaba: new RealAlibabaScraper(),
      temu: new RealTemuScraper(),
      shein: new RealSheinScraper()
    }

    // Initialize mock scrapers (fallback)
    this.mockScrapers = {
      alibaba: new AlibabaScraper(),
      temu: new TemuScraper(),
      shein: new SheinScraper()
    }

    console.log(`🔧 ScraperManager initialized - Real scrapers: ${this.config.useRealScrapers}`)
  }

  async scrapeAllPlatforms(keywords: string[]): Promise<{
    results: { [platform: string]: ScrapingResult }
    summary: {
      totalProducts: number
      successfulPlatforms: number
      failedPlatforms: number
      totalErrors: string[]
    }
  }> {
    console.log(`🚀 Starting scraping across all platforms for ${keywords.length} keywords`)
    console.log(`🔧 Using ${this.config.useRealScrapers ? 'REAL' : 'MOCK'} scrapers`)

    const results: { [platform: string]: ScrapingResult } = {}
    const errors: string[] = []
    const platforms = ['alibaba', 'temu', 'shein']

    // Scrape platforms with controlled concurrency
    const scrapingPromises = platforms.map(async (platform, index) => {
      // Stagger requests to avoid overwhelming servers
      await this.sleep(index * this.config.rateLimitMs)
      
      try {
        console.log(`🕷️ Starting ${platform} scraping...`)
        const result = await this.scrapePlatform(platform, keywords)
        results[platform] = result
        
        if (!result.success && result.error) {
          errors.push(`${platform}: ${result.error}`)
        }
        
        console.log(`✅ ${platform}: ${result.total_found} products found`)
      } catch (error) {
        const errorMsg = `${platform}: Fatal error - ${error instanceof Error ? error.message : 'Unknown'}`
        errors.push(errorMsg)
        console.error(`❌ ${errorMsg}`)
        
        // Create failed result
        results[platform] = {
          products: [],
          success: false,
          error: errorMsg,
          total_found: 0,
          platform
        }
      }
    })

    await Promise.all(scrapingPromises)

    // Calculate summary
    const allProducts = Object.values(results).flatMap(r => r.products)
    const successfulPlatforms = Object.values(results).filter(r => r.success).length
    const failedPlatforms = platforms.length - successfulPlatforms

    const summary = {
      totalProducts: allProducts.length,
      successfulPlatforms,
      failedPlatforms,
      totalErrors: errors
    }

    console.log(`📊 Scraping completed:`, summary)
    return { results, summary }
  }

  private async scrapePlatform(platform: string, keywords: string[]): Promise<ScrapingResult> {
    const scrapers = this.config.useRealScrapers ? this.realScrapers : this.mockScrapers
    const scraper = scrapers[platform]

    if (!scraper) {
      throw new Error(`No scraper found for platform: ${platform}`)
    }

    let lastError: Error | null = null
    
    // Retry logic
    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        console.log(`🔄 ${platform} scraping attempt ${attempt}/${this.config.maxRetries}`)
        
        // Add timeout protection (8 seconds per attempt)
        const timeoutPromise = new Promise<ScrapingResult>((_, reject) => {
          setTimeout(() => reject(new Error(`${platform} scraping timeout`)), 8000)
        })
        
        const scrapePromise = scraper.scrapeProducts(keywords)
        const result = await Promise.race([scrapePromise, timeoutPromise])
        
        // If we got some products, consider it a success even if there were partial errors
        if (result.products.length > 0) {
          return result
        }
        
        // If no products but no error, it might be a temporary issue
        if (!result.error && attempt < this.config.maxRetries) {
          console.log(`⚠️ ${platform}: No products found, retrying...`)
          await this.sleep(this.config.rateLimitMs * attempt) // Exponential backoff
          continue
        }
        
        return result
        
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        console.error(`❌ ${platform} attempt ${attempt} failed:`, lastError.message)
        
        if (attempt < this.config.maxRetries) {
          // Exponential backoff
          const delay = this.config.rateLimitMs * Math.pow(2, attempt - 1)
          console.log(`⏳ Waiting ${delay}ms before retry...`)
          await this.sleep(delay)
        }
      }
    }

    // All attempts failed - try fallback if enabled
    if (this.config.enableFallback && this.config.useRealScrapers) {
      console.log(`🔄 ${platform}: Falling back to mock scraper...`)
      try {
        const fallbackScraper = this.mockScrapers[platform]
        const fallbackResult = await fallbackScraper.scrapeProducts(keywords)
        
        return {
          ...fallbackResult,
          error: `Real scraper failed (${lastError?.message}), using fallback data`
        }
      } catch (fallbackError) {
        console.error(`❌ ${platform} fallback also failed:`, fallbackError)
      }
    }

    // Complete failure
    return {
      products: [],
      success: false,
      error: lastError?.message || 'All scraping attempts failed',
      total_found: 0,
      platform
    }
  }

  async testScrapers(): Promise<{
    [platform: string]: {
      real: { success: boolean; error?: string; productCount: number }
      mock: { success: boolean; error?: string; productCount: number }
    }
  }> {
    console.log('🧪 Testing all scrapers...')
    
    const testKeywords = ['nail art', 'rhinestone']
    const results: any = {}
    
    for (const platform of ['alibaba', 'temu', 'shein']) {
      results[platform] = {
        real: { success: false, productCount: 0 },
        mock: { success: false, productCount: 0 }
      }
      
      // Test real scraper
      try {
        const realResult = await this.realScrapers[platform].scrapeProducts([testKeywords[0]])
        results[platform].real = {
          success: realResult.success,
          error: realResult.error,
          productCount: realResult.total_found
        }
      } catch (error) {
        results[platform].real = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          productCount: 0
        }
      }
      
      // Test mock scraper
      try {
        const mockResult = await this.mockScrapers[platform].scrapeProducts([testKeywords[1]])
        results[platform].mock = {
          success: mockResult.success,
          error: mockResult.error,
          productCount: mockResult.total_found
        }
      } catch (error) {
        results[platform].mock = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          productCount: 0
        }
      }
      
      // Rate limit between platform tests
      await this.sleep(2000)
    }
    
    console.log('✅ Scraper testing completed')
    return results
  }

  // Get combined products from all platforms with deduplication
  async getRecommendationProducts(keywords: string[]): Promise<SupplierProduct[]> {
    const { results } = await this.scrapeAllPlatforms(keywords)
    
    const allProducts = Object.values(results).flatMap(result => result.products)
    
    // Advanced deduplication based on multiple factors
    return this.deduplicateProducts(allProducts)
  }

  private deduplicateProducts(products: SupplierProduct[]): SupplierProduct[] {
    const seen = new Map<string, SupplierProduct>()
    
    products.forEach(product => {
      // Create a similarity key based on name and price
      const nameKey = product.name.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
      
      const priceRange = Math.floor(product.price / 5) * 5 // Group by $5 ranges
      const key = `${nameKey}_${priceRange}`
      
      // Keep the product with the best rating/platform combination
      const existing = seen.get(key)
      if (!existing || this.compareProducts(product, existing) > 0) {
        seen.set(key, product)
      }
    })
    
    return Array.from(seen.values())
  }

  private compareProducts(a: SupplierProduct, b: SupplierProduct): number {
    // Scoring system for product quality
    let scoreA = 0
    let scoreB = 0
    
    // Platform reliability
    const platformScores = { alibaba: 3, temu: 2, shein: 1 }
    scoreA += platformScores[a.platform] || 0
    scoreB += platformScores[b.platform] || 0
    
    // Supplier rating
    scoreA += (a.supplier_rating || 0) * 2
    scoreB += (b.supplier_rating || 0) * 2
    
    // Price competitiveness (lower is better, but not too low)
    if (a.price > 0.5 && a.price < b.price) scoreA += 1
    if (b.price > 0.5 && b.price < a.price) scoreB += 1
    
    // Has product URL
    if (a.product_url) scoreA += 1
    if (b.product_url) scoreB += 1
    
    // Has images
    if (a.images && a.images.length > 0) scoreA += 1
    if (b.images && b.images.length > 0) scoreB += 1
    
    return scoreA - scoreB
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Configuration methods
  setUseRealScrapers(useReal: boolean): void {
    this.config.useRealScrapers = useReal
    console.log(`🔧 Switched to ${useReal ? 'REAL' : 'MOCK'} scrapers`)
  }

  getConfig(): ScrapingConfig {
    return { ...this.config }
  }
}