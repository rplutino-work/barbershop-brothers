'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Menu, X, Scissors, Calendar } from 'lucide-react'
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
    } catch (error) {
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
      <div className="h-full flex flex-col items-center justify-start pt-16 pb-8 px-8 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Barbería Elite
          </h1>
          <p className="text-lg md:text-xl text-gray-600 px-4">
            Selecciona un barbero para registrar un servicio
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl w-full mb-8 mt-8">
          {barbers.map((barber, index) => (
            <motion.button
              key={barber.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleBarberSelect(barber)}
              className="bg-gradient-to-br from-primary-500 to-primary-600 text-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 group"
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-opacity-30 transition-all">
                  <Scissors className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold mb-2">{barber.name}</h3>
                <p className="text-primary-100">Toca para registrar servicio</p>
              </div>
            </motion.button>
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
    </div>
  )
}