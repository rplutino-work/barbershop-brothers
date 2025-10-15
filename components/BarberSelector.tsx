'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User } from 'lucide-react'
import { LoadingSpinner } from './ui/LoadingSpinner'

interface Barber {
  id: string
  name: string
}

interface BarberSelectorProps {
  barbers: Barber[]
  onSelectBarber: (barber: Barber) => void
  onBack?: () => void
}

export function BarberSelector({ barbers, onSelectBarber, onBack }: BarberSelectorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -300 }}
      className="absolute inset-0 bg-white p-8 flex flex-col"
    >
      <div className="flex items-center mb-8">
        {onBack && (
          <button
            onClick={onBack}
            className="mr-4 p-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            ← Volver
          </button>
        )}
        <h2 className="text-3xl font-bold text-gray-900">Seleccionar Barbero</h2>
      </div>

      <div className="grid grid-cols-2 gap-6 flex-1 overflow-y-auto">
        {barbers.map((barber) => (
          <motion.button
            key={barber.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelectBarber(barber)}
            className="touch-button bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-2xl p-8 flex flex-col items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <User className="w-16 h-16 mb-4" />
            <span className="text-2xl font-semibold">{barber.name}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}