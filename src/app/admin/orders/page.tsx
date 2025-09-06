'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '../../../../lib/supabase'
import { formatCurrency } from '../../../../lib/currency'
import { Plus, Eye, Calendar, DollarSign, Trash2, Package, Truck, CheckCircle, Clock, AlertTriangle, CheckSquare, XCircle } from 'lucide-react'
import InvoicePDF from '../../../../components/invoice/InvoicePDF'

interface Order {
  id: string
  customer_name: string | null
  customer_phone: string | null
  customer_address: string | null
  total_amount: number
  created_at: string
  order_status: string
  packed_at: string | null
  shipped_at: string | null
  paid_at: string | null
  can_be_packed?: boolean
  items_with_shortage?: number
  order_items: {
    quantity: number
    unit_price: number
    total_price: number
    products: {
      name: string
      inventory_quantity: number
    }
  }[]
}

interface InventoryCheck {
  product_name: string
  required_quantity: number
  available_quantity: number
  shortage: number
  can_fulfill: boolean
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [updating, setUpdating] = useState<string | null>(null)
  const [showInventoryModal, setShowInventoryModal] = useState(false)
  const [selectedOrderForInventory, setSelectedOrderForInventory] = useState<string | null>(null)
  const [inventoryCheck, setInventoryCheck] = useState<InventoryCheck[]>([])
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [confirmAction, setConfirmAction] = useState<{orderId: string, newStatus: string, action: string} | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'received': return <Clock className="h-4 w-4" />
      case 'packed': return <Package className="h-4 w-4" />
      case 'shipped': return <Truck className="h-4 w-4" />
      case 'paid': return <CheckCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'received': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'packed': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'shipped': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'paid': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case 'received': return 'packed'
      case 'packed': return 'shipped'
      case 'shipped': return 'paid'
      case 'paid': return 'paid' // Already final
      default: return 'received'
    }
  }

  const checkInventoryForOrder = async (orderId: string): Promise<InventoryCheck[]> => {
    const { data, error } = await supabase.rpc('check_order_inventory_availability', { 
      order_id: orderId 
    })
    
    if (error) {
      console.error('Error checking inventory:', error)
      return []
    }
    
    return data || []
  }

  const handleStatusChange = (orderId: string, newStatus: string, currentStatus: string) => {
    const actionDescriptions = {
      'packed': 'pack this order (inventory will be reduced)',
      'shipped': 'mark this order as shipped',
      'paid': 'mark this order as paid',
      'received': 'move this order back to received (inventory will be restored if currently packed)'
    }

    const criticalActions = ['packed', 'received']
    const action = actionDescriptions[newStatus] || `update status to ${newStatus}`

    if (criticalActions.includes(newStatus) || (currentStatus === 'packed' && newStatus === 'received')) {
      setConfirmAction({ orderId, newStatus, action })
      setShowConfirmDialog(true)
    } else {
      updateOrderStatus(orderId, newStatus)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdating(orderId)
    try {
      const { error } = await supabase
        .from('orders')
        .update({ order_status: newStatus })
        .eq('id', orderId)

      if (error) {
        // Handle inventory shortage errors specifically
        if (error.message.includes('Insufficient inventory')) {
          const shortageDetails = error.message.split('Shortages: ')[1] || 'Unknown items'
          alert(`Cannot pack order due to insufficient inventory:\n\n${shortageDetails}\n\nPlease restock these items before packing the order.`)
        } else {
          throw error
        }
        return
      }
      
      // Refresh orders list
      await fetchOrders()
    } catch (error) {
      console.error('Error updating order status:', error)
      alert('Failed to update order status: ' + error.message)
    } finally {
      setUpdating(null)
    }
  }

  const showInventoryDetails = async (orderId: string) => {
    const inventory = await checkInventoryForOrder(orderId)
    setInventoryCheck(inventory)
    setSelectedOrderForInventory(orderId)
    setShowInventoryModal(true)
  }

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders_with_inventory_status')
        .select(`
          *,
          order_items (
            quantity,
            unit_price,
            total_price,
            products (
              name,
              inventory_quantity
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

  const filteredOrders = orders.filter(order => 
    statusFilter === 'all' || order.order_status === statusFilter
  )

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

  const formatTimestamp = (dateString: string | null, label: string) => {
    if (!dateString) return null
    return (
      <div className="text-xs text-gray-500 flex items-center space-x-1">
        <Clock className="h-3 w-3" />
        <span>{label}: {formatDate(dateString)}</span>
      </div>
    )
  }

  const getInventoryIcon = (order: Order) => {
    if (order.order_status === 'received') {
      if (order.can_be_packed) {
        return <CheckSquare className="h-4 w-4 text-green-600" title="Inventory available" />
      } else {
        return <AlertTriangle className="h-4 w-4 text-red-600" title={`${order.items_with_shortage} items have insufficient stock`} />
      }
    }
    return null
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

      {/* Status Filter */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-900"
          >
            <option value="all">All Orders ({orders.length})</option>
            <option value="received">Received ({orders.filter(o => o.order_status === 'received').length})</option>
            <option value="packed">Packed ({orders.filter(o => o.order_status === 'packed').length})</option>
            <option value="shipped">Shipped ({orders.filter(o => o.order_status === 'shipped').length})</option>
            <option value="paid">Paid ({orders.filter(o => o.order_status === 'paid').length})</option>
          </select>
          <div className="text-sm text-gray-500">
            Showing {filteredOrders.length} of {orders.length} orders
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <div key={order.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Order #{order.id.slice(-8).toUpperCase()}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center space-x-1 ${getStatusColor(order.order_status)}`}>
                      {getStatusIcon(order.order_status)}
                      <span className="capitalize">{order.order_status}</span>
                    </span>
                    {getInventoryIcon(order)}
                  </div>
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
                
                {/* Status Timestamps */}
                <div className="mt-2 space-y-1">
                  {formatTimestamp(order.packed_at, 'Packed')}
                  {formatTimestamp(order.shipped_at, 'Shipped')}
                  {formatTimestamp(order.paid_at, 'Paid')}
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

            {/* Status Management and Actions */}
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center space-x-2">
                {order.order_status !== 'paid' && (
                  <button
                    onClick={() => handleStatusChange(order.id, getNextStatus(order.order_status), order.order_status)}
                    disabled={updating === order.id || (order.order_status === 'received' && !order.can_be_packed)}
                    className={`px-3 py-1 rounded text-sm flex items-center space-x-1 transition-colors disabled:opacity-50 ${
                      order.order_status === 'received' && !order.can_be_packed 
                        ? 'bg-gray-400 text-white cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                    title={order.order_status === 'received' && !order.can_be_packed 
                      ? 'Cannot pack - insufficient inventory' 
                      : `Mark as ${getNextStatus(order.order_status)}`}
                  >
                    {updating === order.id ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                    ) : (
                      getStatusIcon(getNextStatus(order.order_status))
                    )}
                    <span>Mark as {getNextStatus(order.order_status)}</span>
                  </button>
                )}
                
                {order.order_status === 'received' && !order.can_be_packed && (
                  <button
                    onClick={() => showInventoryDetails(order.id)}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded text-sm flex items-center space-x-1 transition-colors"
                  >
                    <AlertTriangle className="h-3 w-3" />
                    <span>Check Inventory</span>
                  </button>
                )}
                
                <select
                  value={order.order_status}
                  onChange={(e) => handleStatusChange(order.id, e.target.value, order.order_status)}
                  disabled={updating === order.id}
                  className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-900 disabled:opacity-50"
                >
                  <option value="received">Received</option>
                  <option value="packed" disabled={order.order_status === 'received' && !order.can_be_packed}>
                    Packed {order.order_status === 'received' && !order.can_be_packed && '(Insufficient Inventory)'}
                  </option>
                  <option value="shipped">Shipped</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
              
              <InvoicePDF orderData={order} />
            </div>
          </div>
        ))}

        {filteredOrders.length === 0 && orders.length > 0 && (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow p-8">
              <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-500 mb-4">No orders match the selected status filter</p>
            </div>
          </div>
        )}

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

      {/* Confirmation Dialog */}
      {showConfirmDialog && confirmAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
              <h3 className="text-lg font-semibold text-gray-900">Confirm Status Change</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to {confirmAction.action}?
              {confirmAction.newStatus === 'packed' && (
                <span className="block mt-2 text-sm text-orange-700 font-medium">
                  This will reduce inventory quantities for all items in this order.
                </span>
              )}
              {confirmAction.newStatus === 'received' && (
                <span className="block mt-2 text-sm text-blue-700 font-medium">
                  This will restore inventory quantities if the order was previously packed.
                </span>
              )}
            </p>
            
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => {
                  setShowConfirmDialog(false)
                  setConfirmAction(null)
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (confirmAction) {
                    updateOrderStatus(confirmAction.orderId, confirmAction.newStatus)
                  }
                  setShowConfirmDialog(false)
                  setConfirmAction(null)
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Details Modal */}
      {showInventoryModal && selectedOrderForInventory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-6 w-6 text-red-600" />
                <h3 className="text-lg font-semibold text-gray-900">Inventory Check</h3>
              </div>
              <button
                onClick={() => {
                  setShowInventoryModal(false)
                  setSelectedOrderForInventory(null)
                  setInventoryCheck([])
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-gray-600">
                Order #{selectedOrderForInventory.slice(-8).toUpperCase()} cannot be packed due to insufficient inventory:
              </p>
            </div>
            
            <div className="space-y-3">
              {inventoryCheck.map((item, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    item.can_fulfill 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{item.product_name}</h4>
                    <div className="flex items-center space-x-2">
                      {item.can_fulfill ? (
                        <CheckSquare className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      )}
                      <span className={`text-sm font-medium ${
                        item.can_fulfill ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {item.can_fulfill ? 'Available' : 'Shortage'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Required:</span>
                      <div className="font-medium">{item.required_quantity}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Available:</span>
                      <div className="font-medium">{item.available_quantity}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Shortage:</span>
                      <div className={`font-medium ${
                        item.shortage > 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {item.shortage > 0 ? `-${item.shortage}` : '0'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Next Steps:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Restock the items that are showing shortages</li>
                <li>• Update inventory quantities in the products section</li>
                <li>• Return to this order to pack it once inventory is available</li>
              </ul>
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                onClick={() => {
                  setShowInventoryModal(false)
                  setSelectedOrderForInventory(null)
                  setInventoryCheck([])
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}