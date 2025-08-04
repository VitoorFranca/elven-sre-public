import { useQuery } from '@tanstack/react-query'
import { ordersApi, type Order } from '../lib/api'
import { formatPrice, formatDate, getStatusColor, getStatusText } from '../lib/utils'
import { FileText, Package, Calendar, User } from 'lucide-react'

export function Orders() {
  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['orders'],
    queryFn: () => ordersApi.getAll(),
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Pedidos</h1>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
              <div className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
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
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Erro ao carregar pedidos
        </h2>
        <p className="text-gray-600">
          Não foi possível carregar os pedidos. Tente novamente.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Pedidos</h1>
        <div className="text-sm text-gray-500">
          {orders?.data?.length || 0} pedidos encontrados
        </div>
      </div>

      {orders?.data && orders.data.length > 0 ? (
        <div className="space-y-4">
          {orders.data.map((order: Order) => (
            <div key={order.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <span className="font-semibold text-gray-900">
                        Pedido #{order.id}
                      </span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <User className="w-4 h-4" />
                      <span>{order.customer_name}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Package className="w-4 h-4" />
                      <span>{order.items_count || 0} itens</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(order.created_at)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Total:</span>
                      <span className="ml-1 text-lg font-bold text-green-600">
                        {formatPrice(order.total_amount)}
                      </span>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        className="btn btn-secondary text-sm"
                        onClick={() => {
                          // Ver detalhes do pedido (implementar depois)
                          console.log('Ver detalhes do pedido:', order.id)
                        }}
                      >
                        Ver Detalhes
                      </button>
                      {order.status === 'pending' && (
                        <button
                          className="btn btn-primary text-sm"
                          onClick={() => {
                            // Confirmar pedido (implementar depois)
                            console.log('Confirmar pedido:', order.id)
                          }}
                        >
                          Confirmar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Nenhum pedido encontrado
          </h2>
          <p className="text-gray-600 mb-6">
            Você ainda não fez nenhum pedido.
          </p>
          <a href="/products" className="btn btn-primary">
            Ver Produtos
          </a>
        </div>
      )}
    </div>
  )
} 