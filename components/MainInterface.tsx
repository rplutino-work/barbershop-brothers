'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Scissors, Calendar, BarChart3, DollarSign, TrendingUp, Clock } from 'lucide-react'
import { BarberSelector } from './BarberSelector'
import { DailyServices } from './DailyServices'

interface Barber {
  id: string
  name: string
}

interface MainInterfaceProps {
  onStartRegistration: (barber: Barber) => void
}

export function MainInterface({ onStartRegistration }: MainInterfaceProps) {
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [loading, setLoading] = useState(true)
  const [showMenu, setShowMenu] = useState(false)
  const [showDailyServices, setShowDailyServices] = useState(false)
  const [showStatsModal, setShowStatsModal] = useState(false)
  const [selectedBarberStats, setSelectedBarberStats] = useState<any>(null)
  const [loadingStats, setLoadingStats] = useState(false)

  useEffect(() => {
    fetchBarbers()
  }, [])

  const fetchBarbers = async () => {
    try {
      const response = await fetch('/api/users')
      if (response.ok) {
        const users = await response.json()
        const barbersData = users.filter((user: any) => user.role === 'BARBER')
        setBarbers(barbersData)
      }
    } catch (error: any) {
      console.error('Error al cargar barberos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBarberSelect = (barber: Barber) => {
    onStartRegistration(barber)
  }

  const toggleMenu = () => {
    setShowMenu(!showMenu)
  }

  const handleDailyServices = () => {
    setShowDailyServices(true)
    setShowMenu(false)
  }

  const handleBackToMain = () => {
    setShowDailyServices(false)
  }

  const fetchBarberStats = async (barber: Barber) => {
    setLoadingStats(true)
    try {
      const response = await fetch(`/api/stats/barber/${barber.id}`)
      if (response.ok) {
        const stats = await response.json()
        setSelectedBarberStats({ ...stats, barber })
        setShowStatsModal(true)
      }
    } catch (error: any) {
      console.error('Error al obtener estadísticas:', error)
    } finally {
      setLoadingStats(false)
    }
  }

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-100">
        <div className="text-xl text-gray-900 bg-white p-4 rounded-lg shadow-sm">Cargando barberos...</div>
      </div>
    )
  }

  if (showDailyServices) {
    return (
      <div className="h-full w-full bg-gray-100 p-8 overflow-y-auto">
        <DailyServices 
          onRegisterNew={() => setShowDailyServices(false)}
          onBack={() => setShowDailyServices(false)}
        />
      </div>
    )
  }

  return (
    <div className="h-full w-full bg-gray-100 relative">
      {/* Menú Hamburguesa */}
      <div className="absolute top-4 left-4 z-50">
        <button
          onClick={toggleMenu}
          className="p-3 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow"
        >
          {showMenu ? (
            <X className="w-6 h-6 text-gray-700" />
          ) : (
            <Menu className="w-6 h-6 text-gray-700" />
          )}
        </button>
      </div>

      {/* Menú Lateral */}
      {showMenu && (
        <motion.div
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          exit={{ x: -300 }}
          className="absolute top-0 left-0 h-full w-80 bg-white shadow-2xl z-40"
        >
          <div className="p-6 pt-20">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Menú</h2>
            
            <div className="space-y-4">
              <button
                onClick={handleDailyServices}
                className="w-full flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <Calendar className="w-6 h-6 text-primary-600" />
                <span className="text-lg font-semibold text-gray-900">
                  Servicios de Hoy
                </span>
              </button>
              
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
                  Barbería Elite
                </h3>
                <p className="text-gray-600 text-sm">
                  Sistema de gestión de servicios
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Overlay para cerrar menú */}
      {showMenu && (
        <div
          className="absolute inset-0 bg-black bg-opacity-25 z-30"
          onClick={() => setShowMenu(false)}
        />
      )}

      {/* Contenido Principal - Botones de Barberos */}
      <div className="h-full flex flex-col items-center justify-center py-8 px-4 tablet:px-8 overflow-y-auto">
        <div className="grid grid-cols-2 tablet:grid-cols-3 lg:grid-cols-4 gap-4 tablet:gap-6 lg:gap-8 max-w-6xl w-full">
          {barbers.map((barber, index) => (
            <motion.div
              key={barber.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative bg-gradient-to-br from-primary-500 to-primary-600 text-white p-6 tablet:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 group aspect-square flex items-center justify-center"
            >
              {/* Botón de estadísticas */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  fetchBarberStats(barber)
                }}
                className="absolute top-3 right-3 w-8 h-8 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center transition-all duration-200 group/stats"
                title="Ver estadísticas"
              >
                <BarChart3 className="w-4 h-4" />
              </button>

              {/* Contenido principal */}
              <button
                onClick={() => handleBarberSelect(barber)}
                className="w-full text-center"
              >
                <div className="flex flex-col items-center justify-center">
                  <div className="w-16 h-16 tablet:w-20 tablet:h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-3 tablet:mb-4 group-hover:bg-opacity-30 transition-all">
                    <Scissors className="w-8 h-8 tablet:w-10 tablet:h-10" />
                  </div>
                  <h3 className="text-xl tablet:text-2xl font-bold">{barber.name}</h3>
                </div>
              </button>
            </motion.div>
          ))}
        </div>

        {/* Información adicional */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <p className="text-gray-500 text-sm">
            Usa el menú hamburguesa para ver los servicios del día
          </p>
        </motion.div>
      </div>

      {/* Modal de Estadísticas */}
      <AnimatePresence>
        {showStatsModal && selectedBarberStats && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowStatsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-2xl p-6 tablet:p-8 w-full max-w-md tablet:max-w-2xl mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header del modal */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Estadísticas de {selectedBarberStats.barber.name}
                  </h3>
                  <p className="text-sm text-gray-600">Resumen de rendimiento</p>
                </div>
                <button
                  onClick={() => setShowStatsModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {loadingStats ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Cargando estadísticas...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Grid de estadísticas - 2 columnas en tablet */}
                  <div className="grid grid-cols-1 tablet:grid-cols-2 gap-4">
                    {/* Estadísticas del día */}
                    <div className="bg-green-50 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                          <DollarSign className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Hoy</p>
                          <p className="text-lg font-bold text-gray-900">
                            ${selectedBarberStats.todayRevenue?.toLocaleString() || 0}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">{selectedBarberStats.todayServices || 0} servicios</p>
                      </div>
                    </div>
                  </div>

                  {/* Estadísticas de la semana */}
                  <div className="bg-blue-50 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Esta Semana</p>
                          <p className="text-lg font-bold text-gray-900">
                            ${selectedBarberStats.weekRevenue?.toLocaleString() || 0}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">{selectedBarberStats.weekServices || 0} servicios</p>
                      </div>
                    </div>
                  </div>

                  {/* Estadísticas del mes */}
                  <div className="bg-purple-50 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Este Mes</p>
                          <p className="text-lg font-bold text-gray-900">
                            ${selectedBarberStats.monthRevenue?.toLocaleString() || 0}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">{selectedBarberStats.monthServices || 0} servicios</p>
                      </div>
                    </div>
                  </div>

                    {/* Promedio por servicio */}
                    <div className="bg-yellow-50 rounded-xl p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                          <Clock className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Promedio por Servicio</p>
                          <p className="text-lg font-bold text-gray-900">
                            ${selectedBarberStats.averageService?.toLocaleString() || 0}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Comisión y ganancias reales */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">Comisión del Barbero:</span>
                          <span className="text-lg font-bold text-primary-700">
                            {selectedBarberStats.barber?.commissionRate || 50}%
                          </span>
                        </div>
                        
                        <div className="h-px bg-primary-200"></div>
                        
                        <div>
                          <p className="text-xs text-gray-600 mb-2">Tu ganancia real del mes:</p>
                          <p className="text-2xl font-bold text-primary-600">
                            ${Math.round((selectedBarberStats.monthRevenue || 0) * ((selectedBarberStats.barber?.commissionRate || 50) / 100)).toLocaleString()}
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 pt-2">
                          <div>
                            <p className="text-xs text-gray-600">Ganancia Hoy:</p>
                            <p className="text-sm font-semibold text-gray-900">
                              ${Math.round((selectedBarberStats.todayRevenue || 0) * ((selectedBarberStats.barber?.commissionRate || 50) / 100)).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Ganancia Semana:</p>
                            <p className="text-sm font-semibold text-gray-900">
                              ${Math.round((selectedBarberStats.weekRevenue || 0) * ((selectedBarberStats.barber?.commissionRate || 50) / 100)).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}