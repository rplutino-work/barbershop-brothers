'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Scissors, CreditCard, BarChart3, Settings, LogOut, UserCheck } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { BarberManagement } from '@/components/admin/BarberManagement'
import { ServiceManagement } from '@/components/admin/ServiceManagement'
import { PaymentHistory } from '@/components/admin/PaymentHistory'
import { ClientManagement } from '@/components/admin/ClientManagement'
import { Dashboard } from '@/components/admin/Dashboard'

type AdminTab = 'dashboard' | 'barbers' | 'services' | 'clients' | 'payments' | 'settings'

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard')

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user.role !== 'ADMIN') {
      router.push('/login')
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Cargando...</div>
      </div>
    )
  }

  if (!session || session.user.role !== 'ADMIN') {
    return null
  }

  const tabs = [
    { id: 'dashboard' as AdminTab, label: 'Dashboard', icon: BarChart3 },
    { id: 'barbers' as AdminTab, label: 'Barberos', icon: Users },
    { id: 'services' as AdminTab, label: 'Servicios', icon: Scissors },
    { id: 'clients' as AdminTab, label: 'Clientes', icon: UserCheck },
    { id: 'payments' as AdminTab, label: 'Pagos', icon: CreditCard },
    { id: 'settings' as AdminTab, label: 'Configuración', icon: Settings },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />
      case 'barbers':
        return <BarberManagement />
      case 'services':
        return <ServiceManagement />
      case 'clients':
        return <ClientManagement />
      case 'payments':
        return <PaymentHistory />
      case 'settings':
        return (
          <div className="p-8">
            <h2 className="text-2xl font-bold mb-4">Configuración</h2>
            <p className="text-gray-600">Configuración del sistema (próximamente)</p>
          </div>
        )
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between py-4 md:py-0 md:h-16 space-y-4 md:space-y-0">
            <div className="flex items-center">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                Panel de Administración
              </h1>
            </div>
            <div className="flex items-center justify-between md:justify-end space-x-4">
              <span className="text-xs md:text-sm text-gray-600">
                Bienvenido, {session.user.name}
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
        <div className="flex flex-col lg:flex-row lg:space-x-8 space-y-4 lg:space-y-0">
          {/* Sidebar - Mobile horizontal scroll, Desktop vertical */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <nav className="flex lg:flex-col space-x-2 lg:space-x-0 lg:space-y-2 overflow-x-auto lg:overflow-x-visible">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 lg:space-x-3 px-3 lg:px-4 py-2 lg:py-3 text-left rounded-lg transition-colors whitespace-nowrap lg:w-full ${
                      activeTab === tab.id
                        ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-700 lg:border-r-2'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4 lg:w-5 lg:h-5 flex-shrink-0" />
                    <span className="font-medium text-sm lg:text-base">{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}