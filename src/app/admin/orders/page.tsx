'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '../../../../lib/supabase'
import { formatCurrency } from '../../../../lib/currency'
import { Plus, Eye, Calendar, DollarSign, Trash2 } from 'lucide-react'
import InvoicePDF from '../../../../components/invoice/InvoicePDF'

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

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
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
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteOrder = async (orderId: string, _orderItems: any[]) => {
    const orderNumber = orderId.slice(-8).toUpperCase()
    
    if (!confirm(`Are you sure you want to delete Order #${orderNumber}? This will restore the inventory for all items in this order.`)) {
      return
    }

    try {
      // Delete the order (order_items will be deleted automatically due to CASCADE)
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId)

      if (error) throw error

      // The database triggers will automatically restore inventory
      // when order_items are deleted due to CASCADE
      
      // Refresh the orders list
      await fetchOrders()
      
      alert(`Order #${orderNumber} deleted successfully. Inventory has been restored.`)
    } catch (error) {
      console.error('Error deleting order:', error)
      alert('Error deleting order')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="mt-1 text-gray-600">View and manage customer orders</p>
        </div>
        <Link
          href="/admin/orders/new"
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>New Order</span>
        </Link>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Order #{order.id.slice(-8).toUpperCase()}
                  </h3>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                    Completed
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(order.created_at)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <DollarSign className="h-4 w-4" />
                    <span>{formatCurrency(order.total_amount)}</span>
                  </div>
                  <div>
                    {order.customer_name && (
                      <span>Customer: {order.customer_name}</span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => deleteOrder(order.id, order.order_items)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                title="Delete Order"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>

            {/* Customer Info */}
            {(order.customer_name || order.customer_phone || order.customer_address) && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Customer Information</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  {order.customer_name && <div>Name: {order.customer_name}</div>}
                  {order.customer_phone && <div>Phone: {order.customer_phone}</div>}
                  {order.customer_address && <div>Address: {order.customer_address}</div>}
                </div>
              </div>
            )}

            {/* Order Items */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Items Ordered</h4>
              <div className="space-y-2">
                {order.order_items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                    <div className="flex-1">
                      <span className="font-medium text-gray-900">{item.products.name}</span>
                      <span className="text-gray-500 ml-2">× {item.quantity}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(item.total_price)}</div>
                      <div className="text-sm text-gray-500">{formatCurrency(item.unit_price)} each</div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between items-center pt-4 border-t border-gray-200 mt-4">
                <span className="text-lg font-semibold text-gray-900">Total:</span>
                <span className="text-lg font-semibold text-gray-900">{formatCurrency(order.total_amount)}</span>
              </div>
            </div>

            {/* Invoice Download */}
            <div className="flex justify-end mt-4 pt-4 border-t border-gray-100">
              <InvoicePDF orderData={order} />
            </div>
          </div>
        ))}

        {orders.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow p-8">
              <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
              <p className="text-gray-500 mb-4">Start by creating your first customer order</p>
              <Link
                href="/admin/orders/new"
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg inline-flex items-center space-x-2 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Create First Order</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}