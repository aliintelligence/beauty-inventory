'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../../../../lib/supabase'
import { formatCurrency } from '../../../../../lib/currency'
import { searchLocations } from '../../../../../lib/trinidad-locations'
import { ArrowLeft, Plus, Minus, ShoppingCart, Trash2, MapPin, UserCheck, Users } from 'lucide-react'

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

interface Customer {
  id: string
  name: string
  phone: string | null
  email: string | null
  address: string | null
  customer_type: string
}

function NewOrderContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedCustomerId = searchParams.get('customerId')
  
  const [products, setProducts] = useState<Product[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(preselectedCustomerId)
  const [customerInfo, setCustomerInfo] = useState({
    customer_name: '',
    customer_phone: '',
    customer_address: ''
  })
  const [customerSearch, setCustomerSearch] = useState('')
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([])
  const [showLocationDropdown, setShowLocationDropdown] = useState(false)
  const [loading, setLoading] = useState(false)
  const [productsLoading, setProductsLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
    fetchCustomers()
  }, [])

  useEffect(() => {
    if (preselectedCustomerId && customers.length > 0) {
      const customer = customers.find(c => c.id === preselectedCustomerId)
      if (customer) {
        handleCustomerSelect(customer)
      }
    }
  }, [preselectedCustomerId, customers])

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('id, name, phone, email, address, customer_type')
        .order('name')

      if (error) throw error
      setCustomers(data || [])
    } catch (error) {
      console.error('Error fetching customers:', error)
    } finally {
      // Customers loaded
    }
  }

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomerId(customer.id)
    setCustomerInfo({
      customer_name: customer.name,
      customer_phone: customer.phone || '',
      customer_address: customer.address || ''
    })
    setCustomerSearch(customer.name)
    setShowCustomerDropdown(false)
  }

  const clearCustomerSelection = () => {
    setSelectedCustomerId(null)
    setCustomerInfo({
      customer_name: '',
      customer_phone: '',
      customer_address: ''
    })
    setCustomerSearch('')
  }

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    customer.phone?.toLowerCase().includes(customerSearch.toLowerCase())
  )

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
      // Create order with customer_id and default status
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([{
          customer_id: selectedCustomerId,
          customer_name: customerInfo.customer_name || null,
          customer_phone: customerInfo.customer_phone || null,
          customer_address: customerInfo.customer_address || null,
          total_amount: totalAmount,
          order_status: 'received'
        }])
        .select()
        .single()

      if (orderError) throw orderError

      // Create order items (don't include total_price as it's computed)
      const orderItemsData = orderItems.map(item => ({
        order_id: orderData.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsData)

      if (itemsError) throw itemsError

      router.push('/admin/orders')
    } catch (error) {
      console.error('Error creating order:', error)
      
      // Better error message
      let errorMessage = 'Error creating order'
      if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = `Error: ${error.message}`
      }
      alert(errorMessage)
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
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h2>
            
            {/* Customer Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Existing Customer
              </label>
              <div className="relative">
                <div className="flex items-center">
                  <Users className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
                  <input
                    type="text"
                    placeholder="Search customers by name or phone..."
                    value={customerSearch}
                    onChange={(e) => {
                      setCustomerSearch(e.target.value)
                      setShowCustomerDropdown(true)
                      if (!e.target.value) clearCustomerSelection()
                    }}
                    onFocus={() => setShowCustomerDropdown(true)}
                    className="w-full pl-10 pr-10 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-gray-900"
                  />
                  {selectedCustomerId && (
                    <button
                      type="button"
                      onClick={clearCustomerSelection}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  )}
                </div>
                
                {showCustomerDropdown && customerSearch && filteredCustomers.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {filteredCustomers.map((customer) => (
                      <button
                        key={customer.id}
                        type="button"
                        onClick={() => handleCustomerSelect(customer)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">{customer.name}</div>
                            {customer.phone && (
                              <div className="text-sm text-gray-500">{customer.phone}</div>
                            )}
                          </div>
                          {customer.customer_type === 'vip' && (
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">VIP</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {selectedCustomerId && (
                <div className="mt-2 p-2 bg-green-50 rounded-lg flex items-center">
                  <UserCheck className="h-4 w-4 text-green-600 mr-2" />
                  <span className="text-sm text-green-800">Customer selected: {customerInfo.customer_name}</span>
                </div>
              )}
            </div>
            
            <div className="relative border-t pt-4">
              <p className="text-sm text-gray-500 mb-3">Or enter new customer details:</p>
              <div className="space-y-4">
                <input
                  type="text"
                  name="customer_name"
                  placeholder="Customer Name"
                  value={customerInfo.customer_name}
                  onChange={handleCustomerInfoChange}
                  disabled={!!selectedCustomerId}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-gray-900 disabled:bg-gray-100"
                />
                <input
                  type="tel"
                  name="customer_phone"
                  placeholder="Phone Number"
                  value={customerInfo.customer_phone}
                  onChange={handleCustomerInfoChange}
                  disabled={!!selectedCustomerId}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-gray-900 disabled:bg-gray-100"
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
                    disabled={!!selectedCustomerId}
                    onFocus={() => {
                      if (customerInfo.customer_address.length > 1 && !selectedCustomerId) {
                        const suggestions = searchLocations(customerInfo.customer_address)
                        setLocationSuggestions(suggestions)
                        setShowLocationDropdown(suggestions.length > 0)
                      }
                    }}
                    className="w-full pl-10 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-gray-900 disabled:bg-gray-100"
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

export default function NewOrderPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    }>
      <NewOrderContent />
    </Suspense>
  )
}