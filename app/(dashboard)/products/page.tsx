'use client'

import { useState } from 'react'
import Header from '@/app/components/Header'
import { FaPlus, FaSearch, FaEdit, FaTrash } from 'react-icons/fa'

// 模擬數據
const dummyProducts = [
  {
    id: 1,
    image: '/placeholder.png',
    category: '紙框',
    efficiency: '35%',
    name: '紙框過濾網 G4 595x595x46mm',
    stock: 120,
    safetyStock: 50,
    notes: '常用規格，工廠凈化系統初效過濾'
  },
  {
    id: 2,
    image: '/placeholder.png',
    category: '鐵框',
    efficiency: '65%',
    name: '鐵框過濾網 F7 595x595x46mm',
    stock: 78,
    safetyStock: 40,
    notes: '中效過濾網，適用於一般空調系統'
  },
  {
    id: 3,
    image: '/placeholder.png',
    category: '迷你摺',
    efficiency: '95%',
    name: '迷你摺過濾網 F9 592x592x292mm',
    stock: 25,
    safetyStock: 15,
    notes: '高效過濾網，用於無塵室入口'
  },
  {
    id: 4,
    image: '/placeholder.png',
    category: '袋型濾網',
    efficiency: '85%',
    name: '袋型過濾網 F8 592x592x600mm',
    stock: 32,
    safetyStock: 20,
    notes: '大型工業空調系統用'
  }
]

// 成品類別選項
const categoryOptions = ['紙框', '鐵框', '迷你摺', '袋型濾網', '無']

// 效率選項
const efficiencyOptions = ['35%', '45%', '65%', '85%', '95%', '無']

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [efficiencyFilter, setEfficiencyFilter] = useState('')
  
  // 過濾產品功能
  const filteredProducts = dummyProducts.filter(product => {
    // 搜尋詞過濾
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.notes.toLowerCase().includes(searchTerm.toLowerCase())
    
    // 類別過濾
    const matchesCategory = categoryFilter ? product.category === categoryFilter : true
    
    // 效率過濾
    const matchesEfficiency = efficiencyFilter ? product.efficiency === efficiencyFilter : true
    
    return matchesSearch && matchesCategory && matchesEfficiency
  })

  return (
    <div>
      <Header title="成品管理" subtitle="管理工業過濾網成品資訊" />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="w-full md:w-auto flex flex-col md:flex-row gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="搜尋成品..."
              className="input pl-10 w-full md:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
          
          <select 
            className="input"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">所有類別</option>
            {categoryOptions.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          
          <select 
            className="input"
            value={efficiencyFilter}
            onChange={(e) => setEfficiencyFilter(e.target.value)}
          >
            <option value="">所有效率</option>
            {efficiencyOptions.map(efficiency => (
              <option key={efficiency} value={efficiency}>{efficiency}</option>
            ))}
          </select>
        </div>
        
        <button className="btn btn-primary flex items-center gap-2 whitespace-nowrap">
          <FaPlus /> 新增成品
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map(product => (
          <div key={product.id} className="card relative">
            <div className="absolute top-4 right-4 flex space-x-2">
              <button className="p-1 text-blue-600 hover:text-blue-800">
                <FaEdit />
              </button>
              <button className="p-1 text-red-600 hover:text-red-800">
                <FaTrash />
              </button>
            </div>
            
            <div className="mb-4 bg-gray-100 h-40 rounded flex items-center justify-center">
              <img 
                src={product.image} 
                alt={product.name}
                className="max-h-full max-w-full object-contain"
              />
            </div>
            
            <div className="flex justify-between mb-2">
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">{product.category}</span>
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">{product.efficiency}</span>
            </div>
            
            <h3 className="text-lg font-semibold mb-2 line-clamp-2">{product.name}</h3>
            
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500">目前庫存</span>
              <span className={`font-medium ${product.stock <= product.safetyStock ? 'text-red-600' : 'text-gray-700'}`}>
                {product.stock}
              </span>
            </div>
            
            <div className="flex justify-between text-sm mb-3">
              <span className="text-gray-500">安全庫存量</span>
              <span className="font-medium text-gray-700">{product.safetyStock}</span>
            </div>
            
            {product.notes && (
              <div className="text-sm text-gray-500 border-t pt-2">
                <p className="line-clamp-2">{product.notes}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
} 