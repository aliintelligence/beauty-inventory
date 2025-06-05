export interface SupplierProduct {
  platform: 'alibaba' | 'temu' | 'shein'
  external_id: string
  name: string
  description?: string
  price: number
  original_currency: string
  supplier_name?: string
  supplier_rating?: number
  shipping_cost?: number
  minimum_order_quantity: number
  images?: string[]
  category?: string
  tags?: string[]
  product_url?: string
}

export interface ScrapingResult {
  products: SupplierProduct[]
  success: boolean
  error?: string
  total_found: number
  platform: string
}

export interface SimilarityMatch {
  supplier_product: SupplierProduct
  similarity_score: number
  matching_factors: string[]
  confidence: number
}

export interface CostBreakdown {
  product_cost_usd: number
  product_cost_ttd: number
  shipping_cost_usd: number
  shipping_cost_ttd: number
  customs_duty_ttd: number
  vat_ttd: number
  total_landed_cost_ttd: number
  exchange_rate: number
}

export interface ProfitAnalysis {
  profit_per_unit_ttd: number
  margin_percent: number
  estimated_monthly_profit_ttd: number
  break_even_quantity: number
  recommended_price_ttd: number
}

export interface ProductRecommendation {
  id: string
  supplier_product: SupplierProduct
  based_on_product: any
  similarity_score: number
  cost_breakdown: CostBreakdown
  profit_analysis: ProfitAnalysis
  confidence_score: number
  recommendation_reason: string
}