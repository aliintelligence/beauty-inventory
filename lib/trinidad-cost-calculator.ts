import { CostBreakdown, ProfitAnalysis, SupplierProduct } from './scrapers/types'

export class TrinidadCostCalculator {
  // Trinidad customs and tax rates
  private static readonly CUSTOMS_DUTY_RATE = 0.15 // 15% for beauty products
  private static readonly VAT_RATE = 0.125 // 12.5% VAT
  private static readonly TTPOST_BASE_SHIPPING = 25.00 // Base TT Post shipping cost in TTD
  private static readonly PROCESSING_FEE = 10.00 // TT Post processing fee in TTD
  
  // Exchange rate cache (in real app, would fetch from API)
  private static exchangeRates: Record<string, number> = {
    'USD_TTD': 6.75, // As of recent rates
    'EUR_TTD': 7.30,
    'GBP_TTD': 8.50
  }

  async calculateLandedCost(supplierProduct: SupplierProduct): Promise<CostBreakdown> {
    console.log(`💰 Calculating Trinidad landed cost for: ${supplierProduct.name}`)
    
    // Get current exchange rate
    const exchangeRate = await this.getExchangeRate(supplierProduct.original_currency, 'TTD')
    
    // Convert product cost to TTD
    const productCostTtd = supplierProduct.price * exchangeRate
    
    // Calculate shipping cost in TTD
    const shippingCostUsd = supplierProduct.shipping_cost || this.estimateShippingCost(supplierProduct)
    const shippingCostTtd = shippingCostUsd * exchangeRate + TrinidadCostCalculator.TTPOST_BASE_SHIPPING
    
    // Calculate dutiable value (product cost + shipping)
    const dutiableValue = productCostTtd + shippingCostTtd
    
    // Calculate customs duty (15% on dutiable value for beauty products)
    const customsDuty = dutiableValue * TrinidadCostCalculator.CUSTOMS_DUTY_RATE
    
    // Calculate VAT base (dutiable value + customs duty)
    const vatBase = dutiableValue + customsDuty
    
    // Calculate VAT (12.5% on VAT base)
    const vat = vatBase * TrinidadCostCalculator.VAT_RATE
    
    // Add processing fees
    const processingFee = TrinidadCostCalculator.PROCESSING_FEE
    
    // Total landed cost
    const totalLandedCost = productCostTtd + shippingCostTtd + customsDuty + vat + processingFee
    
    const breakdown: CostBreakdown = {
      product_cost_usd: supplierProduct.price,
      product_cost_ttd: productCostTtd,
      shipping_cost_usd: shippingCostUsd,
      shipping_cost_ttd: shippingCostTtd,
      customs_duty_ttd: customsDuty,
      vat_ttd: vat,
      total_landed_cost_ttd: totalLandedCost,
      exchange_rate: exchangeRate
    }
    
    console.log(`✅ Landed cost calculated: $${supplierProduct.price} USD → ${totalLandedCost.toFixed(2)} TTD`)
    return breakdown
  }

  calculateProfitability(
    landedCostTtd: number, 
    suggestedRetailPrice: number, 
    expectedMonthlyVolume: number = 10,
    competitorProduct?: any
  ): ProfitAnalysis {
    
    // Calculate suggested retail price if not provided
    if (!suggestedRetailPrice) {
      // Use 2.5x markup as default, or match competitor pricing
      suggestedRetailPrice = competitorProduct?.price || landedCostTtd * 2.5
    }
    
    // Calculate basic profit metrics
    const profitPerUnit = suggestedRetailPrice - landedCostTtd
    const marginPercent = (profitPerUnit / suggestedRetailPrice) * 100
    const estimatedMonthlyProfit = profitPerUnit * expectedMonthlyVolume
    
    // Calculate break-even considering overhead costs
    const overheadPerUnit = this.calculateOverheadCosts(landedCostTtd)
    const netProfitPerUnit = profitPerUnit - overheadPerUnit
    const breakEvenQuantity = Math.max(1, Math.ceil(landedCostTtd / netProfitPerUnit))
    
    // Suggest optimal pricing
    const recommendedPrice = this.calculateOptimalPrice(landedCostTtd, competitorProduct)
    
    return {
      profit_per_unit_ttd: profitPerUnit,
      margin_percent: marginPercent,
      estimated_monthly_profit_ttd: estimatedMonthlyProfit,
      break_even_quantity: breakEvenQuantity,
      recommended_price_ttd: recommendedPrice
    }
  }

