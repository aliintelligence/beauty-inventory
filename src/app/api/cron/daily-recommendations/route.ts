import { NextRequest, NextResponse } from 'next/server'
import { RecommendationEngine } from '../../../../../lib/recommendation-engine'
import { supabase } from '../../../../../lib/supabase'

export async function GET(request: NextRequest) {
  console.log('🕐 Starting daily recommendation update cron job...')
  
  try {
    // Verify this is a legitimate cron request (in production, add auth header verification)
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.includes('Bearer')) {
      console.log('⚠️ Unauthorized cron request')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const startTime = Date.now()
    
    // Step 1: Clean old recommendations (older than 30 days)
    console.log('🧹 Cleaning old recommendations...')
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    
    const { error: cleanupError } = await supabase
      .from('product_recommendations')
      .delete()
      .lt('created_at', thirtyDaysAgo)
    
    if (cleanupError) {
      console.error('❌ Error cleaning old recommendations:', cleanupError)
    } else {
      console.log('✅ Old recommendations cleaned')
    }
    
    // Step 2: Clean old supplier products (older than 7 days to keep data fresh)
    console.log('🧹 Cleaning old supplier products...')
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    
    const { error: supplierCleanupError } = await supabase
      .from('supplier_products')
      .delete()
      .lt('scraped_at', sevenDaysAgo)
    
    if (supplierCleanupError) {
      console.error('❌ Error cleaning old supplier products:', supplierCleanupError)
    } else {
      console.log('✅ Old supplier products cleaned')
    }
    
    // Step 3: Generate fresh recommendations
    console.log('🚀 Generating fresh recommendations...')
    const engine = new RecommendationEngine()
    const recommendations = await engine.generateRecommendations()
    
    const executionTime = (Date.now() - startTime) / 1000
    
    // Step 4: Get statistics for the report
    const { data: statsData } = await supabase
      .from('product_recommendations')
      .select('confidence_score, potential_margin_percent')
      .gte('created_at', new Date().toISOString().split('T')[0]) // Today's recommendations
    
    const highConfidenceCount = (statsData || []).filter(r => r.confidence_score >= 0.8).length
    const avgMargin = statsData && statsData.length > 0 
      ? (statsData.reduce((sum, r) => sum + r.potential_margin_percent, 0) / statsData.length).toFixed(1)
      : '0'
    
    // Step 5: Log the results
    const summary = {
      timestamp: new Date().toISOString(),
      totalRecommendations: recommendations.length,
      highConfidenceRecommendations: highConfidenceCount,
      averageMargin: avgMargin,
      executionTimeSeconds: executionTime.toFixed(2),
      status: 'completed'
    }
    
    console.log('📊 Daily update summary:', summary)
    
    // Step 6: Send notification if there are high-confidence recommendations
    if (highConfidenceCount > 0) {
      console.log(`🎯 Found ${highConfidenceCount} high-confidence recommendations`)
      // In production, you would send an email notification here
      await sendNotificationEmail(recommendations.slice(0, 5), summary)
    }
    
    console.log('✅ Daily recommendation update completed successfully')
    
    return NextResponse.json({
      success: true,
      message: 'Daily recommendation update completed',
      summary
    })
    
  } catch (error) {
    console.error('❌ Daily recommendation update failed:', error)
    
    const errorSummary = {
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 'failed'
    }
    
    return NextResponse.json({
      success: false,
      message: 'Daily recommendation update failed',
      error: errorSummary
    }, { status: 500 })
  }
}

async function sendNotificationEmail(topRecommendations: any[], summary: any) {
  // Mock email notification - in production, integrate with Resend, SendGrid, etc.
  console.log('📧 Sending notification email...')
  
  const emailContent = {
    to: 'admin@gurlaesthetic.com',
    subject: `🎯 ${summary.highConfidenceRecommendations} New High-Confidence Product Opportunities`,
    summary: summary,
    topRecommendations: topRecommendations.map(rec => ({
      name: rec.supplier_product.name,
      platform: rec.supplier_product.platform,
      margin: rec.profit_analysis.margin_percent.toFixed(0) + '%',
      confidence: (rec.confidence_score * 100).toFixed(0) + '%',
      reason: rec.recommendation_reason
    }))
  }
  
  // Log the email content (in production, actually send the email)
  console.log('📧 Email notification prepared:', {
    subject: emailContent.subject,
    recommendationCount: emailContent.topRecommendations.length,
    avgMargin: summary.averageMargin + '%'
  })
  
  // TODO: Integrate with actual email service
  /*
  await sendEmail({
    to: emailContent.to,
    subject: emailContent.subject,
    html: generateEmailHTML(emailContent)
  })
  */
  
  console.log('✅ Notification email prepared (not sent in demo)')
}

// Manual trigger endpoint for testing
export async function POST(request: NextRequest) {
  console.log('🔧 Manual trigger for daily recommendations...')
  
  try {
    // Add basic auth check
    const body = await request.json()
    if (body.trigger !== 'manual') {
      return NextResponse.json({ error: 'Invalid trigger' }, { status: 400 })
    }
    
    // Create a mock request for the GET handler
    const mockRequest = new NextRequest(request.url, {
      headers: {
        'authorization': 'Bearer manual-trigger'
      }
    })
    
    return await GET(mockRequest)
    
  } catch (error) {
    console.error('❌ Manual trigger failed:', error)
    return NextResponse.json({
      success: false,
      error: 'Manual trigger failed'
    }, { status: 500 })
  }
}