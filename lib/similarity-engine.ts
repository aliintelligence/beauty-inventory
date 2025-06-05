import { SupplierProduct, SimilarityMatch } from './scrapers/types'

interface SimilarityResult {
  score: number
  factors: string[]
}

export class SimilarityEngine {
  async findSimilarProducts(
    targetProduct: any, 
    supplierProducts: SupplierProduct[]
  ): Promise<SimilarityMatch[]> {
    console.log(`🔍 Finding products similar to: ${targetProduct.name}`)
    
    const matches: SimilarityMatch[] = []
    
    for (const supplier of supplierProducts) {
      const similarity = await this.calculateSimilarity(targetProduct, supplier)
      
      // Only consider products with decent similarity
      if (similarity.score > 0.2) {
        const confidence = this.calculateConfidence(similarity, supplier, targetProduct)
        
        matches.push({
          supplier_product: supplier,
          similarity_score: similarity.score,
          matching_factors: similarity.factors,
          confidence: confidence
        })
      }
    }
    
    // Sort by confidence score (combination of similarity + other factors)
    const sortedMatches = matches.sort((a, b) => b.confidence - a.confidence)
    
    console.log(`✅ Found ${sortedMatches.length} similar products`)
    return sortedMatches
  }

  private async calculateSimilarity(target: any, supplier: SupplierProduct): Promise<SimilarityResult> {
    let totalScore = 0
    const factors: string[] = []
    
    // 1. Name similarity (40% weight) - most important factor
    const nameScore = this.calculateStringSimilarity(target.name, supplier.name)
    totalScore += nameScore * 0.4
    if (nameScore > 0.5) factors.push(`similar name (${(nameScore * 100).toFixed(0)}%)`)
    
    // 2. Category matching (25% weight)
    const categoryScore = this.calculateCategorySimilarity(target, supplier)
    totalScore += categoryScore * 0.25
    if (categoryScore > 0.5) factors.push('same category')
    
    // 3. Keyword overlap (20% weight)
    const keywordScore = this.calculateKeywordSimilarity(target, supplier)
    totalScore += keywordScore * 0.2
    if (keywordScore > 0.3) factors.push(`keyword overlap (${(keywordScore * 100).toFixed(0)}%)`)
    
    // 4. Price range similarity (10% weight)
    const priceScore = this.calculatePriceSimilarity(target, supplier)
    totalScore += priceScore * 0.1
    if (priceScore > 0.7) factors.push('similar price range')
    
    // 5. Tag matching (5% weight)
    const tagScore = this.calculateTagSimilarity(target, supplier)
    totalScore += tagScore * 0.05
    if (tagScore > 0.4) factors.push('matching tags')
    
    return {
      score: Math.min(totalScore, 1.0),
      factors: factors
    }
  }

  private calculateStringSimilarity(str1: string, str2: string): number {
    if (!str1 || !str2) return 0
    
    // Normalize strings
    const normalize = (str: string) => str.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    
    const normalized1 = normalize(str1)
    const normalized2 = normalize(str2)
    
    // Jaccard similarity using word sets
    const words1 = new Set(normalized1.split(' '))
    const words2 = new Set(normalized2.split(' '))
    
    const intersection = new Set([...words1].filter(x => words2.has(x)))
    const union = new Set([...words1, ...words2])
    
    const jaccardScore = intersection.size / union.size
    
    // Also calculate Levenshtein-based similarity
    const levenshteinScore = this.levenshteinSimilarity(normalized1, normalized2)
    
    // Combine both scores (favor Jaccard for word-based similarity)
    return (jaccardScore * 0.7) + (levenshteinScore * 0.3)
  }

