import { supabase } from '../supabase'

// 用戶介面
export interface User {
  id: string
  email: string
  name?: string
  avatar_url?: string
  role?: string
  department?: string
  phone?: string
  employee_id?: string
}

// 使用電子郵件和密碼登入
export async function signIn(email: string, password: string) {
  try {
    console.log('登入請求:', email)
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      console.error('登入失敗:', error.message)
      return { user: null, error: error.message }
    }

    if (!data.user) {
      return { user: null, error: '無法獲取用戶信息' }
    }

    // 獲取用戶的 profiles 表數據
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single()
    
    if (profileError && profileError.code !== 'PGRST116') { // 忽略 not found 錯誤
      console.error('獲取用戶個人資料失敗:', profileError.message)
    }

    console.log('登入成功:', data.user.email)
    return { 
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name || profile?.name,
        avatar_url: profile?.avatar_url,
        role: profile?.role,
        department: profile?.department,
        phone: profile?.phone,
        employee_id: profile?.employee_id
      } as User, 
      error: null 
    }
  } catch (err) {
    console.error('登入過程出錯:', err)
    return { user: null, error: '登入過程中發生錯誤' }
  }
}

// 登出
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('登出失敗:', error.message)
      return { error: error.message }
    }
    
    // 清除本地存儲中的用戶信息
    localStorage.removeItem('erp_user')
    
    return { error: null }
  } catch (err) {
    console.error('登出過程出錯:', err)
    return { error: '登出過程中發生錯誤' }
  }
}

// 獲取當前登入用戶
export async function getCurrentUser() {
  try {
    // 先嘗試從localStorage獲取
    const savedUser = localStorage.getItem('erp_user')
    if (savedUser) {
      return { user: JSON.parse(savedUser) as User, error: null }
    }
    
    // 如果localStorage沒有，則從Supabase獲取
    const { data, error } = await supabase.auth.getUser()
    
    if (error) {
      return { user: null, error: error.message }
    }
    
    if (!data.user) {
      return { user: null, error: null }
    }
    
    // 獲取用戶的 profiles 表數據
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single()
    
    if (profileError && profileError.code !== 'PGRST116') { // 忽略 not found 錯誤
      console.error('獲取用戶個人資料失敗:', profileError.message)
    }
    
    const user = {
      id: data.user.id,
      email: data.user.email,
      name: data.user.user_metadata?.name || profile?.name,
      avatar_url: profile?.avatar_url,
      role: profile?.role,
      department: profile?.department,
      phone: profile?.phone,
      employee_id: profile?.employee_id
    } as User
    
    // 保存到localStorage
    localStorage.setItem('erp_user', JSON.stringify(user))
    
    return { user, error: null }
  } catch (err) {
    console.error('獲取當前用戶出錯:', err)
    return { user: null, error: '獲取用戶信息時發生錯誤' }
  }
} 