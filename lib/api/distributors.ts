import { supabase, Distributor } from '../supabase'

// 獲取所有經銷商
export async function getDistributors(): Promise<Distributor[]> {
  const { data, error } = await supabase
    .from('distributors')
    .select('*')
    .order('name')

  if (error) {
    console.error('獲取經銷商數據失敗:', error)
    return []
  }

  return data || []
}

// 獲取單個經銷商
export async function getDistributor(id: number): Promise<Distributor | null> {
  const { data, error } = await supabase
    .from('distributors')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error(`獲取經銷商數據失敗 (ID: ${id}):`, error)
    return null
  }

  return data
}

// 新增經銷商
export async function createDistributor(distributor: Omit<Distributor, 'id' | 'created_at'>): Promise<Distributor | null> {
  const { data, error } = await supabase
    .from('distributors')
    .insert([distributor])
    .select()
    .single()

  if (error) {
    console.error('新增經銷商失敗:', error)
    return null
  }

  return data
}

// 更新經銷商
export async function updateDistributor(id: number, updates: Partial<Omit<Distributor, 'id' | 'created_at'>>): Promise<Distributor | null> {
  const { data, error } = await supabase
    .from('distributors')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error(`更新經銷商失敗 (ID: ${id}):`, error)
    return null
  }

  return data
}

// 刪除經銷商
export async function deleteDistributor(id: number): Promise<boolean> {
  const { error } = await supabase
    .from('distributors')
    .delete()
    .eq('id', id)

  if (error) {
    console.error(`刪除經銷商失敗 (ID: ${id}):`, error)
    return false
  }

  return true
}

// 搜尋經銷商
export async function searchDistributors(query: string): Promise<Distributor[]> {
  const { data, error } = await supabase
    .from('distributors')
    .select('*')
    .or(`name.ilike.%${query}%,tax_id.ilike.%${query}%`)
    .order('name')

  if (error) {
    console.error('搜尋經銷商失敗:', error)
    return []
  }

  return data || []
} 