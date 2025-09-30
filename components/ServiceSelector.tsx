'use client'

import { motion } from 'framer-motion'
import { Scissors, Zap } from 'lucide-react'

interface Service {
  id: string
  name: string
  price: number
  duration: number
}

interface ServiceSelectorProps {
  services: Service[]
  onSelectService: (service: Service) => void
  onBack: () => void
}

export function ServiceSelector({ services, onSelectService, onBack }: ServiceSelectorProps) {
  const getServiceIcon = (serviceName: string) => {
    if (serviceName.toLowerCase().includes('corte') && serviceName.toLowerCase().includes('barba')) {
      return <Zap className="w-12 h-12" />
    }
    return <Scissors className="w-12 h-12" />
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -300 }}
      className="absolute inset-0 bg-white p-4 md:p-8 flex flex-col overflow-x-hidden"
    >
      <div className="flex items-center mb-4 md:mb-8 flex-shrink-0">
        <button
          onClick={onBack}
          className="mr-4 p-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          ← Volver
        </button>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Seleccionar Servicio</h2>
      </div>

      <div className="grid grid-cols-1 gap-4 flex-1 overflow-y-auto overflow-x-hidden">
        {services.map((service) => (
          <motion.button
            key={service.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectService(service)}
            className="touch-button bg-gradient-to-r from-secondary-50 to-secondary-100 border-2 border-secondary-200 rounded-xl md:rounded-2xl p-4 md:p-6 flex items-center justify-between shadow-md hover:shadow-lg transition-all duration-200"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-primary-100 rounded-lg md:rounded-xl flex items-center justify-center mr-4 md:mr-6">
                {getServiceIcon(service.name)}
              </div>
              <div className="text-left">
                <h3 className="text-lg md:text-2xl font-semibold text-gray-900 mb-1">
                  {service.name}
                </h3>
                <p className="text-sm md:text-base text-gray-600">
                  Duración: {service.duration} min
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xl md:text-3xl font-bold text-primary-600">
                ${service.price}
              </span>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}