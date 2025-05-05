'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Product } from '@/lib/supabase'
import { createProduct, updateProduct, getProduct } from '@/lib/api/products'
import { FaSave, FaTimes } from 'react-icons/fa'

interface ProductFormProps {
  id?: number
  onSuccess?: () => void
  onCancel?: () => void
}

// 成品類別選項
const categoryOptions = ['紙框', '鐵框', '迷你摺', '袋型濾網', '無']

// 效率選項
const efficiencyOptions = ['35%', '45%', '65%', '85%', '95%', '無']

export default function ProductForm({ id, onSuccess, onCancel }: ProductFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<Omit<Product, 'id' | 'created_at'>>({
    name: '',
    category: '',
    efficiency: '',
    stock: 0,
    safety_stock: 0,
    notes: '',
    image_url: ''
  })

  // 如果提供了ID，載入成品數據
  useEffect(() => {
    async function loadProduct() {
      if (id) {
        try {
          setLoading(true)
          const data = await getProduct(id)
          if (data) {
            setForm({
              name: data.name,
              category: data.category,
              efficiency: data.efficiency,
              stock: data.stock,
              safety_stock: data.safety_stock,
              notes: data.notes || '',
              image_url: data.image_url || ''
            })
          }
        } catch (err) {
          console.error('Failed to load product:', err)
          setError('載入成品資料失敗')
        } finally {
          setLoading(false)
        }
      }
    }

    loadProduct()
  }, [id])

  // 處理表單輸入變化
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    // 轉換數字字段
    if (name === 'stock' || name === 'safety_stock') {
      setForm(prev => ({ ...prev, [name]: parseInt(value) || 0 }))
    } else if (name === 'category' || name === 'efficiency') {
      // 更新對應字段
      setForm(prev => {
        const updates = { ...prev, [name]: value }
        
        // 解析當前名稱
        const nameParts = prev.name.split('-')
        let baseName = nameParts[nameParts.length - 1] || ''
        
        // 檢查是否已經有格式化的名稱
        const hasFormattedName = nameParts.length >= 3 && 
          (categoryOptions.includes(nameParts[0]) || nameParts[0] === '') && 
          (efficiencyOptions.includes(nameParts[1]) || nameParts[1] === '')
        
        // 如果是首次設置類別或效率，且名稱沒有格式化，則保存當前名稱作為基礎
        if (!hasFormattedName) {
          baseName = prev.name
        }
        
        // 根據更新後的類別和效率生成新名稱
        const newCategory = name === 'category' ? value : prev.category
        const newEfficiency = name === 'efficiency' ? value : prev.efficiency
        
        // 只有當類別和效率都不為空或'無'時才生成格式化名稱
        if (newCategory && newCategory !== '無' && newEfficiency && newEfficiency !== '無') {
          updates.name = `${newCategory}-${newEfficiency}-${baseName}`
        }
        
        return updates
      })
    } else if (name === 'name') {
      // 直接更新名稱
      setForm(prev => ({ ...prev, name: value }))
    } else {
      // 更新其他字段
      setForm(prev => ({ ...prev, [name]: value }))
    }
  }

  // 處理表單提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (id) {
        // 更新成品
        const updated = await updateProduct(id, form)
        if (updated) {
          if (onSuccess) onSuccess()
          else router.push('/products')
        } else {
          setError('更新成品失敗')
        }
      } else {
        // 創建新成品
        const created = await createProduct(form)
        if (created) {
          if (onSuccess) onSuccess()
          else router.push('/products')
        } else {
          setError('新增成品失敗')
        }
      }
    } catch (err) {
      console.error('Form submission error:', err)
      setError('操作失敗，請稍後再試')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-6">{id ? '編輯成品' : '新增成品'}</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">
              成品名稱 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="input w-full"
              placeholder="請輸入成品名稱"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="image_url">
              圖片網址
            </label>
            <input
              type="text"
              id="image_url"
              name="image_url"
              value={form.image_url}
              onChange={handleChange}
              className="input w-full"
              placeholder="請輸入圖片網址"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="category">
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
              {categoryOptions.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="efficiency">
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
              {efficiencyOptions.map(efficiency => (
                <option key={efficiency} value={efficiency}>{efficiency}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="stock">
              目前庫存 <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="stock"
              name="stock"
              value={form.stock}
              onChange={handleChange}
              required
              min="0"
              className="input w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="safety_stock">
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
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="notes">
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

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onCancel || (() => router.push('/products'))}
            className="btn bg-gray-200 text-gray-800 hover:bg-gray-300 flex items-center gap-1"
            disabled={loading}
          >
            <FaTimes size={14} /> 取消
          </button>
          <button
            type="submit"
            className="btn btn-primary flex items-center gap-1"
            disabled={loading}
          >
            <FaSave size={14} /> {loading ? '處理中...' : '儲存'}
          </button>
        </div>
      </form>
    </div>
  )
} 