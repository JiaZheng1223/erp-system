import { supabase, Purchase, PurchaseItem } from '../supabase'

// 獲取所有採購單
export async function getPurchases(): Promise<Purchase[]> {
  const { data, error } = await supabase
    .from('purchases')
    .select('*')
    .order('purchase_date', { ascending: false })

  if (error) {
    console.error('獲取採購單數據失敗:', error)
    return []
  }

  return data || []
}

// 獲取單個採購單與其項目
export async function getPurchaseWithItems(id: string): Promise<{ purchase: Purchase | null, items: PurchaseItem[] }> {
  // 獲取採購單
  const { data: purchase, error: purchaseError } = await supabase
    .from('purchases')
    .select('*')
    .eq('id', id)
    .single()

  if (purchaseError) {
    console.error(`獲取採購單數據失敗 (ID: ${id}):`, purchaseError)
    return { purchase: null, items: [] }
  }

  // 獲取採購單項目
  const { data: items, error: itemsError } = await supabase
    .from('purchase_items')
    .select('*')
    .eq('purchase_id', id)

  if (itemsError) {
    console.error(`獲取採購單項目失敗 (Purchase ID: ${id}):`, itemsError)
    return { purchase, items: [] }
  }

  return { purchase, items: items || [] }
}

// 新增採購單
export async function createPurchase(
  purchase: Omit<Purchase, 'id' | 'created_at'>, 
  items: Omit<PurchaseItem, 'id' | 'purchase_id'>[]
): Promise<{ purchase: Purchase | null, items: PurchaseItem[] }> {
  // 生成採購單ID
  const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  const purchaseId = `P-${today}-${random}`;
  
  // 插入採購單
  const { data: purchaseData, error: purchaseError } = await supabase
    .from('purchases')
    .insert([{ ...purchase, id: purchaseId }])
    .select()
    .single()

  if (purchaseError) {
    console.error('新增採購單失敗:', purchaseError)
    return { purchase: null, items: [] }
  }

  // 準備採購單項目資料
  const purchaseItems = items.map(item => ({
    ...item,
    purchase_id: purchaseData.id
  }))

  // 插入採購單項目
  const { data: itemsData, error: itemsError } = await supabase
    .from('purchase_items')
    .insert(purchaseItems)
    .select()

  if (itemsError) {
    console.error(`新增採購單項目失敗 (Purchase ID: ${purchaseData.id}):`, itemsError)
    return { purchase: purchaseData, items: [] }
  }

  return { purchase: purchaseData, items: itemsData || [] }
}

// 更新採購單及其項目
export async function updatePurchaseWithItems(
  id: string,
  updates: Partial<Omit<Purchase, 'id' | 'created_at'>>,
  items: {
    existing: { id: number, updates: Partial<Omit<PurchaseItem, 'id' | 'purchase_id'>> }[],
    new: Omit<PurchaseItem, 'id' | 'purchase_id'>[],
    deleted: number[]
  }
): Promise<{ purchase: Purchase | null, items: PurchaseItem[] }> {
  // 開始事務，確保數據一致性
  try {
    // 更新採購單
    const { data: purchase, error: purchaseError } = await supabase
      .from('purchases')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (purchaseError) {
      console.error(`更新採購單失敗 (ID: ${id}):`, purchaseError)
      return { purchase: null, items: [] }
    }

    // 更新現有項目
    for (const item of items.existing) {
      const { error } = await supabase
        .from('purchase_items')
        .update(item.updates)
        .eq('id', item.id)
        
      if (error) {
        console.error(`更新採購單項目失敗 (ID: ${item.id}):`, error)
      }
    }

    // 添加新項目
    if (items.new.length > 0) {
      const newItemsWithPurchaseId = items.new.map(item => ({
        ...item,
        purchase_id: id
      }))

      const { error } = await supabase
        .from('purchase_items')
        .insert(newItemsWithPurchaseId)
        
      if (error) {
        console.error(`添加新採購單項目失敗:`, error)
      }
    }

    // 刪除項目
    if (items.deleted.length > 0) {
      const { error } = await supabase
        .from('purchase_items')
        .delete()
        .in('id', items.deleted)
        
      if (error) {
        console.error(`刪除採購單項目失敗:`, error)
      }
    }

    // 獲取更新後的項目
    const { data: updatedItems, error: itemsError } = await supabase
      .from('purchase_items')
      .select('*')
      .eq('purchase_id', id)

    if (itemsError) {
      console.error(`獲取更新後的採購單項目失敗 (Purchase ID: ${id}):`, itemsError)
      return { purchase, items: [] }
    }

    return { purchase, items: updatedItems || [] }
  } catch (err) {
    console.error(`更新採購單及項目時發生錯誤 (ID: ${id}):`, err)
    return { purchase: null, items: [] }
  }
}

