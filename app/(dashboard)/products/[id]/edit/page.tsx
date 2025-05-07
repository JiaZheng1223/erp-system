'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/app/components/Header'
import { FaArrowLeft, FaUpload } from 'react-icons/fa'
import { getProduct, updateProduct, getProductCategories, getProductEfficiencies } from '@/lib/api/products'
import { Product, ProductCategory, ProductEfficiency } from '@/lib/supabase'

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState<Omit<Product, 'id' | 'created_at'>>({
    name: '',
    category: '',
    efficiency: '',
    stock: 0,
    safety_stock: 0,
    notes: '',
    image_url: ''
  })
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [efficiencies, setEfficiencies] = useState<ProductEfficiency[]>([])

  // 處理表單輸入變化
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    // 轉換數字字段
    if (name === 'stock' || name === 'safety_stock') {
      setForm(prev => ({ ...prev, [name]: parseInt(value) || 0 }))
    } else {
      setForm(prev => ({ ...prev, [name]: value }))
    }
  }

  // 處理表單提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const updated = await updateProduct(parseInt(params.id), form)
      if (updated) {
        router.push(`/products/${params.id}`)
      } else {
        setError('更新成品失敗')
      }
    } catch (err) {
      console.error('Form submission error:', err)
      setError('操作失敗，請稍後再試')
    } finally {
      setLoading(false)
    }
  }

  // 處理圖片上傳
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 檢查檔案類型
    if (!file.type.startsWith('image/')) {
      setError('請上傳圖片檔案')
      return
    }

    // 檢查檔案大小（限制為 2MB）
    if (file.size > 2 * 1024 * 1024) {
      setError('圖片大小不能超過 2MB')
      return
    }

    try {
      setUploading(true)
      setError(null)

      // 創建 FormData
      const formData = new FormData()
      formData.append('file', file)

      // 上傳圖片
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('上傳失敗')
      }

      const data = await response.json()
      setForm(prev => ({ ...prev, image_url: data.url }))
    } catch (err) {
      console.error('Upload error:', err)
      setError('圖片上傳失敗')
    } finally {
      setUploading(false)
    }
  }

  // 載入成品資料
  useEffect(() => {
    loadProduct()
    loadCategories()
    loadEfficiencies()
  }, [params.id])

  // 載入成品資料
  const loadProduct = async () => {
    try {
      setLoading(true)
      const product = await getProduct(parseInt(params.id))
      if (product) {
        setForm(product)
      } else {
        setError('找不到成品資料')
      }
    } catch (err) {
      console.error('載入成品資料失敗:', err)
      setError('載入成品資料失敗')
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-500">載入中...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Header title="編輯成品" subtitle="修改成品資訊" />
      
      <div className="flex justify-between items-center mb-6">
        <button
          className="btn btn-outline flex items-center gap-2"
          onClick={() => router.push(`/products/${params.id}`)}
        >
          <FaArrowLeft /> 返回詳情
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-4 gap-6">
          <div className="col-span-1">
            <div className="bg-gray-100 rounded-lg p-4 h-full">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-0.5" htmlFor="image_url">
                  圖片網址
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="image_url"
                    name="image_url"
                    value={form.image_url}
                    onChange={handleChange}
                    className="input w-full"
                    placeholder="請輸入圖片網址"
                  />
                  <label className="btn btn-outline flex items-center gap-2 cursor-pointer">
                    <FaUpload />
                    <span>上傳</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={uploading}
                    />
                  </label>
                </div>
              </div>
              <div className="aspect-square bg-white rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center relative">
                {form.image_url ? (
                  <img 
                    src={form.image_url} 
                    alt="成品圖片"
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNFNUU3RUIiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM2QjcyODAiPjQwNHw8L3RleHQ+PC9zdmc+'
                    }}
                  />
                ) : (
                  <div className="text-center text-gray-500">
                    <FaUpload className="mx-auto mb-2 text-2xl" />
                    <span>點擊上傳圖片</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
              </div>
              <div className="mt-2 text-center text-sm text-gray-500">
                圖片預覽
              </div>
            </div>
          </div>
          
          <div className="col-span-3">
            <div className="grid grid-cols-2 gap-2 h-full">
              <div className="flex flex-col">
                <label className="block text-sm font-medium text-gray-700 mb-0.5" htmlFor="category">
                  類別 <span className="text-red-500">*</span>
                </label>
                <select
                  id="category"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                  className="input w-full"
                >
                  <option value="">請選擇類別</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.name}>{category.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col">
                <label className="block text-sm font-medium text-gray-700 mb-0.5" htmlFor="efficiency">
                  效率 <span className="text-red-500">*</span>
                </label>
                <select
                  id="efficiency"
                  name="efficiency"
                  value={form.efficiency}
                  onChange={handleChange}
                  required
                  className="input w-full"
                >
                  <option value="">請選擇效率</option>
                  {efficiencies.map(efficiency => (
                    <option key={efficiency.id} value={efficiency.name}>{efficiency.name}</option>
                  ))}
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-0.5" htmlFor="name">
                  成品名稱 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  {form.efficiency !== '無' && (
                    <div className="absolute left-2 top-1/2 -translate-y-1/2 bg-gray-100 border border-gray-300 rounded px-1 text-sm text-gray-600">
                      {form.efficiency}
                    </div>
                  )}
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className={`input w-full ${form.efficiency !== '無' ? 'pl-16' : ''}`}
                    placeholder="請輸入成品名稱"
                  />
                </div>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-0.5" htmlFor="safety_stock">
                  安全庫存量 <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="safety_stock"
                  name="safety_stock"
                  value={form.safety_stock}
                  onChange={handleChange}
                  required
                  min="0"
                  className="input w-full"
                  placeholder="請輸入安全庫存量"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-0.5" htmlFor="notes">
                  備註
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  className="input w-full h-24"
                  placeholder="請輸入備註"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? '處理中...' : '更新成品'}
          </button>
        </div>
      </form>
    </div>
  )
} 