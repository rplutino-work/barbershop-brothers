'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { CheckoutFlow } from '@/components/CheckoutFlow'
import { ArrowLeft } from 'lucide-react'

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

export default function RegisterServicePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [services, setServices] = useState<Service[]>([])

  useEffect(() => {
    // Redirigir si no es barbero
    if (status === 'loading') return
    if (!session || session.user.role !== 'BARBER') {
      router.push('/login')
      return
    }

    // Cargar datos
    fetchBarbers()
    fetchServices()
  }, [session, status, router])

  const fetchBarbers = async () => {
    try {
      const response = await fetch('/api/users')
      if (response.ok) {
        const data = await response.json()
        setBarbers(data)
      }
    } catch (error: any) {
      console.error('Error al cargar barberos:', error)
    }
  }

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services')
      if (response.ok) {
        const data = await response.json()
        setServices(data)
      }
    } catch (error: any) {
      console.error('Error al cargar servicios:', error)
    }
  }

  const handleServiceComplete = async (data: {
    barber: Barber
    service: Service
    client: any
    paymentMethod: string
  }) => {
    try {
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
        console.log('Servicio registrado exitosamente')
        // Redirigir al dashboard del barbero
        router.push('/barber')
      }
    } catch (error: any) {
      console.error('Error al registrar el servicio:', error)
    }
  }

  const handleBack = () => {
    router.push('/barber')
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Cargando...</div>
      </div>
    )
  }

  if (!session || session.user.role !== 'BARBER') {
    return null
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center">
            <button
              onClick={handleBack}
              className="mr-4 p-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">
              Registrar Servicio
            </h1>
          </div>
          <div className="text-sm text-gray-600">
            {session.user.name}
          </div>
        </div>
      </div>

      {/* Checkout Flow */}
      <div className="h-full">
        <CheckoutFlow
          barbers={barbers}
          services={services}
          onComplete={handleServiceComplete}
          onBack={handleBack}
        />
      </div>
    </div>
  )
}

