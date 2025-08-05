import { Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { Products } from './pages/Products'
import { ProductDetail } from './pages/ProductDetail'
import { Cart } from './pages/Cart'
import { Orders } from './pages/Orders'
import { Metrics } from './pages/Metrics'
import { Interno } from './pages/Interno'
import { InternoMetrics } from './pages/InternoMetrics'
import { InternoProducts } from './pages/InternoProducts'
import { InternoOrders } from './pages/InternoOrders'
import { NotFound } from './pages/NotFound'
import { CartProvider } from './contexts/CartContext'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutos
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/metrics" element={<Metrics />} />
            <Route path="/interno" element={<Interno />} />
            <Route path="/interno/metrics" element={<InternoMetrics />} />
            <Route path="/interno/products" element={<InternoProducts />} />
            <Route path="/interno/orders" element={<InternoOrders />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 2000,
              iconTheme: {
                primary: '#10B981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#EF4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </CartProvider>
    </QueryClientProvider>
  )
}

export default App 