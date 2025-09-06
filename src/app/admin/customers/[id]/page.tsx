'use client'

import { useState, useEffect, use, useCallback } from 'react'
import Link from 'next/link'
import { supabase } from '../../../../../lib/supabase'
import { formatCurrency } from '../../../../../lib/currency'
import InvoicePDF from '../../../../../components/invoice/InvoicePDF'
import { 
  ArrowLeft,
  Phone,
  Mail,
  Instagram,
  MapPin,
  Calendar,
  ShoppingBag,
  DollarSign,
  Edit,
  Plus,
  TrendingUp,
  Star,
  Crown,
  MessageSquare
} from 'lucide-react'

interface CustomerDetail {
  id: string
  name: string
  phone: string | null
  email: string | null
  address: string | null
  instagram_handle: string | null
  notes: string | null
  total_spent: number
  order_count: number
  last_order_date: string | null
  customer_type: string
  preferred_payment_method: string | null
  created_at: string
}

interface Order {
  id: string
  customer_name: string | null
  customer_phone: string | null
  customer_address: string | null
  total_amount: number
  created_at: string
  order_items: {
    quantity: number
    unit_price: number
    total_price: number
    products: {
      name: string
    }
  }[]
}

interface ProductStats {
  product_name: string
  total_quantity: number
  total_spent: number
}

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [customer, setCustomer] = useState<CustomerDetail | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [productStats, setProductStats] = useState<ProductStats[]>([])
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [editedCustomer, setEditedCustomer] = useState<CustomerDetail | null>(null)

  const fetchCustomerData = useCallback(async () => {
    try {
      // Fetch customer details
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('id', resolvedParams.id)
        .single()

      if (customerError) throw customerError
      setCustomer(customerData)
      setEditedCustomer(customerData)

      // Fetch customer orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            quantity,
            unit_price,
            total_price,
            products (
              name
            )
          )
        `)
        .eq('customer_id', resolvedParams.id)
        .order('created_at', { ascending: false })

      if (ordersError) throw ordersError
      setOrders(ordersData || [])

      // Calculate product statistics
      const stats: { [key: string]: ProductStats } = {}
      ordersData?.forEach(order => {
        order.order_items.forEach((item: any) => {
          const productName = item.products.name
          if (!stats[productName]) {
            stats[productName] = {
              product_name: productName,
              total_quantity: 0,
              total_spent: 0
            }
          }
          stats[productName].total_quantity += item.quantity
          stats[productName].total_spent += item.total_price
        })
      })
      
      setProductStats(Object.values(stats).sort((a, b) => b.total_spent - a.total_spent))
    } catch (error) {
      console.error('Error fetching customer data:', error)
    } finally {
      setLoading(false)
    }
  }, [resolvedParams.id])

  useEffect(() => {
    fetchCustomerData()
  }, [fetchCustomerData])

  const handleSave = async () => {
    if (!editedCustomer) return

    try {
      const { error } = await supabase
        .from('customers')
        .update({
          name: editedCustomer.name,
          phone: editedCustomer.phone,
          email: editedCustomer.email,
          address: editedCustomer.address,
          instagram_handle: editedCustomer.instagram_handle,
          notes: editedCustomer.notes,
          customer_type: editedCustomer.customer_type,
          preferred_payment_method: editedCustomer.preferred_payment_method
        })
        .eq('id', resolvedParams.id)

      if (error) throw error
      
      setCustomer(editedCustomer)
      setEditMode(false)
    } catch (error) {
      console.error('Error updating customer:', error)
      alert('Failed to update customer')
    }
  }

  const getCustomerBadge = (type: string) => {
    switch(type) {
      case 'vip':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-yellow-100 to-amber-100 text-amber-800 border border-amber-200">
            <Crown className="h-4 w-4 mr-1" />
            VIP Customer
          </span>
        )
      case 'wholesale':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 border border-purple-200">
            <TrendingUp className="h-4 w-4 mr-1" />
            Wholesale
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
            Regular Customer
          </span>
        )
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Customer not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/admin/customers" className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{customer.name}</h1>
            <p className="text-gray-600">Customer since {new Date(customer.created_at).toLocaleDateString()}</p>
          </div>
          {getCustomerBadge(customer.customer_type)}
        </div>
        
        <div className="flex space-x-3">
          {!editMode ? (
            <button
              onClick={() => setEditMode(true)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Edit className="h-4 w-4" />
              <span>Edit</span>
            </button>
          ) : (
            <>
              <button
                onClick={() => {
                  setEditMode(false)
                  setEditedCustomer(customer)
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Save Changes
              </button>
            </>
          )}
          <Link
            href={`/admin/orders/new?customerId=${customer.id}`}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>New Order</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Contact Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
            
            {editMode ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={editedCustomer?.name || ''}
                    onChange={(e) => setEditedCustomer({...editedCustomer!, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={editedCustomer?.phone || ''}
                    onChange={(e) => setEditedCustomer({...editedCustomer!, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={editedCustomer?.email || ''}
                    onChange={(e) => setEditedCustomer({...editedCustomer!, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
                  <input
                    type="text"
                    value={editedCustomer?.instagram_handle || ''}
                    onChange={(e) => setEditedCustomer({...editedCustomer!, instagram_handle: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                    placeholder="@username"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea
                    value={editedCustomer?.address || ''}
                    onChange={(e) => setEditedCustomer({...editedCustomer!, address: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer Type</label>
                  <select
                    value={editedCustomer?.customer_type || 'regular'}
                    onChange={(e) => setEditedCustomer({...editedCustomer!, customer_type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="regular">Regular</option>
                    <option value="vip">VIP</option>
                    <option value="wholesale">Wholesale</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                  <input
                    type="text"
                    value={editedCustomer?.preferred_payment_method || ''}
                    onChange={(e) => setEditedCustomer({...editedCustomer!, preferred_payment_method: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                    placeholder="Cash, Transfer, Linx, etc."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={editedCustomer?.notes || ''}
                    onChange={(e) => setEditedCustomer({...editedCustomer!, notes: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                    rows={3}
                    placeholder="Special preferences, notes, etc."
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {customer.phone && (
                  <div className="flex items-center text-gray-600">
                    <Phone className="h-4 w-4 mr-3 text-gray-400" />
                    <span>{customer.phone}</span>
                  </div>
                )}
                
                {customer.email && (
                  <div className="flex items-center text-gray-600">
                    <Mail className="h-4 w-4 mr-3 text-gray-400" />
                    <span>{customer.email}</span>
                  </div>
                )}
                
                {customer.instagram_handle && (
                  <div className="flex items-center text-gray-600">
                    <Instagram className="h-4 w-4 mr-3 text-gray-400" />
                    <a 
                      href={`https://instagram.com/${customer.instagram_handle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-pink-600 hover:text-pink-700"
                    >
                      @{customer.instagram_handle}
                    </a>
                  </div>
                )}
                
                {customer.address && (
                  <div className="flex items-start text-gray-600">
                    <MapPin className="h-4 w-4 mr-3 text-gray-400 mt-0.5" />
                    <span>{customer.address}</span>
                  </div>
                )}
                
                {customer.preferred_payment_method && (
                  <div className="flex items-center text-gray-600">
                    <DollarSign className="h-4 w-4 mr-3 text-gray-400" />
                    <span>Prefers: {customer.preferred_payment_method}</span>
                  </div>
                )}
                
                {customer.notes && (
                  <div className="flex items-start text-gray-600 pt-3 border-t">
                    <MessageSquare className="h-4 w-4 mr-3 text-gray-400 mt-0.5" />
                    <span className="text-sm">{customer.notes}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Customer Stats */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Stats</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Orders</span>
                <span className="font-semibold text-gray-900">{customer.order_count || 0}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Spent</span>
                <span className="font-semibold text-green-600">{formatCurrency(customer.total_spent || 0)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Average Order</span>
                <span className="font-semibold text-gray-900">
                  {customer.order_count ? formatCurrency((customer.total_spent || 0) / customer.order_count) : 'N/A'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Last Order</span>
                <span className="font-semibold text-gray-900">
                  {customer.last_order_date ? new Date(customer.last_order_date).toLocaleDateString() : 'Never'}
                </span>
              </div>
            </div>
          </div>

          {/* Favorite Products */}
          {productStats.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Products</h2>
              
              <div className="space-y-3">
                {productStats.slice(0, 5).map((stat, index) => (
                  <div key={stat.product_name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {index === 0 && <Star className="h-4 w-4 text-yellow-500" />}
                      <span className="text-sm text-gray-700">{stat.product_name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium text-gray-900">{stat.total_quantity}x</span>
                      <span className="text-xs text-gray-500 ml-2">{formatCurrency(stat.total_spent)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Order History */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Order History</h2>
            </div>
            
            <div className="space-y-4 p-6">
              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No orders yet</p>
                  <Link
                    href={`/admin/orders/new?customerId=${customer.id}`}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg inline-flex items-center space-x-2 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Create First Order</span>
                  </Link>
                </div>
              ) : (
                orders.map((order) => (
                  <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">
                            Order #{order.id.slice(-8).toUpperCase()}
                          </span>
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                            Completed
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(order.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-gray-900">
                          {formatCurrency(order.total_amount)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-3">
                      {order.order_items.slice(0, 3).map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            {item.products.name} × {item.quantity}
                          </span>
                          <span className="text-gray-900">{formatCurrency(item.total_price)}</span>
                        </div>
                      ))}
                      {order.order_items.length > 3 && (
                        <p className="text-sm text-gray-500">
                          +{order.order_items.length - 3} more items
                        </p>
                      )}
                    </div>
                    
                    <div className="flex justify-end">
                      <InvoicePDF orderData={order} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}