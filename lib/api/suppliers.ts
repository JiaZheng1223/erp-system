import { supabase, Supplier } from '../supabase'

// 獲取所有物料商
export async function getSuppliers(): Promise<Supplier[]> {
  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .order('name')

  if (error) {
    console.error('獲取物料商數據失敗:', error)
    return []
  }

  return data || []
}

// 獲取單個物料商
export async function getSupplier(id: number): Promise<Supplier | null> {
  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error(`獲取物料商數據失敗 (ID: ${id}):`, error)
    return null
  }

  return data
}

// 新增物料商
export async function createSupplier(supplier: Omit<Supplier, 'id' | 'created_at'>): Promise<Supplier | null> {
  const { data, error } = await supabase
    .from('suppliers')
    .insert([supplier])
    .select()
    .single()

  if (error) {
    console.error('新增物料商失敗:', error)
    return null
  }

  return data
}

// 更新物料商
export async function updateSupplier(id: number, updates: Partial<Omit<Supplier, 'id' | 'created_at'>>): Promise<Supplier | null> {
  const { data, error } = await supabase
    .from('suppliers')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error(`更新物料商失敗 (ID: ${id}):`, error)
    return null
  }

  return data
}

// 刪除物料商
export async function deleteSupplier(id: number): Promise<boolean> {
  const { error } = await supabase
    .from('suppliers')
    .delete()
    .eq('id', id)

  if (error) {
    console.error(`刪除物料商失敗 (ID: ${id}):`, error)
    return false
  }

  return true
}

// 搜尋物料商
export async function searchSuppliers(query: string): Promise<Supplier[]> {
  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .or(`name.ilike.%${query}%,tax_id.ilike.%${query}%`)
    .order('name')

  if (error) {
    console.error('搜尋物料商失敗:', error)
    return []
  }

  return data || []
} 