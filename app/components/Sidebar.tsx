'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { 
  FaChartBar, FaShoppingCart, FaCartPlus, FaUsers, 
  FaIndustry, FaBoxes, FaBox, FaSignOutAlt, 
  FaUser, FaCog, FaChevronDown, FaChevronUp 
} from 'react-icons/fa'
import { useAuth } from '@/lib/contexts/AuthContext'

// 導航項目類型定義
interface NavItem {
  name: string
  path: string
  icon: React.ReactNode
}

const Sidebar = () => {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)

  // 導航項目列表
  const navItems: NavItem[] = [
    { name: '儀錶板', path: '/dashboard', icon: <FaChartBar className="w-5 h-5" /> },
    { name: '訂購單管理', path: '/orders', icon: <FaShoppingCart className="w-5 h-5" /> },
    { name: '採購單管理', path: '/purchases', icon: <FaCartPlus className="w-5 h-5" /> },
    { name: '經銷商管理', path: '/distributors', icon: <FaUsers className="w-5 h-5" /> },
    { name: '物料商管理', path: '/suppliers', icon: <FaIndustry className="w-5 h-5" /> },
    { name: '成品管理', path: '/products', icon: <FaBoxes className="w-5 h-5" /> },
    { name: '物料管理', path: '/materials', icon: <FaBox className="w-5 h-5" /> },
  ]

  const handleLogout = async () => {
    await logout()
  }

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu)
  }

  return (
    <div className="bg-gray-800 text-white w-64 min-h-screen p-5 flex flex-col">
      <div className="mb-8">
        <h1 className="text-xl font-bold">錡利科技管理系統</h1>
      </div>
      
      <nav className="flex-grow">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.path || pathname?.startsWith(`${item.path}/`)
            
            return (
              <li key={item.path}>
                <Link 
                  href={item.path}
                  className={`flex items-center gap-3 p-3 rounded-md transition-colors ${
                    isActive 
                      ? 'bg-primary text-white' 
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* 用戶資訊區域 */}
      <div className="mt-auto pt-4 border-t border-gray-700">
        <div 
          className="flex items-center justify-between p-3 rounded-md cursor-pointer hover:bg-gray-700"
          onClick={toggleUserMenu}
        >
          <div className="flex items-center gap-3">
            <div className="bg-primary h-10 w-10 rounded-full flex items-center justify-center">
              <FaUser className="text-white" />
            </div>
            <div className="overflow-hidden">
              <div className="font-medium truncate">{user?.name || user?.email}</div>
              <div className="text-xs text-gray-400 truncate">{user?.email}</div>
            </div>
          </div>
          {showUserMenu ? <FaChevronUp /> : <FaChevronDown />}
        </div>

        {showUserMenu && (
          <div className="mt-1 bg-gray-700 rounded-md overflow-hidden">
            <Link 
              href="/settings/profile" 
              className={`flex items-center gap-3 p-3 text-gray-300 hover:bg-gray-600 ${
                pathname === '/settings/profile' ? 'bg-gray-600' : ''
              }`}
            >
              <FaCog className="w-4 h-4" />
              <span>個人設定</span>
            </Link>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 p-3 text-gray-300 hover:bg-gray-600"
            >
              <FaSignOutAlt className="w-4 h-4" />
              <span>登出</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Sidebar 