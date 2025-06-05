'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Brain, TrendingUp, DollarSign, Package, ArrowLeft, ExternalLink, Zap } from 'lucide-react'
import { formatCurrency } from '../../../lib/currency'
import GUrlAestheticLogo from '../../../components/GUrlAestheticLogo'

interface Recommendation {
  id: string
  supplier_product_name: string
  platform: string
  supplier_name: string
  supplier_price_usd: number
  minimum_order_quantity: number
  product_url: string
  supplier_images: string[]
  based_on_product_name: string
  current_selling_price: number
  similarity_score: number
  potential_profit_ttd: number
  potential_margin_percent: number
  confidence_score: number
  recommendation_reason: string
  total_landed_cost_ttd: number
  suggested_retail_price_ttd: number
  exchange_rate: number
}

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [insights, setInsights] = useState<any>(null)
  const [showOptions, setShowOptions] = useState(false)

  useEffect(() => {
    loadRecommendations()
    loadInsights()
  }, [])

  const loadRecommendations = async () => {
    try {
      const response = await fetch('/api/recommendations')
      const data = await response.json()
      setRecommendations(data.recommendations || [])
    } catch (error) {
      console.error('Error loading recommendations:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadInsights = async () => {
    try {
      const response = await fetch('/api/recommendations/insights')
      const data = await response.json()
      setInsights(data)
    } catch (error) {
      console.error('Error loading insights:', error)
    }
  }

  const generateNewRecommendations = async (useCache = true) => {
    setGenerating(true)
    try {
      const response = await fetch('/api/recommendations/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ useCache, limit: 5 }) // Limit to 5 products for faster generation
      })
      const data = await response.json()
      
      if (data.success) {
        await loadRecommendations()
        if (data.fromCache) {
          alert(`Loaded ${data.count} cached recommendations!`)
        } else {
          alert(`Generated ${data.count} new recommendations!`)
        }
      } else {
        if (response.status === 504) {
          alert('Generation timed out. Try viewing existing recommendations or generate with fewer products.')
        } else {
          alert(data.details || 'Failed to generate recommendations')
        }
      }
    } catch (error) {
      console.error('Error generating recommendations:', error)
      alert('Error generating recommendations. Please try again.')
    } finally {
      setGenerating(false)
    }
  }


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading AI recommendations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/admin" className="text-gray-400 hover:text-gray-600">
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <GUrlAestheticLogo size="sm" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">AI Product Recommendations</h1>
                <p className="text-sm text-gray-500">Smart sourcing powered by your sales data</p>
              </div>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowOptions(!showOptions)}
                disabled={generating}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50"
              >
                {generating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4" />
                    <span>Generate New</span>
                  </>
                )}
              </button>
              
              {showOptions && !generating && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setShowOptions(false)
                        generateNewRecommendations(true)
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <div className="font-medium">Quick Generate (Cached)</div>
                      <div className="text-xs text-gray-500">Use existing data if available</div>
                    </button>
                    <button
                      onClick={() => {
                        setShowOptions(false)
                        generateNewRecommendations(false)
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <div className="font-medium">Fresh Generate</div>
                      <div className="text-xs text-gray-500">Scrape new data (slower)</div>
                    </button>
                    <hr className="my-1" />
                    <button
                      onClick={() => {
                        setShowOptions(false)
                        loadRecommendations()
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <div className="font-medium">View Existing Only</div>
                      <div className="text-xs text-gray-500">Show saved recommendations</div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Insights Section */}
        {insights && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Top Performers</p>
                  <p className="text-2xl font-bold text-gray-900">{insights.topPerformers?.length || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Avg. Margin</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {recommendations.length > 0 
                      ? Math.round(recommendations.reduce((acc, r) => acc + r.potential_margin_percent, 0) / recommendations.length) 
                      : 0}%
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Recommendations</p>
                  <p className="text-2xl font-bold text-gray-900">{recommendations.length}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recommendations Grid */}
        {recommendations.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow p-8 max-w-md mx-auto">
              <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No recommendations yet</h3>
              <p className="text-gray-500 mb-4">
                Generate AI-powered product recommendations based on your best-selling items
              </p>
              <button
                onClick={() => generateNewRecommendations()}
                disabled={generating}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {generating ? 'Generating...' : 'Generate Recommendations'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {recommendations.map((rec) => (
              <RecommendationCard key={rec.id} recommendation={rec} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function RecommendationCard({ recommendation }: { recommendation: Recommendation }) {
  const platformColor = {
    'alibaba': 'bg-orange-100 text-orange-800 border-orange-200',
    'temu': 'bg-blue-100 text-blue-800 border-blue-200',
    'shein': 'bg-purple-100 text-purple-800 border-purple-200'
  }[recommendation.platform] || 'bg-gray-100 text-gray-800 border-gray-200'

  const confidenceColor = recommendation.confidence_score >= 0.8 
    ? 'text-green-600' 
    : recommendation.confidence_score >= 0.6 
    ? 'text-yellow-600' 
    : 'text-red-600'

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden border-l-4 border-purple-500">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                {recommendation.supplier_product_name}
              </h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${platformColor}`}>
                {recommendation.platform.toUpperCase()}
              </span>
            </div>
            
            <p className="text-sm text-gray-600 mb-3">
              from {recommendation.supplier_name}
            </p>

            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                {recommendation.potential_margin_percent.toFixed(0)}% profit
              </span>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                {(recommendation.similarity_score * 100).toFixed(0)}% similar
              </span>
              <span className={`font-medium ${confidenceColor}`}>
                <Zap className="h-3 w-3 inline mr-1" />
                {(recommendation.confidence_score * 100).toFixed(0)}% confidence
              </span>
            </div>
          </div>

          <div className="text-right ml-4">
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(recommendation.total_landed_cost_ttd)}
            </div>
            <div className="text-sm text-gray-500">Landed cost</div>
            <div className="text-sm text-green-600 font-medium mt-1">
              Sell for {formatCurrency(recommendation.suggested_retail_price_ttd)}
            </div>
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500">Supplier Price</div>
            <div className="font-medium">${recommendation.supplier_price_usd.toFixed(2)} USD</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500">Min. Order</div>
            <div className="font-medium">{recommendation.minimum_order_quantity} units</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500">Profit/Unit</div>
            <div className="font-medium text-green-600">{formatCurrency(recommendation.potential_profit_ttd)}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500">Exchange Rate</div>
            <div className="font-medium">1 USD = {recommendation.exchange_rate.toFixed(2)} TTD</div>
          </div>
        </div>

        {/* Recommendation Reason */}
        <div className="bg-purple-50 rounded-lg p-4 mb-4">
          <div className="text-sm font-medium text-purple-900 mb-1">
            💡 Why this recommendation?
          </div>
          <div className="text-sm text-purple-800">
            {recommendation.recommendation_reason}
          </div>
        </div>

        {/* Based On */}
        <div className="bg-blue-50 rounded-lg p-4 mb-4">
          <div className="text-sm font-medium text-blue-900 mb-1">
            📊 Based on your best-seller:
          </div>
          <div className="text-sm text-blue-800">
            <strong>{recommendation.based_on_product_name}</strong> 
            <span className="ml-2">
              (currently selling for {formatCurrency(recommendation.current_selling_price)})
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
            Add to Wishlist
          </button>
          
          {recommendation.product_url && (
            <a
              href={recommendation.product_url}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors inline-flex items-center"
            >
              View on {recommendation.platform}
              <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          )}
          
          <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors">
            Calculate ROI
          </button>
          
          <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors">
            Compare Prices
          </button>
        </div>
      </div>
    </div>
  )
}