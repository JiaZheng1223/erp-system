'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/app/components/Header'
import { FaPlus, FaSearch, FaEdit, FaTrash, FaPhone, FaFax, FaIdCard, FaMapMarkerAlt, FaList, FaFileAlt } from 'react-icons/fa'
import { getDistributors, searchDistributors, deleteDistributor } from '@/lib/api/distributors'
import { getOrdersByDistributor } from '@/lib/api/orders'
import { Distributor } from '@/lib/supabase'
import { Order } from '@/lib/supabase'
import DistributorForm from './form'
import Link from 'next/link'

export default function DistributorsPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [distributors, setDistributors] = useState<Distributor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [selectedDistributor, setSelectedDistributor] = useState<number | null>(null)
  const [historyOrders, setHistoryOrders] = useState<Order[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(false)

  // 載入經銷商數據
  useEffect(() => {
    async function loadDistributors() {
      try {
        setLoading(true)
        const data = await getDistributors()
        setDistributors(data)
        setError(null)
      } catch (err) {
        console.error('Failed to load distributors:', err)
        setError('載入經銷商資料失敗')
      } finally {
        setLoading(false)
      }
    }

    loadDistributors()
  }, [])

  // 搜尋經銷商
  useEffect(() => {
    async function performSearch() {
      try {
        setLoading(true)
        if (!searchTerm || searchTerm.trim() === '') {
          // 如果搜尋詞為空，獲取所有經銷商
          const data = await getDistributors()
          setDistributors(data)
        } else {
          // 否則執行搜尋
          const data = await searchDistributors(searchTerm)
          setDistributors(data)
        }
      } catch (err) {
        console.error('Failed to search distributors:', err)
        setError('搜尋經銷商失敗')
      } finally {
        setLoading(false)
      }
    }

    const delaySearch = setTimeout(performSearch, 500)
    return () => clearTimeout(delaySearch)
  }, [searchTerm])

  // 檢視經銷商歷史訂購單
  const handleViewHistory = async (id: number) => {
    try {
      setSelectedDistributor(id)
      setLoadingHistory(true)
      const orders = await getOrdersByDistributor(id)
      setHistoryOrders(orders)
      setShowHistory(true)
      setLoadingHistory(false)
    } catch (err) {
      console.error('Failed to load distributor orders:', err)
      setError('載入經銷商訂購單失敗')
      setLoadingHistory(false)
    }
  }

  // 關閉歷史訂購單視圖
  const handleCloseHistory = () => {
    setShowHistory(false)
    setSelectedDistributor(null)
    setHistoryOrders([])
  }

  // 刪除經銷商
  const handleDelete = async (id: number) => {
    try {
      const success = await deleteDistributor(id)
      if (success) {
        setDistributors(distributors.filter(distributor => distributor.id !== id))
        setShowDeleteConfirm(null)
      } else {
        setError('刪除經銷商失敗')
      }
    } catch (err) {
      console.error('Failed to delete distributor:', err)
      setError('刪除經銷商失敗')
    }
  }

  // 處理表單成功提交
  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingId(null)
    // 重新加載數據
    getDistributors().then(data => setDistributors(data))
  }

  // 編輯經銷商
  const handleEdit = (id: number) => {
    setEditingId(id)
    setShowForm(true)
  }

  // 新增經銷商
  const handleAdd = () => {
    setEditingId(null)
    setShowForm(true)
  }

  // 取得經銷商名稱
  const getDistributorName = (id: number) => {
    const distributor = distributors.find(d => d.id === id)
    return distributor ? distributor.name : '未知經銷商'
  }

  // 格式化訂單狀態
  const formatOrderStatus = (status: string) => {
    const statusMap: Record<string, { text: string, color: string }> = {
      '待處理': { text: '待處理', color: 'bg-yellow-100 text-yellow-800' },
      '處理中': { text: '處理中', color: 'bg-blue-100 text-blue-800' },
      '待出貨': { text: '待出貨', color: 'bg-purple-100 text-purple-800' },
      '已完成': { text: '已完成', color: 'bg-green-100 text-green-800' }
    }
    return statusMap[status] || { text: status, color: 'bg-gray-100 text-gray-800' }
  }

  return (
    <div>
      <Header title="經銷商管理" subtitle="管理經銷商聯絡與信用資料" />
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {showForm ? (
        <DistributorForm 
          id={editingId || undefined} 
          onSuccess={handleFormSuccess} 
          onCancel={() => {
            setShowForm(false)
            setEditingId(null)
          }} 
        />
      ) : showHistory ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">
              {getDistributorName(selectedDistributor || 0)} 的歷史訂購單
            </h2>
            <button 
              className="btn btn-sm bg-gray-200 text-gray-800 hover:bg-gray-300"
              onClick={handleCloseHistory}
            >
              返回經銷商列表
            </button>
          </div>
          
          {loadingHistory ? (
            <div className="flex justify-center items-center h-32">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-gray-500">載入中...</p>
              </div>
            </div>
          ) : historyOrders.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">此經銷商沒有歷史訂購單記錄</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left">訂購單號</th>
                    <th className="px-4 py-2 text-left">日期</th>
                    <th className="px-4 py-2 text-left">客戶採購單號</th>
                    <th className="px-4 py-2 text-right">總金額</th>
                    <th className="px-4 py-2 text-center">狀態</th>
                    <th className="px-4 py-2 text-center">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {historyOrders.map(order => {
                    const status = formatOrderStatus(order.status)
                    return (
                      <tr key={order.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-2">{order.id}</td>
                        <td className="px-4 py-2">{order.order_date}</td>
                        <td className="px-4 py-2">{order.customer_po}</td>
                        <td className="px-4 py-2 text-right">${order.total_amount.toLocaleString()}</td>
                        <td className="px-4 py-2 text-center">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs ${status.color}`}>
                            {status.text}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-center">
                          <Link href={`/orders?id=${order.id}`} className="text-blue-600 hover:text-blue-800">
                            詳情
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <div className="relative w-64">
              <input
                type="text"
                placeholder="搜尋經銷商..."
                className="input pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
            
            <button 
              className="btn btn-primary flex items-center gap-2"
              onClick={handleAdd}
            >
              <FaPlus /> 新增經銷商
            </button>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-gray-500">載入中...</p>
              </div>
            </div>
          ) : distributors.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">沒有找到經銷商資料</p>
              <button 
                className="btn btn-primary mt-4"
                onClick={handleAdd}
              >
                新增第一個經銷商
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {distributors.map(distributor => (
                <div key={distributor.id} className="card relative">
                  <div className="absolute top-4 right-4 flex space-x-2">
                    <button 
                      className="p-1 text-blue-600 hover:text-blue-800"
                      onClick={() => handleEdit(distributor.id)}
                      title="編輯經銷商"
                    >
                      <FaEdit />
                    </button>
                    <button 
                      className="p-1 text-red-600 hover:text-red-800"
                      onClick={() => setShowDeleteConfirm(distributor.id)}
                      title="刪除經銷商"
                    >
                      <FaTrash />
                    </button>
                    <button 
                      className="p-1 text-green-600 hover:text-green-800"
                      onClick={() => handleViewHistory(distributor.id)}
                      title="查看歷史訂購單"
                    >
                      <FaFileAlt />
                    </button>
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-4">{distributor.name}</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <FaPhone className="text-gray-400 mr-3" />
                      <span>{distributor.phone}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <FaFax className="text-gray-400 mr-3" />
                      <span>{distributor.fax}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <FaIdCard className="text-gray-400 mr-3" />
                      <span>統一編號: {distributor.tax_id}</span>
                    </div>
                    
                    <div className="flex items-start">
                      <FaMapMarkerAlt className="text-gray-400 mr-3 mt-1" />
                      <span>{distributor.address}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button
                      className="btn btn-sm btn-outline flex items-center gap-1"
                      onClick={() => handleViewHistory(distributor.id)}
                    >
                      <FaList size={12} /> 歷史訂購單
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
      
      {/* 刪除確認對話框 */}
      {showDeleteConfirm !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-auto">
            <h3 className="text-lg font-medium mb-4">確認刪除</h3>
            <p className="mb-4">確定要刪除此經銷商嗎？此操作無法撤銷。</p>
            <div className="flex justify-end space-x-2">
              <button 
                className="btn bg-gray-200 text-gray-800 hover:bg-gray-300"
                onClick={() => setShowDeleteConfirm(null)}
              >
                取消
              </button>
              <button 
                className="btn bg-red-600 text-white hover:bg-red-700"
                onClick={() => handleDelete(showDeleteConfirm)}
              >
                確認刪除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 