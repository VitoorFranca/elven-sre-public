import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { productsApi } from '../lib/api'
import { BookOpen, Zap, Shield, Star, ArrowRight, Package } from 'lucide-react'

export function Home() {
  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => productsApi.getAll().then(res => res.data),
  })

  console.log(products);

  // Pegar apenas os primeiros 3 produtos para mostrar na home
  const featuredProducts = products ? products.data?.slice(0, 3) : [];

  const features = [
    {
      icon: BookOpen,
      title: 'Livros Selecionados',
      description: 'Livros cuidadosamente escolhidos dos melhores autores e editoras, garantindo qualidade e conteúdo excepcional.'
    },
    {
      icon: Zap,
      title: 'Entrega Rápida',
      description: 'Entrega em até 2 horas na sua região com rastreamento em tempo real.'
    },
    {
      icon: Shield,
      title: 'Qualidade Garantida',
      description: 'Todos os nossos livros passam por rigoroso controle de qualidade.'
    },
    {
      icon: Star,
      title: 'Atendimento Premium',
      description: 'Suporte especializado para tornar sua experiência única e memorável.'
    }
  ]

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-6 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Livros que <span className="text-blue-600">Transformam</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Descubra nossa coleção exclusiva de livros e literatura. 
            Cada obra é cuidadosamente selecionada para trazer conhecimento e inspiração para sua vida.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/products"
              className="btn btn-primary text-lg px-8 py-3 flex items-center justify-center space-x-2"
            >
              <span>Ver Livros</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/cart"
              className="btn btn-secondary text-lg px-8 py-3"
            >
              Meu Carrinho
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Por que escolher a Elven Livros?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Oferecemos a melhor experiência em livros com qualidade premium e serviço excepcional.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <div key={feature.title} className="text-center group">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 transition-colors">
                  <Icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Featured Products */}
      {!isLoading && featuredProducts.length > 0 && (
        <div className="py-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Livros em Destaque
            </h2>
            <p className="text-lg text-gray-600">
              Conheça alguns dos nossos livros mais populares
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredProducts.map((product: any) => (
              <div key={product.id} className="card group hover:shadow-lg transition-shadow">
                <div className="h-48 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg mb-4 flex items-center justify-center group-hover:from-blue-200 group-hover:to-blue-300 transition-colors">
                  <Package className="w-16 h-16 text-blue-600" />
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {product.name}
                </h3>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {product.description}
                </p>
                
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-blue-600">
                    R$ {product.price?.toFixed(2).replace('.', ',')}
                  </span>
                  <span className="text-sm text-gray-500">
                    Estoque: {product.stock}
                  </span>
                </div>
                
                <Link
                  to={`/products/${product.id}`}
                  className="btn btn-primary w-full flex items-center justify-center space-x-2"
                >
                  <span>Ver Detalhes</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Link
              to="/products"
              className="btn btn-secondary text-lg px-8 py-3"
            >
              Ver Todos os Livros
            </Link>
          </div>
        </div>
      )}

      {/* Loading State for Products */}
      {isLoading && (
        <div className="py-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Livros em Destaque
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Pronto para começar?
        </h2>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          Explore nossa coleção completa de livros e literatura. 
          Encontre o livro perfeito para cada momento da sua vida.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/products"
            className="btn btn-primary text-lg px-8 py-3"
          >
            Explorar Livros
          </Link>
          <Link
            to="/orders"
            className="btn btn-secondary text-lg px-8 py-3"
          >
            Ver Pedidos
          </Link>
        </div>
      </div>
    </div>
  )
} 