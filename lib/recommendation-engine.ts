import { SalesAnalyzer } from './sales-analyzer'
import { TrinidadCostCalculator } from './trinidad-cost-calculator'
import { SimilarityEngine } from './similarity-engine'
import { ScraperManager } from './scrapers/scraper-manager'
import { ProductRecommendation, SupplierProduct } from './scrapers/types'
import { supabase } from './supabase'

export class RecommendationEngine {
  private salesAnalyzer = new SalesAnalyzer()
  private costCalculator = new TrinidadCostCalculator()
  private similarityEngine = new SimilarityEngine()
  private scraperManager = new ScraperManager()

  async generateRecommendations(options: { limit?: number } = {}): Promise<ProductRecommendation[]> {
    console.log('🚀 Starting recommendation generation process...')
    const limit = options.limit || 3 // Reduce to 3 products to prevent timeout
    
    try {
      // Step 1: Analyze best-selling products
      console.log('📊 Step 1: Analyzing best-selling products...')
      const bestSellers = await this.salesAnalyzer.getBestSellingProducts()
      
      if (bestSellers.length === 0) {
        console.log('⚠️ No sales data found, using default keywords')
        return await this.generateDefaultRecommendations()
      }
      
      // Limit best sellers to prevent timeout
      const limitedBestSellers = bestSellers.slice(0, Math.min(limit, 2))
      console.log(`📦 Processing top ${limitedBestSellers.length} best sellers`)
      
      // Step 2: Extract keywords from best sellers
      console.log('🔍 Step 2: Extracting keywords...')
      const keywords = await this.salesAnalyzer.extractKeywords(limitedBestSellers)
      
      // Limit keywords to prevent excessive scraping
      const limitedKeywords = keywords.slice(0, Math.min(limit, 5))
      console.log(`🔑 Using ${limitedKeywords.length} keywords for scraping`)
      
      // Step 3: Scrape supplier platforms
      console.log('🌐 Step 3: Scraping supplier platforms...')
      const supplierProducts = await this.scrapeAllPlatforms(limitedKeywords)
      
      // Step 4: Find similar products and calculate recommendations
      console.log('🔄 Step 4: Generating recommendations...')
      const recommendations = await this.processRecommendations(limitedBestSellers, supplierProducts)
      
      // Step 5: Save to database
      console.log('💾 Step 5: Saving recommendations to database...')
      await this.saveRecommendations(recommendations)
      
      console.log(`✅ Generated ${recommendations.length} recommendations successfully`)
      return recommendations
      
    } catch (error) {
      console.error('❌ Error generating recommendations:', error)
      throw error
    }
  }

  private async scrapeAllPlatforms(keywords: string[]): Promise<SupplierProduct[]> {
    console.log(`🕷️ Using ScraperManager to scrape platforms for ${keywords.length} keywords`)
    
    // Use the ScraperManager for improved scraping
    const supplierProducts = await this.scraperManager.getRecommendationProducts(keywords)
    
    // Save to database
    await this.saveSupplierProducts(supplierProducts)
    
    console.log(`✅ Total unique products scraped: ${supplierProducts.length}`)
    return supplierProducts
  }

  private async processRecommendations(
    bestSellers: any[], 
    supplierProducts: SupplierProduct[]
  ): Promise<ProductRecommendation[]> {
    const recommendations: ProductRecommendation[] = []
    
    // Process top 5 best sellers to avoid overwhelming results
    const topPerformers = bestSellers.slice(0, 5)
    
    for (const bestSeller of topPerformers) {
      console.log(`🔍 Processing recommendations for: ${bestSeller.name}`)
      
      // Find similar products
      const similarProducts = await this.similarityEngine.findSimilarProducts(
        bestSeller, 
        supplierProducts
      )
      
      // Process top 3 matches per product
      const topMatches = similarProducts.slice(0, 3)
      
      for (const match of topMatches) {
        try {
          // Calculate costs for Trinidad
          const costBreakdown = await this.costCalculator.calculateLandedCost(match.supplier_product)
          
          // Estimate demand based on best seller performance
          const expectedVolume = Math.floor(bestSeller.total_sold * 0.5) // Conservative estimate
          
          // Calculate profitability
          const profitAnalysis = this.costCalculator.calculateProfitability(
            costBreakdown.total_landed_cost_ttd,
            bestSeller.price, // Use current selling price as reference
            expectedVolume,
            bestSeller
          )
          
          // Only include profitable recommendations
          if (profitAnalysis.margin_percent > 25) { // Minimum 25% margin
            const recommendation: ProductRecommendation = {
              id: crypto.randomUUID(),
              supplier_product: match.supplier_product,
              based_on_product: bestSeller,
              similarity_score: match.similarity_score,
              cost_breakdown: costBreakdown,
              profit_analysis: profitAnalysis,
              confidence_score: this.calculateOverallConfidence(match, profitAnalysis, bestSeller),
              recommendation_reason: this.generateRecommendationReason(match, profitAnalysis, bestSeller)
            }
            
            recommendations.push(recommendation)
          }
        } catch (error) {
          console.error(`❌ Error processing recommendation for ${match.supplier_product.name}:`, error)
        }
      }
    }
    
    // Sort by confidence score
    return recommendations.sort((a, b) => b.confidence_score - a.confidence_score)
  }

