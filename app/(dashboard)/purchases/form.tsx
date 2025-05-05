'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Purchase, PurchaseItem } from '@/lib/supabase'
import { createPurchase, updatePurchase, updatePurchaseWithItems, getPurchaseWithItems } from '@/lib/api/purchases'
import { getSuppliers } from '@/lib/api/suppliers'
import { getMaterials } from '@/lib/api/materials'
import { FaSave, FaTimes, FaPlus, FaTrash } from 'react-icons/fa'

interface PurchaseFormProps {
  id?: string
  onSuccess?: () => void
  onCancel?: () => void
}

// 採購單狀態選項
const statusOptions = ['草稿', '已送出', '部分到貨', '已完成']

// 使用Omit來創建不包含id和created_at的類型
type PurchaseFormData = Omit<Purchase, 'id' | 'created_at'>;
type PurchaseItemFormData = Omit<PurchaseItem, 'id' | 'purchase_id'>;

export default function PurchaseForm({ id, onSuccess, onCancel }: PurchaseFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [suppliers, setSuppliers] = useState<{id: number, name: string}[]>([])
  const [materials, setMaterials] = useState<{id: number, name: string, price?: number}[]>([])
  const [purchaseForm, setPurchaseForm] = useState<PurchaseFormData>({
    supplier_id: 0,
    supplier_name: '',
    purchaser: '',
    purchase_date: new Date().toISOString().split('T')[0],
    expected_delivery_date: '',
    total_amount: 0,
    status: '草稿',
    notes: ''
  })
  
  // 儲存項目ID用於編輯模式
  const [purchaseItems, setPurchaseItems] = useState<(PurchaseItemFormData & { id?: number })[]>([])
  const [originalItemIds, setOriginalItemIds] = useState<number[]>([])
  const [deletedItemIds, setDeletedItemIds] = useState<number[]>([])

  // 載入供應商和物料數據
  useEffect(() => {
    async function loadFormData() {
      try {
        setLoading(true)
        
        // 載入供應商
        const suppliersData = await getSuppliers()
        setSuppliers(suppliersData.map(s => ({ id: s.id, name: s.name })))
        
        // 載入物料
        const materialsData = await getMaterials()
        setMaterials(materialsData.map(m => ({ id: m.id, name: m.name })))
        
        setError(null)
      } catch (err) {
        console.error('Failed to load form data:', err)
        setError('載入表單數據失敗')
      } finally {
        setLoading(false)
      }
    }

    loadFormData()
  }, [])

  // 如果提供了ID，載入採購單數據
  useEffect(() => {
    async function loadPurchase() {
      if (id) {
        try {
          setLoading(true)
          const { purchase, items } = await getPurchaseWithItems(id)
          if (purchase) {
            // 設置表單資料
            setPurchaseForm({
              supplier_id: purchase.supplier_id,
              supplier_name: purchase.supplier_name,
              purchaser: purchase.purchaser || '',
              purchase_date: purchase.purchase_date,
              expected_delivery_date: purchase.expected_delivery_date || '',
              total_amount: purchase.total_amount || 0,
              status: purchase.status,
              notes: purchase.notes || ''
            })
            
            if (items.length > 0) {
              // 儲存原始項目ID
              setOriginalItemIds(items.map(item => item.id))
              
              // 設置項目資料，保留id以供更新使用
              setPurchaseItems(items.map(item => ({
                id: item.id,
                material_id: item.material_id,
                material_name: item.material_name,
                quantity: item.quantity,
                price: item.price || 0,
                total: item.total || 0,
                status: item.status || '待處理'
              })))
            }
          }
        } catch (err) {
          console.error('Failed to load purchase:', err)
          setError('載入採購單資料失敗')
        } finally {
          setLoading(false)
        }
      }
    }

    loadPurchase()
  }, [id])

  // 處理採購單表單輸入變化
  const handlePurchaseChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    // 如果選擇了供應商，也更新供應商名稱
    if (name === 'supplier_id') {
      const selectedSupplier = suppliers.find(s => s.id === Number(value))
      if (selectedSupplier) {
        setPurchaseForm(prev => ({ 
          ...prev, 
          [name]: Number(value),
          supplier_name: selectedSupplier.name
        }))
      }
    } else {
      setPurchaseForm(prev => ({ ...prev, [name]: value }))
    }
  }

  // 處理添加採購項目
  const handleAddItem = () => {
    setPurchaseItems(prev => [
      ...prev, 
      {
        material_id: 0,
        material_name: '',
        quantity: 1,
        price: 0,
        total: 0,
        status: '待處理'
      }
    ])
  }

  // 處理採購項目變化
  const handleItemChange = (index: number, field: string, value: any) => {
    const updatedItems = [...purchaseItems]
    
    // 特殊處理物料選擇
    if (field === 'material_id') {
      const materialId = Number(value)
      const selectedMaterial = materials.find(m => m.id === materialId)
      
      if (selectedMaterial) {
        updatedItems[index] = {
          ...updatedItems[index],
          material_id: materialId,
          material_name: selectedMaterial.name
        }
      }
    } else {
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: field === 'quantity' || field === 'price' ? Number(value) : value
      }
    }
    
    // 更新項目金額
    if (field === 'quantity' || field === 'price') {
      const quantity = field === 'quantity' ? Number(value) : updatedItems[index].quantity
      const price = field === 'price' ? Number(value) : (updatedItems[index].price || 0)
      updatedItems[index].total = quantity * price
    }
    
    setPurchaseItems(updatedItems)
    
    // 更新採購單總金額
    const totalAmount = updatedItems.reduce((sum, item) => sum + (item.total || 0), 0)
    setPurchaseForm(prev => ({ ...prev, total_amount: totalAmount }))
  }

  // 處理刪除採購項目
  const handleRemoveItem = (index: number) => {
    const itemToRemove = purchaseItems[index]
    
    // 如果是已存在的項目（有ID），將其添加到刪除列表
    if (itemToRemove.id && originalItemIds.includes(itemToRemove.id)) {
      setDeletedItemIds(prev => [...prev, itemToRemove.id as number])
    }
    
    const updatedItems = purchaseItems.filter((_, i) => i !== index)
    setPurchaseItems(updatedItems)
    
    // 更新採購單總金額
    const totalAmount = updatedItems.reduce((sum, item) => sum + (item.total || 0), 0)
    setPurchaseForm(prev => ({ ...prev, total_amount: totalAmount }))
  }

  // 處理表單提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 驗證表單
    if (purchaseForm.supplier_id === 0) {
      setError('請選擇供應商')
      return
    }
    
    if (!purchaseForm.purchaser.trim()) {
      setError('請輸入採購人員')
      return
    }
    
    if (purchaseItems.length === 0) {
      setError('請至少添加一個採購項目')
      return
    }
    
    for (const item of purchaseItems) {
      if (item.material_id === 0 || item.quantity <= 0) {
        setError('請確保所有採購項目都有選擇物料和數量')
        return
      }
    }
    
    setLoading(true)
    setError(null)

    try {
      // 生成當前日期 (如果expected_delivery_date為空)
      const currentDate = new Date().toISOString().split('T')[0]
      
      // 準備要提交的表單數據，處理可能的空值或無效值
      const formData = {
        ...purchaseForm,
        // 確保 expected_delivery_date 有值，如果為空則使用當前日期 (避免資料庫錯誤)
        expected_delivery_date: purchaseForm.expected_delivery_date?.trim() ? purchaseForm.expected_delivery_date : currentDate,
        // 確保 total_amount 有值，否則設為 0
        total_amount: purchaseForm.total_amount || 0
      }

      if (id) {
        // 編輯模式 - 使用批量更新
        
        // 分類項目為現有項目和新項目
        const existingItems = purchaseItems
          .filter(item => item.id && originalItemIds.includes(item.id))
          .map(item => ({
            id: item.id as number,
            updates: {
              material_id: item.material_id,
              material_name: item.material_name,
              quantity: item.quantity,
              price: item.price || 0,
              total: item.total || 0,
              status: item.status || '待處理'
            }
          }))
        
        const newItems = purchaseItems
          .filter(item => !item.id || !originalItemIds.includes(item.id as number))
          .map(item => ({
            material_id: item.material_id,
            material_name: item.material_name,
            quantity: item.quantity,
            price: item.price || 0,
            total: item.total || 0,
            status: item.status || '待處理'
          }))
        
        const result = await updatePurchaseWithItems(id, formData, {
          existing: existingItems,
          new: newItems,
          deleted: deletedItemIds
        })
        
        if (result.purchase) {
          if (onSuccess) onSuccess()
          else router.push('/purchases')
        } else {
          setError('更新採購單失敗')
        }
      } else {
        // 創建新採購單
        const purchaseItemsData: PurchaseItemFormData[] = 
          purchaseItems.map(item => ({
            material_id: item.material_id,
            material_name: item.material_name,
            quantity: item.quantity,
            price: item.price || 0,
            total: item.total || 0,
            status: item.status || '待處理'
          }))
        
        // 創建新ID
        const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        const purchaseId = `P-${today}-${random}`;
        
        const result = await createPurchase(formData, purchaseItemsData)
        
        if (result.purchase) {
          if (onSuccess) onSuccess()
          else router.push('/purchases')
        } else {
          setError('新增採購單失敗')
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
      <h2 className="text-xl font-semibold mb-6">{id ? '編輯採購單' : '新增採購單'}</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="supplier_id">
              供應商 <span className="text-red-500">*</span>
            </label>
            <select
              id="supplier_id"
              name="supplier_id"
              value={purchaseForm.supplier_id}
              onChange={handlePurchaseChange}
              required
              className="input w-full"
            >
              <option value="">請選擇供應商</option>
              {suppliers.map(supplier => (
                <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="purchaser">
              採購人員 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="purchaser"
              name="purchaser"
              value={purchaseForm.purchaser}
              onChange={handlePurchaseChange}
              required
              className="input w-full"
              placeholder="請輸入採購人員"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="purchase_date">
              採購日期 <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="purchase_date"
              name="purchase_date"
              value={purchaseForm.purchase_date}
              onChange={handlePurchaseChange}
              required
              className="input w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="expected_delivery_date">
              預計到貨日
            </label>
            <input
              type="date"
              id="expected_delivery_date"
              name="expected_delivery_date"
              value={purchaseForm.expected_delivery_date}
              onChange={handlePurchaseChange}
              className="input w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="status">
              狀態 <span className="text-red-500">*</span>
            </label>
            <select
              id="status"
              name="status"
              value={purchaseForm.status}
              onChange={handlePurchaseChange}
              required
              className="input w-full"
            >
              {statusOptions.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              總金額
            </label>
            <div className="input w-full bg-gray-100">
              ${purchaseForm.total_amount?.toLocaleString() || '0'}
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="notes">
            備註
          </label>
          <textarea
            id="notes"
            name="notes"
            value={purchaseForm.notes}
            onChange={handlePurchaseChange}
            className="input w-full h-24"
            placeholder="請輸入備註"
          />
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium">採購項目</h3>
            <button
              type="button"
              onClick={handleAddItem}
              className="btn btn-sm btn-primary flex items-center gap-1"
            >
              <FaPlus size={12} /> 添加項目
            </button>
          </div>

          {purchaseItems.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">尚未添加採購項目</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left">物料</th>
                    <th className="px-4 py-2 text-right">數量</th>
                    <th className="px-4 py-2 text-right">單價</th>
                    <th className="px-4 py-2 text-right">金額</th>
                    <th className="px-4 py-2 text-center">狀態</th>
                    <th className="px-4 py-2 text-center">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseItems.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="px-4 py-2">
                        <select
                          className="input w-full"
                          value={item.material_id}
                          onChange={(e) => handleItemChange(index, 'material_id', e.target.value)}
                          required
                        >
                          <option value="">請選擇物料</option>
                          {materials.map(material => (
                            <option key={material.id} value={material.id}>{material.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          className="input w-full text-right"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          min="1"
                          required
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          className="input w-full text-right"
                          value={item.price || 0}
                          onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                          min="0"
                          required
                        />
                      </td>
                      <td className="px-4 py-2 text-right">
                        ${(item.total || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-2">
                        <select
                          className="input w-full"
                          value={item.status || '待處理'}
                          onChange={(e) => handleItemChange(index, 'status', e.target.value)}
                        >
                          {statusOptions.map(status => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onCancel || (() => router.push('/purchases'))}
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