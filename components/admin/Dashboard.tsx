'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Scissors, DollarSign, TrendingUp, Calendar, Clock } from 'lucide-react'

interface DashboardStats {
  general: {
    totalBarbers: number
    totalServices: number
    todayRevenue: number
    weekRevenue: number
    monthRevenue: number
    lastMonthRevenue: number
    todayServices: number
    weekServices: number
    monthServices: number
  }
  barberStats: Array<{
    barberId: string
    barberName: string
    servicesCount: number
    totalRevenue: number
    averageService: number
  }>
  recentActivity: Array<{
    id: string
    barberName: string
    serviceName: string
    amount: number
    method: string
    createdAt: string
  }>
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error: any) {
      console.error('Error al obtener estadísticas:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!stats) return null

  const statCards = [
    {
      title: 'Total Barberos',
      value: stats.general.totalBarbers,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Servicios Activos',
      value: stats.general.totalServices,
      icon: Scissors,
      color: 'bg-green-500',
    },
    {
      title: 'Ingresos del Mes',
      value: `$${stats.general.monthRevenue.toLocaleString()}`,
      icon: Calendar,
      color: 'bg-purple-500',
    },
    {
      title: 'Ingresos de la Semana',
      value: `$${stats.general.weekRevenue.toLocaleString()}`,
      icon: TrendingUp,
      color: 'bg-yellow-500',
    },
    {
      title: 'Ingresos Hoy',
      value: `$${stats.general.todayRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-green-600',
    },
    {
      title: 'Servicios Esta Semana',
      value: stats.general.weekServices,
      icon: Clock,
      color: 'bg-indigo-500',
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Cargando estadísticas...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h2>
        <p className="text-gray-600">
          Resumen general de la barbería
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.color} rounded-lg p-3`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Performance by Barber */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Rendimiento por Barbero (Esta Semana)
          </h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {stats.barberStats.map((barber, index) => (
              <div key={barber.barberId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary-600">
                      {barber.barberName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{barber.barberName}</p>
                    <p className="text-sm text-gray-500">{barber.servicesCount} servicios</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    ${barber.totalRevenue.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    Prom: ${barber.averageService.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Actividad Reciente
          </h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {stats.recentActivity.slice(0, 5).map((activity, index) => (
              <div key={activity.id} className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">
                    {activity.barberName} registró {activity.serviceName.toLowerCase()} de ${activity.amount.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(activity.createdAt).toLocaleString('es-ES')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

