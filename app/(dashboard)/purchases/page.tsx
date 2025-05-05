'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/app/components/Header'
import { FaPlus, FaSearch, FaEdit, FaTrash } from 'react-icons/fa'
import { getPurchases, searchPurchases, filterPurchasesByStatus, deletePurchase } from '@/lib/api/purchases'
import { Purchase } from '@/lib/supabase'
import PurchaseForm from './form'

// 採購單狀態選項
const statusOptions = ['草稿', '已送出', '部分到貨', '已完成']

export default function PurchasesPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  // 載入採購單數據
  useEffect(() => {
    async function loadPurchases() {
      try {
        setLoading(true)
        const data = await getPurchases()
        setPurchases(data)
        setError(null)
      } catch (err) {
        console.error('Failed to load purchases:', err)
        setError('載入採購單資料失敗')
      } finally {
        setLoading(false)
      }
    }

    loadPurchases()
  }, [])

  // 處理搜索和過濾
  useEffect(() => {
    async function performSearchAndFilter() {
      try {
        setLoading(true)
        let data: Purchase[] = []
        
        if (searchTerm) {
          // 如果有搜索詞，執行搜索
          data = await searchPurchases(searchTerm)
        } else if (statusFilter) {
          // 如果有狀態過濾條件，執行過濾
          data = await filterPurchasesByStatus(statusFilter)
        } else {
          // 否則獲取所有採購單
          data = await getPurchases()
        }
        
        setPurchases(data)
        setError(null)
      } catch (err) {
        console.error('Failed to search/filter purchases:', err)
        setError('搜尋或過濾採購單失敗')
      } finally {
        setLoading(false)
      }
    }

    const delaySearch = setTimeout(performSearchAndFilter, 500)
    return () => clearTimeout(delaySearch)
  }, [searchTerm, statusFilter])

  // 刪除採購單
  const handleDelete = async (id: string) => {
    try {
      const success = await deletePurchase(id)
      if (success) {
        setPurchases(purchases.filter(purchase => purchase.id !== id))
        setShowDeleteConfirm(null)
      } else {
        setError('刪除採購單失敗')
      }
    } catch (err) {
      console.error('Failed to delete purchase:', err)
      setError('刪除採購單失敗')
    }
  }

  // 處理表單成功提交
  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingId(null)
    // 重新加載數據
    getPurchases().then(data => setPurchases(data))
  }

  // 編輯採購單
  const handleEdit = (id: string) => {
    setEditingId(id)
    setShowForm(true)
  }

  // 新增採購單
  const handleAdd = () => {
    setEditingId(null)
    setShowForm(true)
  }

  return (
    <div>
      <Header title="採購單管理" subtitle="管理物料採購與進貨狀態" />
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {showForm ? (
        <PurchaseForm 
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
                  placeholder="搜尋採購單..."
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
              <FaPlus /> 新增採購單
            </button>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-gray-500">載入中...</p>
              </div>
            </div>
          ) : purchases.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">沒有找到採購單資料</p>
              <button 
                className="btn btn-primary mt-4"
                onClick={handleAdd}
              >
                新增第一個採購單
              </button>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead className="table-header">
                  <tr>
                    <th className="table-header-cell">採購單號</th>
                    <th className="table-header-cell">供應商</th>
                    <th className="table-header-cell">採購人員</th>
                    <th className="table-header-cell">採購日期</th>
                    <th className="table-header-cell">物料項數</th>
                    <th className="table-header-cell">狀態</th>
                    <th className="table-header-cell">操作</th>
                  </tr>
                </thead>
                <tbody className="table-body">
                  {purchases.map(purchase => (
                    <tr key={purchase.id} className="table-row">
                      <td className="table-cell font-medium">{purchase.id}</td>
                      <td className="table-cell">{purchase.supplier_name}</td>
                      <td className="table-cell">{purchase.purchaser}</td>
                      <td className="table-cell">{purchase.purchase_date}</td>
                      <td className="table-cell">
                        <span className="text-gray-500 text-sm">
                          查看詳情
                        </span>
                      </td>
                      <td className="table-cell">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          purchase.status === '草稿' ? 'bg-gray-100 text-gray-800' : 
                          purchase.status === '已送出' ? 'bg-blue-100 text-blue-800' :
                          purchase.status === '部分到貨' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {purchase.status}
                        </span>
                      </td>
                      <td className="table-cell">
                        <div className="flex space-x-2">
                          <button 
                            className="p-1 text-blue-600 hover:text-blue-800"
                            onClick={() => handleEdit(purchase.id)}
                          >
                            <FaEdit />
                          </button>
                          <button 
                            className="p-1 text-red-600 hover:text-red-800"
                            onClick={() => setShowDeleteConfirm(purchase.id)}
                          >
                            <FaTrash />
                          </button>
                        </div>
                        
                        {showDeleteConfirm === purchase.id && (
                          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white p-6 rounded-lg max-w-md w-full">
                              <h3 className="text-lg font-medium mb-4">確認刪除</h3>
                              <p className="mb-6">確定要刪除此採購單嗎？此操作不可恢復。</p>
                              <div className="flex justify-end space-x-2">
                                <button 
                                  className="btn bg-gray-200 text-gray-800 hover:bg-gray-300" 
                                  onClick={() => setShowDeleteConfirm(null)}
                                >
                                  取消
                                </button>
                                <button 
                                  className="btn btn-danger" 
                                  onClick={() => handleDelete(purchase.id)}
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