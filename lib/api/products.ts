import { supabase, Product, ProductCategory, ProductEfficiency } from '../supabase'

// 獲取所有成品
export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('name')

  if (error) {
    console.error('獲取成品數據失敗:', error)
    return []
  }

  return data || []
}

// 獲取單個成品
export async function getProduct(id: number): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error(`獲取成品數據失敗 (ID: ${id}):`, error)
    return null
  }

  return data
}

// 新增成品
export async function createProduct(product: Omit<Product, 'id' | 'created_at'>): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .insert([product])
    .select()
    .single()

  if (error) {
    console.error('新增成品失敗:', error)
    return null
  }

  return data
}

// 更新成品
export async function updateProduct(id: number, updates: Partial<Omit<Product, 'id' | 'created_at'>>): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error(`更新成品失敗 (ID: ${id}):`, error)
    return null
  }

  return data
}

// 更新成品庫存
export async function updateProductStock(id: number, stock: number): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .update({ stock })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error(`更新成品庫存失敗 (ID: ${id}):`, error)
    return null
  }

  return data
}

// 刪除成品
export async function deleteProduct(id: number): Promise<boolean> {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)

  if (error) {
    console.error(`刪除成品失敗 (ID: ${id}):`, error)
    return false
  }

  return true
}

// 搜尋成品
export async function searchProducts(query: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .or(`name.ilike.%${query}%,notes.ilike.%${query}%`)
    .order('name')

  if (error) {
    console.error('搜尋成品失敗:', error)
    return []
  }

  return data || []
}

// 根據類別和效率過濾成品
export async function filterProducts(category?: string, efficiency?: string): Promise<Product[]> {
  let query = supabase.from('products').select('*')
  
  if (category) {
    query = query.eq('category', category)
  }
  
  if (efficiency) {
    query = query.eq('efficiency', efficiency)
  }
  
  const { data, error } = await query.order('name')

  if (error) {
    console.error('過濾成品失敗:', error)
    return []
  }

  return data || []
}

// 調動庫存（入庫/出庫）
export async function moveProductStock(productId: number, userId: string, type: 'in' | 'out', quantity: number, note?: string) {
  // 1. 取得現有庫存
  const product = await getProduct(productId)
  if (!product) return { error: '找不到成品' }
  let newStock = type === 'in' ? product.stock + quantity : product.stock - quantity
  if (newStock < 0) return { error: '庫存不足' } 

  // 2. 更新庫存
  await updateProductStock(productId, newStock)

  // 3. 寫入調動紀錄，捕捉錯誤
  const { error: insertError } = await supabase.from('product_movements').insert({
    product_id: productId,
    user_id: userId,
    type,
    quantity,
    note
  })
  if (insertError) {
    return { error: '寫入調動紀錄失敗: ' + insertError.message }
  }

  return { success: true }
}

// 查詢成品調動紀錄
export async function getProductMovements(productId: number) {
  const { data, error } = await supabase
    .from('product_movements')
    .select('*, profiles(name)')
    .eq('product_id', productId)
    .order('created_at', { ascending: false })
  return data || []
}

// 獲取所有成品類別
export async function getProductCategories(): Promise<ProductCategory[]> {
  const { data, error } = await supabase
    .from('product_categories')
    .select('*')
    .order('name')

  if (error) {
    console.error('獲取成品類別失敗:', error)
    return []
  }

  return data || []
}

// 新增成品類別
export async function createProductCategory(name: string): Promise<ProductCategory | null> {
  const { data, error } = await supabase
    .from('product_categories')
    .insert([{ name }])
    .select()
    .single()

  if (error) {
    console.error('新增成品類別失敗:', error)
    return null
  }

  return data
}

// 刪除成品類別
export async function deleteProductCategory(id: number): Promise<boolean> {
  const { error } = await supabase
    .from('product_categories')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('刪除成品類別失敗:', error)
    return false
  }

  return true
}

// 獲取所有成品效率
export async function getProductEfficiencies(): Promise<ProductEfficiency[]> {
  const { data, error } = await supabase
    .from('product_efficiencies')
    .select('*')
    .order('name')

  if (error) {
    console.error('獲取成品效率失敗:', error)
    return []
  }

  return data || []
}

// 新增成品效率
export async function createProductEfficiency(name: string): Promise<ProductEfficiency | null> {
  const { data, error } = await supabase
    .from('product_efficiencies')
    .insert([{ name }])
    .select()
    .single()

  if (error) {
    console.error('新增成品效率失敗:', error)
    return null
  }

  return data
}

// 刪除成品效率
export async function deleteProductEfficiency(id: number): Promise<boolean> {
  const { error } = await supabase
    .from('product_efficiencies')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('刪除成品效率失敗:', error)
    return false
  }

  return true
} 