  private levenshteinSimilarity(str1: string, str2: string): number {
    const distance = this.levenshteinDistance(str1, str2)
    const maxLength = Math.max(str1.length, str2.length)
    return maxLength === 0 ? 1 : (maxLength - distance) / maxLength
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = []
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i]
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          )
        }
      }
    }
    
    return matrix[str2.length][str1.length]
  }

  private calculateCategorySimilarity(target: any, supplier: SupplierProduct): number {
    // Extract category info from various sources
    const targetCategory = target.category || this.inferCategory(target.name, target.description)
    const supplierCategory = supplier.category || this.inferCategory(supplier.name, supplier.description)
    
    if (!targetCategory || !supplierCategory) return 0
    
    // Exact match
    if (targetCategory === supplierCategory) return 1.0
    
    // Partial category matching
    const categoryHierarchy = {
      'nail-tools': ['nail-accessories', 'beauty-tools'],
      'nail-accessories': ['nail-tools', 'beauty-accessories'],
      'nail-equipment': ['nail-tools', 'beauty-equipment'],
      'nail-polish': ['nail-accessories', 'beauty-products'],
      'beauty-products': ['nail-polish', 'cosmetics'],
      'beauty-tools': ['nail-tools', 'beauty-equipment']
    }
    
    const relatedCategories = categoryHierarchy[targetCategory] || []
    if (relatedCategories.includes(supplierCategory)) return 0.7
    
    // Check if both are nail-related
    if (targetCategory.includes('nail') && supplierCategory.includes('nail')) return 0.5
    if (targetCategory.includes('beauty') && supplierCategory.includes('beauty')) return 0.3
    
    return 0
  }

  private inferCategory(name: string, description?: string): string {
    const text = `${name} ${description || ''}`.toLowerCase()
    
    if (text.includes('lamp') || text.includes('uv') || text.includes('led')) return 'nail-equipment'
    if (text.includes('brush') || text.includes('tool') || text.includes('picker')) return 'nail-tools'
    if (text.includes('gel') || text.includes('polish') || text.includes('base')) return 'nail-polish'
    if (text.includes('rhinestone') || text.includes('crystal') || text.includes('gem')) return 'nail-accessories'
    if (text.includes('nail')) return 'nail-accessories'
    if (text.includes('beauty') || text.includes('cosmetic')) return 'beauty-products'
    
    return 'other'
  }

  private calculateKeywordSimilarity(target: any, supplier: SupplierProduct): number {
    const targetKeywords = this.extractKeywords(target.name, target.description)
    const supplierKeywords = this.extractKeywords(supplier.name, supplier.description)
    
    if (targetKeywords.length === 0 || supplierKeywords.length === 0) return 0
    
    const targetSet = new Set(targetKeywords)
    const supplierSet = new Set(supplierKeywords)
    
    const intersection = new Set([...targetSet].filter(x => supplierSet.has(x)))
    const union = new Set([...targetSet, ...supplierSet])
    
    return intersection.size / union.size
  }

  private extractKeywords(name: string, description?: string): string[] {
    const text = `${name} ${description || ''}`.toLowerCase()
    
    // Remove common stop words and extract meaningful keywords
    const stopWords = new Set(['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'a', 'an'])
    
    const words = text
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word))
      .filter(word => !word.match(/^\d+$/)) // Remove pure numbers
    
    // Add some domain-specific keywords
    const keywords = new Set(words)
    
    // Add composite keywords
    if (text.includes('nail art')) keywords.add('nail-art')
    if (text.includes('uv lamp')) keywords.add('uv-lamp')
    if (text.includes('gel polish')) keywords.add('gel-polish')
    if (text.includes('rhinestone picker')) keywords.add('rhinestone-picker')
    
    return Array.from(keywords)
  }

  private calculatePriceSimilarity(target: any, supplier: SupplierProduct): number {
    const targetCost = target.cost || target.price || 0
    const supplierPrice = supplier.price || 0
    
    if (targetCost === 0 || supplierPrice === 0) return 0
    
    // Calculate price ratio (closer to 1.0 = more similar)
    const ratio = Math.min(targetCost, supplierPrice) / Math.max(targetCost, supplierPrice)
    
    // Convert to similarity score (higher is better)
    return ratio
  }

  private calculateTagSimilarity(target: any, supplier: SupplierProduct): number {
    const targetTags = target.tags || []
    const supplierTags = supplier.tags || []
    
    if (targetTags.length === 0 || supplierTags.length === 0) return 0
    
    const targetSet = new Set(targetTags)
    const supplierSet = new Set(supplierTags)
    
    const intersection = new Set([...targetSet].filter(x => supplierSet.has(x)))
    const union = new Set([...targetSet, ...supplierSet])
    
    return intersection.size / union.size
  }

  private calculateConfidence(
    similarity: SimilarityResult, 
    supplier: SupplierProduct, 
    target: any
  ): number {
    let confidence = similarity.score * 0.6 // Base similarity score (60% weight)
    
    // Supplier rating factor (20% weight)
    if (supplier.supplier_rating) {
      const ratingScore = supplier.supplier_rating / 5.0
      confidence += ratingScore * 0.2
    }
    
    // Platform reliability factor (10% weight)
    const platformReliability = {
      'alibaba': 0.8,  // Generally reliable for bulk orders
      'temu': 0.6,     // Good prices but variable quality
      'shein': 0.5     // Trendy but sometimes inconsistent
    }
    confidence += (platformReliability[supplier.platform] || 0.5) * 0.1
    
    // MOQ factor (10% weight) - prefer lower MOQs for testing
    const moqScore = supplier.minimum_order_quantity <= 10 ? 1.0 : 
                    supplier.minimum_order_quantity <= 50 ? 0.7 : 0.3
    confidence += moqScore * 0.1
    
    return Math.min(confidence, 1.0)
  }

  // Utility method to explain similarity
  explainSimilarity(match: SimilarityMatch, _target: any): string {
    const reasons = []
    
    reasons.push(`${(match.similarity_score * 100).toFixed(0)}% similar overall`)
    
    if (match.matching_factors.length > 0) {
      reasons.push(`Matches: ${match.matching_factors.join(', ')}`)
    }
    
    reasons.push(`${(match.confidence * 100).toFixed(0)}% confidence`)
    
    if (match.supplier_product.supplier_rating) {
      reasons.push(`${match.supplier_product.supplier_rating.toFixed(1)}/5.0 supplier rating`)
    }
    
    return reasons.join(' • ')
  }
}