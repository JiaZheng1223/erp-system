'use client'

import { useState, useEffect } from 'react'
import Header from '@/app/components/Header'
import { FaShoppingBag, FaShoppingCart, FaBox, FaCheckCircle } from 'react-icons/fa'
import { getDashboardData } from '@/lib/api/dashboard'

// 定義儀表板數據的類型
interface DashboardData {
  orderStats: {
    pending: number;
    processing: number;
    awaiting: number;
    completed: number;
  };
  purchaseStats: {
    draft: number;
    sent: number;
    completed: number;
  };
  monthlyOrdersData: {
    month: string;
    count: number;
  }[];
  productShipmentData: {
    id: number;
    name: string;
    quantity: number;
  }[];
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    orderStats: {
      pending: 0,
      processing: 0,
      awaiting: 0,
      completed: 0
    },
    purchaseStats: {
      draft: 0,
      sent: 0,
      completed: 0
    },
    monthlyOrdersData: [],
    productShipmentData: []
  })

  // 載入儀表板數據
  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true)
        const data = await getDashboardData()
        setDashboardData(data)
        setError(null)
      } catch (err) {
        console.error('Failed to load dashboard data:', err)
        setError('載入儀表板數據失敗')
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  return (
    <div>
      <Header title="儀錶板" subtitle="營運數據概覽" />

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-gray-500">載入中...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* 訂購單統計卡片 */}
            <div className="card bg-white flex items-center p-6">
              <div className="rounded-full bg-blue-100 p-3 mr-4">
                <FaShoppingBag className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">訂購單待處理</p>
                <h3 className="text-2xl font-bold">{dashboardData.orderStats.pending}</h3>
              </div>
            </div>
            
            <div className="card bg-white flex items-center p-6">
              <div className="rounded-full bg-indigo-100 p-3 mr-4">
                <FaShoppingCart className="h-6 w-6 text-indigo-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">訂購單處理中</p>
                <h3 className="text-2xl font-bold">{dashboardData.orderStats.processing}</h3>
              </div>
            </div>
            
            <div className="card bg-white flex items-center p-6">
              <div className="rounded-full bg-yellow-100 p-3 mr-4">
                <FaBox className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">訂購單待出貨</p>
                <h3 className="text-2xl font-bold">{dashboardData.orderStats.awaiting}</h3>
              </div>
            </div>
            
            <div className="card bg-white flex items-center p-6">
              <div className="rounded-full bg-green-100 p-3 mr-4">
                <FaCheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">訂購單已完成</p>
                <h3 className="text-2xl font-bold">{dashboardData.orderStats.completed}</h3>
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
                <h3 className="text-2xl font-bold">{dashboardData.purchaseStats.draft}</h3>
              </div>
            </div>
            
            <div className="card bg-white flex items-center p-6">
              <div className="rounded-full bg-blue-100 p-3 mr-4">
                <FaShoppingCart className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">採購單已送出</p>
                <h3 className="text-2xl font-bold">{dashboardData.purchaseStats.sent}</h3>
              </div>
            </div>
            
            <div className="card bg-white flex items-center p-6">
              <div className="rounded-full bg-green-100 p-3 mr-4">
                <FaCheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">採購單已完成</p>
                <h3 className="text-2xl font-bold">{dashboardData.purchaseStats.completed}</h3>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
} 