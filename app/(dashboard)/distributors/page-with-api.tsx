'use client'

import { useState, useEffect } from 'react'
import Header from '@/app/components/Header'
import { FaPlus, FaSearch, FaEdit, FaTrash, FaPhone, FaFax, FaIdCard, FaMapMarkerAlt } from 'react-icons/fa'
import { getDistributors, searchDistributors, deleteDistributor } from '@/lib/api/distributors'
import { Distributor } from '@/lib/supabase'

export default function DistributorsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [distributors, setDistributors] = useState<Distributor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null)

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
      if (!searchTerm || searchTerm.trim() === '') {
        // 如果搜尋詞為空，獲取所有經銷商
        const data = await getDistributors()
        setDistributors(data)
      } else {
        // 否則執行搜尋
        const data = await searchDistributors(searchTerm)
        setDistributors(data)
      }
    }

    const delaySearch = setTimeout(performSearch, 500)
    return () => clearTimeout(delaySearch)
  }, [searchTerm])

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

  return (
    <div>
      <Header title="經銷商管理" subtitle="管理經銷商聯絡與信用資料" />
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
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
        
        <button className="btn btn-primary flex items-center gap-2">
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
          <button className="btn btn-primary mt-4">新增第一個經銷商</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {distributors.map(distributor => (
            <div key={distributor.id} className="card relative">
              <div className="absolute top-4 right-4 flex space-x-2">
                <button className="p-1 text-blue-600 hover:text-blue-800">
                  <FaEdit />
                </button>
                <button 
                  className="p-1 text-red-600 hover:text-red-800"
                  onClick={() => setShowDeleteConfirm(distributor.id)}
                >
                  <FaTrash />
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

                {distributor.notes && (
                  <div className="text-sm text-gray-500 border-t pt-2 mt-2">
                    {distributor.notes}
                  </div>
                )}
              </div>
              
              {showDeleteConfirm === distributor.id && (
                <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center rounded-lg p-4">
                  <div className="text-center">
                    <p className="mb-4">確定要刪除此經銷商？</p>
                    <div className="flex justify-center space-x-2">
                      <button 
                        className="btn bg-gray-200 text-gray-800 hover:bg-gray-300" 
                        onClick={() => setShowDeleteConfirm(null)}
                      >
                        取消
                      </button>
                      <button 
                        className="btn btn-danger" 
                        onClick={() => handleDelete(distributor.id)}
                      >
                        確認刪除
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 