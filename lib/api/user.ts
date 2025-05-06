import { supabase } from '../supabase'
import { User } from './auth'

interface ProfileUpdateData {
  name?: string;
  // 可以在未來添加更多可更新的用戶資料欄位
}

/**
 * 更新用戶個人資料
 * 
 * @param userId 用戶ID
 * @param data 要更新的資料
 * @returns 更新結果
 */
export async function updateUserProfile(userId: string, data: ProfileUpdateData) {
  try {
    // 更新Supabase Auth用戶元數據
    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        name: data.name,
      }
    })

    if (updateError) {
      console.error('更新用戶資料失敗:', updateError.message)
      return { error: updateError.message }
    }

    // 獲取更新後的用戶
    const { data: userData, error: getUserError } = await supabase.auth.getUser()
    
    if (getUserError) {
      console.error('獲取已更新用戶資料失敗:', getUserError.message)
      return { error: getUserError.message }
    }
    
    if (!userData.user) {
      return { error: '無法獲取用戶資訊' }
    }
    
    // 轉換為應用內使用的用戶格式
    const updatedUser: User = {
      id: userData.user.id,
      email: userData.user.email || '',
      name: userData.user.user_metadata?.name
    }
    
    // 更新本地緩存
    localStorage.setItem('erp_user', JSON.stringify(updatedUser))
    
    return { user: updatedUser, error: null }
  } catch (err) {
    console.error('更新用戶資料時出錯:', err)
    return { error: '更新用戶資料時發生未知錯誤' }
  }
} 