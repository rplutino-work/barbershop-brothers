'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit, Trash2, Clock, User } from 'lucide-react'

interface Barber {
  id: string
  name: string
  email: string
}

interface Schedule {
  id: string
  barberId: string
  dayOfWeek: number
  startTime: string
  endTime: string
  isActive: boolean
  barber: {
    name: string
  }
}

const DAYS_OF_WEEK = [
  'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'
]

export function ScheduleManagement() {
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null)
  const [formData, setFormData] = useState({
    barberId: '',
    dayOfWeek: 1,
    startTime: '09:00',
    endTime: '18:00'
  })

  useEffect(() => {
    fetchBarbers()
    fetchSchedules()
  }, [])

  const fetchBarbers = async () => {
    try {
      const response = await fetch('/api/users')
      if (response.ok) {
        const users = await response.json()
        const barbersData = users.filter((user: any) => user.role === 'BARBER')
        setBarbers(barbersData)
      }
    } catch (error) {
      console.error('Error al obtener barberos:', error)
    }
  }

  const fetchSchedules = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/schedules')
      if (response.ok) {
        const data = await response.json()
        setSchedules(data)
      }
    } catch (error) {
      console.error('Error al obtener horarios:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = editingSchedule 
        ? `/api/schedules/${editingSchedule.id}`
        : '/api/schedules'
      
      const method = editingSchedule ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        fetchSchedules()
        setShowModal(false)
        setEditingSchedule(null)
        setFormData({
          barberId: '',
          dayOfWeek: 1,
          startTime: '09:00',
          endTime: '18:00'
        })
      } else {
        const error = await response.json()
        alert(error.error || 'Error al guardar horario')
      }
    } catch (error) {
      console.error('Error al guardar horario:', error)
      alert('Error al guardar horario')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (schedule: Schedule) => {
    setEditingSchedule(schedule)
    setFormData({
      barberId: schedule.barberId,
      dayOfWeek: schedule.dayOfWeek,
      startTime: schedule.startTime,
      endTime: schedule.endTime
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este horario?')) {
      return
    }

    try {
      const response = await fetch(`/api/schedules/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchSchedules()
      } else {
        const error = await response.json()
        alert(error.error || 'Error al eliminar horario')
      }
    } catch (error) {
      console.error('Error al eliminar horario:', error)
      alert('Error al eliminar horario')
    }
  }

  const openModal = () => {
    setEditingSchedule(null)
    setFormData({
      barberId: '',
      dayOfWeek: 1,
      startTime: '09:00',
      endTime: '18:00'
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingSchedule(null)
    setFormData({
      barberId: '',
      dayOfWeek: 1,
      startTime: '09:00',
      endTime: '18:00'
    })
  }

  if (loading && schedules.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Cargando horarios...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Horarios</h2>
          <p className="text-gray-600">Configura los horarios de trabajo de cada barbero</p>
        </div>
        <button
          onClick={openModal}
          className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Agregar Horario</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Barbero
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Día
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Horario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {schedules.map((schedule) => (
                <motion.tr
                  key={schedule.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                        <User className="w-4 h-4 text-primary-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {schedule.barber.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {DAYS_OF_WEEK[schedule.dayOfWeek]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Clock className="w-4 h-4 mr-2 text-gray-400" />
                      {schedule.startTime} - {schedule.endTime}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      schedule.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {schedule.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(schedule)}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(schedule.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-md"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingSchedule ? 'Editar Horario' : 'Agregar Horario'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Barbero
                </label>
                <select
                  value={formData.barberId}
                  onChange={(e) => setFormData({ ...formData, barberId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="">Seleccionar barbero</option>
                  {barbers.map((barber) => (
                    <option key={barber.id} value={barber.id}>
                      {barber.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Día de la Semana
                </label>
                <select
                  value={formData.dayOfWeek}
                  onChange={(e) => setFormData({ ...formData, dayOfWeek: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  {DAYS_OF_WEEK.map((day, index) => (
                    <option key={index} value={index}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hora de Inicio
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hora de Fin
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}

