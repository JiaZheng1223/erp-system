'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { signIn, signOut, getCurrentUser, User } from '../api/auth'
import { useRouter } from 'next/navigation'

// 身份驗證上下文類型
interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  clearError: () => void
  updateUser: (userData: Partial<User>) => void
}

// 創建上下文
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// 身份驗證提供者組件
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // 初始化 - 檢查用戶當前狀態
  useEffect(() => {
    async function loadUser() {
      try {
        setLoading(true)
        const { user, error } = await getCurrentUser()
        if (error) {
          console.error('獲取用戶失敗:', error)
        } else {
          setUser(user)
        }
      } catch (err) {
        console.error('檢查用戶狀態失敗:', err)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  // 登入函數
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)
      
      const { user: authUser, error: authError } = await signIn(email, password)
      
      if (authError) {
        setError(authError)
        return false
      }
      
      if (!authUser) {
        setError('登入失敗：無法獲取用戶資訊')
        return false
      }
      
      // 設置用戶
      setUser(authUser)
      
      // 保存到 localStorage
      localStorage.setItem('erp_user', JSON.stringify(authUser))
      
      return true
    } catch (err) {
      console.error('登入過程中發生錯誤:', err)
      setError('登入時發生未知錯誤')
      return false
    } finally {
      setLoading(false)
    }
  }

  // 登出函數
  const logout = async () => {
    try {
      setLoading(true)
      const { error: logoutError } = await signOut()
      if (logoutError) {
        setError(logoutError)
        return
      }
      setUser(null)
      router.push('/login')
    } catch (err) {
      console.error('登出過程中發生錯誤:', err)
      setError('登出時發生未知錯誤')
    } finally {
      setLoading(false)
    }
  }

  // 更新用戶資料函數
  const updateUser = (userData: Partial<User>) => {
    if (!user) return
    
    const updatedUser = { ...user, ...userData }
    setUser(updatedUser)
    
    // 更新本地緩存
    localStorage.setItem('erp_user', JSON.stringify(updatedUser))
  }

  // 清除錯誤
  const clearError = () => {
    setError(null)
  }

  // 身份驗證上下文值
  const value = {
    user,
    loading,
    error,
    login,
    logout,
    clearError,
    updateUser
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// 自定義鉤子，用於在組件中訪問身份驗證上下文
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth 必須在 AuthProvider 內部使用')
  }
  return context
} 