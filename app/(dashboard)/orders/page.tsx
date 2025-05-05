'use client'

import { useState } from 'react'
import Header from '@/app/components/Header'
import { FaPlus, FaSearch, FaEdit, FaTrash } from 'react-icons/fa'

// 模擬數據
const dummyOrders = [
  {
    id: 'ORD-2023-001',
    distributorName: '台灣過濾器有限公司',
    customerPO: 'PO-20230521',
    orderDate: '2023-05-15',
    deliveryDate: '2023-06-15',
    totalAmount: 185000,
    status: '待處理',
    items: [
      { id: 1, name: '紙框過濾網 G4 595x595x46mm', quantity: 50, price: 350, total: 17500, status: '待處理' },
      { id: 2, name: '鐵框過濾網 F7 595x595x46mm', quantity: 30, price: 750, total: 22500, status: '待處理' }
    ]
  },
  {
    id: 'ORD-2023-002',
    distributorName: '高潔淨化科技',
    customerPO: 'PO-20230602',
    orderDate: '2023-06-01',
    deliveryDate: '2023-06-25',
    totalAmount: 67500,
    status: '處理中',
    items: [
      { id: 1, name: '迷你摺過濾網 F9 592x592x292mm', quantity: 15, price: 4500, total: 67500, status: '已接收' }
    ]
  },
  {
    id: 'ORD-2023-003',
    distributorName: '潔淨空調工程',
    customerPO: 'PO-20230615',
    orderDate: '2023-06-10',
    deliveryDate: '2023-07-10',
    totalAmount: 96000,
    status: '待出貨',
    items: [
      { id: 1, name: '袋型過濾網 F8 592x592x600mm', quantity: 12, price: 8000, total: 96000, status: '已完成' }
    ]
  }
]

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  
  // 過濾訂單功能
  const filteredOrders = dummyOrders.filter(order => 
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.distributorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customerPO.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div>
      <Header title="訂購單管理" subtitle="管理客戶訂單與出貨狀態" />
      
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-64">
          <input
            type="text"
            placeholder="搜尋訂單..."
            className="input pl-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
        </div>
        
        <button className="btn btn-primary flex items-center gap-2">
          <FaPlus /> 新增訂購單
        </button>
      </div>
      
      <div className="table-container">
        <table className="table">
          <thead className="table-header">
            <tr>
              <th className="table-header-cell">訂購單號</th>
              <th className="table-header-cell">經銷商</th>
              <th className="table-header-cell">客戶採購單號</th>
              <th className="table-header-cell">訂購日期</th>
              <th className="table-header-cell">預計交貨日</th>
              <th className="table-header-cell">總金額</th>
              <th className="table-header-cell">狀態</th>
              <th className="table-header-cell">操作</th>
            </tr>
          </thead>
          <tbody className="table-body">
            {filteredOrders.map(order => (
              <tr key={order.id} className="table-row">
                <td className="table-cell font-medium">{order.id}</td>
                <td className="table-cell">{order.distributorName}</td>
                <td className="table-cell">{order.customerPO}</td>
                <td className="table-cell">{order.orderDate}</td>
                <td className="table-cell">{order.deliveryDate}</td>
                <td className="table-cell">${order.totalAmount.toLocaleString()}</td>
                <td className="table-cell">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    order.status === '待處理' ? 'bg-blue-100 text-blue-800' : 
                    order.status === '處理中' ? 'bg-yellow-100 text-yellow-800' :
                    order.status === '待出貨' ? 'bg-purple-100 text-purple-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {order.status}
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