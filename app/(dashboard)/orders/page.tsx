'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/app/components/Header'
import { FaPlus, FaSearch, FaEdit, FaTrash } from 'react-icons/fa'
import { getOrders, searchOrders, filterOrdersByStatus, deleteOrder } from '@/lib/api/orders'
import { Order } from '@/lib/supabase'
import OrderForm from './form'

// 訂單狀態選項
const statusOptions = ['待處理', '處理中', '待出貨', '已完成']

export default function OrdersPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  // 載入訂購單數據
  useEffect(() => {
    async function loadOrders() {
      try {
        setLoading(true)
        const data = await getOrders()
        setOrders(data)
        setError(null)
      } catch (err) {
        console.error('Failed to load orders:', err)
        setError('載入訂購單資料失敗')
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [])

  // 處理搜索和過濾
  useEffect(() => {
    async function performSearchAndFilter() {
      try {
        setLoading(true)
        let data: Order[] = []
        
        if (searchTerm) {
          // 如果有搜索詞，執行搜索
          data = await searchOrders(searchTerm)
        } else if (statusFilter) {
          // 如果有狀態過濾條件，執行過濾
          data = await filterOrdersByStatus(statusFilter)
        } else {
          // 否則獲取所有訂購單
          data = await getOrders()
        }
        
        setOrders(data)
        setError(null)
      } catch (err) {
        console.error('Failed to search/filter orders:', err)
        setError('搜尋或過濾訂購單失敗')
      } finally {
        setLoading(false)
      }
    }

    const delaySearch = setTimeout(performSearchAndFilter, 500)
    return () => clearTimeout(delaySearch)
  }, [searchTerm, statusFilter])

  // 刪除訂購單
  const handleDelete = async (id: string) => {
    try {
      const success = await deleteOrder(id)
      if (success) {
        setOrders(orders.filter(order => order.id !== id))
        setShowDeleteConfirm(null)
      } else {
        setError('刪除訂購單失敗')
      }
    } catch (err) {
      console.error('Failed to delete order:', err)
      setError('刪除訂購單失敗')
    }
  }

  // 處理表單成功提交
  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingId(null)
    // 重新加載數據
    getOrders().then(data => setOrders(data))
  }

  // 編輯訂購單
  const handleEdit = (id: string) => {
    setEditingId(id)
    setShowForm(true)
  }

  // 新增訂購單
  const handleAdd = () => {
    setEditingId(null)
    setShowForm(true)
  }

  return (
    <div>
      <Header title="訂購單管理" subtitle="管理客戶訂單與出貨狀態" />
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {showForm ? (
        <OrderForm 
          id={editingId || undefined} 
          onSuccess={handleFormSuccess} 
          onCancel={() => {
            setShowForm(false)
            setEditingId(null)
          }} 
        />
      ) : (
        <>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="w-full md:w-auto flex flex-col md:flex-row gap-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="搜尋訂購單..."
                  className="input pl-10 w-full md:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
              </div>
              
              <select 
                className="input"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">所有狀態</option>
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            
            <button 
              className="btn btn-primary flex items-center gap-2"
              onClick={handleAdd}
            >
              <FaPlus /> 新增訂購單
            </button>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-gray-500">載入中...</p>
              </div>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">沒有找到訂購單資料</p>
              <button 
                className="btn btn-primary mt-4"
                onClick={handleAdd}
              >
                新增第一個訂購單
              </button>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead className="table-header">
                  <tr>
                    <th className="table-header-cell">訂購單號</th>
                    <th className="table-header-cell">經銷商</th>
                    <th className="table-header-cell">客戶採購單號</th>
                    <th className="table-header-cell">訂購日期</th>
                    <th className="table-header-cell">預計交貨日</th>
                    <th className="table-header-cell">總金額</th>
                    <th className="table-header-cell">狀態</th>
                    <th className="table-header-cell">操作</th>
                  </tr>
                </thead>
                <tbody className="table-body">
                  {orders.map(order => (
                    <tr key={order.id} className="table-row">
                      <td className="table-cell font-medium">{order.id}</td>
                      <td className="table-cell">{order.distributor_name}</td>
                      <td className="table-cell">{order.customer_po}</td>
                      <td className="table-cell">{order.order_date}</td>
                      <td className="table-cell">{order.delivery_date}</td>
                      <td className="table-cell">${order.total_amount.toLocaleString()}</td>
                      <td className="table-cell">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === '待處理' ? 'bg-blue-100 text-blue-800' : 
                          order.status === '處理中' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === '待出貨' ? 'bg-purple-100 text-purple-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="table-cell">
                        <div className="flex space-x-2">
                          <button 
                            className="p-1 text-blue-600 hover:text-blue-800"
                            onClick={() => handleEdit(order.id)}
                          >
                            <FaEdit />
                          </button>
                          <button 
                            className="p-1 text-red-600 hover:text-red-800"
                            onClick={() => setShowDeleteConfirm(order.id)}
                          >
                            <FaTrash />
                          </button>
                        </div>
                        
                        {showDeleteConfirm === order.id && (
                          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white p-6 rounded-lg max-w-md w-full">
                              <h3 className="text-lg font-medium mb-4">確認刪除</h3>
                              <p className="mb-6">確定要刪除此訂購單嗎？此操作不可恢復。</p>
                              <div className="flex justify-end space-x-2">
                                <button 
                                  className="btn bg-gray-200 text-gray-800 hover:bg-gray-300" 
                                  onClick={() => setShowDeleteConfirm(null)}
                                >
                                  取消
                                </button>
                                <button 
                                  className="btn btn-danger" 
                                  onClick={() => handleDelete(order.id)}
                                >
                                  確認刪除
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
} 