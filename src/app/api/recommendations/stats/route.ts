import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../../../lib/supabase'

export async function GET(_request: NextRequest) {
  try {
    console.log('📈 Fetching recommendation system statistics...')
    
    // Get total counts
    const [
      { count: totalSupplierProducts },
      { count: totalRecommendations },
      { count: highConfidenceRecs },
      { count: recentRecs }
    ] = await Promise.all([
      supabase.from('supplier_products').select('*', { count: 'exact', head: true }),
      supabase.from('product_recommendations').select('*', { count: 'exact', head: true }),
      supabase.from('product_recommendations').select('*', { count: 'exact', head: true }).gte('confidence_score', 0.8),
      supabase.from('product_recommendations').select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    ])
    
    // Get platform distribution
    const { data: platformData } = await supabase
      .from('supplier_products')
      .select('platform')
      .eq('is_active', true)
    
    const platformStats = (platformData || []).reduce((acc, item) => {
      acc[item.platform] = (acc[item.platform] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    // Get top categories
    const { data: categoryData } = await supabase
      .from('supplier_products')
      .select('category')
      .eq('is_active', true)
      .not('category', 'is', null)
    
    const categoryStats = (categoryData || []).reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    // Get confidence score distribution
    const { data: confidenceData } = await supabase
      .from('product_recommendations')
      .select('confidence_score')
    
    const confidenceRanges = {
      'High (80-100%)': 0,
      'Medium (60-79%)': 0,
      'Low (40-59%)': 0,
      'Very Low (0-39%)': 0
    }
    
    ;(confidenceData || []).forEach(item => {
      const score = item.confidence_score * 100
      if (score >= 80) confidenceRanges['High (80-100%)']++
      else if (score >= 60) confidenceRanges['Medium (60-79%)']++
      else if (score >= 40) confidenceRanges['Low (40-59%)']++
      else confidenceRanges['Very Low (0-39%)']++
    })
    
    // Get average metrics
    const { data: avgData } = await supabase
      .from('product_recommendations')
      .select('confidence_score, potential_margin_percent, similarity_score')
    
    const averages = (avgData || []).reduce(
      (acc, item) => ({
        confidence: acc.confidence + (item.confidence_score || 0),
        margin: acc.margin + (item.potential_margin_percent || 0),
        similarity: acc.similarity + (item.similarity_score || 0),
        count: acc.count + 1
      }),
      { confidence: 0, margin: 0, similarity: 0, count: 0 }
    )
    
    const avgStats = averages.count > 0 ? {
      avgConfidence: (averages.confidence / averages.count * 100).toFixed(1),
      avgMargin: (averages.margin / averages.count).toFixed(1),
      avgSimilarity: (averages.similarity / averages.count * 100).toFixed(1)
    } : {
      avgConfidence: '0',
      avgMargin: '0',
      avgSimilarity: '0'
    }
    
    console.log('✅ Statistics compiled successfully')
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      overview: {
        totalSupplierProducts: totalSupplierProducts || 0,
        totalRecommendations: totalRecommendations || 0,
        highConfidenceRecommendations: highConfidenceRecs || 0,
        recentRecommendations: recentRecs || 0
      },
      distribution: {
        platforms: platformStats,
        categories: Object.entries(categoryStats)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 10)
          .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {}),
        confidenceRanges
      },
      averages: avgStats,
      lastUpdated: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Error fetching statistics:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch statistics',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}