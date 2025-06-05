import { SupplierProduct, ScrapingResult } from './types'

export abstract class BaseScraper {
  protected rateLimit: number = 2000 // ms between requests
  protected maxRetries: number = 3
  protected userAgents: string[] = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0'
  ]

  abstract scrapeProducts(keywords: string[]): Promise<ScrapingResult>

  protected async makeRequest(url: string, retries = this.maxRetries): Promise<any> {
    try {
      console.log(`🌐 Scraping: ${url}`)
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': this.getRandomUserAgent(),
          'Accept': 'application/json, text/html, */*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      // Rate limiting
      await this.sleep(this.rateLimit)
      
      const contentType = response.headers.get('content-type')
      if (contentType?.includes('application/json')) {
        return await response.json()
      } else {
        return await response.text()
      }
    } catch (error) {
      console.error(`❌ Request failed for ${url}:`, error)
      
      if (retries > 0) {
        console.log(`🔄 Retrying... (${retries} attempts left)`)
        await this.sleep(5000) // Wait longer before retry
        return this.makeRequest(url, retries - 1)
      }
      throw error
    }
  }

  protected getRandomUserAgent(): string {
    return this.userAgents[Math.floor(Math.random() * this.userAgents.length)]
  }

  protected sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  protected categorizeProduct(title: string, keyword: string): string {
    const titleLower = title.toLowerCase()
    const keywordLower = keyword.toLowerCase()

    if (titleLower.includes('nail') || titleLower.includes('manicure')) {
      if (titleLower.includes('lamp') || titleLower.includes('uv') || titleLower.includes('led')) {
        return 'nail-equipment'
      } else if (titleLower.includes('brush') || titleLower.includes('tool') || titleLower.includes('picker')) {
        return 'nail-tools'
      } else if (titleLower.includes('gel') || titleLower.includes('polish') || titleLower.includes('base')) {
        return 'nail-polish'
      } else {
        return 'nail-accessories'
      }
    }

    if (titleLower.includes('beauty') || titleLower.includes('cosmetic')) {
      return 'beauty-products'
    }

    if (titleLower.includes('rhinestone') || titleLower.includes('crystal') || titleLower.includes('gem')) {
      return 'nail-accessories'
    }

    return 'other'
  }

  protected extractTags(title: string, description?: string): string[] {
    const text = `${title} ${description || ''}`.toLowerCase()
    const tags: string[] = []

    const tagMap = {
      'nail-art': ['nail art', 'nail design', 'manicure'],
      'rhinestones': ['rhinestone', 'crystal', 'gem', 'stone'],
      'tools': ['tool', 'brush', 'picker', 'dotting'],
      'professional': ['professional', 'salon', 'pro'],
      'diy': ['diy', 'home', 'beginner'],
      'uv-lamp': ['uv', 'led', 'lamp', 'light'],
      'gel': ['gel', 'shellac', 'soak-off'],
      'gradient': ['gradient', 'ombre', 'fade'],
      'glitter': ['glitter', 'sparkle', 'shimmer'],
      'stickers': ['sticker', 'decal', 'transfer']
    }

    Object.entries(tagMap).forEach(([tag, keywords]) => {
      if (keywords.some(keyword => text.includes(keyword))) {
        tags.push(tag)
      }
    })

    return tags
  }

  protected cleanPrice(priceStr: string): number {
    // Remove currency symbols and extract number
    const cleaned = priceStr.replace(/[^0-9.,]/g, '')
    const number = parseFloat(cleaned.replace(',', '.'))
    return isNaN(number) ? 0 : number
  }

  protected generateMockProducts(keyword: string, platform: string): SupplierProduct[] {
    // For development/testing - generate realistic mock data
    const mockProducts: SupplierProduct[] = [
      {
        platform: platform as any,
        external_id: `${platform.toUpperCase()}_${Date.now()}_1`,
        name: `Professional ${keyword} Tool Set`,
        description: `High-quality ${keyword} tools for professional nail art`,
        price: Math.random() * 20 + 5,
        original_currency: 'USD',
        supplier_name: `${platform} Beauty Supplies`,
        supplier_rating: 3.5 + Math.random() * 1.5,
        shipping_cost: Math.random() * 5 + 2,
        minimum_order_quantity: Math.floor(Math.random() * 50) + 10,
        category: this.categorizeProduct(`${keyword} tool`, keyword),
        tags: this.extractTags(`${keyword} professional tool`),
        product_url: `https://${platform}.com/mock-product-${Date.now()}`
      },
      {
        platform: platform as any,
        external_id: `${platform.toUpperCase()}_${Date.now()}_2`,
        name: `${keyword} Starter Kit`,
        description: `Complete starter kit for ${keyword} beginners`,
        price: Math.random() * 15 + 3,
        original_currency: 'USD',
        supplier_name: `${platform} Starter Co`,
        supplier_rating: 3.0 + Math.random() * 2,
        shipping_cost: Math.random() * 3 + 1,
        minimum_order_quantity: Math.floor(Math.random() * 30) + 5,
        category: this.categorizeProduct(`${keyword} kit`, keyword),
        tags: this.extractTags(`${keyword} starter beginner kit`),
        product_url: `https://${platform}.com/mock-starter-${Date.now()}`
      }
    ]

    return mockProducts
  }
}