import { supabase, Order, Product } from '../supabase'
import { getOrderStats } from './orders'
import { getPurchaseStats } from './purchases'

// 獲取儀錶板數據
export async function getDashboardData() {
  // 獲取訂購單與採購單統計
  const orderStats = await getOrderStats()
  const purchaseStats = await getPurchaseStats()

  // 獲取每月訂購單數量統計
  const monthlyOrdersData = await getMonthlyOrdersStats()

  // 獲取成品出貨統計
  const productShipmentData = await getProductShipmentStats()

  return {
    orderStats,
    purchaseStats,
    monthlyOrdersData,
    productShipmentData
  }
}

// 獲取每月訂購單統計
async function getMonthlyOrdersStats() {
  // 獲取過去12個月的訂購單數量
  const today = new Date()
  const twelveMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 11, 1)
  
  const { data, error } = await supabase
    .from('orders')
    .select('order_date')
    .gte('order_date', twelveMonthsAgo.toISOString().split('T')[0])
    .lte('order_date', today.toISOString().split('T')[0])
  
  if (error) {
    console.error('獲取訂購單統計數據失敗:', error)
    return []
  }
  
  // 初始化每月訂購單數量
  const months: { [key: string]: number } = {}
  for (let i = 0; i < 12; i++) {
    const monthDate = new Date(today.getFullYear(), today.getMonth() - 11 + i, 1)
    const monthKey = monthDate.toISOString().slice(0, 7) // 格式: 'YYYY-MM'
    months[monthKey] = 0
  }
  
  // 計算每月訂購單數量
  if (data) {
    data.forEach(order => {
      const monthKey = order.order_date.slice(0, 7)
      if (months[monthKey] !== undefined) {
        months[monthKey]++
      }
    })
  }
  
  // 轉換為圖表所需的格式
  return Object.entries(months).map(([month, count]) => ({
    month,
    count
  }))
}

// 獲取成品出貨統計
async function getProductShipmentStats() {
  // 查詢已完成的訂購單項目
  const { data: orderItems, error } = await supabase
    .from('order_items')
    .select('product_id, product_name, quantity')
    .eq('status', '已完成')
  
  if (error) {
    console.error('獲取成品出貨統計數據失敗:', error)
    return []
  }
  
  // 計算每個產品的出貨數量
  const productShipments: { [key: string]: { id: number, name: string, quantity: number } } = {}
  
  if (orderItems) {
    orderItems.forEach(item => {
      if (!productShipments[item.product_id]) {
        productShipments[item.product_id] = {
          id: item.product_id,
          name: item.product_name,
          quantity: 0
        }
      }
      productShipments[item.product_id].quantity += item.quantity
    })
  }
  
  // 轉換為數組並按出貨數量排序
  return Object.values(productShipments)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10) // 只返回前10個產品
} 