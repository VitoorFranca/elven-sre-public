import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { productsApi } from '../lib/api'
import { formatPrice } from '../lib/utils'
import { Package, ArrowLeft, ShoppingCart, Truck, Star, Heart, Plus, Minus } from 'lucide-react'
import { useCart } from '../contexts/CartContext'
import { useState } from 'react'
// import toast from 'react-hot-toast'

export function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const productId = parseInt(id || '0')
  const [quantity, setQuantity] = useState(1)
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => productsApi.getById(productId).then(res => res.data),
    enabled: !!productId,
  })

  const { addItem, isInCart, getItemQuantity } = useCart()

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 1)) {
      setQuantity(newQuantity)
    }
  }

  const handleAddToCart = async () => {
    if (!product) return

    setIsAddingToCart(true)
    
    // Simular delay para melhor UX
    setTimeout(() => {
      addItem(product, quantity)
      setIsAddingToCart(false)
    }, 500)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-96 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-24 animate-pulse"></div>
            <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="text-center py-12">
        <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Produto não encontrado
        </h2>
        <p className="text-gray-600 mb-6">
          O produto que você está procurando não existe ou foi removido.
        </p>
        <Link to="/products" className="btn btn-primary">
                      Voltar aos Livros
        </Link>
      </div>
    )
  }

  const isProductInCart = isInCart(product.id)
  const cartQuantity = getItemQuantity(product.id)

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <Link to="/products" className="hover:text-gray-700 flex items-center space-x-1">
          <ArrowLeft className="w-4 h-4" />
                      <span>Livros</span>
        </Link>
        <span>/</span>
        <span className="text-gray-900">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="relative">
                      <div className="h-96 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center group hover:from-blue-200 hover:to-blue-300 transition-colors">
                            <Package className="w-32 h-32 text-blue-600" />
          </div>
          
          {/* Wishlist Button */}
          <button className="absolute top-4 right-4 p-3 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors">
            <Heart className="w-5 h-5 text-gray-400 hover:text-red-500" />
          </button>
          
          {/* Stock Badge */}
          {product.stock <= 5 && product.stock > 0 && (
            <div className="absolute top-4 left-4 px-3 py-1 bg-orange-100 text-orange-800 text-sm rounded-full font-medium">
              Poucas unidades
            </div>
          )}
          
          {product.stock === 0 && (
            <div className="absolute top-4 left-4 px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full font-medium">
              Esgotado
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {product.name}
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Rating */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
              ))}
            </div>
            <span className="text-sm text-gray-500">(4.8 - 127 avaliações)</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-4xl font-bold text-blue-600">
              {formatPrice(product.price)}
            </span>
            <span className={`text-sm font-medium ${product.stock > 0 ? 'text-blue-600' : 'text-red-600'}`}>
              {product.stock > 0 ? `${product.stock} em estoque` : 'Esgotado'}
            </span>
          </div>

          {/* Features */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <Truck className="w-4 h-4 text-blue-600" />
              <span>Entrega em até 2 horas</span>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <Package className="w-4 h-4 text-blue-600" />
                              <span>Livro de qualidade garantida</span>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <Star className="w-4 h-4 text-blue-600" />
              <span>Atendimento premium</span>
            </div>
          </div>

          {/* Quantity Selector */}
          {product.stock > 0 && (
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">Quantidade:</label>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                  className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center text-lg font-medium">
                  {quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= product.stock}
                  className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {product.stock > 0 ? (
              <>
                <button
                  className={`btn w-full flex items-center justify-center space-x-2 ${
                    isProductInCart ? 'btn-success' : 'btn-primary'
                  }`}
                  onClick={handleAddToCart}
                  disabled={isAddingToCart}
                >
                  {isAddingToCart ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Adicionando...</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      <span>
                        {isProductInCart 
                          ? `✓ Adicionado (${cartQuantity})` 
                          : 'Adicionar ao Carrinho'
                        }
                      </span>
                    </>
                  )}
                </button>
                
                {isProductInCart && (
                  <Link
                    to="/cart"
                    className="btn btn-secondary w-full flex items-center justify-center space-x-2"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span>Ver Carrinho</span>
                  </Link>
                )}
              </>
            ) : (
              <button className="btn btn-disabled w-full" disabled>
                Produto Esgotado
              </button>
            )}
          </div>

          {/* Product Details */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Informações do Produto
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Código:</span>
                <span className="font-medium">#{product.id}</span>
              </div>
              <div className="flex justify-between">
                <span>Preço unitário:</span>
                <span className="font-medium">{formatPrice(product.price)}</span>
              </div>
              <div className="flex justify-between">
                <span>Disponível desde:</span>
                <span className="font-medium">
                  {new Date(product.created_at).toLocaleDateString('pt-BR')}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Última atualização:</span>
                <span className="font-medium">
                  {new Date(product.updated_at).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 