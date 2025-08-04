import { Link } from 'react-router-dom'
import { Home, Package, ShoppingCart } from 'lucide-react'

export function NotFound() {
  return (
    <div className="text-center py-12">
      <div className="max-w-md mx-auto">
        <div className="text-6xl font-bold text-gray-300 mb-4">404</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Página não encontrada
        </h1>
        <p className="text-gray-600 mb-8">
          A página que você está procurando não existe ou foi movida.
        </p>
        
        <div className="space-y-4">
          <Link
            to="/"
            className="btn btn-primary w-full flex items-center justify-center space-x-2"
          >
            <Home className="w-4 h-4" />
            <span>Voltar ao Início</span>
          </Link>
          
          <div className="grid grid-cols-2 gap-4">
            <Link
              to="/products"
              className="btn btn-secondary flex items-center justify-center space-x-2"
            >
              <Package className="w-4 h-4" />
              <span>Produtos</span>
            </Link>
            <Link
              to="/cart"
              className="btn btn-secondary flex items-center justify-center space-x-2"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Carrinho</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 