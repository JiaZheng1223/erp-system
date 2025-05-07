'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/lib/contexts/AuthContext'
import Header from '@/app/components/Header'
import { FaUser, FaEnvelope, FaSave, FaBuilding, FaPhone, FaIdCard, FaCamera } from 'react-icons/fa'
import { updateUserProfile, uploadAvatar } from '@/lib/api/user'
import Image from 'next/image'

export default function ProfileSettings() {
  const { user, loading, updateUser } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  })
  const [isUpdating, setIsUpdating] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [updateStatus, setUpdateStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 當用戶資料加載完成後，填充表單
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
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
        phone: formData.phone
      })
      if (result.error) {
        setUpdateStatus({
          success: false,
          message: result.error
        })
      } else {
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
  
  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0 || !user) return
    
    const file = files[0]
    
    // 檢查檔案類型
    if (!file.type.startsWith('image/')) {
      setUpdateStatus({
        success: false,
        message: '請上傳圖片檔案'
      })
      return
    }
    
    // 檢查檔案大小 (限制為 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setUpdateStatus({
        success: false,
        message: '圖片大小不能超過 2MB'
      })
      return
    }
    
    try {
      setIsUploading(true)
      setUpdateStatus(null)
      
      const result = await uploadAvatar(user.id, file)
      
      if (result.error) {
        setUpdateStatus({
          success: false,
          message: result.error
        })
      } else if (result.url) {
        // 更新上下文中的用戶資料
        updateUser({
          ...user,
          avatar_url: result.url
        })
        
        setUpdateStatus({
          success: true,
          message: '頭像已成功更新'
        })
      } else {
        setUpdateStatus({
          success: false,
          message: '上傳頭像失敗，未獲得有效的URL'
        })
      }
    } catch (error) {
      console.error('上傳頭像時出錯:', error)
      setUpdateStatus({
        success: false,
        message: '上傳頭像時發生錯誤'
      })
    } finally {
      setIsUploading(false)
      
      // 清除 file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
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
        
        {/* 用戶頭像區域 */}
        <div className="flex justify-center mb-8">
          <div 
            className="relative rounded-full overflow-hidden cursor-pointer group"
            onClick={handleAvatarClick}
          >
            <div className="h-32 w-32 relative">
              {user?.avatar_url ? (
                <Image 
                  src={user.avatar_url}
                  alt={user.name || '用戶'}
                  fill
                  sizes="128px"
                  className="object-cover"
                />
              ) : (
                <div className="bg-primary h-full w-full flex items-center justify-center">
                  <FaUser className="text-white h-16 w-16" />
                </div>
              )}
            </div>
            
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="text-white flex flex-col items-center">
                <FaCamera className="h-8 w-8 mb-1" />
                <span className="text-sm">更換頭像</span>
              </div>
            </div>
            
            {isUploading && (
              <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
                <div className="animate-spin h-10 w-10 border-4 border-white rounded-full border-t-transparent"></div>
              </div>
            )}
            
            <input 
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
        </div>

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
          
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              聯絡電話
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaPhone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="phone"
                name="phone"
                type="text"
                value={formData.phone}
                onChange={handleInputChange}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="請輸入您的聯絡電話"
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