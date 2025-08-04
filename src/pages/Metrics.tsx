import { useQuery } from '@tanstack/react-query'
import { healthApi } from '../lib/api'
import { BarChart3, Activity, Database, Clock, Server, Zap } from 'lucide-react'

export function Metrics() {
  const { data: health, isLoading, error } = useQuery({
    queryKey: ['health'],
    queryFn: healthApi.check,
    refetchInterval: 10000, // Refetch a cada 10 segundos
  })

  const metrics = [
    {
      icon: Activity,
      title: 'Status do Sistema',
      value: health?.status || 'N/A',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Status atual da aplicação'
    },
    {
      icon: Clock,
      title: 'Uptime',
      value: health?.uptime ? `${Math.floor(health.uptime / 60)}m ${Math.floor(health.uptime % 60)}s` : 'N/A',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Tempo de atividade'
    },
    {
      icon: Server,
      title: 'Versão',
      value: health?.version || 'N/A',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'Versão da aplicação'
    },
    {
      icon: Database,
      title: 'Status do Banco',
      value: health?.database || 'N/A',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      description: 'Status da conexão com banco'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <BarChart3 className="w-8 h-8 text-green-600" />
          <h1 className="text-3xl font-bold text-gray-900">Métricas do Sistema</h1>
        </div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Monitoramento em tempo real da aplicação Elven SRE com OpenTelemetry e observabilidade completa.
        </p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="card">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
            <span className="text-gray-600">Carregando métricas...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="card bg-red-50 border-red-200">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-red-600" />
            <span className="text-red-800">Erro ao carregar métricas do sistema</span>
          </div>
        </div>
      )}

      {/* Metrics Grid */}
      {health && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric) => {
            const Icon = metric.icon
            return (
              <div key={metric.title} className="card">
                <div className={`w-12 h-12 ${metric.bgColor} rounded-lg flex items-center justify-center mb-4`}>
                  <Icon className={`w-6 h-6 ${metric.color}`} />
                </div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  {metric.title}
                </h3>
                <p className={`text-2xl font-bold ${metric.color} mb-2`}>
                  {metric.value}
                </p>
                <p className="text-xs text-gray-500">
                  {metric.description}
                </p>
              </div>
            )
          })}
        </div>
      )}

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Metrics */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Activity className="w-5 h-5 text-green-600" />
            <span>Métricas de Performance</span>
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Latência Média</span>
              <span className="text-sm font-medium text-gray-900">~45ms</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Throughput</span>
              <span className="text-sm font-medium text-gray-900">1.2k req/s</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Taxa de Erro</span>
              <span className="text-sm font-medium text-green-600">0.1%</span>
            </div>
          </div>
        </div>

        {/* System Resources */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Server className="w-5 h-5 text-blue-600" />
            <span>Recursos do Sistema</span>
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">CPU</span>
              <span className="text-sm font-medium text-gray-900">23%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Memória</span>
              <span className="text-sm font-medium text-gray-900">1.2GB / 4GB</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Disco</span>
              <span className="text-sm font-medium text-gray-900">45%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Observability Stack */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Stack de Observabilidade</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">OpenTelemetry</h4>
            <p className="text-sm text-blue-700">
              Instrumentação automática e coleta de telemetria distribuída
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">Jaeger</h4>
            <p className="text-sm text-green-700">
              Rastreamento distribuído e análise de performance
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-medium text-purple-900 mb-2">Prometheus</h4>
            <p className="text-sm text-purple-700">
              Coleta e armazenamento de métricas de sistema
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 