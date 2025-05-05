'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Order, OrderItem } from '@/lib/supabase'
import { createOrder, updateOrder, updateOrderWithItems, getOrderWithItems } from '@/lib/api/orders'
import { getDistributors } from '@/lib/api/distributors'
import { getProducts, filterProducts } from '@/lib/api/products'
import { FaSave, FaTimes, FaPlus, FaTrash } from 'react-icons/fa'

interface OrderFormProps {
  id?: string
  onSuccess?: () => void
  onCancel?: () => void
}

// 訂單狀態選項
const statusOptions = ['待處理', '處理中', '待出貨', '已完成']

// 項目狀態選項
const itemStatusOptions = ['未接收', '已接收', '已完成']

// 運送方式選項
const deliveryMethodOptions = ['自取', '物流', '工廠發貨', '等待通知']

// 成品類別選項
const categoryOptions = ['紙框', '鐵框', '迷你摺', '袋型濾網', '無', '所有類別']

// 使用Omit來創建不包含id和created_at的類型
type OrderFormData = Omit<Order, 'id' | 'created_at'>;
type OrderItemFormData = Omit<OrderItem, 'id' | 'order_id'>;

export default function OrderForm({ id, onSuccess, onCancel }: OrderFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [distributors, setDistributors] = useState<{id: number, name: string}[]>([])
  const [allProducts, setAllProducts] = useState<{id: number, name: string, category: string, price?: number}[]>([])
  const [filteredProducts, setFilteredProducts] = useState<{id: number, name: string, price?: number}[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>(Array(10).fill('所有類別'))
  const [orderForm, setOrderForm] = useState<OrderFormData>({
    distributor_id: 0,
    distributor_name: '',
    customer_po: '',
    order_date: new Date().toISOString().split('T')[0],
    delivery_date: '',
    total_amount: 0,
    status: '待處理',
    notes: '',
    delivery_method: '',
    shipping_company: '',
    shipping_address: '',
    contact_person: '',
    contact_phone: ''
  })
  
  // 儲存項目ID用於編輯模式
  const [orderItems, setOrderItems] = useState<(OrderItemFormData & { id?: number })[]>([])
  const [originalItemIds, setOriginalItemIds] = useState<number[]>([])
  const [deletedItemIds, setDeletedItemIds] = useState<number[]>([])

  // 載入經銷商和成品數據
  useEffect(() => {
    async function loadFormData() {
      try {
        setLoading(true)
        
        // 載入經銷商
        const distributorsData = await getDistributors()
        setDistributors(distributorsData.map(d => ({ id: d.id, name: d.name })))
        
        // 載入成品
        const productsData = await getProducts()
        setAllProducts(productsData.map(p => ({ 
          id: p.id, 
          name: p.name, 
          category: p.category 
        })))
        setFilteredProducts(productsData.map(p => ({ id: p.id, name: p.name })))
        
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

  // 如果提供了ID，載入訂購單數據
  useEffect(() => {
    async function loadOrder() {
      if (id) {
        try {
          setLoading(true)
          const { order, items } = await getOrderWithItems(id)
          if (order) {
            setOrderForm({
              distributor_id: order.distributor_id,
              distributor_name: order.distributor_name,
              customer_po: order.customer_po || '',
              order_date: order.order_date,
              delivery_date: order.delivery_date || '',
              total_amount: order.total_amount || 0,
              status: order.status || '待處理',
              notes: order.notes || '',
              delivery_method: order.delivery_method || '',
              shipping_company: order.shipping_company || '',
              shipping_address: order.shipping_address || '',
              contact_person: order.contact_person || '',
              contact_phone: order.contact_phone || ''
            })
            
            if (items.length > 0) {
              // 儲存原始項目ID
              setOriginalItemIds(items.map(item => item.id))
              
              // 設置項目資料，保留id以供更新使用
              setOrderItems(items.map(item => ({
                id: item.id,
                product_id: item.product_id,
                product_name: item.product_name,
                quantity: item.quantity || 1,
                price: item.price || 0,
                total: item.total || 0,
                status: item.status || '未接收'
              })))
            }
          }
        } catch (err) {
          console.error('Failed to load order:', err)
          setError('載入訂購單資料失敗')
        } finally {
          setLoading(false)
        }
      }
    }

    loadOrder()
  }, [id])

  // 處理項目狀態變化時更新訂單狀態
  useEffect(() => {
    if (orderItems.length === 0) return;
    
    // 檢查是否有任何項目狀態為「未接收」
    const hasUnreceivedItems = orderItems.some(item => item.status === '未接收');
    // 檢查是否有任何項目為「已接收」狀態（但沒有未接收的項目）
    const hasReceivedItems = !hasUnreceivedItems && orderItems.some(item => item.status === '已接收');
    // 檢查是否所有項目都是「已完成」狀態
    const allItemsCompleted = orderItems.every(item => item.status === '已完成');
    
    if (hasUnreceivedItems) {
      // 如果有任何項目為「未接收」，訂單狀態必須為「待處理」
      setOrderForm(prev => ({ ...prev, status: '待處理' }));
    } else if (hasReceivedItems) {
      // 如果有任何項目為「已接收」（且沒有未接收的項目），訂單狀態必須為「處理中」
      setOrderForm(prev => ({ ...prev, status: '處理中' }));
    } else if (allItemsCompleted) {
      // 如果全部項目為「已完成」，訂單狀態自動變為「待出貨」
      setOrderForm(prev => ({ ...prev, status: '待出貨' }));
    }
  }, [orderItems]);

  // 處理訂單表單輸入變化
  const handleOrderChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    // 如果選擇了經銷商，也更新經銷商名稱
    if (name === 'distributor_id') {
      const selectedDistributor = distributors.find(d => d.id === Number(value))
      if (selectedDistributor) {
        setOrderForm(prev => ({ 
          ...prev, 
          [name]: Number(value),
          distributor_name: selectedDistributor.name
        }))
      }
    } else if (name === 'status') {
      // 檢查項目狀態與訂單狀態的一致性
      const hasUnreceivedItems = orderItems.some(item => item.status === '未接收');
      const hasReceivedItems = !hasUnreceivedItems && orderItems.some(item => item.status === '已接收');
      const allItemsCompleted = orderItems.every(item => item.status === '已完成');
      
      if (hasUnreceivedItems && value !== '待處理') {
        setError('有項目狀態為「未接收」時，訂單狀態必須為「待處理」');
        return;
      } else if (hasReceivedItems && value !== '處理中') {
        setError('有項目狀態為「已接收」時，訂單狀態必須為「處理中」');
        return;
      } else if (allItemsCompleted && value !== '待出貨' && value !== '已完成') {
        setError('全部項目狀態為「已完成」時，訂單狀態必須為「待出貨」或「已完成」');
        return;
      }
      
      // 只有當所有項目都已完成時，才可以設置為待出貨或已完成
      if ((value === '待出貨' || value === '已完成') && !allItemsCompleted) {
        setError('只有當所有項目狀態為「已完成」時，才能將訂單狀態更新為「待出貨」或「已完成」');
        return;
      }
      
      setOrderForm(prev => ({ ...prev, [name]: value }));
    } else {
      setOrderForm(prev => ({ ...prev, [name]: value }));
    }
  }

  // 處理添加訂單項目
  const handleAddItem = () => {
    setOrderItems(prev => [
      ...prev, 
      {
        product_id: 0,
        product_name: '',
        quantity: 1,
        price: 0,
        total: 0,
        status: '未接收'
      }
    ])
    
    // 為新添加的項目設置默認類別
    setSelectedCategories(prev => {
      const newCategories = [...prev]
      newCategories[orderItems.length] = '所有類別'
      return newCategories
    })
  }

  // 處理成品類別變化
  const handleCategoryChange = async (index: number, category: string) => {
    try {
      // 更新類別選擇
      setSelectedCategories(prev => {
        const newCategories = [...prev]
        newCategories[index] = category
        return newCategories
      })
      
      // 篩選成品
      if (category === '所有類別') {
        setFilteredProducts(allProducts)
      } else {
        const filteredData = await filterProducts(category)
        setFilteredProducts(filteredData.map(p => ({ id: p.id, name: p.name })))
      }
      
      // 重置該項目的成品選擇
      const updatedItems = [...orderItems]
      updatedItems[index] = {
        ...updatedItems[index],
        product_id: 0,
        product_name: ''
      }
      setOrderItems(updatedItems)
      
    } catch (err) {
      console.error('Failed to filter products:', err)
      setError('篩選成品失敗')
    }
  }

  // 處理訂單項目變化
  const handleItemChange = (index: number, field: string, value: any) => {
    const updatedItems = [...orderItems]
    
    // 特殊處理成品選擇
    if (field === 'product_id') {
      const productId = Number(value)
      const selectedProduct = allProducts.find(p => p.id === productId)
      
      if (selectedProduct) {
        updatedItems[index] = {
          ...updatedItems[index],
          product_id: productId,
          product_name: selectedProduct.name
        }
      }
    } else if (field === 'status') {
      // 檢查項目狀態變更是否合理 (只能按照順序進行: 未接收 -> 已接收 -> 已完成)
      const currentStatus = updatedItems[index].status;
      if (currentStatus === '未接收' && value === '已完成') {
        setError('項目狀態必須按順序更新: 未接收 -> 已接收 -> 已完成');
        return;
      }
      
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: value
      }
    } else {
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: field === 'quantity' || field === 'price' ? Number(value) : value
      }
    }
    
    // 更新項目金額
    if (field === 'quantity' || field === 'price') {
      const quantity = field === 'quantity' ? Number(value) : updatedItems[index].quantity || 0
      const price = field === 'price' ? Number(value) : updatedItems[index].price || 0
      updatedItems[index].total = quantity * price
    }
    
    setOrderItems(updatedItems)
    
    // 更新訂單總金額
    const totalAmount = updatedItems.reduce((sum, item) => sum + (item.total || 0), 0)
    setOrderForm(prev => ({ ...prev, total_amount: totalAmount }))
  }

  // 處理刪除訂單項目
  const handleRemoveItem = (index: number) => {
    const itemToRemove = orderItems[index]
    
    // 如果是已存在的項目（有ID），將其添加到刪除列表
    if (itemToRemove.id && originalItemIds.includes(itemToRemove.id)) {
      setDeletedItemIds(prev => [...prev, itemToRemove.id as number])
    }
    
    const updatedItems = orderItems.filter((_, i) => i !== index)
    setOrderItems(updatedItems)
    
    // 更新訂單總金額
    const totalAmount = updatedItems.reduce((sum, item) => sum + (item.total || 0), 0)
    setOrderForm(prev => ({ ...prev, total_amount: totalAmount }))
    
    // 更新類別選擇列表
    setSelectedCategories(prev => prev.filter((_, i) => i !== index))
  }

  // 處理表單提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 驗證表單
    if (orderForm.distributor_id === 0) {
      setError('請選擇經銷商')
      return
    }
    
    if (orderItems.length === 0) {
      setError('請至少添加一個訂購項目')
      return
    }
    
    for (const item of orderItems) {
      if (item.product_id === 0 || item.quantity <= 0 || item.price <= 0) {
        setError('請確保所有訂購項目都有選擇成品、數量和價格')
        return
      }
    }
    
    // 驗證運送方式
    if (!orderForm.delivery_method) {
      setError('請選擇運送方式')
      return
    }
    
    // 驗證物流或工廠發貨相關欄位
    if ((orderForm.delivery_method === '物流' || orderForm.delivery_method === '工廠發貨')) {
      if (!orderForm.shipping_company) {
        setError('請輸入寄送公司')
        return
      }
      if (!orderForm.shipping_address) {
        setError('請輸入公司地址')
        return
      }
      if (!orderForm.contact_person) {
        setError('請輸入聯絡人')
        return
      }
      if (!orderForm.contact_phone) {
        setError('請輸入聯絡人電話')
        return
      }
    }
    
    // 檢查訂單狀態與項目狀態的一致性
    const hasUnreceivedItems = orderItems.some(item => item.status === '未接收');
    const hasReceivedItems = !hasUnreceivedItems && orderItems.some(item => item.status === '已接收');
    const allItemsCompleted = orderItems.every(item => item.status === '已完成');
    
    if (hasUnreceivedItems && orderForm.status !== '待處理') {
      setError('有項目狀態為「未接收」時，訂單狀態必須為「待處理」');
      return;
    } else if (hasReceivedItems && orderForm.status !== '處理中') {
      setError('有項目狀態為「已接收」時，訂單狀態必須為「處理中」');
      return;
    } else if (allItemsCompleted && orderForm.status !== '待出貨' && orderForm.status !== '已完成') {
      setError('全部項目狀態為「已完成」時，訂單狀態必須為「待出貨」或「已完成」');
      return;
    }
    
    // 只有當所有項目都已完成時，才可以設置為待出貨或已完成
    if ((orderForm.status === '待出貨' || orderForm.status === '已完成') && !allItemsCompleted) {
      setError('只有當所有項目狀態為「已完成」時，才能將訂單狀態更新為「待出貨」或「已完成」');
      return;
    }
    
    setLoading(true)
    setError(null)

    try {
      // 生成當前日期 (如果delivery_date為空)
      const currentDate = new Date().toISOString().split('T')[0]
      
      // 準備要提交的表單數據，處理可能的空值或無效值
      const formData = {
        ...orderForm,
        // 確保 delivery_date 有值，如果為空則使用當前日期 (避免資料庫錯誤)
        delivery_date: orderForm.delivery_date?.trim() ? orderForm.delivery_date : currentDate,
        // 確保 total_amount 有值，否則設為 0
        total_amount: orderForm.total_amount || 0,
        // 確保 customer_po 有值，若為空字串則設為空格
        customer_po: orderForm.customer_po.trim() || ' '
      }

      if (id) {
        // 編輯模式 - 使用批量更新
        
        // 分類項目為現有項目和新項目
        const existingItems = orderItems
          .filter(item => item.id && originalItemIds.includes(item.id))
          .map(item => ({
            id: item.id as number,
            updates: {
              product_id: item.product_id,
              product_name: item.product_name,
              quantity: item.quantity,
              price: item.price || 0,
              total: item.total || 0,
              status: item.status || '未接收'
            }
          }))
        
        const newItems = orderItems
          .filter(item => !item.id || !originalItemIds.includes(item.id as number))
          .map(item => ({
            product_id: item.product_id,
            product_name: item.product_name,
            quantity: item.quantity,
            price: item.price || 0,
            total: item.total || 0,
            status: item.status || '未接收'
          }))
        
        const result = await updateOrderWithItems(id, formData, {
          existing: existingItems,
          new: newItems,
          deleted: deletedItemIds
        })
        
        if (result.order) {
          if (onSuccess) onSuccess()
          else router.push('/orders')
        } else {
          setError('更新訂購單失敗')
        }
      } else {
        // 創建新訂購單
        const orderItemsData = orderItems.map(item => ({
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: item.quantity,
          price: item.price || 0,
          total: item.total || 0,
          status: item.status || '未接收'
        }))
        
        const result = await createOrder(formData, orderItemsData)
        if (result.order) {
          if (onSuccess) onSuccess()
          else router.push('/orders')
        } else {
          setError('新增訂購單失敗')
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
      <h2 className="text-xl font-semibold mb-6">{id ? '編輯訂購單' : '新增訂購單'}</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="distributor_id">
              經銷商 <span className="text-red-500">*</span>
            </label>
            <select
              id="distributor_id"
              name="distributor_id"
              value={orderForm.distributor_id}
              onChange={handleOrderChange}
              required
              className="input w-full"
            >
              <option value="">請選擇經銷商</option>
              {distributors.map(dist => (
                <option key={dist.id} value={dist.id}>{dist.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="customer_po">
              客戶採購單號
            </label>
            <input
              type="text"
              id="customer_po"
              name="customer_po"
              value={orderForm.customer_po}
              onChange={handleOrderChange}
              className="input w-full"
              placeholder="請輸入客戶採購單號"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="order_date">
              訂購日期 <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="order_date"
              name="order_date"
              value={orderForm.order_date}
              onChange={handleOrderChange}
              required
              className="input w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="delivery_date">
              預計交貨日
            </label>
            <input
              type="date"
              id="delivery_date"
              name="delivery_date"
              value={orderForm.delivery_date}
              onChange={handleOrderChange}
              className="input w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="delivery_method">
              運送方式 <span className="text-red-500">*</span>
            </label>
            <select
              id="delivery_method"
              name="delivery_method"
              value={orderForm.delivery_method}
              onChange={handleOrderChange}
              required
              className="input w-full"
            >
              <option value="">請選擇運送方式</option>
              {deliveryMethodOptions.map(method => (
                <option key={method} value={method}>{method}</option>
              ))}
            </select>
          </div>

          {/* 運送方式為「物流」或「工廠發貨」時顯示的欄位 */}
          {(orderForm.delivery_method === '物流' || orderForm.delivery_method === '工廠發貨') && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="shipping_company">
                  寄送公司 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="shipping_company"
                  name="shipping_company"
                  value={orderForm.shipping_company}
                  onChange={handleOrderChange}
                  required
                  className="input w-full"
                  placeholder="請輸入寄送公司"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="shipping_address">
                  公司地址 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="shipping_address"
                  name="shipping_address"
                  value={orderForm.shipping_address}
                  onChange={handleOrderChange}
                  required
                  className="input w-full"
                  placeholder="請輸入公司地址"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="contact_person">
                  聯絡人 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="contact_person"
                  name="contact_person"
                  value={orderForm.contact_person}
                  onChange={handleOrderChange}
                  required
                  className="input w-full"
                  placeholder="請輸入聯絡人"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="contact_phone">
                  聯絡人電話 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="contact_phone"
                  name="contact_phone"
                  value={orderForm.contact_phone}
                  onChange={handleOrderChange}
                  required
                  className="input w-full"
                  placeholder="請輸入聯絡人電話"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="status">
              訂單狀態 <span className="text-red-500">*</span>
            </label>
            <select
              id="status"
              name="status"
              value={orderForm.status}
              onChange={handleOrderChange}
              required
              className="input w-full"
              disabled={orderItems.some(item => item.status === '未接收') || 
                        (orderItems.some(item => item.status === '已接收') && !orderItems.some(item => item.status === '未接收'))}
            >
              {/* 當所有項目為已完成時，只顯示待出貨和已完成選項 */}
              {orderItems.length > 0 && orderItems.every(item => item.status === '已完成') ? (
                // 只顯示待出貨和已完成
                statusOptions
                  .filter(status => status === '待出貨' || status === '已完成')
                  .map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))
              ) : (
                // 顯示所有狀態選項
                statusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))
              )}
            </select>
            {(orderItems.some(item => item.status === '未接收') || 
              (orderItems.some(item => item.status === '已接收') && !orderItems.some(item => item.status === '未接收'))) && (
              <p className="text-xs text-gray-500 mt-1">
                訂單狀態會根據項目狀態自動更新，目前無法手動更改
              </p>
            )}
            {orderItems.length > 0 && orderItems.every(item => item.status === '已完成') && (
              <p className="text-xs text-green-600 mt-1">
                所有項目已完成，您可以將訂單狀態更新為「待出貨」或「已完成」
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              總金額
            </label>
            <div className="input w-full bg-gray-100">
              ${orderForm.total_amount.toLocaleString()}
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
            value={orderForm.notes}
            onChange={handleOrderChange}
            className="input w-full h-24"
            placeholder="請輸入備註"
          />
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium">訂購項目</h3>
            <button
              type="button"
              onClick={handleAddItem}
              className="btn btn-sm btn-primary flex items-center gap-1"
            >
              <FaPlus size={12} /> 添加項目
            </button>
          </div>

          {orderItems.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">尚未添加訂購項目</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left">類別</th>
                    <th className="px-4 py-2 text-left">成品</th>
                    <th className="px-4 py-2 text-right">數量</th>
                    <th className="px-4 py-2 text-right">單價</th>
                    <th className="px-4 py-2 text-right">金額</th>
                    <th className="px-4 py-2 text-center">項目狀態</th>
                    <th className="px-4 py-2 text-center">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {orderItems.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="px-4 py-2">
                        <select
                          className="input w-full"
                          value={selectedCategories[index]}
                          onChange={(e) => handleCategoryChange(index, e.target.value)}
                        >
                          <option value="所有類別">所有類別</option>
                          {categoryOptions.filter(c => c !== '所有類別').map(category => (
                            <option key={category} value={category}>{category}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-2">
                        <select
                          className="input w-full"
                          value={item.product_id}
                          onChange={(e) => handleItemChange(index, 'product_id', e.target.value)}
                          required
                        >
                          <option value="">請選擇成品</option>
                          {filteredProducts.map(product => (
                            <option key={product.id} value={product.id}>{product.name}</option>
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
                          value={item.price}
                          onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                          min="0"
                          required
                        />
                      </td>
                      <td className="px-4 py-2 text-right">
                        ${item.total.toLocaleString()}
                      </td>
                      <td className="px-4 py-2">
                        <select
                          className="input w-full"
                          value={item.status}
                          onChange={(e) => handleItemChange(index, 'status', e.target.value)}
                        >
                          {itemStatusOptions.map(status => (
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
            onClick={onCancel || (() => router.push('/orders'))}
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