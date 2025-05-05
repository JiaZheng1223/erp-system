import { supabase, Material } from '../supabase'

// 獲取所有物料
export async function getMaterials(): Promise<Material[]> {
  const { data, error } = await supabase
    .from('materials')
    .select('*')
    .order('name')

  if (error) {
    console.error('獲取物料數據失敗:', error)
    return []
  }

  return data || []
}

// 獲取單個物料
export async function getMaterial(id: number): Promise<Material | null> {
  const { data, error } = await supabase
    .from('materials')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error(`獲取物料數據失敗 (ID: ${id}):`, error)
    return null
  }

  return data
}

// 新增物料
export async function createMaterial(material: Omit<Material, 'id' | 'created_at'>): Promise<Material | null> {
  const { data, error } = await supabase
    .from('materials')
    .insert([material])
    .select()
    .single()

  if (error) {
    console.error('新增物料失敗:', error)
    return null
  }

  return data
}

// 更新物料
export async function updateMaterial(id: number, updates: Partial<Omit<Material, 'id' | 'created_at'>>): Promise<Material | null> {
  const { data, error } = await supabase
    .from('materials')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error(`更新物料失敗 (ID: ${id}):`, error)
    return null
  }

  return data
}

// 更新物料庫存
export async function updateMaterialStock(id: number, stock: number): Promise<Material | null> {
  const { data, error } = await supabase
    .from('materials')
    .update({ stock })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error(`更新物料庫存失敗 (ID: ${id}):`, error)
    return null
  }

  return data
}

// 刪除物料
export async function deleteMaterial(id: number): Promise<boolean> {
  const { error } = await supabase
    .from('materials')
    .delete()
    .eq('id', id)

  if (error) {
    console.error(`刪除物料失敗 (ID: ${id}):`, error)
    return false
  }

  return true
}

// 搜尋物料
export async function searchMaterials(query: string): Promise<Material[]> {
  const { data, error } = await supabase
    .from('materials')
    .select('*')
    .or(`name.ilike.%${query}%,notes.ilike.%${query}%`)
    .order('name')

  if (error) {
    console.error('搜尋物料失敗:', error)
    return []
  }

  return data || []
}

// 根據類別和效率過濾物料
export async function filterMaterials(category?: string, efficiency?: string): Promise<Material[]> {
  let query = supabase.from('materials').select('*')
  
  if (category) {
    query = query.eq('category', category)
  }
  
  if (efficiency) {
    query = query.eq('efficiency', efficiency)
  }
  
  const { data, error } = await query.order('name')

  if (error) {
    console.error('過濾物料失敗:', error)
    return []
  }

  return data || []
} 