  private calculateOverallConfidence(
    match: any, 
    profitAnalysis: any, 
    bestSeller: any
  ): number {
    let confidence = 0
    
    // Similarity factor (40% weight)
    confidence += match.similarity_score * 0.4
    
    // Profitability factor (30% weight)
    const profitScore = Math.min(profitAnalysis.margin_percent / 100, 1)
    confidence += profitScore * 0.3
    
    // Best seller performance factor (20% weight)
    const performanceScore = Math.min(bestSeller.performance_score || 0.5, 1)
    confidence += performanceScore * 0.2
    
    // Platform/supplier reliability (10% weight)
    const supplierScore = match.supplier_product.supplier_rating ? 
      match.supplier_product.supplier_rating / 5 : 0.5
    confidence += supplierScore * 0.1
    
    return Math.min(confidence, 1.0)
  }

  private generateRecommendationReason(
    match: any, 
    profitAnalysis: any, 
    bestSeller: any
  ): string {
    const reasons = []
    
    // Main similarity reason
    if (match.similarity_score > 0.7) {
      reasons.push(`Very similar to your best-seller "${bestSeller.name}"`)
    } else if (match.similarity_score > 0.5) {
      reasons.push(`Similar to your popular "${bestSeller.name}"`)
    } else {
      reasons.push(`Related to "${bestSeller.name}"`)
    }
    
    // Profit highlight
    if (profitAnalysis.margin_percent > 50) {
      reasons.push(`excellent ${profitAnalysis.margin_percent.toFixed(0)}% profit margin`)
    } else {
      reasons.push(`${profitAnalysis.margin_percent.toFixed(0)}% profit margin`)
    }
    
    // Volume insight
    if (bestSeller.total_sold > 20) {
      reasons.push(`based on ${bestSeller.total_sold} units sold of similar product`)
    }
    
    // Platform benefit
    const platformBenefits: Record<string, string> = {
      'alibaba': 'bulk pricing available',
      'temu': 'fast shipping & trendy styles',
      'shein': 'competitive prices & aesthetic appeal'
    }
    const benefit = platformBenefits[match.supplier_product.platform]
    if (benefit) reasons.push(benefit)
    
    return reasons.join(' • ')
  }

  private async saveSupplierProducts(products: SupplierProduct[]): Promise<void> {
    if (products.length === 0) return
    
    console.log(`💾 Saving ${products.length} supplier products to database...`)
    
    try {
      const { error } = await supabase
        .from('supplier_products')
        .upsert(products.map(product => ({
          platform: product.platform,
          external_id: product.external_id,
          name: product.name,
          description: product.description,
          price: product.price,
          original_currency: product.original_currency,
          supplier_name: product.supplier_name,
          supplier_rating: product.supplier_rating,
          shipping_cost: product.shipping_cost,
          minimum_order_quantity: product.minimum_order_quantity,
          images: product.images,
          category: product.category,
          tags: product.tags,
          product_url: product.product_url
        })), {
          onConflict: 'external_id,platform'
        })
      
      if (error) throw error
      console.log('✅ Supplier products saved successfully')
    } catch (error) {
      console.error('❌ Error saving supplier products:', error)
    }
  }

