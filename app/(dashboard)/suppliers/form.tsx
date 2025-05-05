'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Supplier } from '@/lib/supabase'
import { createSupplier, updateSupplier, getSupplier } from '@/lib/api/suppliers'
import { FaSave, FaTimes } from 'react-icons/fa'

interface SupplierFormProps {
  id?: number
  onSuccess?: () => void
  onCancel?: () => void
}

export default function SupplierForm({ id, onSuccess, onCancel }: SupplierFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<Omit<Supplier, 'id' | 'created_at'>>({
    name: '',
    phone: '',
    fax: '',
    tax_id: '',
    address: '',
    notes: ''
  })

  // 如果提供了ID，載入物料商數據
  useEffect(() => {
    async function loadSupplier() {
      if (id) {
        try {
          setLoading(true)
          const data = await getSupplier(id)
          if (data) {
            setForm({
              name: data.name,
              phone: data.phone || '',
              fax: data.fax || '',
              tax_id: data.tax_id || '',
              address: data.address || '',
              notes: data.notes || ''
            })
          }
        } catch (err) {
          console.error('Failed to load supplier:', err)
          setError('載入物料商資料失敗')
        } finally {
          setLoading(false)
        }
      }
    }

    loadSupplier()
  }, [id])

  // 處理表單輸入變化
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  // 處理表單提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (id) {
        // 更新物料商
        const updated = await updateSupplier(id, form)
        if (updated) {
          if (onSuccess) onSuccess()
          else router.push('/suppliers')
        } else {
          setError('更新物料商失敗')
        }
      } else {
        // 創建新物料商
        const created = await createSupplier(form)
        if (created) {
          if (onSuccess) onSuccess()
          else router.push('/suppliers')
        } else {
          setError('新增物料商失敗')
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
      <h2 className="text-xl font-semibold mb-6">{id ? '編輯物料商' : '新增物料商'}</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">
              物料商名稱 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="input w-full"
              placeholder="請輸入物料商名稱"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="tax_id">
              統一編號
            </label>
            <input
              type="text"
              id="tax_id"
              name="tax_id"
              value={form.tax_id}
              onChange={handleChange}
              className="input w-full"
              placeholder="請輸入統一編號"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="phone">
              電話
            </label>
            <input
              type="text"
              id="phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="input w-full"
              placeholder="請輸入電話"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="fax">
              傳真
            </label>
            <input
              type="text"
              id="fax"
              name="fax"
              value={form.fax}
              onChange={handleChange}
              className="input w-full"
              placeholder="請輸入傳真"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="address">
            地址
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={form.address}
            onChange={handleChange}
            className="input w-full"
            placeholder="請輸入地址"
          />
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
            onClick={onCancel || (() => router.push('/suppliers'))}
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