  private async getExchangeRate(fromCurrency: string, toCurrency: string): Promise<number> {
    const key = `${fromCurrency}_${toCurrency}`
    
    // In production, would fetch from a real API like exchangerate-api.com
    if (TrinidadCostCalculator.exchangeRates[key]) {
      return TrinidadCostCalculator.exchangeRates[key]
    }
    
    // Fallback to USD rate if currency not found
    if (fromCurrency !== 'USD') {
      console.warn(`⚠️ Exchange rate not found for ${fromCurrency}, using USD rate`)
      return TrinidadCostCalculator.exchangeRates['USD_TTD']
    }
    
    return 6.75 // Default USD to TTD rate
  }

  private estimateShippingCost(product: SupplierProduct): number {
    // Estimate shipping based on platform and product type
    const baseCosts: Record<string, number> = {
      'alibaba': 8.00,  // Higher shipping costs from Alibaba
      'temu': 3.00,     // Lower shipping from Temu
      'shein': 4.00     // Moderate shipping from Shein
    }
    
    let shippingCost = baseCosts[product.platform] || 5.00
    
    // Adjust for product category
    if (product.category?.includes('equipment') || product.name.toLowerCase().includes('lamp')) {
      shippingCost *= 1.5 // Heavier items cost more to ship
    }
    
    // Adjust for MOQ
    if (product.minimum_order_quantity > 50) {
      shippingCost *= 0.8 // Bulk shipping discount
    }
    
    return Math.round(shippingCost * 100) / 100
  }

  private calculateOverheadCosts(landedCost: number): number {
    // Estimate overhead costs as percentage of landed cost
    const overheadRate = 0.15 // 15% overhead (packaging, time, storage, etc.)
    const fixedOverhead = 5.00 // Fixed cost per item (packaging, handling)
    
    return (landedCost * overheadRate) + fixedOverhead
  }

  private calculateOptimalPrice(landedCost: number, competitorProduct?: any): number {
    // Start with 2.5x markup
    let optimalPrice = landedCost * 2.5
    
    // Adjust based on competitor pricing
    if (competitorProduct?.price) {
      const competitorPrice = competitorProduct.price
      
      // If we can undercut competitor by 10% while maintaining 40%+ margin
      const undercutPrice = competitorPrice * 0.9
      const minimumPrice = landedCost * 1.4 // Minimum 40% margin
      
      if (undercutPrice > minimumPrice) {
        optimalPrice = undercutPrice
      }
    }
    
    // Round to nearest .99 or .50 for psychological pricing
    const rounded = Math.floor(optimalPrice)
    if (optimalPrice - rounded > 0.5) {
      return rounded + 0.99
    } else {
      return rounded + 0.50
    }
  }

  // Utility method to format costs for display
  formatCostBreakdown(breakdown: CostBreakdown): string {
    return `
Product Cost: $${breakdown.product_cost_usd} USD (${breakdown.product_cost_ttd.toFixed(2)} TTD)
Shipping: $${breakdown.shipping_cost_usd} USD (${breakdown.shipping_cost_ttd.toFixed(2)} TTD)
Customs Duty (15%): ${breakdown.customs_duty_ttd.toFixed(2)} TTD
VAT (12.5%): ${breakdown.vat_ttd.toFixed(2)} TTD
Total Landed Cost: ${breakdown.total_landed_cost_ttd.toFixed(2)} TTD
Exchange Rate: 1 USD = ${breakdown.exchange_rate} TTD
    `.trim()
  }

  // Method to calculate volume discounts for bulk orders
  calculateBulkPricing(product: SupplierProduct, quantities: number[]): Array<{quantity: number, unitCost: number, totalCost: number}> {
    return quantities.map(qty => {
      // Assume volume discounts for larger quantities
      let discount = 0
      if (qty >= 100) discount = 0.15      // 15% discount for 100+
      else if (qty >= 50) discount = 0.10  // 10% discount for 50+
      else if (qty >= 20) discount = 0.05  // 5% discount for 20+
      
      const discountedPrice = product.price * (1 - discount)
      
      return {
        quantity: qty,
        unitCost: discountedPrice,
        totalCost: discountedPrice * qty
      }
    })
  }
}