  private async saveRecommendations(recommendations: ProductRecommendation[]): Promise<void> {
    if (recommendations.length === 0) return
    
    console.log(`💾 Saving ${recommendations.length} recommendations to database...`)
    
    try {
      // First, get supplier product IDs from database
      for (const rec of recommendations) {
        const { data: supplierData } = await supabase
          .from('supplier_products')
          .select('id')
          .eq('external_id', rec.supplier_product.external_id)
          .eq('platform', rec.supplier_product.platform)
          .single()
        
        if (supplierData) {
          // Save recommendation
          const { data: recData, error: recError } = await supabase
            .from('product_recommendations')
            .insert({
              supplier_product_id: supplierData.id,
              based_on_product_id: rec.based_on_product.id,
              similarity_score: rec.similarity_score,
              potential_profit_ttd: rec.profit_analysis.profit_per_unit_ttd,
              potential_margin_percent: rec.profit_analysis.margin_percent,
              confidence_score: rec.confidence_score,
              recommendation_reason: rec.recommendation_reason,
              estimated_demand: Math.floor(rec.based_on_product.total_sold * 0.5),
              break_even_quantity: rec.profit_analysis.break_even_quantity,
              total_landed_cost_ttd: rec.cost_breakdown.total_landed_cost_ttd,
              suggested_retail_price_ttd: rec.profit_analysis.recommended_price_ttd,
              exchange_rate_used: rec.cost_breakdown.exchange_rate
            })
            .select()
            .single()
          
          if (recError) {
            console.error('❌ Error saving recommendation:', recError)
            continue
          }
          
          // Save cost breakdown
          if (recData) {
            await supabase
              .from('cost_breakdowns')
              .insert({
                recommendation_id: recData.id,
                product_cost_usd: rec.cost_breakdown.product_cost_usd,
                product_cost_ttd: rec.cost_breakdown.product_cost_ttd,
                shipping_cost_usd: rec.cost_breakdown.shipping_cost_usd,
                shipping_cost_ttd: rec.cost_breakdown.shipping_cost_ttd,
                customs_duty_ttd: rec.cost_breakdown.customs_duty_ttd,
                vat_ttd: rec.cost_breakdown.vat_ttd,
                total_landed_cost_ttd: rec.cost_breakdown.total_landed_cost_ttd,
                exchange_rate: rec.cost_breakdown.exchange_rate
              })
          }
        }
      }
      
      console.log('✅ Recommendations saved successfully')
    } catch (error) {
      console.error('❌ Error saving recommendations:', error)
    }
  }

  private async generateDefaultRecommendations(): Promise<ProductRecommendation[]> {
    console.log('🔄 Generating default recommendations (no sales data)')
    
    const defaultKeywords = [
      'nail art', 'rhinestone', 'nail brush', 'gel polish', 'uv lamp',
      'nail file', 'cuticle tool', 'nail tips', 'nail stickers'
    ]
    
    const supplierProducts = await this.scrapeAllPlatforms(defaultKeywords)
    
    // Create basic recommendations without similarity matching
    return supplierProducts.slice(0, 10).map(product => {
      const mockBestSeller = { name: 'Default Product', price: 50, total_sold: 10 }
      
      return {
        id: crypto.randomUUID(),
        supplier_product: product,
        based_on_product: mockBestSeller,
        similarity_score: 0.5,
        cost_breakdown: {
          product_cost_usd: product.price,
          product_cost_ttd: product.price * 6.75,
          shipping_cost_usd: product.shipping_cost || 5,
          shipping_cost_ttd: (product.shipping_cost || 5) * 6.75,
          customs_duty_ttd: product.price * 6.75 * 0.15,
          vat_ttd: product.price * 6.75 * 0.125,
          total_landed_cost_ttd: product.price * 6.75 * 1.4,
          exchange_rate: 6.75
        },
        profit_analysis: {
          profit_per_unit_ttd: 20,
          margin_percent: 40,
          estimated_monthly_profit_ttd: 200,
          break_even_quantity: 5,
          recommended_price_ttd: product.price * 6.75 * 2
        },
        confidence_score: 0.6,
        recommendation_reason: 'Popular nail art product with good profit potential'
      }
    })
  }

  // Method to enable/disable real scrapers
  setUseRealScrapers(useReal: boolean): void {
    this.scraperManager.setUseRealScrapers(useReal)
  }

  // Method to test all scrapers
  async testScrapers() {
    return await this.scraperManager.testScrapers()
  }

  // Method to get existing recommendations from database
  async getExistingRecommendations(limit: number = 50): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('recommendation_details')
        .select('*')
        .order('confidence_score', { ascending: false })
        .limit(limit)
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('❌ Error fetching recommendations:', error)
      return []
    }
  }
}