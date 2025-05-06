'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/contexts/AuthContext'
import Header from '@/app/components/Header'
import { FaUser, FaEnvelope, FaSave } from 'react-icons/fa'
import { updateUserProfile } from '@/lib/api/user'

export default function ProfileSettings() {
  const { user, loading, updateUser } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  })
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateStatus, setUpdateStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null)

  // 當用戶資料加載完成後，填充表單
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
      })
    }
  }, [user])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) return
    
    try {
      setIsUpdating(true)
      setUpdateStatus(null)
      
      const result = await updateUserProfile(user.id, {
        name: formData.name,
      })
      
      if (result.error) {
        setUpdateStatus({
          success: false,
          message: result.error
        })
      } else {
        // 更新上下文中的用戶資料
        if (result.user) {
          updateUser(result.user)
        }
        
        setUpdateStatus({
          success: true,
          message: '個人資料已成功更新'
        })
      }
    } catch (error) {
      console.error('更新用戶資料時出錯:', error)
      setUpdateStatus({
        success: false,
        message: '更新個人資料時發生錯誤'
      })
    } finally {
      setIsUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-500">載入中...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Header title="個人設定" subtitle="更新您的個人資料" />

      <div className="bg-white rounded-lg shadow-md p-6 max-w-xl">
        {updateStatus && (
          <div className={`mb-6 p-4 rounded-md ${updateStatus.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {updateStatus.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              電子郵件
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaEnvelope className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                readOnly
                disabled
                className="bg-gray-100 block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">電子郵件不可更改，它是您的主要登入識別</p>
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              姓名
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaUser className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="請輸入您的姓名"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isUpdating}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
            >
              {isUpdating ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
                  更新中...
                </>
              ) : (
                <>
                  <FaSave className="mr-2 h-4 w-4" />
                  儲存變更
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 