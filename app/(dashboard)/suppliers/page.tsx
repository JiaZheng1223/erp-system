'use client'

import { useState } from 'react'
import Header from '@/app/components/Header'
import { FaPlus, FaSearch, FaEdit, FaTrash, FaPhone, FaFax, FaIdCard, FaMapMarkerAlt } from 'react-icons/fa'

// 模擬數據
const dummySuppliers = [
  {
    id: 1,
    name: '優質過濾材料有限公司',
    phone: '02-8765-4321',
    fax: '02-8765-4320',
    taxId: '76543210',
    address: '台北市南港區三重路66號5樓'
  },
  {
    id: 2,
    name: '高效濾網科技',
    phone: '03-789-0123',
    fax: '03-789-0124',
    taxId: '54321098',
    address: '桃園市龜山區文化一路250號'
  },
  {
    id: 3,
    name: '新科過濾器材',
    phone: '07-345-6789',
    fax: '07-345-6780',
    taxId: '32109876',
    address: '高雄市前鎮區中華五路966號'
  }
]

export default function SuppliersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  
  // 過濾供應商功能
  const filteredSuppliers = dummySuppliers.filter(supplier => 
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.taxId.includes(searchTerm)
  )

  return (
    <div>
      <Header title="物料商管理" subtitle="管理物料供應商聯絡資料" />
      
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-64">
          <input
            type="text"
            placeholder="搜尋物料商..."
            className="input pl-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
        </div>
        
        <button className="btn btn-primary flex items-center gap-2">
          <FaPlus /> 新增物料商
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSuppliers.map(supplier => (
          <div key={supplier.id} className="card relative">
            <div className="absolute top-4 right-4 flex space-x-2">
              <button className="p-1 text-blue-600 hover:text-blue-800">
                <FaEdit />
              </button>
              <button className="p-1 text-red-600 hover:text-red-800">
                <FaTrash />
              </button>
            </div>
            
            <h3 className="text-xl font-semibold mb-4">{supplier.name}</h3>
            
            <div className="space-y-3">
              <div className="flex items-center">
                <FaPhone className="text-gray-400 mr-3" />
                <span>{supplier.phone}</span>
              </div>
              
              <div className="flex items-center">
                <FaFax className="text-gray-400 mr-3" />
                <span>{supplier.fax}</span>
              </div>
              
              <div className="flex items-center">
                <FaIdCard className="text-gray-400 mr-3" />
                <span>統一編號: {supplier.taxId}</span>
              </div>
              
              <div className="flex items-start">
                <FaMapMarkerAlt className="text-gray-400 mr-3 mt-1" />
                <span>{supplier.address}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 