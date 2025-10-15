'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CreditCard, Banknote, Smartphone, DollarSign } from 'lucide-react'

interface PaymentMethod {
  id: string
  name: string
  icon: React.ReactNode
  color: string
}

interface PaymentSelectorProps {
  onSelectPayment: (method: string, tip?: number) => void
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
  const [showTipInput, setShowTipInput] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<string>('')
  const [tipAmount, setTipAmount] = useState<string>('')
  const [hasTip, setHasTip] = useState<boolean | null>(null)

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'transfer',
      name: 'Transferencia',
      icon: <Smartphone className="w-12 h-12" />,
      color: 'from-purple-500 to-purple-700'
    },
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
    }
  ]

  const handleMethodSelect = (method: string) => {
    if (method === 'transfer') {
      setSelectedMethod(method)
      setShowTipInput(true)
    } else {
      onSelectPayment(method)
    }
  }

  const handleTipResponse = (response: boolean) => {
    setHasTip(response)
    if (!response) {
      onSelectPayment(selectedMethod, 0)
    }
  }

  const handleTipSubmit = () => {
    const tip = parseFloat(tipAmount) || 0
    onSelectPayment(selectedMethod, tip)
  }

  if (showTipInput) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -300 }}
        className="absolute inset-0 bg-white p-4 md:p-8 flex flex-col overflow-x-hidden"
      >
        <div className="flex items-center mb-4 md:mb-8 flex-shrink-0">
          <button
            onClick={() => {
              setShowTipInput(false)
              setSelectedMethod('')
              setHasTip(null)
              setTipAmount('')
            }}
            className="mr-4 p-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            ← Volver
          </button>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Propina</h2>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center space-y-6">
          <DollarSign className="w-16 h-16 text-primary-600" />
          
          {hasTip === null ? (
            <>
              <h3 className="text-xl font-semibold text-gray-900 text-center">
                ¿Hubo propina por transferencia?
              </h3>
              <p className="text-gray-600 text-center max-w-md">
                Si el cliente dejó propina en efectivo, el barbero se la queda. 
                Solo registra propinas por transferencia.
              </p>
              
              <div className="flex gap-4 mt-4">
                <button
                  onClick={() => handleTipResponse(false)}
                  className="px-8 py-3 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                >
                  No
                </button>
                <button
                  onClick={() => handleTipResponse(true)}
                  className="px-8 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                >
                  Sí
                </button>
              </div>
            </>
          ) : (
            <>
              <h3 className="text-xl font-semibold text-gray-900 text-center">
                ¿Cuánto fue la propina?
              </h3>
              
              <div className="w-full max-w-md">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-2xl">$</span>
                  <input
                    type="number"
                    value={tipAmount}
                    onChange={(e) => setTipAmount(e.target.value)}
                    placeholder="0"
                    className="w-full pl-12 pr-4 py-4 text-2xl border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-center"
                    autoFocus
                  />
                </div>
              </div>

              <button
                onClick={handleTipSubmit}
                disabled={!tipAmount || parseFloat(tipAmount) <= 0 || isProcessing}
                className="px-8 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Procesando...' : 'Confirmar'}
              </button>
            </>
          )}
        </div>
      </motion.div>
    )
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
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Método de Pago</h2>
      </div>

      {/* Resumen del servicio */}
      <div className="bg-gray-50 rounded-2xl p-4 md:p-6 mb-6 md:mb-8 flex-shrink-0">
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
          {clientName && (
            <div className="flex justify-between">
              <span className="text-force-gray">Cliente:</span>
              <span className="font-medium text-force-dark">{clientName}</span>
            </div>
          )}
          <div className="flex justify-between text-xl font-bold mt-4 pt-4 border-t border-gray-200">
            <span className="text-force-gray">Total:</span>
            <span className="text-force-blue">${servicePrice}</span>
          </div>
        </div>
      </div>

      {/* Métodos de pago */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 content-start overflow-y-auto">
        {paymentMethods.map((method) => (
          <motion.button
            key={method.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleMethodSelect(method.id)}
            disabled={isProcessing}
            className={`bg-gradient-to-br ${method.color} text-white p-6 md:p-8 rounded-2xl flex flex-col items-center justify-center space-y-4 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {method.icon}
            <span className="text-xl font-semibold">{method.name}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}