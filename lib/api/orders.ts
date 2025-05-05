import { supabase, Order, OrderItem } from '../supabase'

// 獲取所有訂購單
export async function getOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('order_date', { ascending: false })

  if (error) {
    console.error('獲取訂購單數據失敗:', error)
    return []
  }

  return data || []
}

// 獲取單個訂購單與其項目
export async function getOrderWithItems(id: string): Promise<{ order: Order | null, items: OrderItem[] }> {
  // 獲取訂購單
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single()

  if (orderError) {
    console.error(`獲取訂購單數據失敗 (ID: ${id}):`, orderError)
    return { order: null, items: [] }
  }

  // 獲取訂購單項目
  const { data: items, error: itemsError } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', id)

  if (itemsError) {
    console.error(`獲取訂購單項目失敗 (Order ID: ${id}):`, itemsError)
    return { order, items: [] }
  }

  return { order, items: items || [] }
}

// 新增訂購單
export async function createOrder(
  order: Omit<Order, 'id' | 'created_at'>, 
  items: Omit<OrderItem, 'id' | 'order_id'>[]
): Promise<{ order: Order | null, items: OrderItem[] }> {
  // 開始事務
  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .insert([order])
    .select()
    .single()

  if (orderError) {
    console.error('新增訂購單失敗:', orderError)
    return { order: null, items: [] }
  }

  // 準備訂購單項目資料
  const orderItems = items.map(item => ({
    ...item,
    order_id: orderData.id
  }))

  // 插入訂購單項目
  const { data: itemsData, error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems)
    .select()

  if (itemsError) {
    console.error(`新增訂購單項目失敗 (Order ID: ${orderData.id}):`, itemsError)
    return { order: orderData, items: [] }
  }

  return { order: orderData, items: itemsData || [] }
}

// 更新訂購單
export async function updateOrder(id: string, updates: Partial<Omit<Order, 'id' | 'created_at'>>): Promise<Order | null> {
  const { data, error } = await supabase
    .from('orders')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error(`更新訂購單失敗 (ID: ${id}):`, error)
    return null
  }

  return data
}

// 更新訂購單狀態
export async function updateOrderStatus(id: string, status: string): Promise<Order | null> {
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error(`更新訂購單狀態失敗 (ID: ${id}):`, error)
    return null
  }

  return data
}

// 更新訂購單項目
export async function updateOrderItem(id: number, updates: Partial<Omit<OrderItem, 'id' | 'order_id'>>): Promise<OrderItem | null> {
  const { data, error } = await supabase
    .from('order_items')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error(`更新訂購單項目失敗 (ID: ${id}):`, error)
    return null
  }

  return data
}

// 刪除訂購單及其項目
export async function deleteOrder(id: string): Promise<boolean> {
  // 刪除訂購單項目
  const { error: itemsError } = await supabase
    .from('order_items')
    .delete()
    .eq('order_id', id)

  if (itemsError) {
    console.error(`刪除訂購單項目失敗 (Order ID: ${id}):`, itemsError)
    return false
  }

  // 刪除訂購單
  const { error: orderError } = await supabase
    .from('orders')
    .delete()
    .eq('id', id)

  if (orderError) {
    console.error(`刪除訂購單失敗 (ID: ${id}):`, orderError)
    return false
  }

  return true
}

// 搜尋訂購單
export async function searchOrders(query: string): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .or(`id.ilike.%${query}%,distributor_name.ilike.%${query}%,customer_po.ilike.%${query}%`)
    .order('order_date', { ascending: false })

  if (error) {
    console.error('搜尋訂購單失敗:', error)
    return []
  }

  return data || []
}

// 根據狀態過濾訂購單
export async function filterOrdersByStatus(status: string): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('status', status)
    .order('order_date', { ascending: false })

  if (error) {
    console.error(`過濾訂購單失敗 (Status: ${status}):`, error)
    return []
  }

  return data || []
}

// 獲取訂購單統計資料
export async function getOrderStats(): Promise<{ pending: number, processing: number, awaiting: number, completed: number }> {
  const stats = {
    pending: 0,
    processing: 0,
    awaiting: 0,
    completed: 0
  }

  // 獲取待處理訂購單數量
  const { count: pendingCount, error: pendingError } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('status', '待處理')

  if (!pendingError && pendingCount !== null) {
    stats.pending = pendingCount
  }

  // 獲取處理中訂購單數量
  const { count: processingCount, error: processingError } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('status', '處理中')

  if (!processingError && processingCount !== null) {
    stats.processing = processingCount
  }

  // 獲取待出貨訂購單數量
  const { count: awaitingCount, error: awaitingError } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('status', '待出貨')

  if (!awaitingError && awaitingCount !== null) {
    stats.awaiting = awaitingCount
  }

  // 獲取已完成訂購單數量
  const { count: completedCount, error: completedError } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('status', '已完成')

  if (!completedError && completedCount !== null) {
    stats.completed = completedCount
  }

  return stats
} 