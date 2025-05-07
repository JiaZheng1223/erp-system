'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/app/components/Header'
import { FaArrowLeft, FaEdit, FaArrowUp, FaArrowDown, FaHistory, FaTrash } from 'react-icons/fa'
import { getProduct, getProductMovements, moveProductStock, updateProductStock, deleteProduct } from '@/lib/api/products'
import { Product } from '@/lib/supabase'
import { useAuth } from '@/lib/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [product, setProduct] = useState<Product | null>(null)
  const [movements, setMovements] = useState<any[]>([])
  const [confirmModal, setConfirmModal] = useState<null | {
    type: 'in' | 'out' | 'adjust',
    quantity: number,
    note: string
  }>(null)
  const [secondConfirm, setSecondConfirm] = useState<null | typeof confirmModal>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // 載入成品數據
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const [productData, movementsData] = await Promise.all([
          getProduct(parseInt(params.id)),
          getProductMovements(parseInt(params.id))
        ])
        
        if (productData) {
          setProduct(productData)
        }
        setMovements(movementsData)
      } catch (err) {
        console.error('Failed to load data:', err)
        setError('載入資料失敗')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [params.id])

  // 處理刪除成品
  const handleDelete = async () => {
    try {
      const success = await deleteProduct(parseInt(params.id))
      if (success) {
        router.push('/products')
      } else {
        setError('刪除成品失敗')
      }
    } catch (err) {
      console.error('Failed to delete product:', err)
      setError('刪除成品失敗')
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

  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">找不到成品資料</p>
        <button 
          className="btn btn-primary mt-4"
          onClick={() => router.push('/products')}
        >
          返回列表
        </button>
      </div>
    )
  }

  return (
    <div>
      <Header title="成品詳情" subtitle="查看成品詳細資訊" />
      
      <div className="flex justify-between items-center mb-6">
        <button
          className="btn btn-outline flex items-center gap-2"
          onClick={() => router.push('/products')}
        >
          <FaArrowLeft /> 返回列表
        </button>
        <div className="flex gap-2">
          <button
            className="btn btn-primary flex items-center gap-2"
            onClick={() => router.push(`/products/${params.id}/edit`)}
          >
            <FaEdit /> 編輯成品
          </button>
          <button
            className="btn btn-danger flex items-center gap-2"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <FaTrash /> 刪除成品
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-4 bg-gray-100 h-64 rounded flex items-center justify-center">
            {product.image_url ? (
              <div className="flex items-center justify-center w-full h-full">
                <img 
                  src={product.image_url} 
                  alt={product.name}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            ) : (
              <div className="text-gray-400">無圖片</div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between mb-2">
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">{product.category}</span>
          </div>
          
          <h2 className="text-2xl font-bold mb-4">
            {product.efficiency !== '無' && (
              <span className="border border-gray-300 rounded px-1 mr-1 bg-gray-50">{product.efficiency}</span>
            )}
            {product.name}
          </h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="text-sm text-gray-500 mb-1">目前庫存</div>
                <div className={`text-2xl font-bold ${product.stock <= product.safety_stock ? 'text-red-600' : 'text-gray-900'}`}>
                  {product.stock}
                </div>
                {product.stock <= product.safety_stock && (
                  <div className="text-xs text-red-500 mt-1">庫存低於安全庫存量</div>
                )}
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="text-sm text-gray-500 mb-1">安全庫存量</div>
                <div className="text-2xl font-bold text-gray-900">
                  {product.safety_stock}
                </div>
              </div>
            </div>
            
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-0.5">
                備註
              </label>
              <div className="bg-gray-50 rounded-lg p-4 min-h-[100px]">
                {product.notes || '無備註'}
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-6">
            <button 
              className="btn btn-success flex items-center gap-1" 
              onClick={() => setConfirmModal({type: 'in', quantity: 1, note: ''})}
            >
              <FaArrowDown /> 入庫
            </button>
            <button 
              className="btn flex items-center gap-1 bg-yellow-400 text-white hover:bg-yellow-500" 
              onClick={() => setConfirmModal({type: 'adjust', quantity: product.stock, note: ''})}
            >
              <FaHistory /> 調整
            </button>
            <button 
              className="btn btn-danger flex items-center gap-1" 
              onClick={() => setConfirmModal({type: 'out', quantity: 1, note: ''})}
            >
              <FaArrowUp /> 出庫
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">庫存異動紀錄</h3>
        {movements.length === 0 ? (
          <p className="text-gray-500 text-center py-4">尚無異動紀錄</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">時間</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">類型</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">數量</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">備註</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作者</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {movements.map((movement) => (
                  <tr key={movement.id}>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      {new Date(movement.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded text-xs ${
                        movement.type === 'in' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {movement.type === 'in' ? '入庫' : '出庫'}
                      </span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      {movement.quantity}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {movement.note || '-'}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      {movement.profiles?.name || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 確認 Modal */}
      {confirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xs">
            <h3 className="font-bold mb-4">確認{confirmModal.type === 'in' ? '入庫' : confirmModal.type === 'out' ? '出庫' : '調整'}動作</h3>
            <div className="mb-2">
              <label className="block text-sm mb-1">數量</label>
              <input 
                type="number" 
                className="input w-full" 
                value={confirmModal.quantity} 
                min={confirmModal.type === 'adjust' ? 0 : 1} 
                onChange={e => setConfirmModal({...confirmModal, quantity: Number(e.target.value)})} 
              />
            </div>
            <div className="mb-2">
              <label className="block text-sm mb-1">備註</label>
              <input 
                type="text" 
                className="input w-full" 
                value={confirmModal.note} 
                onChange={e => setConfirmModal({...confirmModal, note: e.target.value})} 
              />
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
                  const res = await moveProductStock(parseInt(params.id), user.id, secondConfirm.type, secondConfirm.quantity, secondConfirm.note)
                  if (res.error) { setError(res.error); return; }
                } else if (secondConfirm.type === 'adjust') {
                  if (secondConfirm.quantity < 0) { setError('數量不可小於0'); return; }
                  const updated = await updateProductStock(parseInt(params.id), secondConfirm.quantity)
                  if (!updated) { setError('庫存更新失敗'); return; }
                  const diff = secondConfirm.quantity - product.stock;
                  if (diff !== 0) {
                    const { error: insertError } = await supabase.from('product_movements').insert({
                      product_id: parseInt(params.id),
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
                // 重新載入資料
                const [productData, movementsData] = await Promise.all([
                  getProduct(parseInt(params.id)),
                  getProductMovements(parseInt(params.id))
                ])
                if (productData) {
                  setProduct(productData)
                }
                setMovements(movementsData)
              }}>確定</button>
              <button className="btn btn-danger flex-1" onClick={() => setSecondConfirm(null)}>取消</button>
            </div>
          </div>
        </div>
      )}

      {/* 刪除確認 Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xs">
            <h3 className="font-bold mb-4">確認刪除</h3>
            <div className="mb-4">確定要刪除此成品嗎？此操作無法復原。</div>
            <div className="flex gap-2 mt-4">
              <button className="btn btn-danger flex-1" onClick={handleDelete}>確定刪除</button>
              <button className="btn btn-outline flex-1" onClick={() => setShowDeleteConfirm(false)}>取消</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 