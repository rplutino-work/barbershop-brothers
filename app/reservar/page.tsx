'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, User, Phone, Scissors, CheckCircle } from 'lucide-react'

interface Barber {
  id: string
  name: string
  schedules: Array<{
    dayOfWeek: number
    startTime: string
    endTime: string
  }>
}

interface Service {
  id: string
  name: string
  price: number
  duration: number
}

interface TimeSlot {
  time: string
  available: boolean
}

export default function ReservarPage() {
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [availableBarbers, setAvailableBarbers] = useState<Barber[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [formData, setFormData] = useState({
    clientName: '',
    clientPhone: ''
  })
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetchBarbers()
    fetchServices()
  }, [])

  // Verificar barberos disponibles cuando se selecciona fecha y hora
  useEffect(() => {
    if (selectedDate && selectedTime && barbers.length > 0) {
      checkAvailableBarbers(selectedDate, selectedTime)
    }
  }, [selectedDate, selectedTime, barbers])

  const fetchBarbers = async () => {
    try {
      const response = await fetch('/api/schedules')
      if (response.ok) {
        const schedules = await response.json()
        // Agrupar horarios por barbero
        const barberMap = new Map()
        schedules.forEach((schedule: any) => {
          if (!barberMap.has(schedule.barberId)) {
            barberMap.set(schedule.barberId, {
              id: schedule.barberId,
              name: schedule.barber.name,
              schedules: []
            })
          }
          barberMap.get(schedule.barberId).schedules.push({
            dayOfWeek: schedule.dayOfWeek,
            startTime: schedule.startTime,
            endTime: schedule.endTime
          })
        })
        setBarbers(Array.from(barberMap.values()))
      }
    } catch (error) {
      console.error('Error al obtener barberos:', error)
    }
  }

  const checkAvailableBarbers = async (date: string, time: string) => {
    if (!date || !time || barbers.length === 0) return

    const selectedDateObj = new Date(date)
    const dayOfWeek = selectedDateObj.getDay()
    const [hours, minutes] = time.split(':')
    const appointmentTime = new Date(selectedDateObj)
    appointmentTime.setHours(parseInt(hours), parseInt(minutes))

    // Filtrar barberos que trabajan en ese día y horario
    const available = barbers.filter(barber => {
      const schedule = barber.schedules.find(s => s.dayOfWeek === dayOfWeek)
      if (!schedule) return false

      const [startHour, startMin] = schedule.startTime.split(':').map(Number)
      const [endHour, endMin] = schedule.endTime.split(':').map(Number)
      
      const startTime = new Date(selectedDateObj)
      startTime.setHours(startHour, startMin)
      
      const endTime = new Date(selectedDateObj)
      endTime.setHours(endHour, endMin)

      return appointmentTime >= startTime && appointmentTime < endTime
    })

    setAvailableBarbers(available)
  }

  // Generar fechas disponibles (próximos 14 días)
  const generateAvailableDates = () => {
    const dates = []
    const today = new Date()
    
    for (let i = 0; i < 14; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      
      // Solo incluir días laborables (lunes a sábado)
      const dayOfWeek = date.getDay()
      if (dayOfWeek >= 1 && dayOfWeek <= 6) {
        dates.push({
          date: date.toISOString().split('T')[0],
          display: date.toLocaleDateString('es-AR', {
            weekday: 'short',
            day: 'numeric',
            month: 'short'
          }),
          fullDisplay: date.toLocaleDateString('es-AR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
          })
        })
      }
    }
    
    return dates
  }

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services')
      if (response.ok) {
        const data = await response.json()
        setServices(data.filter((service: any) => service.isActive))
      }
    } catch (error) {
      console.error('Error al obtener servicios:', error)
    }
  }

  const generateTimeSlots = (date: string) => {
    if (!date) return []

    const selectedDateObj = new Date(date)
    const dayOfWeek = selectedDateObj.getDay()
    
    // Generar slots de 30 minutos desde las 9:00 hasta las 18:00
    const slots: TimeSlot[] = []
    
    for (let hour = 9; hour < 18; hour++) {
      for (let minutes = 0; minutes < 60; minutes += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
        slots.push({
          time: timeString,
          available: true // Por simplicidad, asumimos que todos están disponibles
        })
      }
    }

    return slots
  }

  const handleDateChange = (date: string) => {
    setSelectedDate(date)
    setSelectedTime('')
    setAvailableBarbers([])
  }

  const handleTimeChange = (time: string) => {
    setSelectedTime(time)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const appointmentDate = new Date(selectedDate)
      const [hours, minutes] = selectedTime.split(':')
      appointmentDate.setHours(parseInt(hours), parseInt(minutes))

      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientName: formData.clientName,
          clientPhone: formData.clientPhone,
          barberId: selectedBarber?.id,
          serviceId: selectedService?.id,
          date: appointmentDate.toISOString()
        })
      })

      if (response.ok) {
        setSuccess(true)
      } else {
        const error = await response.json()
        alert(error.error || 'Error al crear la reserva')
      }
    } catch (error) {
      console.error('Error al crear reserva:', error)
      alert('Error al crear la reserva')
    } finally {
      setLoading(false)
    }
  }

  const nextStep = () => {
    if (step === 1 && selectedDate && selectedTime && availableBarbers.length > 0) {
      setStep(2)
    } else if (step === 2 && selectedBarber && selectedService) {
      setStep(3)
    }
  }

  const prevStep = () => {
    setStep(Math.max(1, step - 1))
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md w-full"
        >
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            ¡Reserva Confirmada!
          </h2>
          <p className="text-gray-600 mb-4">
            Tu turno ha sido reservado exitosamente. Te esperamos el {selectedDate} a las {selectedTime}.
          </p>
          <button
            onClick={() => {
              setSuccess(false)
              setStep(1)
              setSelectedBarber(null)
              setSelectedService(null)
              setSelectedDate('')
              setSelectedTime('')
              setFormData({ clientName: '', clientPhone: '' })
            }}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            Hacer Otra Reserva
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 p-4">
      <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Reserva tu Turno
          </h1>
          <p className="text-xl text-gray-600">
            Elige tu barbero, servicio y horario preferido
          </p>
        </motion.div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    step >= stepNumber
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div
                    className={`w-12 h-1 ${
                      step > stepNumber ? 'bg-primary-600' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-2">
            <p className="text-sm text-gray-600">
              {step === 1 && 'Fecha y Horario'}
              {step === 2 && 'Barbero y Servicio'}
              {step === 3 && 'Datos Personales'}
            </p>
          </div>
        </div>

        {/* Step 1: Date and Time Selection */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="grid md:grid-cols-2 gap-8"
          >
            {/* Date Selection */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Selecciona la Fecha
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                {generateAvailableDates().map((dateOption) => (
                  <button
                    key={dateOption.date}
                    onClick={() => handleDateChange(dateOption.date)}
                    className={`p-3 rounded-lg text-sm font-medium transition-all border-2 ${
                      selectedDate === dateOption.date
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-gray-100 text-gray-900 border-gray-200 hover:bg-primary-100 hover:border-primary-300'
                    }`}
                  >
                    <div className="text-center">
                      <p className="font-semibold">{dateOption.display}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Time Selection */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Selecciona el Horario
              </h3>
              {selectedDate ? (
                <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                  {generateTimeSlots(selectedDate).map((slot) => (
                    <button
                      key={slot.time}
                      onClick={() => handleTimeChange(slot.time)}
                      disabled={!slot.available}
                      className={`p-3 rounded-lg text-sm font-medium transition-all ${
                        selectedTime === slot.time
                          ? 'bg-primary-600 text-white'
                          : slot.available
                          ? 'bg-gray-100 text-gray-900 hover:bg-primary-100'
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Selecciona una fecha para ver los horarios disponibles
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* Step 2: Barber and Service Selection */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            {/* Selected Date and Time Summary */}
            <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl p-6 border border-primary-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Fecha y Horario Seleccionados
              </h3>
              <div className="flex items-center space-x-4">
                <div className="flex items-center text-primary-700">
                  <Calendar className="w-5 h-5 mr-2" />
                  <span className="font-medium">
                    {new Date(selectedDate).toLocaleDateString('es-AR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex items-center text-primary-700">
                  <Clock className="w-5 h-5 mr-2" />
                  <span className="font-medium">{selectedTime}</span>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Barber Selection */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Barberos Disponibles
                </h3>
                {availableBarbers.length > 0 ? (
                  <div className="space-y-3">
                    {availableBarbers.map((barber) => (
                      <button
                        key={barber.id}
                        onClick={() => setSelectedBarber(barber)}
                        className={`w-full p-4 rounded-lg border-2 transition-all ${
                          selectedBarber?.id === barber.id
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-primary-300'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Scissors className="w-6 h-6 text-primary-600" />
                          <div>
                            <p className="font-semibold text-gray-900">{barber.name}</p>
                            <p className="text-sm text-gray-600">Disponible</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      No hay barberos disponibles para este horario
                    </p>
                  </div>
                )}
              </div>

              {/* Service Selection */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Scissors className="w-5 h-5 mr-2" />
                  Selecciona tu Servicio
                </h3>
                <div className="space-y-3">
                  {services.map((service) => (
                    <button
                      key={service.id}
                      onClick={() => setSelectedService(service)}
                      className={`w-full p-4 rounded-lg border-2 transition-all ${
                        selectedService?.id === service.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-primary-300'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-gray-900">{service.name}</p>
                          <p className="text-sm text-gray-600">{service.duration} minutos</p>
                        </div>
                        <p className="text-lg font-bold text-primary-600">
                          ${service.price.toLocaleString()}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 3: Personal Information */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="max-w-md mx-auto"
          >
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Tus Datos
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={formData.clientPhone}
                    onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                    placeholder="+54 9 11 1234-5678"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Summary */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Resumen de tu Reserva</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><strong>Barbero:</strong> {selectedBarber?.name}</p>
                    <p><strong>Servicio:</strong> {selectedService?.name}</p>
                    <p><strong>Fecha:</strong> {selectedDate}</p>
                    <p><strong>Horario:</strong> {selectedTime}</p>
                    <p><strong>Precio:</strong> ${selectedService?.price.toLocaleString()}</p>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Confirmando...' : 'Confirmar Reserva'}
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {/* Navigation Buttons */}
        {step < 3 && (
          <div className="flex justify-between mt-8">
            <button
              onClick={prevStep}
              disabled={step === 1}
              className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              onClick={nextStep}
              disabled={
                (step === 1 && (!selectedDate || !selectedTime || availableBarbers.length === 0)) ||
                (step === 2 && (!selectedBarber || !selectedService))
              }
              className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </div>
  )
}