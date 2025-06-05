'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../../lib/supabase'
import { TrendingUp, DollarSign, Package, ShoppingCart, Star } from 'lucide-react'

interface ProductSales {
  id: string
  name: string
  price: number
  cost: number
  customs_cost: number | null
  total_sold: number
  total_revenue: number
  total_cost: number
  profit: number
}

interface RevenueData {
  date: string
  total_orders: number
  total_revenue: number
}

interface AnalyticsData {
  totalRevenue: number
  totalProfit: number
  totalOrders: number
  averageOrderValue: number
  topProducts: ProductSales[]
  recentRevenue: RevenueData[]
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalRevenue: 0,
    totalProfit: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    topProducts: [],
    recentRevenue: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      // Fetch product sales summary
      const { data: productSales } = await supabase
        .from('product_sales_summary')
        .select('*')
        .order('total_sold', { ascending: false })
        .limit(10)

      // Fetch revenue summary
      const { data: revenueData } = await supabase
        .from('revenue_summary')
        .select('*')
        .order('date', { ascending: false })
        .limit(7)

      // Fetch total orders
      const { data: ordersData } = await supabase
        .from('orders')
        .select('total_amount')

      const totalRevenue = ordersData?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0
      const totalOrders = ordersData?.length || 0
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

      // Calculate total profit from product sales
      const totalProfit = productSales?.reduce((sum, product) => sum + Number(product.profit), 0) || 0

      setAnalytics({
        totalRevenue,
        totalProfit,
        totalOrders,
        averageOrderValue,
        topProducts: productSales || [],
        recentRevenue: revenueData || []
      })
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="mt-1 text-gray-600">Track your business performance and insights</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${analytics.totalRevenue.toFixed(2)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Profit</p>
              <p className="text-2xl font-bold text-gray-900">${analytics.totalProfit.toFixed(2)}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalOrders}</p>
            </div>
            <ShoppingCart className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Order Value</p>
              <p className="text-2xl font-bold text-gray-900">${analytics.averageOrderValue.toFixed(2)}</p>
            </div>
            <Package className="h-8 w-8 text-pink-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Performing Products */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Top Performing Products</h2>
          </div>
          <div className="p-6">
            {analytics.topProducts.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No sales data available yet</p>
            ) : (
              <div className="space-y-4">
                {analytics.topProducts.map((product, index) => {
                  const profitMargin = product.total_revenue > 0 ? (product.profit / product.total_revenue) * 100 : 0
                  
                  return (
                    <div key={product.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                            {index === 0 && <Star className="h-4 w-4 text-pink-600" />}
                            {index !== 0 && <span className="text-sm font-medium text-pink-600">#{index + 1}</span>}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.total_sold} units sold</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">${product.total_revenue.toFixed(2)}</div>
                        <div className="text-sm text-gray-500">
                          {profitMargin.toFixed(1)}% profit margin
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Recent Revenue Trend */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Revenue Trend</h2>
          </div>
          <div className="p-6">
            {analytics.recentRevenue.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No revenue data available yet</p>
            ) : (
              <div className="space-y-4">
                {analytics.recentRevenue.map((day) => (
                  <div key={day.date} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">
                        {new Date(day.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                      <div className="text-sm text-gray-500">{day.total_orders} orders</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">${Number(day.total_revenue).toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Business Insights */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Business Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <h3 className="font-medium text-green-900 mb-2">Profit Margin</h3>
            <p className="text-2xl font-bold text-green-600">
              {analytics.totalRevenue > 0 ? ((analytics.totalProfit / analytics.totalRevenue) * 100).toFixed(1) : 0}%
            </p>
            <p className="text-sm text-green-700 mt-1">Overall business profitability</p>
          </div>
          
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Best Sellers</h3>
            <p className="text-2xl font-bold text-blue-600">{analytics.topProducts.length}</p>
            <p className="text-sm text-blue-700 mt-1">Products with sales</p>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <h3 className="font-medium text-purple-900 mb-2">Growth Potential</h3>
            <p className="text-2xl font-bold text-purple-600">
              {analytics.recentRevenue.length > 1 ? 
                (analytics.recentRevenue[0]?.total_revenue > analytics.recentRevenue[1]?.total_revenue ? '📈' : '📉') : 
                '➡️'
              }
            </p>
            <p className="text-sm text-purple-700 mt-1">Recent trend indicator</p>
          </div>
        </div>
      </div>
    </div>
  )
}