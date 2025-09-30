'use client'

import { motion } from 'framer-motion'
import { CreditCard, Banknote, Smartphone } from 'lucide-react'

interface PaymentMethod {
  id: string
  name: string
  icon: React.ReactNode
  color: string
}

interface PaymentSelectorProps {
  onSelectPayment: (method: string) => void
  onBack: () => void
  barberName: string
  serviceName: string
  servicePrice: number
  clientName?: string
  isProcessing?: boolean
}

export function PaymentSelector({ 
  onSelectPayment, 
  onBack, 
  barberName, 
  serviceName, 
  servicePrice,
  clientName,
  isProcessing = false
}: PaymentSelectorProps) {
  const paymentMethods: PaymentMethod[] = [
    {
      id: 'cash',
      name: 'Efectivo',
      icon: <Banknote className="w-12 h-12" />,
      color: 'from-green-500 to-green-700'
    },
    {
      id: 'card',
      name: 'Tarjeta',
      icon: <CreditCard className="w-12 h-12" />,
      color: 'from-blue-500 to-blue-700'
    },
    {
      id: 'transfer',
      name: 'Transferencia',
      icon: <Smartphone className="w-12 h-12" />,
      color: 'from-purple-500 to-purple-700'
    }
  ]

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
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Método de Pago</h2>
      </div>

      {/* Resumen del servicio */}
      <div className="bg-gray-50 rounded-xl md:rounded-2xl p-4 md:p-6 mb-4 md:mb-8 flex-shrink-0">
        <h3 className="text-lg md:text-xl font-semibold text-force-dark mb-4">Resumen del Servicio</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-force-gray">Barbero:</span>
            <span className="font-medium text-force-dark">{barberName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-force-gray">Servicio:</span>
            <span className="font-medium text-force-dark">{serviceName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-force-gray">Cliente:</span>
            <span className="font-medium text-force-dark">{clientName || 'Cliente Ocasional'}</span>
          </div>
          <div className="flex justify-between text-xl font-bold border-t pt-2">
            <span className="text-force-gray">Total:</span>
            <span className="text-force-blue">${servicePrice}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 flex-1 overflow-y-auto overflow-x-hidden relative">
        {isProcessing && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg flex items-center space-x-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <span className="text-lg font-medium text-gray-900">Procesando pago...</span>
            </div>
          </div>
        )}
        
        {paymentMethods.map((method) => (
          <motion.button
            key={method.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectPayment(method.id)}
            disabled={isProcessing}
            className={`touch-button bg-gradient-to-r ${method.color} text-white rounded-xl md:rounded-2xl p-4 md:p-6 flex items-center justify-between shadow-lg hover:shadow-xl transition-all duration-200 ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="flex items-center">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-white bg-opacity-20 rounded-lg md:rounded-xl flex items-center justify-center mr-4 md:mr-6">
                {method.icon}
              </div>
              <span className="text-lg md:text-2xl font-semibold">{method.name}</span>
            </div>
            <div className="text-right">
              <span className="text-2xl md:text-4xl">→</span>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}