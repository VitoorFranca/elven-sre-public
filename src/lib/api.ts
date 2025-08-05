import axios from 'axios'
import toast from 'react-hot-toast'

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || '/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  },
})

api.interceptors.request.use(
  (config) => {
    console.log(`${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    console.error('Erro na requisição:', error)
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => {
    console.log(`${response.status} ${response.config.url}`)
    return response
  },
  (error) => {
    console.error('Erro na resposta:', error.response?.data || error.message)
    
    const message = error.response?.data?.error || 'Erro interno do servidor'
    toast.error(message)
    
    return Promise.reject(error)
  }
)

export interface Product {
  id: number
  name: string
  description: string
  price: number
  stock: number
  created_at: string
  updated_at: string
}

export interface Order {
  id: number
  customer_name: string
  customer_email: string
  total_amount: number
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered'
  created_at: string
  updated_at: string
  items_count: number
  total_calculated: number
}

export interface CartItem {
  product: Product
  quantity: number
}

function sanitizeProduct(product: any): Product | null {
  console.log('Sanitizando produto:', product)
  
  if (!validateProduct(product)) {
    console.warn('Produto inválido recebido:', product)
    return null
  }

  const sanitized = {
    id: Number(product.id),
    name: String(product.name).trim(),
    description: String(product.description).trim(),
    price: Number(product.price),
    stock: Number(product.stock),
    created_at: String(product.createdAt || product.created_at),
    updated_at: String(product.updatedAt || product.updated_at),
  }
  
  console.log('Produto sanitizado:', sanitized)
  return sanitized
}

function validateProduct(product: any): boolean {
  console.log('Validando produto:', product)
  
  const isValid = (
    product &&
    typeof product.id === 'number' &&
    typeof product.name === 'string' &&
    typeof product.description === 'string' &&
    (typeof product.price === 'number' || typeof product.price === 'string') &&
    !isNaN(Number(product.price)) &&
    Number(product.price) >= 0 &&
    (typeof product.stock === 'number' || typeof product.stock === 'string') &&
    !isNaN(Number(product.stock)) &&
    Number(product.stock) >= 0
  )
  
  console.log('Produto válido:', isValid)
  return isValid
}

export const productsApi = {
  getAll: async () => {
    try {
      console.log('Buscando produtos...')
      const response = await api.get<any>('/products')
      console.log('Resposta da API:', response.data)
      
      const productsData = response.data.data || response.data
      console.log('Dados dos produtos:', productsData)
      
      const sanitizedProducts = productsData.map((product: any) => ({
        id: Number(product.id),
        name: String(product.name),
        description: String(product.description),
        price: Number(product.price),
        stock: Number(product.stock),
        created_at: String(product.createdAt || product.created_at),
        updated_at: String(product.updatedAt || product.updated_at),
      }))
      
      console.log('Produtos processados:', sanitizedProducts)
      
      return { data: sanitizedProducts }
    } catch (error) {
      console.error('Erro ao buscar produtos:', error)
      return { data: [] }
    }
  },
  
  getById: async (id: number) => {
    try {
      const response = await api.get<any>(`/products/${id}`)
      const productData = response.data.data || response.data
      const sanitizedProduct = sanitizeProduct(productData)
      
      if (!sanitizedProduct) {
        throw new Error('Produto não encontrado ou dados inválidos')
      }
      
      return { data: sanitizedProduct }
    } catch (error) {
      console.error(`Erro ao buscar produto ${id}:`, error)
      throw error
    }
  },
  
  create: (data: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => 
    api.post<Product>('/products', data).then(res => res.data),
}

export const ordersApi = {
  getAll: async () => {
    try {
      const response = await api.get<any>('/orders')
      const ordersData = response.data.data || response.data
      
      const sanitizedOrders = ordersData.map((order: any) => ({
        id: Number(order.id),
        customer_name: String(order.customer_name),
        customer_email: String(order.customer_email),
        total_amount: Number(order.total_amount),
        status: order.status || 'pending',
        created_at: String(order.created_at || order.createdAt),
        updated_at: String(order.updated_at || order.updatedAt),
        items_count: Number(order.items_count || 0),
        total_calculated: Number(order.total_calculated || order.total_amount),
      }))
      
      return { data: sanitizedOrders }
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error)
      return { data: [] }
    }
  },
  create: (data: {
    customer_name: string
    customer_email: string
    total_amount: number
    items: Array<{ product_id: number; quantity: number; price: number }>
  }) => api.post<Order>('/orders', data).then(res => res.data),
  updateStatus: (id: number, status: Order['status']) =>
    api.put(`/orders/${id}/status`, { status }).then(res => res.data),
}

export const healthApi = {
  check: async () => {
    try {
      const response = await api.get('/health')
      return response.data
    } catch (error) {
      console.error('Erro ao verificar health:', error)
      return {
        status: 'error',
        uptime: 0,
        version: 'unknown',
        database: 'error'
      }
    }
  },
} 