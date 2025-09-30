'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface ScreenSaverProps {
  onActivate: () => void
}

export function ScreenSaver({ onActivate }: ScreenSaverProps) {
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    const handleMouseMove = () => {
      if (isActive) {
        setIsActive(false)
        setTimeout(() => onActivate(), 500)
      }
    }

    const handleTouchStart = () => {
      if (isActive) {
        setIsActive(false)
        setTimeout(() => onActivate(), 500)
      }
    }

    if (isActive) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('touchstart', handleTouchStart)
      window.addEventListener('click', handleMouseMove)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('click', handleMouseMove)
    }
  }, [isActive, onActivate])

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: isActive ? 1 : 0 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900 flex items-center justify-center z-50"
    >
      <div className="text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8"
        >
          {/* Logo de la marca */}
          <div className="w-32 h-32 mx-auto bg-white rounded-full flex items-center justify-center mb-6 shadow-2xl p-4">
            <img 
              src="/533471330_18323191894230579_4774162367719342925_n-removebg-preview.png" 
              alt="Logo Barbería Elite" 
              className="w-full h-full object-contain"
            />
          </div>
        </motion.div>
        
        <motion.h1
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-6xl font-bold text-white mb-4"
        >
          Barbería Elite
        </motion.h1>
        
        <motion.p
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-xl text-primary-100 mb-8"
        >
          Sistema de Gestión
        </motion.p>
        
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="text-primary-200"
        >
          <p className="text-lg mb-2">Toca la pantalla para continuar</p>
          <div className="flex justify-center space-x-2">
            <motion.div
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-2 h-2 bg-white rounded-full"
            />
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
              className="w-2 h-2 bg-white rounded-full"
            />
            <motion.div
              animate={{ opacity: [0.3, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
              className="w-2 h-2 bg-white rounded-full"
            />
          </div>
        </motion.div>
      </div>
      
      {/* Efectos de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
    </motion.div>
  )
}