// 更新採購單狀態
export async function updatePurchaseStatus(id: string, status: string): Promise<Purchase | null> {
  const { data, error } = await supabase
    .from('purchases')
    .update({ status })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error(`更新採購單狀態失敗 (ID: ${id}):`, error)
    return null
  }

  return data
}

// 更新採購單項目
export async function updatePurchaseItem(id: number, updates: Partial<Omit<PurchaseItem, 'id' | 'purchase_id'>>): Promise<PurchaseItem | null> {
  const { data, error } = await supabase
    .from('purchase_items')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error(`更新採購單項目失敗 (ID: ${id}):`, error)
    return null
  }

  return data
}

// 刪除採購單及其項目
export async function deletePurchase(id: string): Promise<boolean> {
  // 刪除採購單項目
  const { error: itemsError } = await supabase
    .from('purchase_items')
    .delete()
    .eq('purchase_id', id)

  if (itemsError) {
    console.error(`刪除採購單項目失敗 (Purchase ID: ${id}):`, itemsError)
    return false
  }

  // 刪除採購單
  const { error: purchaseError } = await supabase
    .from('purchases')
    .delete()
    .eq('id', id)

  if (purchaseError) {
    console.error(`刪除採購單失敗 (ID: ${id}):`, purchaseError)
    return false
  }

  return true
}

// 搜尋採購單
export async function searchPurchases(query: string): Promise<Purchase[]> {
  const { data, error } = await supabase
    .from('purchases')
    .select('*')
    .or(`id.ilike.%${query}%,supplier_name.ilike.%${query}%,purchaser.ilike.%${query}%`)
    .order('purchase_date', { ascending: false })

  if (error) {
    console.error('搜尋採購單失敗:', error)
    return []
  }

  return data || []
}

// 根據狀態過濾採購單
export async function filterPurchasesByStatus(status: string): Promise<Purchase[]> {
  const { data, error } = await supabase
    .from('purchases')
    .select('*')
    .eq('status', status)
    .order('purchase_date', { ascending: false })

  if (error) {
    console.error(`過濾採購單失敗 (Status: ${status}):`, error)
    return []
  }

  return data || []
}

// 獲取採購單統計資料
export async function getPurchaseStats(): Promise<{ draft: number, sent: number, completed: number }> {
  const stats = {
    draft: 0,
    sent: 0,
    completed: 0
  }

  // 獲取草稿採購單數量
  const { count: draftCount, error: draftError } = await supabase
    .from('purchases')
    .select('*', { count: 'exact', head: true })
    .eq('status', '草稿')

  if (!draftError && draftCount !== null) {
    stats.draft = draftCount
  }

  // 獲取已送出採購單數量
  const { count: sentCount, error: sentError } = await supabase
    .from('purchases')
    .select('*', { count: 'exact', head: true })
    .eq('status', '已送出')

  if (!sentError && sentCount !== null) {
    stats.sent = sentCount
  }

  // 獲取已完成採購單數量
  const { count: completedCount, error: completedError } = await supabase
    .from('purchases')
    .select('*', { count: 'exact', head: true })
    .eq('status', '已完成')

  if (!completedError && completedCount !== null) {
    stats.completed = completedCount
  }

  return stats
}

// 更新採購單
export async function updatePurchase(id: string, updates: Partial<Omit<Purchase, 'id' | 'created_at'>>): Promise<Purchase | null> {
  const { data, error } = await supabase
    .from('purchases')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error(`更新採購單失敗 (ID: ${id}):`, error)
    return null
  }

  return data
}

// 根據供應商ID獲取採購單
export async function getPurchasesBySupplier(supplierId: number): Promise<Purchase[]> {
  const { data, error } = await supabase
    .from('purchases')
    .select('*')
    .eq('supplier_id', supplierId)
    .order('purchase_date', { ascending: false })

  if (error) {
    console.error(`獲取供應商採購單失敗 (Supplier ID: ${supplierId}):`, error)
    return []
  }

  return data || []
} 