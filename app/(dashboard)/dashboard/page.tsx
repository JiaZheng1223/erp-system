'use client'

import Header from '@/app/components/Header'
import { FaShoppingBag, FaShoppingCart, FaBox, FaCheckCircle } from 'react-icons/fa'

// 假設這些數據未來會從API獲取
const dummyData = {
  orders: {
    pending: 12,
    processing: 8,
    awaiting: 5,
    completed: 24
  },
  purchases: {
    draft: 7,
    sent: 10,
    completed: 15
  }
}

export default function Dashboard() {
  return (
    <div>
      <Header title="儀錶板" subtitle="營運數據概覽" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* 訂購單統計卡片 */}
        <div className="card bg-white flex items-center p-6">
          <div className="rounded-full bg-blue-100 p-3 mr-4">
            <FaShoppingBag className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500">訂購單待處理</p>
            <h3 className="text-2xl font-bold">{dummyData.orders.pending}</h3>
          </div>
        </div>
        
        <div className="card bg-white flex items-center p-6">
          <div className="rounded-full bg-indigo-100 p-3 mr-4">
            <FaShoppingCart className="h-6 w-6 text-indigo-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500">訂購單處理中</p>
            <h3 className="text-2xl font-bold">{dummyData.orders.processing}</h3>
          </div>
        </div>
        
        <div className="card bg-white flex items-center p-6">
          <div className="rounded-full bg-yellow-100 p-3 mr-4">
            <FaBox className="h-6 w-6 text-yellow-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500">訂購單待出貨</p>
            <h3 className="text-2xl font-bold">{dummyData.orders.awaiting}</h3>
          </div>
        </div>
        
        <div className="card bg-white flex items-center p-6">
          <div className="rounded-full bg-green-100 p-3 mr-4">
            <FaCheckCircle className="h-6 w-6 text-green-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500">訂購單已完成</p>
            <h3 className="text-2xl font-bold">{dummyData.orders.completed}</h3>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* 採購單統計卡片 */}
        <div className="card bg-white flex items-center p-6">
          <div className="rounded-full bg-purple-100 p-3 mr-4">
            <FaShoppingBag className="h-6 w-6 text-purple-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500">採購單草稿</p>
            <h3 className="text-2xl font-bold">{dummyData.purchases.draft}</h3>
          </div>
        </div>
        
        <div className="card bg-white flex items-center p-6">
          <div className="rounded-full bg-blue-100 p-3 mr-4">
            <FaShoppingCart className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500">採購單已送出</p>
            <h3 className="text-2xl font-bold">{dummyData.purchases.sent}</h3>
          </div>
        </div>
        
        <div className="card bg-white flex items-center p-6">
          <div className="rounded-full bg-green-100 p-3 mr-4">
            <FaCheckCircle className="h-6 w-6 text-green-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500">採購單已完成</p>
            <h3 className="text-2xl font-bold">{dummyData.purchases.completed}</h3>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">每月訂購單量趨勢</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
            <p className="text-gray-500">此處將顯示訂購單趨勢圖表</p>
          </div>
        </div>
        
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">成品出貨統計</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
            <p className="text-gray-500">此處將顯示成品出貨統計圖表</p>
          </div>
        </div>
      </div>
    </div>
  )
} 