'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/lib/contexts/AuthContext'
import Link from 'next/link'
import Image from 'next/image'

export default function LoginPage() {
  const { login, error, loading, clearError, user } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  // 如果用戶已登入，則跳轉到儀表板
  useEffect(() => {
    if (user) {
      window.location.href = '/dashboard'
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim() === '' || password.trim() === '') {
      return
    }
    
    try {
      // 執行登入
      const success = await login(email, password)
      
      if (success) {
        // 登入成功
        setIsSuccess(true)
        
        // 自動跳轉
        window.location.href = '/dashboard'
      }
    } catch (err) {
      console.error('登入處理錯誤:', err)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
          <div className="flex flex-col items-center mb-6">
            <div className="w-32 h-32 relative mb-4">
              <Image 
                src="/logo.png" 
                alt="錡利科技" 
                fill
                style={{ objectFit: 'contain' }}
                priority
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">錡利科技管理系統</h1>
            <p className="text-gray-600 text-sm">請登入您的帳號以繼續</p>
          </div>

          {/* 登入成功提示 */}
          {isSuccess && (
            <div className="bg-green-50 text-green-700 p-4 rounded-md mb-4">
              <p className="font-medium">登入成功！</p>
              <p className="text-sm mt-1">正在跳轉到儀表板...</p>
              <div className="flex justify-center mt-2">
                <div className="animate-spin h-6 w-6 border-2 border-green-500 rounded-full border-t-transparent"></div>
              </div>
            </div>
          )}

          {/* 錯誤提示 */}
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded border border-red-200 text-sm">
              {error}
              <button 
                className="float-right text-red-700 hover:text-red-900"
                onClick={clearError}
              >
                ✕
              </button>
            </div>
          )}

          {/* 登入表單 */}
          {!isSuccess && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  電子郵件
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="請輸入您的電子郵件"
                  required
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    密碼
                  </label>
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="請輸入您的密碼"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-70"
              >
                {loading ? '登入中...' : '登入'}
              </button>
            </form>
          )}

          <div className="text-center text-xs text-gray-500 mt-4">
            &copy; {new Date().getFullYear()} 錡利科技. 版權所有.
          </div>

          {/* 新增：註冊與忘記密碼連結 */}
          <div className="flex justify-between mt-4 text-sm">
            <Link href="/register" className="text-blue-600 hover:underline">註冊新帳號</Link>
            <Link href="/forgot-password" className="text-blue-600 hover:underline">忘記密碼？</Link>
          </div>
        </div>
      </div>
    </div>
  )
} 