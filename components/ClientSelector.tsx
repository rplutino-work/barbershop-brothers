'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Plus, Search, Phone } from 'lucide-react'

interface Client {
  id: string
  name: string
  phone: string
}

interface ClientHistory {
  id: string
  createdAt: string
  barber: {
    name: string
  }
  service: {
    name: string
  }
}

interface ClientSelectorProps {
  onSelectClient: (client: Client | null) => void
  onBack: () => void
  barberName: string
  serviceName: string
  servicePrice: number
  selectedClient?: Client | null
}

export function ClientSelector({ 
  onSelectClient, 
  onBack, 
  barberName, 
  serviceName, 
  servicePrice,
  selectedClient 
}: ClientSelectorProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newClient, setNewClient] = useState({ name: '', phone: '' })
  const [selectedClientHistory, setSelectedClientHistory] = useState<ClientHistory[]>([])
  const [showHistory, setShowHistory] = useState<string | null>(null)
  const [clientsWithHistory, setClientsWithHistory] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchClients()
  }, [])

  useEffect(() => {
    // Verificar qué clientes tienen historial
    const checkClientsHistory = async () => {
      const clientsWithHistorySet = new Set<string>()
      for (const client of clients) {
        try {
          const response = await fetch(`/api/clients/${client.id}/history`)
          if (response.ok) {
            const history = await response.json()
            if (history.length > 0) {
              clientsWithHistorySet.add(client.id)
            }
          }
        } catch (error: any) {
          console.error(`Error al verificar historial de ${client.name}:`, error)
        }
      }
      setClientsWithHistory(clientsWithHistorySet)
    }

    if (clients.length > 0) {
      checkClientsHistory()
    }
  }, [clients])

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients')
      if (response.ok) {
        const data = await response.json()
        setClients(data)
      }
    } catch (error: any) {
      console.error('Error al cargar clientes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newClient),
      })

      if (response.ok) {
        const createdClient = await response.json()
        setClients([...clients, createdClient])
        setNewClient({ name: '', phone: '' })
        setShowCreateForm(false)
        onSelectClient(createdClient)
      } else {
        const error = await response.json()
        alert(error.error || 'Error al crear cliente')
      }
    } catch (error: any) {
      console.error('Error al crear cliente:', error)
      alert('Error al crear cliente')
    }
  }

  const fetchClientHistory = async (clientId: string) => {
    try {
      console.log('Buscando historial para cliente:', clientId)
      
      // Si ya está mostrando el historial de este cliente, ocultarlo
      if (showHistory === clientId) {
        setShowHistory(null)
        return
      }
      
      const response = await fetch(`/api/clients/${clientId}/history`)
      console.log('Respuesta del servidor:', response.status)
      
      if (response.ok) {
        const history = await response.json()
        console.log('Historial obtenido:', history)
        setSelectedClientHistory(history)
        setShowHistory(clientId)
      } else {
        console.error('Error en la respuesta:', response.status)
      }
    } catch (error: any) {
      console.error('Error al obtener historial del cliente:', error)
    }
  }

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm)
  )

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -300 }}
        className="absolute inset-0 bg-white p-8 flex items-center justify-center"
      >
        <div className="text-lg text-gray-900 bg-white p-4 rounded-lg">Cargando clientes...</div>
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
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Cliente</h2>
      </div>

      {/* Resumen del servicio */}
      <div className="bg-gray-50 rounded-2xl p-4 md:p-6 mb-4 md:mb-8 flex-shrink-0">
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
            <span className="font-medium text-force-blue">
              {selectedClient ? selectedClient.name : 'Seleccionar cliente'}
            </span>
          </div>
          <div className="flex justify-between text-xl font-bold border-t pt-2">
            <span className="text-force-gray">Total:</span>
            <span className="text-force-blue">${servicePrice}</span>
          </div>
        </div>
      </div>

      {!showCreateForm ? (
        <>
          {/* Búsqueda */}
          <div className="mb-4 md:mb-6 flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
              <input
                type="text"
                placeholder="Buscar cliente por nombre o teléfono..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm md:text-base"
              />
            </div>
          </div>

          {/* Botón crear nuevo cliente */}
          <div className="mb-4 md:mb-6 flex-shrink-0">
            <button
              onClick={() => setShowCreateForm(true)}
              className="w-full bg-primary-600 text-white py-2 md:py-3 px-4 rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2 text-sm md:text-base"
            >
              <Plus className="w-4 h-4 md:w-5 md:h-5" />
              <span>Crear Nuevo Cliente</span>
            </button>
          </div>

          {/* Lista de clientes */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            <div className="space-y-3 pb-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelectClient(null)}
                className="w-full bg-gray-100 border-2 border-gray-300 rounded-xl md:rounded-2xl p-3 md:p-4 flex items-center justify-between hover:bg-gray-200 transition-colors"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-300 rounded-lg md:rounded-xl flex items-center justify-center mr-3 md:mr-4">
                    <User className="w-5 h-5 md:w-6 md:h-6 text-gray-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-base md:text-lg font-semibold text-gray-900">
                      Cliente Ocasional
                    </h3>
                    <p className="text-sm md:text-base text-gray-600">Sin registro</p>
                  </div>
                </div>
              </motion.button>

              {filteredClients.map((client) => (
                <div key={client.id} className="space-y-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onSelectClient(client)}
                    className="w-full bg-gradient-to-r from-secondary-50 to-secondary-100 border-2 border-secondary-200 rounded-xl md:rounded-2xl p-3 md:p-4 flex items-center justify-between hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-primary-100 rounded-lg md:rounded-xl flex items-center justify-center mr-3 md:mr-4">
                        <span className="text-base md:text-lg font-semibold text-primary-600">
                          {client.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="text-left">
                        <h3 className="text-base md:text-lg font-semibold text-gray-900">
                          {client.name}
                        </h3>
                        <p className="text-sm md:text-base text-gray-600 flex items-center">
                          <Phone className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                          {client.phone}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xl md:text-2xl">→</span>
                    </div>
                  </motion.button>
                  
                  {clientsWithHistory.has(client.id) && (
                    <button
                      onClick={() => fetchClientHistory(client.id)}
                      className="w-full text-xs md:text-sm text-primary-600 hover:text-primary-800 transition-colors ml-3 md:ml-4"
                    >
                      {showHistory === client.id ? 'Ocultar historial' : 'Ver últimos cortes'}
                    </button>
                  )}
                  
                  {showHistory === client.id && selectedClientHistory.length > 0 && (
                    <div className="ml-3 md:ml-4 p-3 bg-gray-50 rounded-lg">
                      <h4 className="text-xs md:text-sm font-semibold text-gray-700 mb-2">Últimos cortes:</h4>
                      <div className="space-y-1">
                        {selectedClientHistory.map((history) => (
                          <div key={history.id} className="text-xs text-gray-600">
                            <span className="font-medium">{history.service.name}</span> con{' '}
                            <span className="font-medium">{history.barber.name}</span> -{' '}
                            <span>{new Date(history.createdAt).toLocaleDateString('es-ES')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        /* Formulario crear cliente */
        <div className="flex-1">
          <div className="max-w-md mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Crear Nuevo Cliente</h3>
            
            <form onSubmit={handleCreateClient} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  value={newClient.name}
                  onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Ej: Juan Pérez"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={newClient.phone}
                  onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="91173675464"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Se carga con código de área (ej: 91173675464)
                </p>
              </div>
              
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 px-4 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Crear Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  )
}