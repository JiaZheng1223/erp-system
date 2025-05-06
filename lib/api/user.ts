import { supabase } from '../supabase'
import { User } from './auth'

interface ProfileUpdateData {
  name?: string;
  // 可以在未來添加更多可更新的用戶資料欄位
  phone?: string;
  department?: string;
  avatar_url?: string;
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
    // 1. 更新Supabase Auth用戶元數據
    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        name: data.name,
      }
    })

    if (updateError) {
      console.error('更新用戶auth元數據失敗:', updateError.message)
      return { error: updateError.message }
    }

    // 2. 更新profiles表中的用戶資料
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        name: data.name,
        phone: data.phone,
        department: data.department,
        avatar_url: data.avatar_url,
        updated_at: new Date()
      })
      .eq('id', userId)
    
    if (profileError) {
      console.error('更新用戶profiles表失敗:', profileError.message)
      return { error: profileError.message }
    }

    // 3. 獲取更新後的用戶
    const { data: userData, error: getUserError } = await supabase.auth.getUser()
    
    if (getUserError) {
      console.error('獲取已更新用戶資料失敗:', getUserError.message)
      return { error: getUserError.message }
    }
    
    if (!userData.user) {
      return { error: '無法獲取用戶資訊' }
    }
    
    // 4. 獲取更新後的用戶個人資料
    const { data: profile, error: profileGetError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
      
    if (profileGetError) {
      console.error('獲取用戶個人資料失敗:', profileGetError.message)
    }
    
    // 5. 轉換為應用內使用的用戶格式
    const updatedUser: User = {
      id: userData.user.id,
      email: userData.user.email || '',
      name: userData.user.user_metadata?.name || profile?.name,
      phone: profile?.phone,
      department: profile?.department,
      avatar_url: profile?.avatar_url,
      role: profile?.role
    }
    
    // 6. 更新本地緩存
    localStorage.setItem('erp_user', JSON.stringify(updatedUser))
    
    return { user: updatedUser, error: null }
  } catch (err) {
    console.error('更新用戶資料時出錯:', err)
    return { error: '更新用戶資料時發生未知錯誤' }
  }
}

/**
 * 獲取用戶詳細資料
 * 
 * @param userId 用戶ID
 * @returns 用戶詳細資料
 */
export async function getUserProfile(userId: string) {
  try {
    // 獲取用戶個人資料
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (profileError) {
      console.error('獲取用戶個人資料失敗:', profileError.message)
      return { profile: null, error: profileError.message }
    }
    
    return { profile, error: null }
  } catch (err) {
    console.error('獲取用戶資料時出錯:', err)
    return { profile: null, error: '獲取用戶資料時發生未知錯誤' }
  }
}

/**
 * 上傳用戶頭像
 * 
 * @param userId 用戶ID
 * @param file 頭像文件
 * @returns 上傳結果
 */
export async function uploadAvatar(userId: string, file: File) {
  try {
    // 生成唯一檔案名
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/${Date.now()}.${fileExt}`
    const filePath = `${fileName}`
    
    // 上傳到 avatars 存儲桶
    const { error: uploadError } = await supabase
      .storage
      .from('avatars')
      .upload(filePath, file, {
        upsert: true
      })
    
    if (uploadError) {
      console.error('上傳頭像失敗:', uploadError.message)
      return { url: null, error: uploadError.message }
    }
    
    // 獲取公共URL
    const { data } = supabase
      .storage
      .from('avatars')
      .getPublicUrl(filePath)
    
    // 更新用戶個人資料
    await updateUserProfile(userId, {
      avatar_url: data.publicUrl
    })
    
    return { url: data.publicUrl, error: null }
  } catch (err) {
    console.error('上傳頭像時出錯:', err)
    return { url: null, error: '上傳頭像時發生未知錯誤' }
  }
} 