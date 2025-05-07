'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/app/components/Header'
import { FaPlus, FaSearch, FaArrowUp, FaArrowDown, FaInfoCircle, FaTimes } from 'react-icons/fa'
import { getProducts, searchProducts, filterProducts, moveProductStock, getProductMovements, updateProductStock, getProductCategories, getProductEfficiencies, createProductCategory, createProductEfficiency, deleteProductCategory, deleteProductEfficiency } from '@/lib/api/products'
import { Product, ProductCategory, ProductEfficiency } from '@/lib/supabase'
import { useAuth } from '@/lib/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

// 定義確認模態框的類型
interface ConfirmModal {
  type: 'in' | 'out' | 'adjust'
  productId: number
  quantity: number
  note: string
}

export default function ProductsPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [efficiencyFilter, setEfficiencyFilter] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const [showMoveModal, setShowMoveModal] = useState<{productId: number, type: 'in' | 'out'}|null>(null)
  const [moveQuantity, setMoveQuantity] = useState(1)
  const [moveNote, setMoveNote] = useState('')
  const [moveError, setMoveError] = useState('')
  const [moveLoading, setMoveLoading] = useState(false)
  const [historyRecords, setHistoryRecords] = useState<any[]>([])
  const [showHistory, setShowHistory] = useState<number|null>(null)
  const [showAdjustModal, setShowAdjustModal] = useState<number|null>(null)
  const [adjustQuantity, setAdjustQuantity] = useState(0)
  const [adjustNote, setAdjustNote] = useState('')
  const [adjustError, setAdjustError] = useState('')
  const [adjustLoading, setAdjustLoading] = useState(false)
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [efficiencies, setEfficiencies] = useState<ProductEfficiency[]>([])
  const [newCategory, setNewCategory] = useState('')
  const [newEfficiency, setNewEfficiency] = useState('')
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [showEfficiencyModal, setShowEfficiencyModal] = useState(false)
  const [confirmModal, setConfirmModal] = useState<ConfirmModal | null>(null)
  const [secondConfirm, setSecondConfirm] = useState<ConfirmModal | null>(null)
  const [filters, setFilters] = useState({
    category: '',
    efficiency: '',
    stockStatus: '',
    search: ''
  })

  // 載入成品列表
  useEffect(() => {
    loadProducts()
    loadCategories()
    loadEfficiencies()
  }, [filters])

  // 載入成品列表
  const loadProducts = async () => {
    try {
      setLoading(true)
      let data: Product[]
      
      if (filters.search) {
        data = await searchProducts(filters.search)
      } else if (filters.category || filters.efficiency) {
        data = await filterProducts(filters.category, filters.efficiency)
      } else {
        data = await getProducts()
      }
      
      // 根據庫存狀態篩選
      if (filters.stockStatus) {
        data = data.filter(product => {
          if (filters.stockStatus === 'low') {
            return product.stock <= product.safety_stock
          } else if (filters.stockStatus === 'normal') {
            return product.stock > product.safety_stock
          }
          return true
        })
      }
      
      setProducts(data)
    } catch (err) {
      console.error('載入成品列表失敗:', err)
      setError('載入成品列表失敗')
    } finally {
      setLoading(false)
    }
  }

  // 載入類別列表
  const loadCategories = async () => {
    try {
      const data = await getProductCategories()
      setCategories(data)
    } catch (err) {
      console.error('載入類別列表失敗:', err)
    }
  }

  // 載入效率列表
  const loadEfficiencies = async () => {
    try {
      const data = await getProductEfficiencies()
      setEfficiencies(data)
    } catch (err) {
      console.error('載入效率列表失敗:', err)
    }
  }

  // 新增類別
  const handleAddCategory = async () => {
    if (!newCategory.trim()) return
    
    try {
      const category = await createProductCategory(newCategory.trim())
      if (category) {
        setCategories(prev => [...prev, category])
        setNewCategory('')
        setShowCategoryModal(false)
      }
    } catch (err) {
      console.error('新增類別失敗:', err)
    }
  }

  // 刪除類別
  const handleDeleteCategory = async (id: number) => {
    try {
      const success = await deleteProductCategory(id)
      if (success) {
        setCategories(prev => prev.filter(c => c.id !== id))
      }
    } catch (err) {
      console.error('刪除類別失敗:', err)
    }
  }

  // 新增效率
  const handleAddEfficiency = async () => {
    if (!newEfficiency.trim()) return
    
    try {
      const efficiency = await createProductEfficiency(newEfficiency.trim())
      if (efficiency) {
        setEfficiencies(prev => [...prev, efficiency])
        setNewEfficiency('')
        setShowEfficiencyModal(false)
      }
    } catch (err) {
      console.error('新增效率失敗:', err)
    }
  }

  // 刪除效率
  const handleDeleteEfficiency = async (id: number) => {
    try {
      const success = await deleteProductEfficiency(id)
      if (success) {
        setEfficiencies(prev => prev.filter(e => e.id !== id))
      }
    } catch (err) {
      console.error('刪除效率失敗:', err)
    }
  }

  // 顯示歷史調動紀錄
  const handleShowHistory = async (productId: number) => {
    setShowHistory(productId)
    const records = await getProductMovements(productId)
    setHistoryRecords(records)
  }

  // 處理入庫/出庫
  const handleMoveStock = async () => {
    if (!user) {
      setMoveError('請先登入')
      return
    }
    if (moveQuantity <= 0) {
      setMoveError('數量必須大於0')
      return
    }
    setMoveLoading(true)
    setMoveError('')
    const res = await moveProductStock(showMoveModal!.productId, user.id, showMoveModal!.type, moveQuantity, moveNote)
    setMoveLoading(false)
    if (res.error) {
      setMoveError(res.error)
    } else {
      setShowMoveModal(null)
      setMoveQuantity(1)
      setMoveNote('')
      // 重新加載成品
      getProducts().then(data => setProducts(data))
      // 重新加載歷史紀錄（如有開啟）
      if (showHistory === showMoveModal!.productId) {
        handleShowHistory(showMoveModal!.productId)
      }
    }
  }

  return (
    <div>
      <Header title="成品管理" subtitle="管理工業過濾網成品資訊" />
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">類別</label>
            <div className="relative">
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="input w-full pr-12"
              >
                <option value="">全部類別</option>
                {categories.map(category => (
                  <option key={category.id} value={category.name}>{category.name}</option>
                ))}
              </select>
              <button
                className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setShowCategoryModal(true)}
              >
                <FaPlus size={12} />
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">效率</label>
            <div className="relative">
              <select
                value={filters.efficiency}
                onChange={(e) => setFilters(prev => ({ ...prev, efficiency: e.target.value }))}
                className="input w-full pr-12"
              >
                <option value="">全部效率</option>
                {efficiencies.map(efficiency => (
                  <option key={efficiency.id} value={efficiency.name}>{efficiency.name}</option>
                ))}
              </select>
              <button
                className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setShowEfficiencyModal(true)}
              >
                <FaPlus size={12} />
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">庫存狀態</label>
            <select
              value={filters.stockStatus}
              onChange={(e) => setFilters(prev => ({ ...prev, stockStatus: e.target.value }))}
              className="input w-full"
            >
              <option value="">全部</option>
              <option value="low">低於安全庫存</option>
              <option value="normal">正常</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">搜尋</label>
            <div className="relative">
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                placeholder="搜尋成品名稱..."
                className="input w-full pl-10"
              />
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end mb-6">
        <button
          className="btn btn-primary flex items-center gap-2"
          onClick={() => router.push('/products/add')}
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
            onClick={() => router.push('/products/add')}
          >
            新增第一個成品
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map(product => (
            <div key={product.id} className="card relative">
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
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold line-clamp-2 flex-grow">{product.efficiency} {removeCategoryAndEfficiency(product.name, product.category, product.efficiency)}</h3>
                <button 
                  className="p-1 text-blue-600 hover:text-blue-800"
                  onClick={() => router.push(`/products/${product.id}`)}
                >
                  <FaInfoCircle />
                </button>
              </div>
              
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
              
              <div className="flex gap-2 mt-4">
                <button className="btn btn-sm btn-success flex items-center gap-1" onClick={() => setConfirmModal({type: 'in', productId: product.id, quantity: 1, note: ''})}><FaArrowDown /> 入庫</button>
                <button className="btn btn-sm flex items-center gap-1 bg-yellow-400 text-white hover:bg-yellow-500" onClick={() => setConfirmModal({type: 'adjust', productId: product.id, quantity: product.stock, note: ''})}><FaInfoCircle /> 調整</button>
                <button className="btn btn-sm btn-danger flex items-center gap-1" onClick={() => setConfirmModal({type: 'out', productId: product.id, quantity: 1, note: ''})}><FaArrowUp /> 出庫</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 入庫/出庫 Modal */}
      {showMoveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xs">
            <h3 className="font-bold mb-4">{showMoveModal.type === 'in' ? '入庫' : '出庫'}</h3>
            <div className="mb-2">
              <label className="block text-sm mb-1">數量</label>
              <input type="number" className="input w-full" value={moveQuantity} min={1} onChange={e => setMoveQuantity(Number(e.target.value))} />
            </div>
            <div className="mb-2">
              <label className="block text-sm mb-1">備註</label>
              <input type="text" className="input w-full" value={moveNote} onChange={e => setMoveNote(e.target.value)} />
            </div>
            {moveError && <div className="text-red-600 text-xs mb-2">{moveError}</div>}
            <div className="flex gap-2 mt-4">
              <button className="btn btn-primary flex-1" onClick={handleMoveStock} disabled={moveLoading}>{moveLoading ? '處理中...' : '確認'}</button>
              <button className="btn btn-outline flex-1" onClick={() => setShowMoveModal(null)}>取消</button>
            </div>
          </div>
        </div>
      )}

      {/* 調整庫存 Modal */}
      {showAdjustModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xs">
            <h3 className="font-bold mb-4">調整庫存</h3>
            <div className="mb-2">
              <label className="block text-sm mb-1">新庫存數量</label>
              <input type="number" className="input w-full" value={adjustQuantity} min={0} onChange={e => setAdjustQuantity(Number(e.target.value))} />
            </div>
            <div className="mb-2">
              <label className="block text-sm mb-1">備註</label>
              <input type="text" className="input w-full" value={adjustNote} onChange={e => setAdjustNote(e.target.value)} />
            </div>
            {adjustError && <div className="text-red-600 text-xs mb-2">{adjustError}</div>}
            <div className="flex gap-2 mt-4">
              <button className="btn btn-primary flex-1" onClick={async () => {
                if (!user) { setAdjustError('請先登入'); return; }
                if (adjustQuantity < 0) { setAdjustError('數量不可小於0'); return; }
                setAdjustLoading(true)
                setAdjustError('')
                // 取得原本庫存
                const product = products.find(p => p.id === showAdjustModal)
                if (!product) { setAdjustError('找不到成品'); setAdjustLoading(false); return; }
                // 更新庫存
                const updated = await updateProductStock(product.id, adjustQuantity)
                if (!updated) { setAdjustError('庫存更新失敗'); setAdjustLoading(false); return; }
                // 寫入調整紀錄
                const diff = adjustQuantity - product.stock;
                if (diff !== 0) {
                  const { error: insertError } = await supabase.from('product_movements').insert({
                    product_id: product.id,
                    user_id: user.id,
                    type: diff > 0 ? 'in' : 'out',
                    quantity: Math.abs(diff),
                    note: `[調整] ${adjustNote}`
                  });
                  if (insertError) {
                    setAdjustError('調整紀錄寫入失敗: ' + insertError.message)
                    setAdjustLoading(false)
                    return
                  }
                }
                setShowAdjustModal(null)
                setAdjustLoading(false)
                getProducts().then(data => setProducts(data))
              }} disabled={adjustLoading}>{adjustLoading ? '處理中...' : '確認'}</button>
              <button className="btn btn-outline flex-1" onClick={() => setShowAdjustModal(null)}>取消</button>
            </div>
          </div>
        </div>
      )}

      {/* 確認 Modal */}
      {confirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xs">
            <h3 className="font-bold mb-4">確認{confirmModal.type === 'in' ? '入庫' : confirmModal.type === 'out' ? '出庫' : '調整'}動作</h3>
            <div className="mb-2">
              <label className="block text-sm mb-1">數量</label>
              <input type="number" className="input w-full" value={confirmModal.quantity} min={confirmModal.type === 'adjust' ? 0 : 1} onChange={e => setConfirmModal({...confirmModal, quantity: Number(e.target.value)})} />
            </div>
            <div className="mb-2">
              <label className="block text-sm mb-1">備註</label>
              <input type="text" className="input w-full" value={confirmModal.note} onChange={e => setConfirmModal({...confirmModal, note: e.target.value})} />
            </div>
            <div className="flex gap-2 mt-4">
              <button className="btn btn-primary flex-1" onClick={() => setSecondConfirm(confirmModal)}>確認</button>
              <button className="btn btn-danger flex-1" onClick={() => setConfirmModal(null)}>取消</button>
            </div>
          </div>
        </div>
      )}

      {/* 二次確認 Modal */}
      {secondConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xs">
            <h3 className="font-bold mb-4">再次確認</h3>
            <div className="mb-4">確定要執行此{secondConfirm.type === 'in' ? '入庫' : secondConfirm.type === 'out' ? '出庫' : '調整'}操作嗎？</div>
            <div className="mb-2">數量：{secondConfirm.quantity}</div>
            <div className="mb-2">備註：{secondConfirm.note || '無'}</div>
            <div className="flex gap-2 mt-4">
              <button className="btn btn-primary flex-1" onClick={async () => {
                if (!user) { setError('請先登入'); return; }
                if (secondConfirm.type === 'in' || secondConfirm.type === 'out') {
                  if (secondConfirm.quantity <= 0) { setError('數量必須大於0'); return; }
                  const res = await moveProductStock(secondConfirm.productId, user.id, secondConfirm.type, secondConfirm.quantity, secondConfirm.note)
                  if (res.error) { setError(res.error); return; }
                } else if (secondConfirm.type === 'adjust') {
                  const product = products.find(p => p.id === secondConfirm.productId)
                  if (!product) { setError('找不到成品'); return; }
                  if (secondConfirm.quantity < 0) { setError('數量不可小於0'); return; }
                  const updated = await updateProductStock(product.id, secondConfirm.quantity)
                  if (!updated) { setError('庫存更新失敗'); return; }
                  const diff = secondConfirm.quantity - product.stock;
                  if (diff !== 0) {
                    const { error: insertError } = await supabase.from('product_movements').insert({
                      product_id: product.id,
                      user_id: user.id,
                      type: diff > 0 ? 'in' : 'out',
                      quantity: Math.abs(diff),
                      note: `[調整] ${secondConfirm.note}`
                    })
                    if (insertError) { setError('調整紀錄寫入失敗: ' + insertError.message); return; }
                  }
                }
                setSecondConfirm(null)
                setConfirmModal(null)
                getProducts().then(data => setProducts(data))
              }}>確定</button>
              <button className="btn btn-danger flex-1" onClick={() => setSecondConfirm(null)}>取消</button>
            </div>
          </div>
        </div>
      )}

      {/* 類別管理模態框 */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">管理類別</h3>
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  className="input flex-grow"
                  placeholder="新增類別..."
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                />
                <button
                  className="btn btn-primary"
                  onClick={handleAddCategory}
                >
                  新增
                </button>
              </div>
              <div className="max-h-60 overflow-y-auto">
                {categories.map(category => (
                  <div key={category.id} className="flex items-center justify-between py-2 border-b">
                    <span>{category.name}</span>
                    <button
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleDeleteCategory(category.id)}
                    >
                      <FaTimes />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                className="btn"
                onClick={() => setShowCategoryModal(false)}
              >
                關閉
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 效率管理模態框 */}
      {showEfficiencyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">管理效率</h3>
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  className="input flex-grow"
                  placeholder="新增效率..."
                  value={newEfficiency}
                  onChange={(e) => setNewEfficiency(e.target.value)}
                />
                <button
                  className="btn btn-primary"
                  onClick={handleAddEfficiency}
                >
                  新增
                </button>
              </div>
              <div className="max-h-60 overflow-y-auto">
                {efficiencies.map(efficiency => (
                  <div key={efficiency.id} className="flex items-center justify-between py-2 border-b">
                    <span>{efficiency.name}</span>
                    <button
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleDeleteEfficiency(efficiency.id)}
                    >
                      <FaTimes />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                className="btn"
                onClick={() => setShowEfficiencyModal(false)}
              >
                關閉
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function removeCategoryAndEfficiency(name: string, category: string, efficiency: string) {
  // 假設原始格式為「類別-效率-名稱」或「效率-名稱」
  // 只保留最後一段（名稱）
  const parts = name.split('-')
  if (parts.length >= 3 && parts[0] === category && parts[1] === efficiency) {
    return parts.slice(2).join('-')
  }
  if (parts.length >= 2 && parts[0] === efficiency) {
    return parts.slice(1).join('-')
  }
  return name
} 