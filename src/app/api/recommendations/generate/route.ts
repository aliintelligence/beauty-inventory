import { NextRequest, NextResponse } from 'next/server'
import { RecommendationEngine } from '../../../../../lib/recommendation-engine'

export const runtime = 'nodejs'
export const maxDuration = 60 // 60 seconds max for Pro plan

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Starting recommendation generation API...')
    
    // Get request body to check for options
    const body = await request.json().catch(() => ({}))
    const useCache = body.useCache !== false // Default to using cache
    const limit = body.limit || 3 // Limit products to scrape
    
    const engine = new RecommendationEngine()
    
    // If using cache, try to get existing recommendations first
    if (useCache) {
      console.log('📦 Checking for existing recommendations...')
      const existing = await engine.getExistingRecommendations(20)
      if (existing.length > 0) {
        console.log(`✅ Found ${existing.length} cached recommendations`)
        return NextResponse.json({
          success: true,
          count: existing.length,
          message: `Found ${existing.length} existing recommendations`,
          recommendations: existing.slice(0, 10),
          fromCache: true
        })
      }
    }
    
    // Generate new recommendations with timeout protection
    console.log(`🔄 Generating new recommendations (limit: ${limit})...`)
    
    // Create a timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Generation timeout - please try again')), 55000) // 55 seconds
    })
    
    // Race between generation and timeout
    const recommendations = await Promise.race([
      engine.generateRecommendations({ limit }),
      timeoutPromise
    ]) as any[]
    
    console.log(`✅ API: Generated ${recommendations.length} recommendations`)
    
    return NextResponse.json({
      success: true,
      count: recommendations.length,
      message: `Successfully generated ${recommendations.length} recommendations`,
      recommendations: recommendations.slice(0, 10),
      fromCache: false
    })
    
  } catch (error) {
    console.error('❌ Recommendation generation API error:', error)
    
    // Check if it's a timeout error
    if (error instanceof Error && error.message.includes('timeout')) {
      return NextResponse.json({
        success: false,
        error: 'Generation timed out',
        details: 'The process took too long. Try using cached recommendations or generating fewer items.',
        suggestion: 'Use the "View Existing" button to see previously generated recommendations'
      }, { status: 504 })
    }
    
    return NextResponse.json({
      success: false,
      error: 'Failed to generate recommendations',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Also allow GET for testing
export async function GET(_request: NextRequest) {
  return NextResponse.json({
    message: 'Use POST method to generate recommendations',
    endpoint: '/api/recommendations/generate',
    method: 'POST',
    options: {
      useCache: 'boolean (default: true) - Use cached recommendations if available',
      limit: 'number (default: 10) - Limit number of products to analyze'
    }
  })
}