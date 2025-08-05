import { useState, useEffect } from 'react'
import { 
  BarChart3, TrendingUp, Database, HardDrive, AlertTriangle,
  Activity, Zap, Server,
  RefreshCw, AlertCircle, CheckCircle, XCircle, Info
} from 'lucide-react'
import { TraceViewer } from '../components/TraceViewer'
import { metricsApi } from '../lib/api'
import toast from 'react-hot-toast'

interface SystemMetrics {
  system: {
    memory: {
      heapUsed: number
      heapTotal: number
      external: number
      rss: number
    }
    cpu: {
      user: number
      system: number
    }
    uptime: number
    pid: number
    version: string
    platform: string
    arch: string
  }
  database: {
    activeConnections: number
    performance: any[]
    tableSizes: any[]
    connectionStatus: string
  }
  business: {
    products: {
      total_products: number
      in_stock: number
      out_of_stock: number
      avg_price: number
      total_stock: number
    }
    orders: {
      total_orders: number
      pending_orders: number
      processing_orders: number
      shipped_orders: number
      delivered_orders: number
      cancelled_orders: number
      avg_order_value: number
      total_revenue: number
    }
    ordersByDay: any[]
    topProducts: any[]
  }
  performance: {
    slowQueries: any[]
    tableStats: any[]
    indexUsage: any[]
  }
  timestamp: string
}

interface Alert {
  level: 'info' | 'warning' | 'error'
  message: string
  metric: string
  value: number
}

