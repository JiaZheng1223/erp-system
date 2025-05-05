import { supabase, Product } from '../supabase'

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