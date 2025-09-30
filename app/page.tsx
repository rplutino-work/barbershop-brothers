'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ScreenSaver } from '@/components/ScreenSaver'
import { CheckoutFlow } from '@/components/CheckoutFlow'
import { MainInterface } from '@/components/MainInterface'

interface Barber {
  id: string
  name: string
}

interface Service {
  id: string
  name: string
  price: number
  duration: number
}

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [showScreenSaver, setShowScreenSaver] = useState(true)
  const [showRegistration, setShowRegistration] = useState(false)
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null)
  const [allBarbers, setAllBarbers] = useState<Barber[]>([])
  const [services, setServices] = useState<Service[]>([])

  useEffect(() => {
    // Redirigir barberos a su dashboard
    if (session?.user?.role === 'BARBER') {
      router.push('/barber')
      return
    }

    // Cargar datos
    fetchServices()
    fetchBarbers()
  }, [session, router])

  const fetchBarbers = async () => {
    try {
      const response = await fetch('/api/users')
      if (response.ok) {
        const users = await response.json()
        const barbersData = users.filter((user: any) => user.role === 'BARBER')
        setAllBarbers(barbersData)
      }
    } catch (error) {
      console.error('Error al cargar barberos:', error)
      // Fallback con datos de ejemplo
      setAllBarbers([
        { id: '1', name: 'Carlos' },
        { id: '2', name: 'Miguel' },
        { id: '3', name: 'Ana' },
        { id: '4', name: 'Roberto' }
      ])
    }
  }

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services')
      if (response.ok) {
        const data = await response.json()
        setServices(data)
      }
    } catch (error) {
      console.error('Error al cargar servicios:', error)
      // Fallback con datos de ejemplo
      setServices([
        { id: '1', name: 'Corte', price: 2500, duration: 30 },
        { id: '2', name: 'Corte y Barba', price: 3500, duration: 45 },
        { id: '3', name: 'Barba', price: 1500, duration: 20 }
      ])
    }
  }

  const handleActivateScreen = () => {
    setShowScreenSaver(false)
  }

  const handleBackToScreenSaver = () => {
    setShowScreenSaver(true)
  }

  const handleStartRegistration = (barber: Barber) => {
    setSelectedBarber(barber)
    setShowRegistration(true)
  }

  const handleBackToMain = () => {
    setShowRegistration(false)
    setSelectedBarber(null)
  }

  const handleServiceComplete = async (data: {
    barber: Barber
    service: Service
    client: any
    paymentMethod: string
  }) => {
    try {
      console.log('Servicio completado:', data)
      
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          barberId: data.barber.id,
          serviceId: data.service.id,
          amount: data.service.price,
          method: data.paymentMethod,
          clientId: data.client?.id || null,
        }),
      })

      if (response.ok) {
        console.log('Pago registrado exitosamente')
        // No cerrar inmediatamente, dejar que CheckoutFlow maneje la navegación
        return true
      } else {
        throw new Error('Error al registrar el pago')
      }
    } catch (error) {
      console.error('Error al registrar el pago:', error)
    }
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-gray-100">
      <AnimatePresence>
        {showScreenSaver ? (
          <ScreenSaver key="screensaver" onActivate={handleActivateScreen} />
        ) : showRegistration && selectedBarber ? (
          <motion.div
            key="registration"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full w-full"
          >
            <CheckoutFlow
              barbers={allBarbers} // Todos los barberos para poder cambiar
              services={services}
              preselectedBarber={selectedBarber} // Barbero preseleccionado
              onComplete={handleServiceComplete}
              onBack={handleBackToMain}
            />
          </motion.div>
        ) : (
          <motion.div
            key="main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full w-full"
          >
            <MainInterface onStartRegistration={handleStartRegistration} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}