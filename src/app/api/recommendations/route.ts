import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../../lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const minConfidence = parseFloat(searchParams.get('min_confidence') || '0')
    
    // Get recommendations from the detailed view
    const { data, error } = await supabase
      .from('recommendation_details')
      .select('*')
      .gte('confidence_score', minConfidence)
      .order('confidence_score', { ascending: false })
      .limit(limit)
    
    if (error) {
      console.error('Error fetching recommendations:', error)
      return NextResponse.json(
        { error: 'Failed to fetch recommendations' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      count: data?.length || 0,
      recommendations: data || []
    })
    
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}