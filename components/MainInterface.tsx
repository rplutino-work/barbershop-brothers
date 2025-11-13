'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Scissors, Calendar, BarChart3, DollarSign, TrendingUp, Clock, Play, StopCircle } from 'lucide-react'
import { LoadingSpinner } from './ui/LoadingSpinner'
import { BarberSelector } from './BarberSelector'
import { DailyServices } from './DailyServices'
import { DailyAppointments } from './DailyAppointments'
import { ServiceTimer } from './ServiceTimer'
import Image from 'next/image'

interface Barber {
  id: string
  name: string
  imageUrl?: string | null
}

interface ActiveService {
  id: string
  barberId: string
  startTime: string
}

interface MainInterfaceProps {
  onStartRegistration: (barber: Barber) => void
}

export function MainInterface({ onStartRegistration }: MainInterfaceProps) {
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [loading, setLoading] = useState(true)
  const [showMenu, setShowMenu] = useState(false)
  const [showDailyServices, setShowDailyServices] = useState(false)
  const [showDailyAppointments, setShowDailyAppointments] = useState(false)
  const [showStatsModal, setShowStatsModal] = useState(false)
  const [selectedBarberStats, setSelectedBarberStats] = useState<any>(null)
  const [loadingStats, setLoadingStats] = useState(false)
  const [activeServices, setActiveServices] = useState<ActiveService[]>([])
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null)

  useEffect(() => {
    fetchBarbers()
    fetchActiveServices()
    
    // Actualizar servicios activos cada 5 segundos
    const interval = setInterval(() => {
      fetchActiveServices()
    }, 5000)
    
    return () => clearInterval(interval)
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

  const fetchActiveServices = async () => {
    try {
      const response = await fetch('/api/active-service')
      if (response.ok) {
        const services = await response.json()
        setActiveServices(services)
      }
    } catch (error: any) {
      console.error('Error al cargar servicios activos:', error)
    }
  }

  const handleBarberSelect = (barber: Barber) => {
    // Verificar si el barbero tiene un servicio activo
    const hasActiveService = activeServices.some(s => s.barberId === barber.id)
    
    if (hasActiveService) {
      // Si tiene servicio activo, finalizar y continuar con el registro
      handleFinishService(barber)
    } else {
      // Si no tiene servicio activo, mostrar modal de confirmación
      setSelectedBarber(barber)
      setShowConfirmModal(true)
    }
  }

  const handleStartService = async () => {
    if (!selectedBarber) return

    try {
      const response = await fetch('/api/active-service', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barberId: selectedBarber.id }),
      })

      if (response.ok) {
        await fetchActiveServices()
        setShowConfirmModal(false)
        setSelectedBarber(null)
      }
    } catch (error: any) {
      console.error('Error al iniciar servicio:', error)
    }
  }

  const handleFinishService = async (barber: Barber) => {
    try {
      const response = await fetch(`/api/active-service?barberId=${barber.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        const serviceData = await response.json()
        await fetchActiveServices()
        
        // Guardar datos del servicio para usarlos en el checkout
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('activeServiceData', JSON.stringify({
            startTime: serviceData.startTime,
            duration: serviceData.duration,
            barberId: barber.id
          }))
        }
        
        // Continuar con el flujo de registro
        onStartRegistration(barber)
      }
    } catch (error: any) {
      console.error('Error al finalizar servicio:', error)
    }
  }

  const handleCancelStart = () => {
    setShowConfirmModal(false)
    setSelectedBarber(null)
  }

  const toggleMenu = () => {
    setShowMenu(!showMenu)
  }

  const handleDailyServices = () => {
    setShowDailyServices(true)
    setShowMenu(false)
  }

  const handleDailyAppointments = () => {
    setShowDailyAppointments(true)
    setShowMenu(false)
  }

  const handleBackToMain = () => {
    setShowDailyServices(false)
    setShowDailyAppointments(false)
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

  // Calcular columnas del grid según cantidad de barberos
  const getGridCols = () => {
    const count = barbers.length
    if (count === 1) return 'grid-cols-1'
    if (count === 2) return 'grid-cols-2'
    if (count === 3) return 'grid-cols-3'
    if (count === 4) return 'grid-cols-2 tablet:grid-cols-2 landscape:grid-cols-4'
    if (count === 5) return 'grid-cols-3 tablet:grid-cols-3 landscape:grid-cols-5'
    if (count === 6) return 'grid-cols-3 tablet:grid-cols-3 landscape:grid-cols-6'
    if (count === 7) return 'grid-cols-3 tablet:grid-cols-4 landscape:grid-cols-7'
    if (count === 8) return 'grid-cols-4 tablet:grid-cols-4 landscape:grid-cols-8'
    // Para más de 8, usar grid dinámico
    return 'grid-cols-4 tablet:grid-cols-4 landscape:grid-cols-6'
  }

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <LoadingSpinner size="lg" text="Cargando barberos..." />
        </div>
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

  if (showDailyAppointments) {
    return (
      <div className="h-full w-full bg-gray-100 overflow-y-auto">
        <DailyAppointments onBack={handleBackToMain} />
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

              <button
                onClick={handleDailyAppointments}
                className="w-full flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <Clock className="w-6 h-6 text-primary-600" />
                <span className="text-lg font-semibold text-gray-900">
                  Turnos del Día
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
      <div className="h-full flex flex-col items-center justify-center px-2 tablet:px-4 landscape:px-2">
        <div className={`grid ${getGridCols()} gap-1 tablet:gap-2 landscape:gap-1 w-full h-full items-stretch justify-items-stretch`}>
          {barbers.map((barber, index) => {
            const activeService = activeServices.find(s => s.barberId === barber.id)
            const isActive = !!activeService
            
            return (
              <motion.div
                key={barber.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 group flex items-center justify-center w-full h-full min-h-[200px] tablet:min-h-[250px] landscape:min-h-[180px] ${
                  isActive 
                    ? 'bg-gradient-to-br from-green-500 to-green-600' 
                    : 'bg-gradient-to-br from-primary-500 to-primary-600'
                }`}
              >
                {/* Botón de estadísticas */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    fetchBarberStats(barber)
                  }}
                  className="absolute top-2 right-2 w-6 h-6 md:w-8 md:h-8 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center transition-all duration-200 group/stats"
                  title="Ver estadísticas"
                >
                  <BarChart3 className="w-3 h-3 md:w-4 md:h-4" />
                </button>

                {/* Indicador de estado */}
                {isActive && (
                  <div className="absolute top-2 left-2 flex items-center gap-1">
                    <div className="w-2 h-2 md:w-3 md:h-3 bg-white rounded-full animate-pulse"></div>
                    <span className="text-xs md:text-sm font-medium">En servicio</span>
                  </div>
                )}

                {/* Contenido principal */}
                <button
                  onClick={() => handleBarberSelect(barber)}
                  className="w-full text-center"
                >
                  <div className="flex flex-col items-center justify-center w-full h-full p-4 tablet:p-6 landscape:p-4">
                    {/* Imagen o Ícono */}
                    <div className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full overflow-hidden mb-3 md:mb-4 border-4 border-white border-opacity-30 group-hover:border-opacity-50 transition-all shadow-lg">
                      {barber.imageUrl ? (
                        <Image
                          src={barber.imageUrl}
                          alt={barber.name}
                          width={96}
                          height={96}
                          className="object-cover w-full h-full"
                          priority
                        />
                      ) : (
                        <div className="w-full h-full bg-white bg-opacity-20 flex items-center justify-center group-hover:bg-opacity-30 transition-all">
                          {isActive ? (
                            <StopCircle className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12" />
                          ) : (
                            <Scissors className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12" />
                          )}
                        </div>
                      )}
                    </div>
                    
                    <h3 className="text-xl md:text-2xl lg:text-3xl font-bold leading-tight text-center px-2 break-words w-full mb-2">
                      {barber.name}
                    </h3>
                    
                    {/* Cronómetro */}
                    {isActive && activeService && (
                      <div className="mt-2">
                        <ServiceTimer startTime={activeService.startTime} size="lg" />
                      </div>
                    )}
                  </div>
                </button>
              </motion.div>
            )
          })}
        </div>
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
              className="bg-white rounded-2xl p-4 tablet:p-6 landscape:p-4 w-full max-w-md tablet:max-w-xl landscape:max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header del modal */}
              <div className="flex items-center justify-between mb-4 landscape:mb-3">
                <div>
                  <h3 className="text-lg landscape:text-xl font-bold text-gray-900">
                    Estadísticas de {selectedBarberStats.barber.name}
                  </h3>
                  <p className="text-xs landscape:text-sm text-gray-600">Resumen de rendimiento</p>
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
                  <LoadingSpinner size="md" text="Cargando estadísticas..." />
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
                          <p className="text-sm font-medium text-gray-600">Ganancia Hoy</p>
                          <p className="text-lg font-bold text-gray-900">
                            ${(selectedBarberStats.todayEarnings || 0).toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">(comisión + propinas)</p>
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
                          <p className="text-sm font-medium text-gray-600">Ganancia Semana</p>
                          <p className="text-lg font-bold text-gray-900">
                            ${(selectedBarberStats.weekEarnings || 0).toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">(comisión + propinas)</p>
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
                          <p className="text-sm font-medium text-gray-600">Ganancia Mes</p>
                          <p className="text-lg font-bold text-gray-900">
                            ${(selectedBarberStats.monthEarnings || 0).toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">(comisión + propinas)</p>
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
                          <p className="text-sm font-medium text-gray-600">Promedio Ganancia/Servicio</p>
                          <p className="text-lg font-bold text-gray-900">
                            ${(selectedBarberStats.averageEarnings || 0).toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">(últimos 30 días)</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Estadísticas de tiempo */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">
                        ⏱️ Estadísticas de Tiempo
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        {(() => {
                          // Obtener servicios recientes del API o calcular desde las estadísticas
                          const recentServices = selectedBarberStats.recentServices || []
                          const servicesWithDuration = recentServices.filter((s: any) => 
                            s.serviceDuration !== null && s.serviceDuration !== undefined
                          )
                          
                          const avgDuration = servicesWithDuration.length > 0
                            ? servicesWithDuration.reduce((sum: number, s: any) => sum + (s.serviceDuration || 0), 0) / servicesWithDuration.length
                            : 0
                          
                          const todayServicesWithDuration = recentServices.filter((s: any) => {
                            const serviceDate = new Date(s.createdAt).toDateString()
                            const today = new Date().toDateString()
                            return serviceDate === today && s.serviceDuration !== null && s.serviceDuration !== undefined
                          })
                          const todayTotalTime = todayServicesWithDuration.reduce((sum: number, s: any) => sum + (s.serviceDuration || 0), 0)
                          
                          return (
                            <>
                              <div className="bg-white rounded-lg p-3">
                                <p className="text-xs text-gray-600 mb-1">Tiempo Promedio</p>
                                <p className="text-sm font-bold text-blue-600">
                                  {avgDuration > 0 ? `${Math.floor(avgDuration / 60)}:${(avgDuration % 60).toString().padStart(2, '0')}` : 'N/A'}
                                </p>
                                <p className="text-xs text-gray-500">por servicio</p>
                              </div>
                              
                              <div className="bg-white rounded-lg p-3">
                                <p className="text-xs text-gray-600 mb-1">Tiempo Total Hoy</p>
                                <p className="text-sm font-bold text-green-600">
                                  {todayTotalTime > 0 ? `${Math.floor(todayTotalTime / 60)}:${(todayTotalTime % 60).toString().padStart(2, '0')}` : '0:00'}
                                </p>
                                <p className="text-xs text-gray-500">minutos</p>
                              </div>
                            </>
                          )
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de confirmación para iniciar servicio */}
      <AnimatePresence>
        {showConfirmModal && selectedBarber && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={handleCancelStart}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-md"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Play className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Iniciar Servicio
                </h3>
                <p className="text-gray-600">
                  ¿Deseas iniciar un servicio con{' '}
                  <span className="font-semibold text-primary-600">
                    {selectedBarber.name}
                  </span>
                  ?
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCancelStart}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleStartService}
                  className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  Iniciar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}