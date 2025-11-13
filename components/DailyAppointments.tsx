'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, User, Phone, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { LoadingSpinner } from './ui/LoadingSpinner'

interface Appointment {
  id: string
  date: string
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
  clientName: string
  clientPhone: string
  barberId: string
  serviceId: string
  service: {
    name: string
    duration: number
    price: number
  }
  barber: {
    id: string
    name: string
  }
}

interface DailyAppointmentsProps {
  onBack: () => void
}

export function DailyAppointments({ onBack }: DailyAppointmentsProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0])

  useEffect(() => {
    fetchAppointments()
  }, [selectedDate])

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      console.log('📅 Fetching appointments for date:', selectedDate)
      
      const response = await fetch('/api/appointments', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      })
      if (response.ok) {
        const data = await response.json()
        console.log('📋 All appointments received:', data)
        
        // Filtrar citas del día seleccionado
        const todayAppointments = data.filter((apt: any) => {
          const aptDate = new Date(apt.date).toISOString().split('T')[0]
          console.log(`🔍 Checking appointment:`, {
            aptDate,
            selectedDate,
            matches: aptDate === selectedDate,
            appointment: apt
          })
          return aptDate === selectedDate
        })
        
        console.log('✅ Filtered appointments for today:', todayAppointments)
        setAppointments(todayAppointments)
      } else {
        console.error('❌ Failed to fetch appointments:', response.status)
      }
    } catch (error: any) {
      console.error('❌ Error al obtener turnos:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'PENDING':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4 text-blue-600" />
      case 'CANCELLED':
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'Confirmado'
      case 'PENDING':
        return 'Pendiente'
      case 'COMPLETED':
        return 'Completado'
      case 'CANCELLED':
        return 'Cancelado'
      default:
        return 'Desconocido'
    }
  }

  const getTimeFromDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toTimeString().substring(0, 5) // HH:MM
  }

  // Agrupar citas por barbero
  const appointmentsByBarber = appointments.reduce((acc, appointment) => {
    const barberId = appointment.barber.id
    if (!acc[barberId]) {
      acc[barberId] = {
        barber: appointment.barber,
        appointments: []
      }
    }
    acc[barberId].appointments.push(appointment)
    return acc
  }, {} as Record<string, { barber: { id: string; name: string }, appointments: Appointment[] }>)

  // Ordenar citas por hora dentro de cada barbero
  Object.keys(appointmentsByBarber).forEach(barberId => {
    appointmentsByBarber[barberId].appointments.sort((a, b) => {
      return getTimeFromDate(a.date).localeCompare(getTimeFromDate(b.date))
    })
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <LoadingSpinner size="lg" text="Cargando turnos del día..." />
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="h-full w-full bg-gray-100 p-4 md:p-8 overflow-y-auto"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0 mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            ← Volver
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Turnos del Día</h1>
            <p className="text-gray-600">Gestiona las citas programadas</p>
          </div>
        </div>

        {/* Selector de fecha */}
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-gray-600" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Resumen del día */}
      <div className="bg-white rounded-xl p-4 md:p-6 mb-6 shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">
              {appointments.filter(apt => apt.status === 'CONFIRMED').length}
            </div>
            <div className="text-sm text-gray-600">Confirmados</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {appointments.filter(apt => apt.status === 'PENDING').length}
            </div>
            <div className="text-sm text-gray-600">Pendientes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {appointments.filter(apt => apt.status === 'COMPLETED').length}
            </div>
            <div className="text-sm text-gray-600">Completados</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {appointments.filter(apt => apt.status === 'CANCELLED').length}
            </div>
            <div className="text-sm text-gray-600">Cancelados</div>
          </div>
        </div>
      </div>

      {/* Grilla de turnos por barbero */}
      {Object.keys(appointmentsByBarber).length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center shadow-sm">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay turnos programados</h3>
          <p className="text-gray-600">No se encontraron citas para esta fecha</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.values(appointmentsByBarber).map(({ barber, appointments: barberAppointments }) => (
            <div key={barber.id} className="bg-white rounded-xl shadow-sm">
              {/* Header del barbero */}
              <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white p-4 rounded-t-xl">
                <h2 className="text-lg font-semibold">{barber.name}</h2>
                <p className="text-primary-100">{barberAppointments.length} turnos programados</p>
              </div>

              {/* Lista de turnos */}
              <div className="p-4">
                <div className="grid gap-3">
                  {barberAppointments.map((appointment) => (
                    <motion.div
                      key={appointment.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {/* Hora */}
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-gray-600" />
                            <span className="font-semibold text-gray-900">{getTimeFromDate(appointment.date)}</span>
                          </div>

                          {/* Cliente */}
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-gray-600" />
                            <div>
                              <span className="font-medium text-gray-900">{appointment.clientName}</span>
                              <div className="flex items-center space-x-1">
                                <Phone className="w-3 h-3 text-gray-500" />
                                <span className="text-sm text-gray-600">{appointment.clientPhone}</span>
                              </div>
                            </div>
                          </div>

                          {/* Servicio */}
                          <div>
                            <span className="font-medium text-gray-900">{appointment.service.name}</span>
                            <div className="text-sm text-gray-600">
                              {appointment.service.duration} min • ${appointment.service.price.toLocaleString()}
                            </div>
                          </div>
                        </div>

                        {/* Estado */}
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(appointment.status)}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}>
                            {getStatusText(appointment.status)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
