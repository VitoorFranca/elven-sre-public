import { useState, useEffect } from 'react'
import { Search, Filter, AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react'
import { metricsApi } from '../lib/api'

interface Trace {
  traceID: string
  spans: Span[]
  startTime: number
  duration: number
  serviceName: string
  operationName: string
  status: 'success' | 'error' | 'warning'
}

interface Span {
  spanID: string
  traceID: string
  operationName: string
  startTime: number
  duration: number
  tags: Record<string, any>
  logs: Log[]
  references: Reference[]
}

interface Log {
  timestamp: number
  fields: Record<string, any>
}

interface Reference {
  refType: string
  traceID: string
  spanID: string
}

interface TraceViewerProps {
  jaegerUrl?: string
}

export function TraceViewer({ jaegerUrl = 'http://localhost:16686' }: TraceViewerProps) {
  const [traces, setTraces] = useState<Trace[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [serviceFilter, setServiceFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedTrace, setSelectedTrace] = useState<Trace | null>(null)

  useEffect(() => {
    loadTraces()
  }, [])

  const loadTraces = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Usar a API client configurada que funciona tanto em dev quanto em produção
      const response = await metricsApi.getTracesSummary()
      
      if (response.data.success && response.data.data && Array.isArray(response.data.data)) {
        const formattedTraces = response.data.data.map((trace: any) => ({
          traceID: trace.traceID,
          spans: trace.spans || [],
          startTime: trace.startTime || Date.now(),
          duration: trace.duration || 0,
          serviceName: trace.serviceName || 'elven-api',
          operationName: trace.operationName || 'unknown',
          status: trace.status || 'success'
        }))
        
        setTraces(formattedTraces)
      } else {
        setTraces([])
      }
    } catch (error) {
      console.error('Erro ao carregar traces:', error)
      setError('Não foi possível carregar os traces. Verifique se o Jaeger está rodando.')
      setTraces([])
    } finally {
      setLoading(false)
    }
  }

  const filteredTraces = traces.filter(trace => {
    const matchesSearch = trace.operationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trace.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trace.traceID.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesService = serviceFilter === 'all' || trace.serviceName === serviceFilter
    const matchesStatus = statusFilter === 'all' || trace.status === statusFilter
    
    return matchesSearch && matchesService && matchesStatus
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      default: return <Info className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800'
      case 'error': return 'bg-red-100 text-red-800'
      case 'warning': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDuration = (duration: number) => {
    if (duration < 1000) return `${duration}ms`
    return `${(duration / 1000).toFixed(2)}s`
  }

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR')
  }

  const openInJaeger = (traceID: string) => {
    window.open(`${jaegerUrl}/trace/${traceID}`, '_blank')
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Carregando traces...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Erro ao carregar traces</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={loadTraces}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar por trace ID, operação ou serviço..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="md:w-48">
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos os Serviços</option>
              <option value="elven-api">elven-api</option>
            </select>
          </div>
          <div className="md:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos os Status</option>
              <option value="success">Sucesso</option>
              <option value="error">Erro</option>
              <option value="warning">Aviso</option>
            </select>
          </div>
        </div>
      </div>

      {/* Traces List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {traces.length === 0 ? (
          <div className="text-center py-8">
            <Info className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum trace encontrado</h3>
            <p className="text-gray-600">Não há traces disponíveis no momento.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trace ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Serviço
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Operação
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duração
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTraces.map((trace) => (
                  <tr key={trace.traceID} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono text-gray-900">{trace.traceID}</div>
                      <div className="text-sm text-gray-500">{trace.spans.length} spans</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{trace.serviceName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{trace.operationName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatDuration(trace.duration)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(trace.status)}`}>
                        {getStatusIcon(trace.status)}
                        <span className="ml-1">{trace.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatTimestamp(trace.startTime)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedTrace(trace)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Info className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openInJaeger(trace.traceID)}
                          className="text-green-600 hover:text-green-900"
                        >
                          <Filter className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Trace Details Modal */}
      {selectedTrace && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Detalhes do Trace</h3>
              <button
                onClick={() => setSelectedTrace(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900">Informações Gerais</h4>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Trace ID:</span>
                      <span className="text-sm font-mono">{selectedTrace.traceID}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Serviço:</span>
                      <span className="text-sm">{selectedTrace.serviceName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Operação:</span>
                      <span className="text-sm">{selectedTrace.operationName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Duração:</span>
                      <span className="text-sm">{formatDuration(selectedTrace.duration)}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900">Status</h4>
                  <div className="mt-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedTrace.status)}`}>
                      {getStatusIcon(selectedTrace.status)}
                      <span className="ml-1">{selectedTrace.status}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Spans</h4>
                <div className="space-y-2">
                  {selectedTrace.spans.map((span) => (
                    <div key={span.spanID} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{span.operationName}</p>
                          <p className="text-xs text-gray-500">Span ID: {span.spanID}</p>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {formatDuration(span.duration)}
                        </span>
                      </div>
                      
                      {Object.keys(span.tags).length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs font-medium text-gray-700 mb-1">Tags:</p>
                          <div className="space-y-1">
                            {Object.entries(span.tags).map(([key, value]) => (
                              <div key={key} className="flex justify-between text-xs">
                                <span className="text-gray-600">{key}:</span>
                                <span className="text-gray-900">{String(value)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  onClick={() => setSelectedTrace(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Fechar
                </button>
                <button
                  onClick={() => openInJaeger(selectedTrace.traceID)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                >
                  Abrir no Jaeger
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 