'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Edit, Calendar, User, Scissors, Phone, CreditCard } from 'lucide-react'

interface Payment {
  id: string
  amount: number
  method: string
  createdAt: string
  barber: {
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

interface BarberServiceHistoryProps {
  barberId: string
}

export function BarberServiceHistory({ barberId }: BarberServiceHistoryProps) {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)

  useEffect(() => {
    fetchPayments()
  }, [barberId])

  const fetchPayments = async () => {
    try {
      const response = await fetch(`/api/payments/barber/${barberId}`)
      if (response.ok) {
        const data = await response.json()
        setPayments(data)
      }
    } catch (error: any) {
      console.error('Error al obtener pagos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (payment: Payment) => {
    setEditingPayment(payment)
    setShowEditModal(true)
  }

  const handleSaveEdit = async (updatedPayment: any) => {
    try {
      const response = await fetch(`/api/payments/${updatedPayment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceId: updatedPayment.service.id,
          clientId: updatedPayment.client?.id || null,
        }),
      })

      if (response.ok) {
        await fetchPayments()
        setShowEditModal(false)
        setEditingPayment(null)
      }
    } catch (error: any) {
      console.error('Error al actualizar pago:', error)
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
        <div className="text-lg text-gray-900 bg-white p-4 rounded-lg shadow-sm">Cargando historial...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Historial de Servicios
        </h2>
        <p className="text-gray-600">
          Todos los servicios que has registrado
        </p>
      </div>

      {/* Lista de servicios */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {payments.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {payments.map((payment) => (
              <motion.div
                key={payment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-3">
                      <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                        <Scissors className="w-6 h-6 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {payment.service.name}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(payment.createdAt).toLocaleDateString('es-ES')}
                          </span>
                          <span className="flex items-center">
                            <CreditCard className="w-4 h-4 mr-1" />
                            {getPaymentMethodIcon(payment.method)}
                            {payment.method.toLowerCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-force-gray">
                          <strong>Cliente:</strong> {payment.client ? payment.client.name : 'Cliente Ocasional'}
                        </span>
                      </div>
                      
                      {payment.client && (
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-force-gray">
                            <strong>Tel:</strong> {payment.client.phone}
                          </span>
                        </div>
                      )}
                      
                      <div className="text-sm text-force-gray">
                        <strong>Duración:</strong> {payment.service.duration} min
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary-600">
                        ${payment.amount.toLocaleString()}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleEdit(payment)}
                      className="p-2 text-primary-600 hover:text-primary-800 hover:bg-primary-50 rounded-lg transition-colors"
                      title="Editar servicio"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Scissors className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No hay servicios registrados aún</p>
          </div>
        )}
      </div>

      {/* Modal de edición */}
      {showEditModal && editingPayment && (
        <EditServiceModal
          payment={editingPayment}
          onSave={handleSaveEdit}
          onCancel={() => {
            setShowEditModal(false)
            setEditingPayment(null)
          }}
        />
      )}
    </div>
  )
}

// Componente modal para editar servicio
function EditServiceModal({ 
  payment, 
  onSave, 
  onCancel 
}: { 
  payment: Payment
  onSave: (payment: any) => void
  onCancel: () => void 
}) {
  const [services, setServices] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedService, setSelectedService] = useState(payment.service.id)
  const [selectedClient, setSelectedClient] = useState(payment.client?.id || '')

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
    const updatedPayment = {
      ...payment,
      service: services.find(s => s.id === selectedService) || payment.service,
      client: selectedClient ? clients.find(c => c.id === selectedClient) : null
    }
    onSave(updatedPayment)
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
          <div className="text-center text-gray-900 bg-white p-4 rounded-lg shadow-sm">Cargando...</div>
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