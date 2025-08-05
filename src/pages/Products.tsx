import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { productsApi, type Product } from '../lib/api'
import { formatPrice } from '../lib/utils'
import { Package, Eye, ShoppingCart, Plus, Minus, Heart } from 'lucide-react'
import { useCart } from '../contexts/CartContext'
import { useState } from 'react'

export function Products() {
  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: () => productsApi.getAll().then(res => res.data),
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 3,
    retryDelay: 1000,
  })

  const { addItem, isInCart } = useCart()
  const [quantities, setQuantities] = useState<Record<number, number>>({})

  const handleAddToCart = (product: Product) => {
    const quantity = quantities[product.id] || 1
    addItem(product, quantity)
    setQuantities(prev => ({ ...prev, [product.id]: 1 })) // Reset quantity
  }

  const handleQuantityChange = (productId: number, newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= 99) {
      setQuantities(prev => ({ ...prev, [productId]: newQuantity }))
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Livros</h1>
          <div className="text-sm text-gray-500">Carregando...</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
              <div className="h-6 bg-gray-200 rounded mb-4"></div>
              <div className="flex space-x-2">
                <div className="h-8 bg-gray-200 rounded flex-1"></div>
                <div className="h-8 bg-gray-200 rounded w-12"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Erro ao carregar livros
        </h2>
        <p className="text-gray-600 mb-4">
          Não foi possível carregar os livros. Tente novamente.
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="btn btn-primary"
        >
          Tentar Novamente
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Nossos Livros</h1>
        <div className="text-sm text-gray-500">
          {products?.length || 0} livros encontrados
        </div>
      </div>

      {products && products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product: Product) => {
            const isProductInCart = isInCart(product.id)
            const currentQuantity = quantities[product.id] || 1
            
            return (
              <div key={product.id} className="card group hover:shadow-lg transition-all duration-300">
                <div className="relative">
                                  <div className="h-48 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg mb-4 flex items-center justify-center group-hover:from-blue-200 group-hover:to-blue-300 transition-colors">
                  <Package className="w-16 h-16 text-blue-600" />
                </div>
                  
                  {/* Wishlist Button */}
                  <button className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors">
                    <Heart className="w-4 h-4 text-gray-400 hover:text-red-500" />
                  </button>
                  
                  {/* Stock Badge */}
                  {product.stock <= 5 && product.stock > 0 && (
                    <div className="absolute top-2 left-2 px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                      Poucas unidades
                    </div>
                  )}
                  
                  {product.stock === 0 && (
                    <div className="absolute top-2 left-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                      Esgotado
                    </div>
                  )}
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {product.name}
                </h3>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {product.description}
                </p>
                
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-blue-600">
                    {formatPrice(product.price)}
                  </span>
                  <span className={`text-sm ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {product.stock > 0 ? `${product.stock} em estoque` : 'Esgotado'}
                  </span>
                </div>
                
                {product.stock > 0 ? (
                  <div className="space-y-3">
                    {/* Quantity Selector */}
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => handleQuantityChange(product.id, currentQuantity - 1)}
                        disabled={currentQuantity <= 1}
                        className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">
                        {currentQuantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(product.id, currentQuantity + 1)}
                        disabled={currentQuantity >= product.stock || currentQuantity >= 99}
                        className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Link
                        to={`/products/${product.id}`}
                        className="btn btn-secondary flex-1 flex items-center justify-center space-x-1"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Ver</span>
                      </Link>
                      <button
                        className={`btn flex items-center justify-center space-x-1 ${
                          isProductInCart 
                            ? 'btn-success' 
                            : 'btn-primary'
                        }`}
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock === 0}
                      >
                        <ShoppingCart className="w-4 h-4" />
                        <span>{isProductInCart ? '✓' : '+'}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex space-x-2">
                    <Link
                      to={`/products/${product.id}`}
                      className="btn btn-secondary flex-1 flex items-center justify-center space-x-1"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Ver</span>
                    </Link>
                    <button
                      className="btn btn-disabled flex items-center justify-center space-x-1"
                      disabled
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>Esgotado</span>
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Nenhum livro encontrado
          </h2>
          <p className="text-gray-600 mb-6">
            Não há livros disponíveis no momento.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="btn btn-primary"
          >
            Recarregar
          </button>
        </div>
      )}
    </div>
  )
} 