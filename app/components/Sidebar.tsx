import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FaChartBar, FaShoppingCart, FaCartPlus, FaUsers, FaIndustry, FaBoxes, FaBox } from 'react-icons/fa'

// 導航項目類型定義
interface NavItem {
  name: string
  path: string
  icon: React.ReactNode
}

const Sidebar = () => {
  const pathname = usePathname()

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

  return (
    <div className="bg-gray-800 text-white w-64 min-h-screen p-5">
      <div className="mb-8">
        <h1 className="text-xl font-bold">錡利科技管理系統</h1>
      </div>
      
      <nav>
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
    </div>
  )
}

export default Sidebar 