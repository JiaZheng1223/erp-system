'use client'

import { useState } from 'react'
import Header from '@/app/components/Header'
import { FaPlus, FaSearch, FaEdit, FaTrash, FaPhone, FaFax, FaIdCard, FaMapMarkerAlt } from 'react-icons/fa'

// 模擬數據
const dummyDistributors = [
  {
    id: 1,
    name: '台灣過濾器有限公司',
    phone: '02-2345-6789',
    fax: '02-2345-6780',
    taxId: '12345678',
    address: '台北市信義區松仁路100號8樓'
  },
  {
    id: 2,
    name: '高潔淨化科技',
    phone: '03-456-7890',
    fax: '03-456-7891',
    taxId: '87654321',
    address: '新竹市科學園區研發路20號'
  },
  {
    id: 3,
    name: '潔淨空調工程',
    phone: '04-567-8901',
    fax: '04-567-8902',
    taxId: '23456789',
    address: '台中市西屯區工業區一路88號'
  }
]

export default function DistributorsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  
  // 過濾經銷商功能
  const filteredDistributors = dummyDistributors.filter(distributor => 
    distributor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    distributor.taxId.includes(searchTerm)
  )

  return (
    <div>
      <Header title="經銷商管理" subtitle="管理經銷商聯絡與信用資料" />
      
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-64">
          <input
            type="text"
            placeholder="搜尋經銷商..."
            className="input pl-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
        </div>
        
        <button className="btn btn-primary flex items-center gap-2">
          <FaPlus /> 新增經銷商
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDistributors.map(distributor => (
          <div key={distributor.id} className="card relative">
            <div className="absolute top-4 right-4 flex space-x-2">
              <button className="p-1 text-blue-600 hover:text-blue-800">
                <FaEdit />
              </button>
              <button className="p-1 text-red-600 hover:text-red-800">
                <FaTrash />
              </button>
            </div>
            
            <h3 className="text-xl font-semibold mb-4">{distributor.name}</h3>
            
            <div className="space-y-3">
              <div className="flex items-center">
                <FaPhone className="text-gray-400 mr-3" />
                <span>{distributor.phone}</span>
              </div>
              
              <div className="flex items-center">
                <FaFax className="text-gray-400 mr-3" />
                <span>{distributor.fax}</span>
              </div>
              
              <div className="flex items-center">
                <FaIdCard className="text-gray-400 mr-3" />
                <span>統一編號: {distributor.taxId}</span>
              </div>
              
              <div className="flex items-start">
                <FaMapMarkerAlt className="text-gray-400 mr-3 mt-1" />
                <span>{distributor.address}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 