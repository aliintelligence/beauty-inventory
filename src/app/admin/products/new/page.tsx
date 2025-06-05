'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../../../../lib/supabase'
import { formatCurrency, CURRENCY } from '../../../../../lib/currency'
import { ArrowLeft, Save } from 'lucide-react'

export default function NewProductPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    cost: '',
    customs_cost: '',
    inventory_quantity: ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase
        .from('products')
        .insert([{
          name: formData.name,
          description: formData.description || null,
          price: parseFloat(formData.price),
          cost: parseFloat(formData.cost),
          customs_cost: formData.customs_cost ? parseFloat(formData.customs_cost) : null,
          inventory_quantity: parseInt(formData.inventory_quantity)
        }])

      if (error) throw error

      router.push('/admin/products')
    } catch (error) {
      console.error('Error creating product:', error)
      alert('Error creating product')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  // Calculate profit margin in real time
  const price = parseFloat(formData.price) || 0
  const cost = parseFloat(formData.cost) || 0
  const customsCost = parseFloat(formData.customs_cost) || 0
  const totalCost = cost + customsCost
  const profitMargin = price > 0 ? ((price - totalCost) / price) * 100 : 0

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link
          href="/admin/products"
          className="text-gray-400 hover:text-gray-600"
        >
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
          <p className="mt-1 text-gray-600">Add a new nail art product to Gurl Aesthetic inventory • Prices in {CURRENCY.code}</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Product Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-gray-900"
              placeholder="e.g., Rhinestone Picker, Nail Art Brushes, Gel Tips"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-gray-900"
              placeholder="Product description..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                Selling Price *
              </label>
              <div className="mt-1 relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">{CURRENCY.symbol}</span>
                <input
                  type="number"
                  id="price"
                  name="price"
                  required
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={handleChange}
                  className="pl-8 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-gray-900"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label htmlFor="cost" className="block text-sm font-medium text-gray-700">
                Product Cost *
              </label>
              <div className="mt-1 relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">{CURRENCY.symbol}</span>
                <input
                  type="number"
                  id="cost"
                  name="cost"
                  required
                  step="0.01"
                  min="0"
                  value={formData.cost}
                  onChange={handleChange}
                  className="pl-8 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-gray-900"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label htmlFor="customs_cost" className="block text-sm font-medium text-gray-700">
                Customs/Import Cost
              </label>
              <div className="mt-1 relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">{CURRENCY.symbol}</span>
                <input
                  type="number"
                  id="customs_cost"
                  name="customs_cost"
                  step="0.01"
                  min="0"
                  value={formData.customs_cost}
                  onChange={handleChange}
                  className="pl-8 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-gray-900"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label htmlFor="inventory_quantity" className="block text-sm font-medium text-gray-700">
                Initial Stock Quantity *
              </label>
              <input
                type="number"
                id="inventory_quantity"
                name="inventory_quantity"
                required
                min="0"
                value={formData.inventory_quantity}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-gray-900"
                placeholder="0"
              />
            </div>
          </div>

          {/* Profit Margin Display */}
          {price > 0 && totalCost > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Profit Analysis</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Selling Price:</span>
                  <div className="font-medium">{formatCurrency(price)}</div>
                </div>
                <div>
                  <span className="text-gray-500">Total Cost:</span>
                  <div className="font-medium">{formatCurrency(totalCost)}</div>
                </div>
                <div>
                  <span className="text-gray-500">Profit per Unit:</span>
                  <div className="font-medium">{formatCurrency(price - totalCost)}</div>
                </div>
                <div>
                  <span className="text-gray-500">Profit Margin:</span>
                  <div className={`font-medium ${profitMargin >= 50 ? 'text-green-600' : profitMargin >= 25 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {profitMargin.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-6">
            <Link
              href="/admin/products"
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{loading ? 'Creating...' : 'Create Product'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}