export function InternoMetrics() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [autoRefresh, setAutoRefresh] = useState(true)

  useEffect(() => {
    loadMetrics()
    
    if (autoRefresh) {
      const interval = setInterval(loadMetrics, 30000) // 30 segundos
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  const loadMetrics = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [dashboardResponse, alertsResponse] = await Promise.all([
        metricsApi.getDashboard(),
        metricsApi.getAlerts()
      ])
      
      if (dashboardResponse.data.success) {
        setMetrics(dashboardResponse.data.data.system)
      } else {
        throw new Error(dashboardResponse.data.message || 'Erro ao carregar métricas')
      }
      
      if (alertsResponse.data.success) {
        setAlerts(alertsResponse.data.data)
      } else {
        setAlerts([])
      }
    } catch (error) {
      console.error('Erro ao carregar métricas:', error)
      setError('Erro ao carregar métricas do sistema')
      toast.error('Erro ao carregar métricas do sistema')
    } finally {
      setLoading(false)
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${days}d ${hours}h ${minutes}m`
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const getMemoryUsagePercent = () => {
    if (!metrics) return 0
    return (metrics.system.memory.heapUsed / metrics.system.memory.heapTotal) * 100
  }

  const getAlertIcon = (level: string) => {
    switch (level) {
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case 'info': return <Info className="w-4 h-4 text-blue-500" />
      default: return <Info className="w-4 h-4 text-gray-500" />
    }
  }

  const getAlertColor = (level: string) => {
    switch (level) {
      case 'error': return 'border-red-200 bg-red-50'
      case 'warning': return 'border-yellow-200 bg-yellow-50'
      case 'info': return 'border-blue-200 bg-blue-50'
      default: return 'border-gray-200 bg-gray-50'
    }
  }

  if (loading && !metrics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando métricas do sistema...</p>
        </div>
      </div>
    )
  }

  if (error && !metrics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erro ao carregar métricas</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadMetrics}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard SRE</h1>
              <p className="text-gray-600">Monitoramento e observabilidade do sistema</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={loadMetrics}
                disabled={loading}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </button>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-600">Auto-refresh</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', name: 'Visão Geral', icon: BarChart3 },
              { id: 'system', name: 'Sistema', icon: Server },
              { id: 'database', name: 'Banco de Dados', icon: Database },
              { id: 'business', name: 'Negócio', icon: TrendingUp },
              { id: 'performance', name: 'Performance', icon: Zap },
              { id: 'traces', name: 'Traces', icon: Activity },
              { id: 'alerts', name: 'Alertas', icon: AlertCircle }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && metrics && (
          <div className="space-y-6">
            {/* System Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Server className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Uptime</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatUptime(metrics.system.uptime)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <HardDrive className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Memória</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {`${getMemoryUsagePercent().toFixed(1)}%`}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatBytes(metrics.system.memory.heapUsed)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Database className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Conexões DB</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {metrics.database.activeConnections}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <AlertCircle className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Alertas</p>
                    <p className="text-2xl font-bold text-gray-900">{alerts.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Business Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Métricas de Negócio</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total de Produtos</span>
                    <span className="font-medium">{metrics.business.products.total_products}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total de Pedidos</span>
                    <span className="font-medium">{metrics.business.orders.total_orders}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Receita Total</span>
                    <span className="font-medium">{formatCurrency(metrics.business.orders.total_revenue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Valor Médio Pedido</span>
                    <span className="font-medium">{formatCurrency(metrics.business.orders.avg_order_value)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Status dos Pedidos</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Pendentes</span>
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm">
                      {metrics.business.orders.pending_orders}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Processando</span>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                      {metrics.business.orders.processing_orders}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Enviados</span>
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-sm">
                      {metrics.business.orders.shipped_orders}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Entregues</span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                      {metrics.business.orders.delivered_orders}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'system' && metrics && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações do Sistema</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">PID</span>
                    <span className="font-medium">{metrics.system.pid}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Versão Node.js</span>
                    <span className="font-medium">{metrics.system.version}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Plataforma</span>
                    <span className="font-medium">{metrics.system.platform}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Arquitetura</span>
                    <span className="font-medium">{metrics.system.arch}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Uso de Memória</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Heap Usado</span>
                    <span className="font-medium">{formatBytes(metrics.system.memory.heapUsed)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Heap Total</span>
                    <span className="font-medium">{formatBytes(metrics.system.memory.heapTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">RSS</span>
                    <span className="font-medium">{formatBytes(metrics.system.memory.rss)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">External</span>
                    <span className="font-medium">{formatBytes(metrics.system.memory.external)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'database' && metrics && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Status do Banco</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Status</span>
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      metrics.database.connectionStatus === 'connected' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {metrics.database.connectionStatus}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Conexões Ativas</span>
                    <span className="font-medium">{metrics.database.activeConnections}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tamanho das Tabelas</h3>
                <div className="space-y-2">
                  {metrics.database.tableSizes?.slice(0, 5).map((table: any, index: number) => (
                    <div key={index} className="flex justify-between">
                      <span className="text-gray-600">{table.table_name}</span>
                      <span className="font-medium">{table.size_mb} MB</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'business' && metrics && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Produtos</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total</span>
                    <span className="font-medium">{metrics.business.products.total_products}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Em Estoque</span>
                    <span className="font-medium">{metrics.business.products.in_stock}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sem Estoque</span>
                    <span className="font-medium">{metrics.business.products.out_of_stock}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Preço Médio</span>
                    <span className="font-medium">{formatCurrency(metrics.business.products.avg_price)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Produtos Mais Vendidos</h3>
                <div className="space-y-2">
                  {metrics.business.topProducts?.slice(0, 5).map((product: any, index: number) => (
                    <div key={index} className="flex justify-between items-center">
                      <div>
                        <span className="text-sm font-medium text-gray-900">{product.name}</span>
                        <p className="text-xs text-gray-500">{product.sales_count} vendas</p>
                      </div>
                      <span className="text-sm font-medium">{formatCurrency(product.total_revenue)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'performance' && metrics && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Queries Lentas</h3>
              <div className="space-y-3">
                {metrics.performance.slowQueries?.slice(0, 5).map((query: any, index: number) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium text-gray-900">
                        {query.sql_text?.substring(0, 100)}...
                      </span>
                      <span className="text-sm text-red-600 font-medium">
                        {query.avg_time_ms?.toFixed(2)}ms
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{query.exec_count} execuções</span>
                      <span>Total: {query.total_time_ms?.toFixed(2)}ms</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'traces' && (
          <div className="space-y-6">
            <TraceViewer jaegerUrl={(import.meta as any).env.VITE_JAEGER_URL} />
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Alertas do Sistema</h3>
              {alerts.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <p className="text-gray-600">Nenhum alerta ativo</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {alerts.map((alert, index) => (
                    <div key={index} className={`p-4 border rounded-lg ${getAlertColor(alert.level)}`}>
                      <div className="flex items-start">
                        {getAlertIcon(alert.level)}
                        <div className="ml-3 flex-1">
                          <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Métrica: {alert.metric} | Valor: {alert.value}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
} 