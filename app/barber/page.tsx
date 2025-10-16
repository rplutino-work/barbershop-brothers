'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { DollarSign, Calendar, Clock, TrendingUp, User, LogOut, Scissors, BarChart3, History, CheckCircle } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { BarberServiceHistory } from '@/components/BarberServiceHistory'
import { BarberAppointments } from '@/components/BarberAppointments'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

interface BarberStats {
  todayRevenue: number
  weekRevenue: number
  monthRevenue: number
  todayServices: number
  weekServices: number
  monthServices: number
  averageService: number
  barber?: {
    id: string
    name: string
    commissionRate: number
  }
  recentServices: Array<{
    id: string
    serviceName: string
    serviceDurationMinutes: number
    amount: number
    method: string
    clientName?: string
    clientPhone?: string
    createdAt: string
    serviceStartTime?: string | null
    serviceEndTime?: string | null
    serviceDuration?: number | null
  }>
}

type BarberTab = 'stats' | 'appointments' | 'history'

export default function BarberDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<BarberStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<BarberTab>('stats')

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user.role !== 'BARBER') {
      router.push('/login')
    } else {
      fetchBarberStats()
    }
  }, [session, status, router])

  const fetchBarberStats = async () => {
    try {
      const response = await fetch(`/api/stats/barber/${session?.user.id}`)
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error: any) {
      console.error('Error al obtener estadísticas del barbero:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <LoadingSpinner size="lg" text="Cargando dashboard..." />
        </div>
      </div>
    )
  }

  if (!session || session.user.role !== 'BARBER') {
    return null
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Error al cargar estadísticas</div>
      </div>
    )
  }

  const tabs = [
    { id: 'stats' as BarberTab, label: 'Mi Seguimiento', icon: BarChart3 },
    { id: 'appointments' as BarberTab, label: 'Mis Turnos', icon: Calendar },
    { id: 'history' as BarberTab, label: 'Mis Servicios', icon: History },
  ]

  const statCards = [
    {
      title: 'Ingresos Hoy',
      value: `$${stats.todayRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-green-500',
      subtitle: `${stats.todayServices} servicios`
    },
    {
      title: 'Ingresos Esta Semana',
      value: `$${stats.weekRevenue.toLocaleString()}`,
      icon: TrendingUp,
      color: 'bg-blue-500',
      subtitle: `${stats.weekServices} servicios`
    },
    {
      title: 'Ingresos Este Mes',
      value: `$${stats.monthRevenue.toLocaleString()}`,
      icon: Calendar,
      color: 'bg-purple-500',
      subtitle: `${stats.monthServices} servicios`
    },
    {
      title: 'Promedio por Servicio',
      value: `$${stats.averageService.toLocaleString()}`,
      icon: Clock,
      color: 'bg-yellow-500',
      subtitle: 'Últimos 30 días'
    },
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between py-4 md:py-0 md:h-16 space-y-4 md:space-y-0">
            <div className="flex items-center">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                <User className="w-4 h-4 md:w-5 md:h-5 text-primary-600" />
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                Mi Dashboard
              </h1>
            </div>
            <div className="flex items-center justify-between md:justify-end space-x-4">
              <span className="text-xs md:text-sm text-gray-600">
                Hola, {session.user.name}
              </span>
              <button
                onClick={() => signOut()}
                className="flex items-center space-x-2 px-3 md:px-4 py-2 text-xs md:text-sm text-red-600 hover:text-red-800 transition-colors"
              >
                <LogOut className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden sm:inline">Cerrar Sesión</span>
                <span className="sm:hidden">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* Tabs Navigation */}
        <div className="mb-6 md:mb-8">
          <nav className="flex space-x-2 bg-white rounded-xl p-2 shadow-sm">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center space-x-2 px-3 md:px-4 py-2 md:py-3 rounded-lg font-medium transition-colors text-sm md:text-base ${
                    activeTab === tab.id
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                </button>
              )
            })}
          </nav>
        </div>

        <div className="space-y-6">
          {/* Content based on active tab */}
          {activeTab === 'history' ? (
            /* Historial de Servicios */
            <BarberServiceHistory barberId={session.user.id} />
          ) : activeTab === 'appointments' ? (
            /* Turnos del Barbero */
            <BarberAppointments barberId={session.user.id} />
          ) : (
            /* Estadísticas y Seguimiento */
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {statCards.map((stat, index) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-sm border p-4 md:p-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs md:text-sm font-medium text-gray-600">
                        {stat.title}
                      </p>
                      <p className="text-xl md:text-2xl font-bold text-gray-900 mt-1">
                        {stat.value}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {stat.subtitle}
                      </p>
                    </div>
                    <div className={`${stat.color} rounded-lg p-2 md:p-3 flex-shrink-0`}>
                      <Icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

              {/* Comisión y ganancias reales */}
              {stats.barber && (
                <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl shadow-sm border border-primary-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    💰 Tus Ganancias Reales
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Tu Comisión:</span>
                      <span className="text-2xl font-bold text-primary-600">
                        {stats.barber.commissionRate}%
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-white rounded-lg p-4">
                        <p className="text-xs text-gray-600 mb-1">Ganancia Hoy</p>
                        <p className="text-lg font-bold text-green-600">
                          ${Math.round((stats.todayRevenue || 0) * (stats.barber.commissionRate / 100)).toLocaleString()}
                        </p>
                      </div>
                      
                      <div className="bg-white rounded-lg p-4">
                        <p className="text-xs text-gray-600 mb-1">Ganancia Semana</p>
                        <p className="text-lg font-bold text-blue-600">
                          ${Math.round((stats.weekRevenue || 0) * (stats.barber.commissionRate / 100)).toLocaleString()}
                        </p>
                      </div>
                      
                      <div className="bg-white rounded-lg p-4">
                        <p className="text-xs text-gray-600 mb-1">Ganancia Mes</p>
                        <p className="text-lg font-bold text-purple-600">
                          ${Math.round((stats.monthRevenue || 0) * (stats.barber.commissionRate / 100)).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Recent Services */}
              <div className="bg-white rounded-xl shadow-sm border">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Mis Servicios Recientes
                  </h3>
                </div>
                <div className="p-6">
                  {stats.recentServices.length > 0 ? (
                    <div className="space-y-4">
                      {stats.recentServices.map((service) => (
                        <div key={service.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-semibold text-primary-600">
                                {service.serviceName.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{service.serviceName}</p>
                              <p className="text-sm text-gray-500">
                                {service.clientName || 'Cliente Ocasional'}
                              </p>
                              <p className="text-xs text-gray-400">
                                {new Date(service.createdAt).toLocaleDateString('es-ES')} {new Date(service.createdAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                              {service.serviceStartTime && service.serviceEndTime && service.serviceDuration && (
                                <p className="text-xs text-blue-600 font-medium">
                                  <Clock className="w-3 h-3 inline mr-1" />
                                  {new Date(service.serviceStartTime).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} - {new Date(service.serviceEndTime).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} ({Math.floor(service.serviceDuration / 60)}:{(service.serviceDuration % 60).toString().padStart(2, '0')} min)
                                </p>
                              )}
                              {!service.serviceStartTime && (
                                <p className="text-xs text-orange-500 italic">
                                  Duración estándar: {service.serviceDurationMinutes} min
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              ${service.amount.toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-500 capitalize">
                              {service.method.toLowerCase()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No hay servicios registrados aún</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Acciones Rápidas
                </h3>
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={fetchBarberStats}
                    className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
                  >
                    <span>Actualizar Estadísticas</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}