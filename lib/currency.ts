// Currency utilities for Trinidad and Tobago
export const CURRENCY = {
  code: 'TTD',
  symbol: 'TT$',
  name: 'Trinidad and Tobago Dollar'
}

export function formatCurrency(amount: number): string {
  return `${CURRENCY.symbol}${amount.toFixed(2)}`
}

export function formatCurrencyInput(amount: string): string {
  const numAmount = parseFloat(amount) || 0
  return formatCurrency(numAmount)
}

// Convert USD to TTD (approximate rate - she should update this)
export const USD_TO_TTD_RATE = 6.8

export function convertUSDToTTD(usdAmount: number): number {
  return usdAmount * USD_TO_TTD_RATE
}

export function convertTTDToUSD(ttdAmount: number): number {
  return ttdAmount / USD_TO_TTD_RATE
}