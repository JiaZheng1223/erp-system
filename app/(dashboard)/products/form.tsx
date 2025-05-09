'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Product } from '@/lib/supabase'
import { updateProduct, getProduct } from '@/lib/api/products'
import { FaSave, FaTimes } from 'react-icons/fa'

interface EditProductFormProps {
  id: number
  onSuccess?: () => void
  onCancel?: () => void
}

// 成品類別選項
const categoryOptions = ['紙框', '鐵框', '迷你摺', '袋型濾網', '無']

// 效率選項
const efficiencyOptions = ['35%', '45%', '65%', '85%', '95%', '無']

export default function EditProductForm({ id, onSuccess, onCancel }: EditProductFormProps) {
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
      const updated = await updateProduct(id, form)
      if (updated) {
        if (onSuccess) onSuccess()
        else router.push(`/products/${id}`)
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

  // 載入成品數據
  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true)
        const data = await getProduct(id)
        if (data) {
          // 移除名稱中的效率值
          const baseName = data.name.replace(data.efficiency, '').trim()
          
          setForm({
            name: baseName,
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

    loadProduct()
  }, [id])

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">編輯成品</h2>
      </div>

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
            <div className="relative">
              {form.efficiency !== '無' && (
                <span className="absolute left-3 top-1/2 -translate-y-1/2 border border-gray-300 rounded px-1 text-sm bg-gray-50">{form.efficiency}</span>
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

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="notes">
              備註
            </label>
            <textarea
              id="notes"
              name="notes"
              value={form.notes}
              onChange={handleChange}
              className="input w-full"
              rows={3}
              placeholder="請輸入備註"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="btn btn-outline flex items-center gap-2"
            onClick={onCancel || (() => router.push(`/products/${id}`))}
          >
            <FaTimes /> 取消
          </button>
          <button
            type="submit"
            className="btn btn-primary flex items-center gap-2"
            disabled={loading}
          >
            <FaSave /> {loading ? '處理中...' : '儲存變更'}
          </button>
        </div>
      </form>
    </div>
  )
} 