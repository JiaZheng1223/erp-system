'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/app/components/Header'
import { FaPlus, FaSearch, FaEdit, FaTrash } from 'react-icons/fa'
import { getMaterials, searchMaterials, filterMaterials, deleteMaterial } from '@/lib/api/materials'
import { Material } from '@/lib/supabase'
import MaterialForm from './form'

// 物料類別選項
const categoryOptions = ['貼合鐵網濾材', '無鐵網濾材', '袋型濾材', '迷你摺濾材', '無']

// 效率選項
const efficiencyOptions = ['35%', '45%', '65%', '85%', '95%', '無']

export default function MaterialsPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [efficiencyFilter, setEfficiencyFilter] = useState('')
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  
  // 載入物料數據
  useEffect(() => {
    async function loadMaterials() {
      try {
        setLoading(true)
        const data = await getMaterials()
        setMaterials(data)
        setError(null)
      } catch (err) {
        console.error('Failed to load materials:', err)
        setError('載入物料資料失敗')
      } finally {
        setLoading(false)
      }
    }

    loadMaterials()
  }, [])

  // 處理搜索和過濾
  useEffect(() => {
    async function performSearchAndFilter() {
      try {
        setLoading(true)
        let data: Material[] = []
        
        if (searchTerm) {
          // 如果有搜索詞，執行搜索
          data = await searchMaterials(searchTerm)
        } else if (categoryFilter || efficiencyFilter) {
          // 如果有過濾條件，執行過濾
          data = await filterMaterials(categoryFilter || undefined, efficiencyFilter || undefined)
        } else {
          // 否則獲取所有物料
          data = await getMaterials()
        }
        
        setMaterials(data)
      } catch (err) {
        console.error('Failed to search/filter materials:', err)
        setError('搜尋或過濾物料失敗')
      } finally {
        setLoading(false)
      }
    }

    const delaySearch = setTimeout(performSearchAndFilter, 500)
    return () => clearTimeout(delaySearch)
  }, [searchTerm, categoryFilter, efficiencyFilter])

  // 刪除物料
  const handleDelete = async (id: number) => {
    try {
      const success = await deleteMaterial(id)
      if (success) {
        setMaterials(materials.filter(material => material.id !== id))
        setShowDeleteConfirm(null)
      } else {
        setError('刪除物料失敗')
      }
    } catch (err) {
      console.error('Failed to delete material:', err)
      setError('刪除物料失敗')
    }
  }

  // 處理表單成功提交
  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingId(null)
    // 重新加載數據
    getMaterials().then(data => setMaterials(data))
  }

  // 編輯物料
  const handleEdit = (id: number) => {
    setEditingId(id)
    setShowForm(true)
  }

  // 新增物料
  const handleAdd = () => {
    setEditingId(null)
    setShowForm(true)
  }

  return (
    <div>
      <Header title="物料管理" subtitle="管理工業過濾網物料資訊" />
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {showForm ? (
        <MaterialForm 
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
                  placeholder="搜尋物料..."
                  className="input pl-10 w-full md:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
              </div>
              
              <select 
                className="input"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">所有類別</option>
                {categoryOptions.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              
              <select 
                className="input"
                value={efficiencyFilter}
                onChange={(e) => setEfficiencyFilter(e.target.value)}
              >
                <option value="">所有效率</option>
                {efficiencyOptions.map(efficiency => (
                  <option key={efficiency} value={efficiency}>{efficiency}</option>
                ))}
              </select>
            </div>
            
            <button 
              className="btn btn-primary flex items-center gap-2 whitespace-nowrap"
              onClick={handleAdd}
            >
              <FaPlus /> 新增物料
            </button>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-gray-500">載入中...</p>
              </div>
            </div>
          ) : materials.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">沒有找到物料資料</p>
              <button 
                className="btn btn-primary mt-4"
                onClick={handleAdd}
              >
                新增第一個物料
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {materials.map(material => (
                <div key={material.id} className="card relative">
                  <div className="absolute top-4 right-4 flex space-x-2">
                    <button 
                      className="p-1 text-blue-600 hover:text-blue-800"
                      onClick={() => handleEdit(material.id)}
                    >
                      <FaEdit />
                    </button>
                    <button 
                      className="p-1 text-red-600 hover:text-red-800"
                      onClick={() => setShowDeleteConfirm(material.id)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                  
                  <div className="mb-4 bg-gray-100 h-40 rounded flex items-center justify-center">
                    {material.image_url ? (
                      <img 
                        src={material.image_url} 
                        alt={material.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <div className="text-gray-400">無圖片</div>
                    )}
                  </div>
                  
                  <div className="flex justify-between mb-2">
                    <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">{material.category}</span>
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">{material.efficiency}</span>
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-2 line-clamp-2">{material.name}</h3>
                  
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">目前庫存</span>
                    <span className={`font-medium ${material.stock <= material.safety_stock ? 'text-red-600' : 'text-gray-700'}`}>
                      {material.stock}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm mb-3">
                    <span className="text-gray-500">安全庫存量</span>
                    <span className="font-medium text-gray-700">{material.safety_stock}</span>
                  </div>
                  
                  {material.notes && (
                    <div className="text-sm text-gray-500 border-t pt-2">
                      <p className="line-clamp-2">{material.notes}</p>
                    </div>
                  )}
                  
                  {showDeleteConfirm === material.id && (
                    <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center rounded-lg p-4">
                      <div className="text-center">
                        <p className="mb-4">確定要刪除此物料？</p>
                        <div className="flex justify-center space-x-2">
                          <button 
                            className="btn bg-gray-200 text-gray-800 hover:bg-gray-300" 
                            onClick={() => setShowDeleteConfirm(null)}
                          >
                            取消
                          </button>
                          <button 
                            className="btn btn-danger" 
                            onClick={() => handleDelete(material.id)}
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
        </>
      )}
    </div>
  )
} 