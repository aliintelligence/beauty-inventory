import { NextRequest, NextResponse } from 'next/server'
import { RecommendationEngine } from '../../../../lib/recommendation-engine'
import { SalesAnalyzer } from '../../../../lib/sales-analyzer'
import { ScraperManager } from '../../../../lib/scrapers/scraper-manager'
import { SimilarityEngine } from '../../../../lib/similarity-engine'
import { TrinidadCostCalculator } from '../../../../lib/trinidad-cost-calculator'

export async function GET(_request: NextRequest) {
  try {
    console.log('🧪 Deep debug of recommendation generation...')
    
    const debug: any = {
      steps: []
    }
    
    // Step 1: Get best sellers
    const salesAnalyzer = new SalesAnalyzer()
    const bestSellers = await salesAnalyzer.getBestSellingProducts()
    const topSeller = bestSellers[0]
    
    debug.steps.push({
      step: 'Best Sellers',
      found: bestSellers.length,
      topSeller: topSeller ? {
        name: topSeller.name,
        price: topSeller.price,
        totalSold: topSeller.total_sold
      } : null
    })
    
    // Step 2: Get keywords
    const keywords = await salesAnalyzer.extractKeywords(bestSellers.slice(0, 2))
    debug.steps.push({
      step: 'Keywords',
      count: keywords.length,
      keywords: keywords.slice(0, 5)
    })
    
    // Step 3: Scrape products
    const scraperManager = new ScraperManager({ useRealScrapers: false })
    const supplierProducts = await scraperManager.getRecommendationProducts(keywords.slice(0, 3))
    debug.steps.push({
      step: 'Scraping',
      productsFound: supplierProducts.length,
      samples: supplierProducts.slice(0, 2).map(p => ({
        name: p.name,
        price: p.price,
        platform: p.platform
      }))
    })
    
    // Step 4: Test similarity matching
    if (topSeller && supplierProducts.length > 0) {
      const similarityEngine = new SimilarityEngine()
      const similarProducts = await similarityEngine.findSimilarProducts(topSeller, supplierProducts)
      
      debug.steps.push({
        step: 'Similarity Matching',
        totalMatches: similarProducts.length,
        topMatches: similarProducts.slice(0, 3).map(m => ({
          productName: m.supplier_product.name,
          similarityScore: m.similarity_score,
          confidence: m.confidence,
          matchingFactors: m.matching_factors
        }))
      })
      
      // Step 5: Test cost calculation
      if (similarProducts.length > 0) {
        const costCalculator = new TrinidadCostCalculator()
        const testProduct = similarProducts[0].supplier_product
        const costBreakdown = await costCalculator.calculateLandedCost(testProduct)
        
        debug.steps.push({
          step: 'Cost Calculation',
          product: testProduct.name,
          originalPrice: testProduct.price,
          landedCostTTD: costBreakdown.total_landed_cost_ttd,
          exchangeRate: costBreakdown.exchange_rate
        })
        
        // Step 6: Test profitability
        const profitAnalysis = costCalculator.calculateProfitability(
          costBreakdown.total_landed_cost_ttd,
          topSeller.price,
          Math.floor(topSeller.total_sold * 0.5),
          topSeller
        )
        
        debug.steps.push({
          step: 'Profitability Analysis',
          sellingPrice: topSeller.price,
          landedCost: costBreakdown.total_landed_cost_ttd,
          profitPerUnit: profitAnalysis.profit_per_unit_ttd,
          marginPercent: profitAnalysis.margin_percent,
          meetsThreshold: profitAnalysis.margin_percent > 25
        })
      }
    }
    
    // Step 7: Try full generation with lower threshold
    const engine = new RecommendationEngine()
    engine.setUseRealScrapers(false)
    
    // Temporarily modify the engine to use a lower threshold
    const recommendations = await engine.generateRecommendations({ limit: 2 })
    
    debug.steps.push({
      step: 'Full Generation',
      recommendationsGenerated: recommendations.length,
      recommendations: recommendations.slice(0, 2).map(r => ({
        supplierProduct: r.supplier_product.name,
        basedOn: r.based_on_product.name,
        similarity: r.similarity_score,
        confidence: r.confidence_score,
        marginPercent: r.profit_analysis.margin_percent
      }))
    })
    
    return NextResponse.json({
      success: true,
      debug,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Debug error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}