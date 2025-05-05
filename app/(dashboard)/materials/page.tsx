'use client'

import { useState } from 'react'
import Header from '@/app/components/Header'
import { FaPlus, FaSearch, FaEdit, FaTrash } from 'react-icons/fa'

// 模擬數據
const dummyMaterials = [
  {
    id: 1,
    image: '/placeholder.png',
    category: '貼合鐵網濾材',
    efficiency: '65%',
    name: '貼合鐵網濾材 F7 1.6x20m',
    stock: 5,
    safetyStock: 3,
    notes: '用於生產鐵框過濾網'
  },
  {
    id: 2,
    image: '/placeholder.png',
    category: '無鐵網濾材',
    efficiency: '35%',
    name: '無鐵網濾材 G4 2.0x20m',
    stock: 8,
    safetyStock: 5,
    notes: '用於生產紙框過濾網'
  },
  {
    id: 3,
    image: '/placeholder.png',
    category: '袋型濾材',
    efficiency: '85%',
    name: '袋型濾材 F8 0.6x20m',
    stock: 3,
    safetyStock: 2,
    notes: '高效濾材，用於袋型過濾網製作'
  },
  {
    id: 4,
    image: '/placeholder.png',
    category: '迷你摺濾材',
    efficiency: '95%',
    name: '迷你摺濾材 F9 0.6x10m',
    stock: 2,
    safetyStock: 3,
    notes: '最高效率濾材，庫存不足'
  }
]

// 物料類別選項
const categoryOptions = ['貼合鐵網濾材', '無鐵網濾材', '袋型濾材', '迷你摺濾材', '無']

// 效率選項
const efficiencyOptions = ['35%', '45%', '65%', '85%', '95%', '無']

export default function MaterialsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [efficiencyFilter, setEfficiencyFilter] = useState('')
  
  // 過濾物料功能
  const filteredMaterials = dummyMaterials.filter(material => {
    // 搜尋詞過濾
    const matchesSearch = 
      material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.notes.toLowerCase().includes(searchTerm.toLowerCase())
    
    // 類別過濾
    const matchesCategory = categoryFilter ? material.category === categoryFilter : true
    
    // 效率過濾
    const matchesEfficiency = efficiencyFilter ? material.efficiency === efficiencyFilter : true
    
    return matchesSearch && matchesCategory && matchesEfficiency
  })

  return (
    <div>
      <Header title="物料管理" subtitle="管理工業過濾網物料資訊" />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="w-full md:w-auto flex flex-col md:flex-row gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="搜尋物料..."
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
          <FaPlus /> 新增物料
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredMaterials.map(material => (
          <div key={material.id} className="card relative">
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
                src={material.image} 
                alt={material.name}
                className="max-h-full max-w-full object-contain"
              />
            </div>
            
            <div className="flex justify-between mb-2">
              <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">{material.category}</span>
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">{material.efficiency}</span>
            </div>
            
            <h3 className="text-lg font-semibold mb-2 line-clamp-2">{material.name}</h3>
            
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500">目前庫存</span>
              <span className={`font-medium ${material.stock < material.safetyStock ? 'text-red-600' : 'text-gray-700'}`}>
                {material.stock}
              </span>
            </div>
            
            <div className="flex justify-between text-sm mb-3">
              <span className="text-gray-500">安全庫存量</span>
              <span className="font-medium text-gray-700">{material.safetyStock}</span>
            </div>
            
            {material.notes && (
              <div className="text-sm text-gray-500 border-t pt-2">
                <p className="line-clamp-2">{material.notes}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
} 