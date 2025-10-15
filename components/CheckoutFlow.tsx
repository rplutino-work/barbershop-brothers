'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BarberSelector } from './BarberSelector'
import { ServiceSelector } from './ServiceSelector'
import { ClientSelector } from './ClientSelector'
import { PaymentSelector } from './PaymentSelector'
import { CheckCircle } from 'lucide-react'
import { LoadingSpinner } from './ui/LoadingSpinner'

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

interface Client {
  id: string
  name: string
  phone: string
}

interface CheckoutFlowProps {
  barbers: Barber[]
  services: Service[]
  onComplete: (data: {
    barber: Barber
    service: Service
    client: Client | null
    paymentMethod: string
  }) => void
  onBack?: () => void
  preselectedBarber?: Barber | null
}

type FlowStep = 'barber' | 'service' | 'client' | 'payment' | 'complete'

export function CheckoutFlow({ barbers, services, onComplete, onBack, preselectedBarber }: CheckoutFlowProps) {
  const [currentStep, setCurrentStep] = useState<FlowStep>('barber')
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [countdown, setCountdown] = useState(3)

  // Si hay un barbero preseleccionado o solo hay uno, seleccionarlo automáticamente
  useEffect(() => {
    if (preselectedBarber) {
      setSelectedBarber(preselectedBarber)
      setCurrentStep('service')
    } else if (barbers.length === 1) {
      setSelectedBarber(barbers[0])
      setCurrentStep('service')
    }
  }, [barbers, preselectedBarber])

  // Auto-redirect después de mostrar éxito
  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        // Limpiar estados
        setCurrentStep('barber')
        setSelectedBarber(null)
        setSelectedService(null)
        setSelectedClient(null)
        setSelectedPaymentMethod(null)
        setShowSuccess(false)
        setCountdown(3)
        
        // Llamar a onBack para volver al MainInterface
        if (onBack) {
          onBack()
        }
      }, 3000) // 3 segundos

      return () => clearTimeout(timer)
    }
  }, [showSuccess, onBack])

  // Countdown effect
  useEffect(() => {
    if (showSuccess && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [showSuccess, countdown])

  const handleBarberSelect = (barber: Barber) => {
    setSelectedBarber(barber)
    setCurrentStep('service')
  }

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service)
    setCurrentStep('client')
  }

  const handleClientSelect = (client: Client | null) => {
    setSelectedClient(client)
    setCurrentStep('payment')
  }

  const handlePaymentSelect = async (method: string) => {
    setSelectedPaymentMethod(method)
    setIsProcessing(true)
    
    if (selectedBarber && selectedService) {
      try {
        await onComplete({
          barber: selectedBarber,
          service: selectedService,
          client: selectedClient,
          paymentMethod: method
        })
        setCurrentStep('complete')
        setShowSuccess(true)
      } catch (error: any) {
        console.error('Error al procesar pago:', error)
      } finally {
        setIsProcessing(false)
      }
    }
  }

  const handleBack = () => {
    switch (currentStep) {
      case 'barber':
        // Si hay un barbero preseleccionado, volver al paso anterior no debería limpiar la selección
        if (preselectedBarber) {
          setCurrentStep('service')
        } else {
          // Solo limpiar si no hay barbero preseleccionado
          setCurrentStep('barber')
          setSelectedBarber(null)
          setSelectedService(null)
          setSelectedClient(null)
          setSelectedPaymentMethod(null)
        }
        break
      case 'service':
        if (preselectedBarber) {
          // Si hay barbero preseleccionado, llamar onBack para volver a la pantalla principal
          if (onBack) {
            onBack()
          }
        } else {
          setCurrentStep('barber')
        }
        break
      case 'client':
        setCurrentStep('service')
        break
      case 'payment':
        setCurrentStep('client')
        break
      case 'complete':
        setCurrentStep('payment')
        break
    }
  }

  return (
    <div className="relative h-full overflow-hidden">
      <AnimatePresence mode="wait">
        {currentStep === 'barber' && (
          <BarberSelector
            key="barber"
            barbers={barbers}
            onSelectBarber={handleBarberSelect}
            onBack={onBack}
          />
        )}

        {currentStep === 'service' && (
          <ServiceSelector
            key="service"
            services={services}
            onSelectService={handleServiceSelect}
            onBack={handleBack}
          />
        )}

        {currentStep === 'client' && selectedBarber && selectedService && (
          <ClientSelector
            key="client"
            barberName={selectedBarber.name}
            serviceName={selectedService.name}
            servicePrice={selectedService.price}
            selectedClient={selectedClient}
            onSelectClient={handleClientSelect}
            onBack={handleBack}
          />
        )}

        {currentStep === 'payment' && selectedBarber && selectedService && (
          <PaymentSelector
            key="payment"
            barberName={selectedBarber.name}
            serviceName={selectedService.name}
            servicePrice={selectedService.price}
            clientName={selectedClient?.name}
            onSelectPayment={handlePaymentSelect}
            onBack={handleBack}
            isProcessing={isProcessing}
          />
        )}

        {currentStep === 'complete' && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 bg-white flex flex-col items-center justify-center p-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-8"
            >
              <CheckCircle className="w-12 h-12 text-white" />
            </motion.div>
            
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              ¡Servicio Registrado!
            </h2>
            
            <p className="text-xl text-gray-600 mb-4 text-center">
              El servicio ha sido registrado exitosamente
            </p>
            
            <p className="text-lg text-gray-500 mb-8 text-center">
              Regresando en {countdown} segundos...
            </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                // Limpiar estados
                setCurrentStep('barber')
                setSelectedBarber(null)
                setSelectedService(null)
                setSelectedClient(null)
                setSelectedPaymentMethod(null)
                setShowSuccess(false)
                setCountdown(3)
                
                // Llamar a onBack para volver al MainInterface
                if (onBack) {
                  onBack()
                }
              }}
              className="bg-primary-600 text-white px-8 py-4 rounded-2xl text-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Registrar Otro Servicio
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}