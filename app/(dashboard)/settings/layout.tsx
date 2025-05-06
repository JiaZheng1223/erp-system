'use client'

import { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { FaUser, FaShieldAlt, FaBell } from 'react-icons/fa'

interface SettingsLayoutProps {
  children: ReactNode
}

// 設定導航選項
const settingsNavItems = [
  { 
    name: '個人資料', 
    path: '/settings/profile', 
    icon: <FaUser className="h-5 w-5" /> 
  },
  // 未來可能的設定選項
  /*
  { 
    name: '安全設定', 
    path: '/settings/security', 
    icon: <FaShieldAlt className="h-5 w-5" /> 
  },
  { 
    name: '通知設定', 
    path: '/settings/notifications', 
    icon: <FaBell className="h-5 w-5" /> 
  }
  */
]

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const pathname = usePathname()

  return (
    <div className="container mx-auto px-4">
      <div className="flex flex-col md:flex-row gap-6">
        {/* 設定側邊導航 */}
        <div className="w-full md:w-64">
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg font-medium text-gray-700 mb-4">設定</h3>
            <nav>
              <ul className="space-y-2">
                {settingsNavItems.map((item) => {
                  const isActive = pathname === item.path
                  
                  return (
                    <li key={item.path}>
                      <Link 
                        href={item.path}
                        className={`flex items-center gap-3 p-2 rounded-md text-sm transition-colors ${
                          isActive 
                            ? 'bg-blue-50 text-primary' 
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <div className={`${isActive ? 'text-primary' : 'text-gray-500'}`}>
                          {item.icon}
                        </div>
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>
          </div>
        </div>
        
        {/* 設定內容區域 */}
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  )
} 