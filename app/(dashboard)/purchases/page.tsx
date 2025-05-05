'use client'

import { useState } from 'react'
import Header from '@/app/components/Header'
import { FaPlus, FaSearch, FaEdit, FaTrash } from 'react-icons/fa'

// 模擬數據
const dummyPurchases = [
  {
    id: 'PUR-2023-001',
    supplierName: '優質過濾材料有限公司',
    purchaser: '張小明',
    purchaseDate: '2023-05-10',
    status: '草稿',
    items: [
      { id: 1, name: '貼合鐵網濾材 F7 1.6x20m', quantity: 2 },
      { id: 2, name: '無鐵網濾材 G4 2.0x20m', quantity: 3 }
    ]
  },
  {
    id: 'PUR-2023-002',
    supplierName: '高效濾網科技',
    purchaser: '李大華',
    purchaseDate: '2023-05-20',
    status: '已送出',
    items: [
      { id: 1, name: '袋型濾材 F8 0.6x20m', quantity: 5 }
    ]
  },
  {
    id: 'PUR-2023-003',
    supplierName: '新科過濾器材',
    purchaser: '王小芳',
    purchaseDate: '2023-06-05',
    status: '已完成',
    items: [
      { id: 1, name: '迷你摺濾材 F9 0.6x10m', quantity: 4 }
    ]
  }
]

export default function PurchasesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  
  // 過濾採購單功能
  const filteredPurchases = dummyPurchases.filter(purchase => 
    purchase.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    purchase.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    purchase.purchaser.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div>
      <Header title="採購單管理" subtitle="管理物料採購與進貨狀態" />
      
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-64">
          <input
            type="text"
            placeholder="搜尋採購單..."
            className="input pl-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
        </div>
        
        <button className="btn btn-primary flex items-center gap-2">
          <FaPlus /> 新增採購單
        </button>
      </div>
      
      <div className="table-container">
        <table className="table">
          <thead className="table-header">
            <tr>
              <th className="table-header-cell">採購單號</th>
              <th className="table-header-cell">供應商</th>
              <th className="table-header-cell">採購人員</th>
              <th className="table-header-cell">採購日期</th>
              <th className="table-header-cell">物料項目</th>
              <th className="table-header-cell">狀態</th>
              <th className="table-header-cell">操作</th>
            </tr>
          </thead>
          <tbody className="table-body">
            {filteredPurchases.map(purchase => (
              <tr key={purchase.id} className="table-row">
                <td className="table-cell font-medium">{purchase.id}</td>
                <td className="table-cell">{purchase.supplierName}</td>
                <td className="table-cell">{purchase.purchaser}</td>
                <td className="table-cell">{purchase.purchaseDate}</td>
                <td className="table-cell">
                  <span className="text-gray-500 text-sm">
                    {purchase.items.length} 項物料
                  </span>
                </td>
                <td className="table-cell">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    purchase.status === '草稿' ? 'bg-gray-100 text-gray-800' : 
                    purchase.status === '已送出' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {purchase.status}
                  </span>
                </td>
                <td className="table-cell">
                  <div className="flex space-x-2">
                    <button className="p-1 text-blue-600 hover:text-blue-800">
                      <FaEdit />
                    </button>
                    <button className="p-1 text-red-600 hover:text-red-800">
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
} 