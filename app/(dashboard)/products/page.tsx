'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/app/components/Header'
import { FaPlus, FaSearch, FaEdit, FaTrash } from 'react-icons/fa'
import { getProducts, searchProducts, filterProducts, deleteProduct } from '@/lib/api/products'
import { Product } from '@/lib/supabase'
import ProductForm from './form'

// 成品類別選項
const categoryOptions = ['紙框', '鐵框', '迷你摺', '袋型濾網', '無']

// 效率選項
const efficiencyOptions = ['35%', '45%', '65%', '85%', '95%', '無']

export default function ProductsPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [efficiencyFilter, setEfficiencyFilter] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  
  // 載入成品數據
  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true)
        const data = await getProducts()
        setProducts(data)
        setError(null)
      } catch (err) {
        console.error('Failed to load products:', err)
        setError('載入成品資料失敗')
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  // 處理搜索和過濾
  useEffect(() => {
    async function performSearchAndFilter() {
      try {
        setLoading(true)
        let data: Product[] = []
        
        if (searchTerm) {
          // 如果有搜索詞，執行搜索
          data = await searchProducts(searchTerm)
        } else if (categoryFilter || efficiencyFilter) {
          // 如果有過濾條件，執行過濾
          data = await filterProducts(categoryFilter || undefined, efficiencyFilter || undefined)
        } else {
          // 否則獲取所有成品
          data = await getProducts()
        }
        
        setProducts(data)
      } catch (err) {
        console.error('Failed to search/filter products:', err)
        setError('搜尋或過濾成品失敗')
      } finally {
        setLoading(false)
      }
    }

    const delaySearch = setTimeout(performSearchAndFilter, 500)
    return () => clearTimeout(delaySearch)
  }, [searchTerm, categoryFilter, efficiencyFilter])

  // 刪除成品
  const handleDelete = async (id: number) => {
    try {
      const success = await deleteProduct(id)
      if (success) {
        setProducts(products.filter(product => product.id !== id))
        setShowDeleteConfirm(null)
      } else {
        setError('刪除成品失敗')
      }
    } catch (err) {
      console.error('Failed to delete product:', err)
      setError('刪除成品失敗')
    }
  }

  // 處理表單成功提交
  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingId(null)
    // 重新加載數據
    getProducts().then(data => setProducts(data))
  }

  // 編輯成品
  const handleEdit = (id: number) => {
    setEditingId(id)
    setShowForm(true)
  }

  // 新增成品
  const handleAdd = () => {
    setEditingId(null)
    setShowForm(true)
  }

  return (
    <div>
      <Header title="成品管理" subtitle="管理工業過濾網成品資訊" />
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {showForm ? (
        <ProductForm 
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
                  placeholder="搜尋成品..."
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
              <FaPlus /> 新增成品
            </button>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-gray-500">載入中...</p>
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">沒有找到成品資料</p>
              <button 
                className="btn btn-primary mt-4"
                onClick={handleAdd}
              >
                新增第一個成品
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map(product => (
                <div key={product.id} className="card relative">
                  <div className="absolute top-4 right-4 flex space-x-2">
                    <button 
                      className="p-1 text-blue-600 hover:text-blue-800"
                      onClick={() => handleEdit(product.id)}
                    >
                      <FaEdit />
                    </button>
                    <button 
                      className="p-1 text-red-600 hover:text-red-800"
                      onClick={() => setShowDeleteConfirm(product.id)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                  
                  <div className="mb-4 bg-gray-100 h-40 rounded flex items-center justify-center">
                    {product.image_url ? (
                      <img 
                        src={product.image_url} 
                        alt={product.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <div className="text-gray-400">無圖片</div>
                    )}
                  </div>
                  
                  <div className="flex justify-between mb-2">
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">{product.category}</span>
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">{product.efficiency}</span>
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-2 line-clamp-2">{product.name}</h3>
                  
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">目前庫存</span>
                    <span className={`font-medium ${product.stock <= product.safety_stock ? 'text-red-600' : 'text-gray-700'}`}>
                      {product.stock}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm mb-3">
                    <span className="text-gray-500">安全庫存量</span>
                    <span className="font-medium text-gray-700">{product.safety_stock}</span>
                  </div>
                  
                  {product.notes && (
                    <div className="text-sm text-gray-500 border-t pt-2">
                      <p className="line-clamp-2">{product.notes}</p>
                    </div>
                  )}
                  
                  {showDeleteConfirm === product.id && (
                    <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center rounded-lg p-4">
                      <div className="text-center">
                        <p className="mb-4">確定要刪除此成品？</p>
                        <div className="flex justify-center space-x-2">
                          <button 
                            className="btn bg-gray-200 text-gray-800 hover:bg-gray-300" 
                            onClick={() => setShowDeleteConfirm(null)}
                          >
                            取消
                          </button>
                          <button 
                            className="btn btn-danger" 
                            onClick={() => handleDelete(product.id)}
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