'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Edit, Calendar, User, Scissors, Phone, CreditCard, Plus } from 'lucide-react'
import { LoadingSpinner } from './ui/LoadingSpinner'

interface Payment {
  id: string
  amount: number
  method: string
  createdAt: string
  barber: {
    id: string
    name: string
  }
  service: {
    id: string
    name: string
    price: number
    duration: number
  }
  client?: {
    id: string
    name: string
    phone: string
  } | null
}

interface DailyServicesProps {
  onRegisterNew: () => void
  onBack?: () => void
}

export function DailyServices({ onRegisterNew, onBack }: DailyServicesProps) {
  const [services, setServices] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [editingService, setEditingService] = useState<Payment | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)

  useEffect(() => {
    fetchTodayServices()
    
    // Auto-refresh cada 30 segundos
    const interval = setInterval(() => {
      console.log('🔄 Auto-refresh: Recargando servicios del día...')
      fetchTodayServices()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const fetchTodayServices = async () => {
    try {
      // Obtener TODOS los pagos y filtrar en el cliente
      const response = await fetch(`/api/payments`)
      if (response.ok) {
        const allData = await response.json()
        
        // Filtrar solo los de hoy comparando en hora local
        const now = new Date()
        const todayStr = now.toLocaleDateString('es-AR')
        
        const todayServices = allData.filter((payment: Payment) => {
          const paymentDate = new Date(payment.createdAt)
          const paymentStr = paymentDate.toLocaleDateString('es-AR')
          return paymentStr === todayStr
        })
        
        setServices(todayServices)
      }
    } catch (error: any) {
      console.error('Error al obtener servicios del día:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (service: Payment) => {
    setEditingService(service)
    setShowEditModal(true)
  }

  const handleSaveEdit = async (updatedService: any) => {
    try {
      const response = await fetch(`/api/payments/${updatedService.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceId: updatedService.service.id,
          clientId: updatedService.client?.id || null,
        }),
      })

      if (response.ok) {
        await fetchTodayServices()
        setShowEditModal(false)
        setEditingService(null)
      }
    } catch (error: any) {
      console.error('Error al actualizar servicio:', error)
    }
  }

  const getPaymentMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case 'cash':
        return '💰'
      case 'card':
        return '💳'
      case 'transfer':
        return '📱'
      default:
        return '💳'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <LoadingSpinner size="lg" text="Cargando servicios del día..." />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <div>
          {onBack && (
            <button
              onClick={onBack}
              className="text-primary-600 hover:text-primary-800 mb-2 flex items-center space-x-2 text-sm md:text-base"
            >
              <span>← Volver</span>
            </button>
          )}
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
            Servicios de Hoy
          </h2>
          <p className="text-sm md:text-base text-gray-600">
            {new Date().toLocaleDateString('es-ES', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        <button
          onClick={onRegisterNew}
          className="bg-primary-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2 text-sm md:text-base"
        >
          <Plus className="w-4 h-4 md:w-5 md:h-5" />
          <span>Registrar Servicio</span>
        </button>
      </div>

      {/* Lista de servicios del día */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {services.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {services.map((service) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 md:p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 md:space-x-4 mb-3">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-primary-100 rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0">
                        <Scissors className="w-5 h-5 md:w-6 md:h-6 text-primary-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base md:text-lg font-semibold text-gray-900">
                          {service.service.name}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-gray-600 mt-1">
                          <span className="flex items-center">
                            <User className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                            {service.barber.name}
                          </span>
                          <span className="flex items-center">
                            <CreditCard className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                            {getPaymentMethodIcon(service.method)}
                            {service.method.toLowerCase()}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                            {new Date(service.createdAt).toLocaleTimeString('es-ES', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-2 md:gap-4">
                      <div className="flex items-center space-x-2">
                        <User className="w-3 h-3 md:w-4 md:h-4 text-gray-400" />
                        <span className="text-xs md:text-sm text-force-gray">
                          <strong>Cliente:</strong> {service.client ? service.client.name : 'Cliente Ocasional'}
                        </span>
                      </div>
                      
                      {service.client && (
                        <div className="flex items-center space-x-2">
                          <Phone className="w-3 h-3 md:w-4 md:h-4 text-gray-400" />
                          <span className="text-xs md:text-sm text-force-gray">
                            <strong>Tel:</strong> {service.client.phone}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between md:justify-end space-x-4">
                    <div className="text-left md:text-right">
                      <div className="text-xl md:text-2xl font-bold text-primary-600">
                        ${service.amount.toLocaleString()}
                      </div>
                      <div className="text-xs md:text-sm text-gray-500 text-force-gray">
                        {service.service.duration} min
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleEdit(service)}
                      className="p-2 text-primary-600 hover:text-primary-800 hover:bg-primary-50 rounded-lg transition-colors flex-shrink-0"
                      title="Editar servicio"
                    >
                      <Edit className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Scissors className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No hay servicios registrados hoy</p>
            <button
              onClick={onRegisterNew}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              Registrar Primer Servicio
            </button>
          </div>
        )}
      </div>

      {/* Modal de edición */}
      {showEditModal && editingService && (
        <EditServiceModal
          service={editingService}
          onSave={handleSaveEdit}
          onCancel={() => {
            setShowEditModal(false)
            setEditingService(null)
          }}
        />
      )}
    </div>
  )
}

// Componente modal para editar servicio
function EditServiceModal({ 
  service, 
  onSave, 
  onCancel 
}: { 
  service: Payment
  onSave: (service: any) => void
  onCancel: () => void 
}) {
  const [services, setServices] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedService, setSelectedService] = useState(service.service.id)
  const [selectedClient, setSelectedClient] = useState(service.client?.id || '')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [servicesRes, clientsRes] = await Promise.all([
        fetch('/api/services'),
        fetch('/api/clients')
      ])

      if (servicesRes.ok) {
        const servicesData = await servicesRes.json()
        setServices(servicesData)
      }

      if (clientsRes.ok) {
        const clientsData = await clientsRes.json()
        setClients(clientsData)
      }
    } catch (error: any) {
      console.error('Error al cargar datos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = () => {
    const updatedService = {
      ...service,
      service: services.find(s => s.id === selectedService) || service.service,
      client: selectedClient ? clients.find(c => c.id === selectedClient) : null
    }
    onSave(updatedService)
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
          <LoadingSpinner size="md" text="Cargando..." />
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl p-6 w-full max-w-md mx-4"
      >
        <h3 className="text-lg font-semibold mb-4">Editar Servicio</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Servicio
            </label>
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name} - ${service.price}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cliente
            </label>
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Cliente Ocasional</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name} - {client.phone}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Guardar
          </button>
        </div>
      </motion.div>
    </div>
  )
}