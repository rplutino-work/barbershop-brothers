'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit, Trash2, Scissors, Clock, DollarSign } from 'lucide-react'

interface Service {
  id: string
  name: string
  price: number
  duration: number
  description?: string
  isActive: boolean
  isServiceCut?: boolean
  barberCommissionRate?: number | null
}

export function ServiceManagement() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    duration: '30',
    description: '',
    isServiceCut: false,
    barberCommissionRate: '50',
  })

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services')
      if (response.ok) {
        const data = await response.json()
        setServices(data)
      }
    } catch (error: any) {
      console.error('Error al obtener servicios:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingService ? `/api/services/${editingService.id}` : '/api/services'
      const method = editingService ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchServices()
        setShowModal(false)
        setEditingService(null)
        setFormData({ name: '', price: '', duration: '30', description: '', isServiceCut: false, barberCommissionRate: '50' })
      }
    } catch (error: any) {
      console.error('Error al guardar servicio:', error)
    }
  }

  const handleEdit = (service: Service) => {
    setEditingService(service)
    setFormData({
      name: service.name,
      price: service.price.toString(),
      duration: service.duration.toString(),
      description: service.description || '',
      isServiceCut: service.isServiceCut || false,
      barberCommissionRate: service.barberCommissionRate?.toString() || '50',
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este servicio?')) {
      try {
        const response = await fetch(`/api/services/${id}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          await fetchServices()
        }
      } catch (error: any) {
        console.error('Error al eliminar servicio:', error)
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Cargando servicios...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Gestión de Servicios
          </h2>
          <p className="text-gray-600">
            Administra los servicios de tu barbería
          </p>
        </div>
        <button
          onClick={() => {
            setEditingService(null)
            setFormData({ name: '', price: '', duration: '30', description: '', isServiceCut: false, barberCommissionRate: '50' })
            setShowModal(true)
          }}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Agregar Servicio</span>
        </button>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <Scissors className="w-6 h-6 text-primary-600" />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(service)}
                  className="text-primary-600 hover:text-primary-900 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(service.id)}
                  className="text-red-600 hover:text-red-900 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {service.name}
              {service.isServiceCut && (
                <span className="ml-2 px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded">
                  Corte de Servicio
                </span>
              )}
            </h3>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-gray-500" />
                <span className="text-lg font-bold text-primary-600">
                  ${service.price.toLocaleString()}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">
                  {service.duration} minutos
                </span>
              </div>
              
              <div className="text-sm text-gray-600">
                <span className="font-semibold">Comisión barbero:</span> {service.barberCommissionRate || 50}%
              </div>
              
              {service.isServiceCut && (
                <div className="text-xs text-green-700 bg-green-50 px-2 py-1 rounded mt-2">
                  ℹ️ No suma a ingresos de barbería, solo al barbero
                </div>
              )}
              
              {service.description && (
                <p className="text-sm text-gray-500 mt-2">
                  {service.description}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl w-full max-w-md mx-4 flex flex-col max-h-[90vh]"
          >
            <div className="p-6 border-b border-gray-200 flex-shrink-0">
              <h3 className="text-lg font-semibold">
                {editingService ? 'Editar Servicio' : 'Agregar Servicio'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
              <div className="overflow-y-auto p-6 space-y-4 flex-1">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Servicio
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duración (minutos)
                </label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción (opcional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Comisión del Barbero (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.barberCommissionRate}
                  onChange={(e) => setFormData({ ...formData, barberCommissionRate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="50"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Porcentaje que se lleva el barbero de este servicio
                </p>
              </div>
              
              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="isServiceCut"
                  checked={formData.isServiceCut}
                  onChange={(e) => setFormData({ ...formData, isServiceCut: e.target.checked })}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="isServiceCut" className="text-sm font-medium text-gray-700">
                  Corte de Servicio (la barbería paga al barbero, no cuenta como ingreso)
                </label>
              </div>
              
              {formData.isServiceCut && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
                  <p className="font-semibold mb-1">ℹ️ Servicio Especial</p>
                  <p>Este servicio NO sumará a los ingresos de la barbería en el dashboard, pero SÍ se pagará al barbero según su comisión configurada.</p>
                </div>
              )}
              </div>
              
              <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 flex-shrink-0 bg-gray-50">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  {editingService ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}

