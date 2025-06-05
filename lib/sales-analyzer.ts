import { supabase } from './supabase'

interface BestSellerProduct {
  id: string
  name: string
  price: number
  cost: number
  customs_cost: number
  total_sold: number
  total_revenue: number
  profit: number
  performance_score: number
  category?: string
  description?: string
}

export class SalesAnalyzer {
  async getBestSellingProducts(timeframe: 'week' | 'month' | 'quarter' = 'month'): Promise<BestSellerProduct[]> {
    console.log(`📊 Analyzing best-selling products for timeframe: ${timeframe}`)
    
    try {
      // Get sales data from the existing view
      const { data, error } = await supabase
        .from('product_sales_summary')
        .select('*')
        .order('total_sold', { ascending: false })
        .limit(20)
      
      if (error) throw error
      
      const bestSellers = (data || []).map(product => ({
        ...product,
        performance_score: this.calculatePerformanceScore(product),
        category: this.inferCategory(product.name)
      }))
      
      console.log(`✅ Found ${bestSellers.length} best-selling products`)
      return bestSellers
      
    } catch (error) {
      console.error('❌ Error fetching best sellers:', error)
      return []
    }
  }

  async extractKeywords(bestSellers: BestSellerProduct[]): Promise<string[]> {
    console.log('🔍 Extracting keywords from best-selling products')
    
    const keywordMap = new Map<string, number>()
    
    bestSellers.forEach(product => {
      // Extract keywords from product name
      const nameKeywords = this.extractKeywordsFromText(product.name)
      
      // Weight keywords by product performance
      nameKeywords.forEach(keyword => {
        const currentScore = keywordMap.get(keyword) || 0
        keywordMap.set(keyword, currentScore + product.performance_score)
      })
      
      // Add category-specific keywords
      const categoryKeywords = this.getCategoryKeywords(product.category)
      categoryKeywords.forEach(keyword => {
        const currentScore = keywordMap.get(keyword) || 0
        keywordMap.set(keyword, currentScore + (product.performance_score * 0.5))
      })
    })
    
    // Sort keywords by weighted score and return top ones
    const sortedKeywords = Array.from(keywordMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([keyword]) => keyword)
      .slice(0, 15) // Limit to prevent API overload
    
    console.log(`✅ Extracted ${sortedKeywords.length} keywords:`, sortedKeywords)
    return sortedKeywords
  }

  async getTrendingCategories(): Promise<Array<{category: string, growth: number}>> {
    // Analyze which categories are growing
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          created_at,
          order_items (
            products (
              name,
              category
            )
          )
        `)
        .gte('created_at', new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()) // Last 60 days
      
      if (error) throw error
      
      // Analyze category trends
      const categoryTrends = this.analyzeCategoryTrends(data || [])
      return categoryTrends
      
    } catch (error) {
      console.error('❌ Error analyzing trends:', error)
      return []
    }
  }

  private calculatePerformanceScore(product: any): number {
    // Weighted score considering multiple factors
    const maxSold = 100 // Normalize against this
    const volumeScore = Math.min(product.total_sold / maxSold, 1) * 0.4
    
    const marginScore = product.total_revenue > 0 ? 
      (product.profit / product.total_revenue) * 0.4 : 0
    
    // Recency bonus (products sold recently get higher scores)
    const recencyScore = 0.2 // Would calculate based on recent sales
    
    return volumeScore + marginScore + recencyScore
  }

  private inferCategory(productName: string): string {
    const name = productName.toLowerCase()
    
    if (name.includes('rhinestone') || name.includes('crystal') || name.includes('gem')) {
      return 'nail-accessories'
    }
    if (name.includes('brush') || name.includes('tool') || name.includes('picker')) {
      return 'nail-tools'
    }
    if (name.includes('lamp') || name.includes('uv') || name.includes('led')) {
      return 'nail-equipment'
    }
    if (name.includes('gel') || name.includes('polish') || name.includes('base')) {
      return 'nail-polish'
    }
    if (name.includes('tip') || name.includes('form') || name.includes('extension')) {
      return 'nail-extensions'
    }
    
    return 'nail-accessories' // Default category
  }

  private extractKeywordsFromText(text: string): string[] {
    const stopWords = new Set([
      'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 
      'by', 'is', 'are', 'was', 'were', 'a', 'an', 'beauty', 'product'
    ])
    
    const keywords = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word))
      .filter(word => !word.match(/^\d+$/))
    
    // Add composite keywords
    const compositeKeywords = []
    if (text.toLowerCase().includes('nail art')) compositeKeywords.push('nail art')
    if (text.toLowerCase().includes('gel polish')) compositeKeywords.push('gel polish')
    if (text.toLowerCase().includes('uv lamp')) compositeKeywords.push('uv lamp')
    
    return [...new Set([...keywords, ...compositeKeywords])]
  }

  private getCategoryKeywords(category?: string): string[] {
    if (!category) return ['nail', 'beauty']
    
    const categoryKeywordMap: Record<string, string[]> = {
      'nail-accessories': ['nail', 'decoration', 'rhinestone', 'crystal', 'gem', 'sticker'],
      'nail-tools': ['tool', 'brush', 'picker', 'dotting', 'cuticle', 'file'],
      'nail-equipment': ['lamp', 'uv', 'led', 'drill', 'vacuum', 'fan'],
      'nail-polish': ['polish', 'gel', 'base', 'top', 'color', 'lacquer'],
      'nail-extensions': ['tip', 'form', 'extension', 'builder', 'overlay']
    }
    
    const keywords = categoryKeywordMap[category]
    return keywords || ['nail', 'beauty']
  }

  private analyzeCategoryTrends(orders: any[]): Array<{category: string, growth: number}> {
    // Simplified trend analysis
    const categoryTrends = new Map<string, number>()
    
    orders.forEach(order => {
      order.order_items?.forEach((item: any) => {
        const category = this.inferCategory(item.products?.name || '')
        const current = categoryTrends.get(category) || 0
        categoryTrends.set(category, current + 1)
      })
    })
    
    return Array.from(categoryTrends.entries())
      .map(([category, count]) => ({
        category,
        growth: count // Simplified - would calculate actual growth rate
      }))
      .sort((a, b) => b.growth - a.growth)
  }

  // Get insights about product performance
  async getProductInsights(): Promise<{
    topPerformers: BestSellerProduct[]
    underPerformers: BestSellerProduct[]
    opportunities: string[]
  }> {
    const bestSellers = await this.getBestSellingProducts()
    
    const topPerformers = bestSellers
      .filter(p => p.performance_score > 0.7)
      .slice(0, 5)
    
    const underPerformers = bestSellers
      .filter(p => p.performance_score < 0.3 && p.total_sold > 0)
      .slice(0, 5)
    
    const opportunities = [
      'Consider products similar to your top rhinestone tools',
      'Expand nail lamp selection based on UV lamp success',
      'Explore gel polish alternatives for higher margins',
      'Look into trending TikTok nail art supplies'
    ]
    
    return {
      topPerformers,
      underPerformers,
      opportunities
    }
  }
}