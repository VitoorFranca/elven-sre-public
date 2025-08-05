import { ShoppingCart, Trash2, Package, Plus, Minus, ArrowLeft, CreditCard } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatPrice } from '../lib/utils'
import { useCart } from '../contexts/CartContext'
import { useState } from 'react'
import toast from 'react-hot-toast'

export function Cart() {
  const { state, removeItem, updateQuantity, clearCart } = useCart()
  const [isCheckingOut, setIsCheckingOut] = useState(false)

  const handleQuantityChange = (id: number, newQuantity: number) => {
    if (newQuantity >= 1) {
      updateQuantity(id, newQuantity)
    }
  }

  const handleRemoveItem = (id: number) => {
    removeItem(id)
  }

  const handleCheckout = async () => {
    if (state.items.length === 0) {
              toast.error('Adicione livros ao carrinho antes de finalizar')
      return
    }

    setIsCheckingOut(true)
    
    // Simular processo de checkout
    setTimeout(() => {
      toast.success('Pedido finalizado com sucesso!')
      clearCart()
      setIsCheckingOut(false)
    }, 2000)
  }

  const shippingCost = state.total > 50 ? 0 : 10
  const finalTotal = state.total + shippingCost

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Meu Carrinho</h1>
        {state.itemCount > 0 && (
          <span className="text-sm text-gray-500">
            {state.itemCount} {state.itemCount === 1 ? 'item' : 'itens'}
          </span>
        )}
      </div>

      {state.items.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {state.items.map((item) => (
              <div key={item.id} className="card">
                <div className="flex items-center space-x-4">
                                      <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                    <Package className="w-10 h-10 text-blue-600" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {item.product.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-2">
                      {item.product.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-blue-600">
                        {formatPrice(item.product.price)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {item.product.stock} em estoque
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-2">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock}
                        className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">
                        {formatPrice(item.product.price * item.quantity)}
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-sm text-red-500 hover:text-red-700 flex items-center space-x-1 mt-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remover</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Clear Cart Button */}
            <div className="flex justify-end">
              <button
                onClick={clearCart}
                className="text-sm text-red-500 hover:text-red-700 flex items-center space-x-1"
              >
                <Trash2 className="w-4 h-4" />
                <span>Limpar Carrinho</span>
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="card h-fit">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <CreditCard className="w-5 h-5" />
              <span>Resumo do Pedido</span>
            </h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span>Subtotal ({state.itemCount} {state.itemCount === 1 ? 'item' : 'itens'}):</span>
                <span>{formatPrice(state.total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Frete:</span>
                <span className={shippingCost === 0 ? 'text-blue-600' : ''}>
                  {shippingCost === 0 ? 'Grátis' : formatPrice(shippingCost)}
                </span>
              </div>
              {shippingCost > 0 && (
                <div className="text-xs text-gray-500">
                  Frete grátis em pedidos acima de R$ 50,00
                </div>
              )}
              <div className="border-t pt-3">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total:</span>
                  <span className="text-blue-600">{formatPrice(finalTotal)}</span>
                </div>
              </div>
            </div>

            <button 
              className="btn btn-primary w-full flex items-center justify-center space-x-2"
              onClick={handleCheckout}
              disabled={isCheckingOut}
            >
              {isCheckingOut ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Processando...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  <span>Finalizar Pedido</span>
                </>
              )}
            </button>
            
            <div className="mt-4 text-center">
              <Link
                to="/products"
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center justify-center space-x-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Continuar Comprando</span>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Seu carrinho está vazio
          </h2>
          <p className="text-gray-600 mb-6">
            Adicione livros ao seu carrinho para começar suas compras.
          </p>
          <Link to="/products" className="btn btn-primary">
                          Ver Livros
          </Link>
        </div>
      )}
    </div>
  )
} 