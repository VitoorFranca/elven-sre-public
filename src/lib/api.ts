import axios from 'axios';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api/v1';

// Tipos
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: number;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  status: string;
  items_count: number;
  created_at: string;
  updated_at: string;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Interceptors para logging e telemetria
api.interceptors.request.use(
  (config) => {
    console.debug('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.debug('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.status, error.config?.url);
    return Promise.reject(error);
  }
);

// Products API
export const productsApi = {
  getAll: () => api.get('/products'),
  getById: (id: string) => api.get(`/products/${id}`),
  create: (product: any) => api.post('/products', product),
  update: (id: string, product: any) => api.put(`/products/${id}`, product),
  delete: (id: string) => api.delete(`/products/${id}`),
};

// Orders API
export const ordersApi = {
  getAll: () => api.get('/orders'),
  getById: (id: string) => api.get(`/orders/${id}`),
  create: (order: any) => api.post('/orders', order),
  update: (id: string, order: any) => api.put(`/orders/${id}`, order),
  updateStatus: (id: string, status: string) => api.patch(`/orders/${id}/status`, { status }),
};

// Admin API
export const adminApi = {
  getAllOrders: () => api.get('/admin/orders'),
  updateOrderStatus: (orderId: string, status: string) => 
    api.patch(`/admin/orders/${orderId}/status`, { status }),
  getOrderDetails: (orderId: string) => api.get(`/admin/orders/${orderId}`),
};

// Metrics API
export const metricsApi = {
  getDashboard: () => api.get('/metrics/dashboard'),
  getSystemMetrics: () => api.get('/metrics/system'),
  getDatabaseMetrics: () => api.get('/metrics/database'),
  getBusinessMetrics: () => api.get('/metrics/business'),
  getPerformanceMetrics: () => api.get('/metrics/performance'),
  getTracesSummary: () => api.get('/metrics/traces'),
  getAlerts: () => api.get('/metrics/alerts'),
};

// Health API
export const healthApi = {
  check: () => api.get('/health'),
};

export default api; 