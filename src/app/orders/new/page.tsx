'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../../../lib/supabase'
import { formatCurrency } from '../../../../lib/currency'
import { searchLocations } from '../../../../lib/trinidad-locations'
import { ArrowLeft, Plus, Minus, ShoppingCart, Trash2, MapPin } from 'lucide-react'

interface Product {
  id: string
  name: string
  price: number
  inventory_quantity: number
}

interface OrderItem {
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
  available_stock: number
}

export default function NewOrderPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [customerInfo, setCustomerInfo] = useState({
    customer_name: '',
    customer_phone: '',
    customer_address: ''
  })
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([])
  const [showLocationDropdown, setShowLocationDropdown] = useState(false)
  const [loading, setLoading] = useState(false)
  const [productsLoading, setProductsLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, inventory_quantity')
        .gt('inventory_quantity', 0)
        .order('name')

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setProductsLoading(false)
    }
  }

  const addProductToOrder = (product: Product) => {
    const existingItem = orderItems.find(item => item.product_id === product.id)
    
    if (existingItem) {
      if (existingItem.quantity < product.inventory_quantity) {
        updateQuantity(product.id, existingItem.quantity + 1)
      } else {
        alert('Not enough stock available')
      }
    } else {
      const newItem: OrderItem = {
        product_id: product.id,
        product_name: product.name,
        quantity: 1,
        unit_price: product.price,
        total_price: product.price,
        available_stock: product.inventory_quantity
      }
      setOrderItems([...orderItems, newItem])
    }
  }

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(productId)
      return
    }

    setOrderItems(orderItems.map(item => {
      if (item.product_id === productId) {
        if (newQuantity > item.available_stock) {
          alert('Not enough stock available')
          return item
        }
        return {
          ...item,
          quantity: newQuantity,
          total_price: newQuantity * item.unit_price
        }
      }
      return item
    }))
  }

  const removeItem = (productId: string) => {
    setOrderItems(orderItems.filter(item => item.product_id !== productId))
  }

  const totalAmount = orderItems.reduce((sum, item) => sum + item.total_price, 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (orderItems.length === 0) {
      alert('Please add at least one product to the order')
      return
    }

    setLoading(true)

    try {
      // Create order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([{
          customer_name: customerInfo.customer_name || null,
          customer_phone: customerInfo.customer_phone || null,
          customer_address: customerInfo.customer_address || null,
          total_amount: totalAmount
        }])
        .select()
        .single()

      if (orderError) throw orderError

      // Create order items
      const orderItemsData = orderItems.map(item => ({
        order_id: orderData.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsData)

      if (itemsError) throw itemsError

      router.push('/orders')
    } catch (error) {
      console.error('Error creating order:', error)
      alert('Error creating order')
    } finally {
      setLoading(false)
    }
  }

  const handleCustomerInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setCustomerInfo({
      ...customerInfo,
      [name]: value
    })
    
    // Show location suggestions when typing in address field
    if (name === 'customer_address' && value.length > 1) {
      const suggestions = searchLocations(value)
      setLocationSuggestions(suggestions)
      setShowLocationDropdown(suggestions.length > 0)
    } else if (name === 'customer_address') {
      setShowLocationDropdown(false)
    }
  }

  const handleLocationSelect = (location: string) => {
    setCustomerInfo({
      ...customerInfo,
      customer_address: location
    })
    setShowLocationDropdown(false)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">New Order</h1>
          <p className="mt-1 text-gray-600">Create a new customer order</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Product Selection */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Products</h2>
          
          {productsLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {products.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{product.name}</div>
                    <div className="text-sm text-gray-500">
                      {formatCurrency(product.price)} • {product.inventory_quantity} in stock
                    </div>
                  </div>
                  <button
                    onClick={() => addProductToOrder(product)}
                    className="bg-pink-600 hover:bg-pink-700 text-white p-2 rounded-lg transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              ))}
              
              {products.length === 0 && (
                <p className="text-gray-500 text-center py-8">
                  No products available. <Link href="/products/new" className="text-pink-600 hover:text-pink-700">Add some products</Link> first.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          {/* Customer Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Information (Optional)</h2>
            <div className="space-y-4">
              <input
                type="text"
                name="customer_name"
                placeholder="Customer Name"
                value={customerInfo.customer_name}
                onChange={handleCustomerInfoChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              />
              <input
                type="tel"
                name="customer_phone"
                placeholder="Phone Number"
                value={customerInfo.customer_phone}
                onChange={handleCustomerInfoChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              />
              <div className="relative">
                <div className="flex items-center">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <textarea
                    name="customer_address"
                    placeholder="Address (e.g., Chaguanas, San Fernando, Port of Spain...)"
                    rows={3}
                    value={customerInfo.customer_address}
                    onChange={handleCustomerInfoChange}
                    onFocus={() => {
                      if (customerInfo.customer_address.length > 1) {
                        const suggestions = searchLocations(customerInfo.customer_address)
                        setLocationSuggestions(suggestions)
                        setShowLocationDropdown(suggestions.length > 0)
                      }
                    }}
                    className="w-full pl-10 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>
                {showLocationDropdown && locationSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {locationSuggestions.map((location, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleLocationSelect(location)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                      >
                        <div className="flex items-center">
                          <MapPin className="h-3 w-3 text-gray-400 mr-2" />
                          {location}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
            
            {orderItems.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No items added yet</p>
            ) : (
              <div className="space-y-3">
                {orderItems.map((item) => (
                  <div key={item.product_id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{item.product_name}</div>
                      <div className="text-sm text-gray-500">{formatCurrency(item.unit_price)} each</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => removeItem(item.product_id)}
                        className="text-red-400 hover:text-red-600 ml-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="text-right ml-4">
                      <div className="font-medium">{formatCurrency(item.total_price)}</div>
                    </div>
                  </div>
                ))}
                
                <div className="border-t pt-3 mt-4">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Total:</span>
                    <span>{formatCurrency(totalAmount)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <form onSubmit={handleSubmit}>
            <button
              type="submit"
              disabled={loading || orderItems.length === 0}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
            >
              <ShoppingCart className="h-5 w-5" />
              <span>{loading ? 'Creating Order...' : 'Create Order'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}