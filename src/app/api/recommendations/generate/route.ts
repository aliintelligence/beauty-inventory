import { NextRequest, NextResponse } from 'next/server'
import { RecommendationEngine } from '../../../../../lib/recommendation-engine'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Starting recommendation generation API...')
    
    const engine = new RecommendationEngine()
    const recommendations = await engine.generateRecommendations()
    
    console.log(`✅ API: Generated ${recommendations.length} recommendations`)
    
    return NextResponse.json({
      success: true,
      count: recommendations.length,
      message: `Successfully generated ${recommendations.length} recommendations`,
      recommendations: recommendations.slice(0, 10) // Return first 10 for response size
    })
    
  } catch (error) {
    console.error('❌ Recommendation generation API error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to generate recommendations',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Also allow GET for testing
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Use POST method to generate recommendations',
    endpoint: '/api/recommendations/generate',
    method: 'POST'
  })
}