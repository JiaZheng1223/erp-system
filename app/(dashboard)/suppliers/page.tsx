'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/app/components/Header'
import { FaPlus, FaSearch, FaEdit, FaTrash, FaPhone, FaFax, FaIdCard, FaMapMarkerAlt, FaList, FaFileAlt } from 'react-icons/fa'
import { getSuppliers, searchSuppliers, deleteSupplier } from '@/lib/api/suppliers'
import { getPurchasesBySupplier } from '@/lib/api/purchases'
import { Supplier } from '@/lib/supabase'
import { Purchase } from '@/lib/supabase'
import SupplierForm from './form'
import Link from 'next/link'

export default function SuppliersPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [selectedSupplier, setSelectedSupplier] = useState<number | null>(null)
  const [historyPurchases, setHistoryPurchases] = useState<Purchase[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(false)

  // 載入物料商數據
  useEffect(() => {
    async function loadSuppliers() {
      try {
        setLoading(true)
        const data = await getSuppliers()
        setSuppliers(data)
        setError(null)
      } catch (err) {
        console.error('Failed to load suppliers:', err)
        setError('載入物料商資料失敗')
      } finally {
        setLoading(false)
      }
    }

    loadSuppliers()
  }, [])

  // 搜尋物料商
  useEffect(() => {
    async function performSearch() {
      try {
        setLoading(true)
        if (!searchTerm || searchTerm.trim() === '') {
          // 如果搜尋詞為空，獲取所有物料商
          const data = await getSuppliers()
          setSuppliers(data)
        } else {
          // 否則執行搜尋
          const data = await searchSuppliers(searchTerm)
          setSuppliers(data)
        }
      } catch (err) {
        console.error('Failed to search suppliers:', err)
        setError('搜尋物料商失敗')
      } finally {
        setLoading(false)
      }
    }

    const delaySearch = setTimeout(performSearch, 500)
    return () => clearTimeout(delaySearch)
  }, [searchTerm])

  // 檢視物料商歷史採購單
  const handleViewHistory = async (id: number) => {
    try {
      setSelectedSupplier(id)
      setLoadingHistory(true)
      const purchases = await getPurchasesBySupplier(id)
      setHistoryPurchases(purchases)
      setShowHistory(true)
      setLoadingHistory(false)
    } catch (err) {
      console.error('Failed to load supplier purchases:', err)
      setError('載入物料商採購單失敗')
      setLoadingHistory(false)
    }
  }

  // 關閉歷史採購單視圖
  const handleCloseHistory = () => {
    setShowHistory(false)
    setSelectedSupplier(null)
    setHistoryPurchases([])
  }

  // 刪除物料商
  const handleDelete = async (id: number) => {
    try {
      const success = await deleteSupplier(id)
      if (success) {
        setSuppliers(suppliers.filter(supplier => supplier.id !== id))
        setShowDeleteConfirm(null)
      } else {
        setError('刪除物料商失敗')
      }
    } catch (err) {
      console.error('Failed to delete supplier:', err)
      setError('刪除物料商失敗')
    }
  }

  // 處理表單成功提交
  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingId(null)
    // 重新加載數據
    getSuppliers().then(data => setSuppliers(data))
  }

  // 編輯物料商
  const handleEdit = (id: number) => {
    setEditingId(id)
    setShowForm(true)
  }

  // 新增物料商
  const handleAdd = () => {
    setEditingId(null)
    setShowForm(true)
  }

  // 取得物料商名稱
  const getSupplierName = (id: number) => {
    const supplier = suppliers.find(s => s.id === id)
    return supplier ? supplier.name : '未知物料商'
  }

  // 格式化採購單狀態
  const formatPurchaseStatus = (status: string) => {
    const statusMap: Record<string, { text: string, color: string }> = {
      '草稿': { text: '草稿', color: 'bg-gray-100 text-gray-800' },
      '已送出': { text: '已送出', color: 'bg-blue-100 text-blue-800' },
      '部分到貨': { text: '部分到貨', color: 'bg-yellow-100 text-yellow-800' },
      '已完成': { text: '已完成', color: 'bg-green-100 text-green-800' }
    }
    return statusMap[status] || { text: status, color: 'bg-gray-100 text-gray-800' }
  }

  return (
    <div>
      <Header title="物料商管理" subtitle="管理物料供應商聯絡資料" />
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {showForm ? (
        <SupplierForm 
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
              {getSupplierName(selectedSupplier || 0)} 的歷史採購單
            </h2>
            <button 
              className="btn btn-sm bg-gray-200 text-gray-800 hover:bg-gray-300"
              onClick={handleCloseHistory}
            >
              返回物料商列表
            </button>
          </div>
          
          {loadingHistory ? (
            <div className="flex justify-center items-center h-32">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-gray-500">載入中...</p>
              </div>
            </div>
          ) : historyPurchases.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">此物料商沒有歷史採購單記錄</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left">採購單號</th>
                    <th className="px-4 py-2 text-left">日期</th>
                    <th className="px-4 py-2 text-left">採購人員</th>
                    <th className="px-4 py-2 text-right">總金額</th>
                    <th className="px-4 py-2 text-center">狀態</th>
                    <th className="px-4 py-2 text-center">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {historyPurchases.map(purchase => {
                    const status = formatPurchaseStatus(purchase.status)
                    return (
                      <tr key={purchase.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-2">{purchase.id}</td>
                        <td className="px-4 py-2">{purchase.purchase_date}</td>
                        <td className="px-4 py-2">{purchase.purchaser}</td>
                        <td className="px-4 py-2 text-right">${(purchase.total_amount || 0).toLocaleString()}</td>
                        <td className="px-4 py-2 text-center">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs ${status.color}`}>
                            {status.text}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-center">
                          <Link href={`/purchases?id=${purchase.id}`} className="text-blue-600 hover:text-blue-800">
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
                placeholder="搜尋物料商..."
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
              <FaPlus /> 新增物料商
            </button>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-gray-500">載入中...</p>
              </div>
            </div>
          ) : suppliers.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">沒有找到物料商資料</p>
              <button 
                className="btn btn-primary mt-4"
                onClick={handleAdd}
              >
                新增第一個物料商
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {suppliers.map(supplier => (
                <div key={supplier.id} className="card relative">
                  <div className="absolute top-4 right-4 flex space-x-2">
                    <button 
                      className="p-1 text-blue-600 hover:text-blue-800"
                      onClick={() => handleEdit(supplier.id)}
                      title="編輯物料商"
                    >
                      <FaEdit />
                    </button>
                    <button 
                      className="p-1 text-red-600 hover:text-red-800"
                      onClick={() => setShowDeleteConfirm(supplier.id)}
                      title="刪除物料商"
                    >
                      <FaTrash />
                    </button>
                    <button 
                      className="p-1 text-green-600 hover:text-green-800"
                      onClick={() => handleViewHistory(supplier.id)}
                      title="查看歷史採購單"
                    >
                      <FaFileAlt />
                    </button>
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-4">{supplier.name}</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <FaPhone className="text-gray-400 mr-3" />
                      <span>{supplier.phone}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <FaFax className="text-gray-400 mr-3" />
                      <span>{supplier.fax}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <FaIdCard className="text-gray-400 mr-3" />
                      <span>統一編號: {supplier.tax_id}</span>
                    </div>
                    
                    <div className="flex items-start">
                      <FaMapMarkerAlt className="text-gray-400 mr-3 mt-1" />
                      <span>{supplier.address}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button
                      className="btn btn-sm btn-outline flex items-center gap-1"
                      onClick={() => handleViewHistory(supplier.id)}
                    >
                      <FaList size={12} /> 歷史採購單
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
            <p className="mb-4">確定要刪除此物料商嗎？此操作無法撤銷。</p>
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