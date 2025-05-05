import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 定義數據庫表結構類型

// 經銷商
export interface Distributor {
  id: number
  name: string
  phone: string
  fax: string
  tax_id: string
  address: string
  notes?: string
  created_at?: string
}

// 物料商
export interface Supplier {
  id: number
  name: string
  phone: string
  fax: string
  tax_id: string
  address: string
  notes?: string
  created_at?: string
}

// 成品
export interface Product {
  id: number
  image_url?: string
  category: string
  efficiency: string
  name: string
  stock: number
  safety_stock: number
  notes?: string
  created_at?: string
}

// 物料
export interface Material {
  id: number
  image_url?: string
  category: string
  efficiency: string
  name: string
  stock: number
  safety_stock: number
  notes?: string
  created_at?: string
}

// 訂購單
export interface Order {
  id: string
  distributor_id: number
  distributor_name: string
  customer_po: string
  order_date: string
  delivery_date?: string
  total_amount: number
  status: string
  notes?: string
  created_at?: string
  delivery_method?: string
  shipping_company?: string
  shipping_address?: string
  contact_person?: string
  contact_phone?: string
}

// 訂購單項目
export interface OrderItem {
  id: number
  order_id: string
  product_id: number
  product_name: string
  quantity: number
  price: number
  total: number
  status: string
}

// 採購單
export interface Purchase {
  id: string
  supplier_id: number
  supplier_name: string
  purchaser: string
  purchase_date: string
  expected_delivery_date?: string
  total_amount?: number
  status: string
  notes?: string
  created_at?: string
}

// 採購單項目
export interface PurchaseItem {
  id: number
  purchase_id: string
  material_id: number
  material_name: string
  quantity: number
  price?: number
  total?: number
  status?: string
} 