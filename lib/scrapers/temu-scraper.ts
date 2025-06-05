import { BaseScraper } from './base-scraper'
import { SupplierProduct, ScrapingResult } from './types'

export class TemuScraper extends BaseScraper {
  async scrapeProducts(keywords: string[]): Promise<ScrapingResult> {
    console.log('🔍 Starting Temu scraping for keywords:', keywords)
    
    const allProducts: SupplierProduct[] = []
    let totalErrors = 0

    for (const keyword of keywords.slice(0, 5)) {
      try {
        console.log(`🔎 Searching Temu for: "${keyword}"`)
        const products = await this.scrapeKeyword(keyword)
        allProducts.push(...products)
        await this.sleep(2500) // Rate limiting
      } catch (error) {
        console.error(`❌ Failed to scrape Temu for "${keyword}":`, error)
        totalErrors++
      }
    }

    const deduplicatedProducts = this.deduplicateProducts(allProducts)

    return {
      products: deduplicatedProducts,
      success: totalErrors < keywords.length,
      error: totalErrors > 0 ? `${totalErrors} keyword searches failed` : undefined,
      total_found: deduplicatedProducts.length,
      platform: 'temu'
    }
  }

  private async scrapeKeyword(keyword: string): Promise<SupplierProduct[]> {
    try {
      const searchUrl = `https://www.temu.com/search_result.html?search_key=${encodeURIComponent(keyword)}`
      console.log(`📡 Mock scraping: ${searchUrl}`)
      
      await this.sleep(800)
      const mockProducts = this.generateTemuProducts(keyword)
      
      console.log(`✅ Found ${mockProducts.length} products for "${keyword}"`)
      return mockProducts
      
    } catch (error) {
      console.error(`❌ Error scraping keyword "${keyword}":`, error)
      return []
    }
  }

  private generateTemuProducts(keyword: string): SupplierProduct[] {
    const products: SupplierProduct[] = []
    const productCount = Math.floor(Math.random() * 4) + 2 // 2-5 products

    const temuStyles = [
      'Cute & Trendy',
      'Kawaii Style',
      'Instagram Worthy',
      'TikTok Viral',
      'Aesthetic Vibes'
    ]

    for (let i = 0; i < productCount; i++) {
      const style = temuStyles[Math.floor(Math.random() * temuStyles.length)]
      
      products.push({
        platform: 'temu',
        external_id: `TEMU_${keyword.replace(/\s+/g, '_')}_${Date.now()}_${i}`,
        name: this.generateTemuProductName(keyword, style),
        description: this.generateTemuDescription(keyword, style),
        price: this.generateTemuPrice(keyword),
        original_currency: 'USD',
        supplier_name: 'Temu Marketplace',
        supplier_rating: 3.2 + Math.random() * 1.8, // 3.2-5.0
        shipping_cost: Math.random() * 3 + 1, // $1-4 (Temu has lower shipping)
        minimum_order_quantity: 1, // Temu typically sells individual units
        images: [`https://temu.com/mock-image-${i}.jpg`],
        category: this.categorizeProduct(keyword, keyword),
        tags: this.extractTags(keyword, `trendy ${keyword} cute aesthetic`),
        product_url: `https://www.temu.com/mock-product-${keyword.replace(/\s+/g, '-')}-${i}.html`
      })
    }

    return products
  }

  private generateTemuProductName(keyword: string, style: string): string {
    const adjectives = ['Adorable', 'Trendy', 'Cute', 'Aesthetic', 'Viral', 'Popular']
    const formats = ['Set', 'Kit', 'Collection', 'Bundle', 'Pack']
    
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)]
    const format = formats[Math.floor(Math.random() * formats.length)]
    
    return `${adj} ${keyword} ${format} - ${style}`
  }

  private generateTemuDescription(keyword: string, style: string): string {
    const descriptions = [
      `${style} ${keyword} perfect for creating stunning nail art designs`,
      `Trendy ${keyword} kit that's taking social media by storm`,
      `Aesthetic ${keyword} collection for the modern nail art enthusiast`,
      `Popular ${keyword} supplies featuring the latest beauty trends`,
      `Cute and functional ${keyword} tools for DIY nail art at home`
    ]
    
    return descriptions[Math.floor(Math.random() * descriptions.length)]
  }

  private generateTemuPrice(keyword: string): number {
    // Temu generally has lower prices than Alibaba
    if (keyword.includes('lamp') || keyword.includes('equipment')) {
      return Math.random() * 20 + 5 // $5-25
    } else if (keyword.includes('tool') || keyword.includes('brush')) {
      return Math.random() * 8 + 1 // $1-9
    } else {
      return Math.random() * 12 + 1 // $1-13
    }
  }

  private deduplicateProducts(products: SupplierProduct[]): SupplierProduct[] {
    const seen = new Set()
    return products.filter(product => {
      const key = `${product.name}_${product.price}`
      if (seen.has(key)) {
        return false
      }
      seen.add(key)
      return true
    })
  }
}