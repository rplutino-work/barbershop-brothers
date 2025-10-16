'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, DollarSign, CheckCircle, Clock, User, TrendingUp, Scissors, CreditCard, Smartphone, Banknote } from 'lucide-react'
import { LoadingSpinner } from '../ui/LoadingSpinner'

interface Payment {
  id: string
  barberId: string
  serviceId: string
  amount: number
  tip: number
  method: string
  createdAt: string
  barber: {
    id: string
    name: string
    commissionRate: number
  }
  service: {
    id: string
    name: string
    duration: number
  }
  client?: {
    name: string
    phone: string
  } | null
}

interface DayService {
  id: string
  time: string
  barberName: string
  clientName: string
  serviceName: string
  serviceDurationMinutes: number // Duración estándar del servicio en minutos
  amount: number
  tip: number
  method: string
  total: number
  createdAt: string
  serviceStartTime: string | null
  serviceEndTime: string | null
  serviceDuration: number | null
}

interface BarberSummary {
  barberId: string
  barberName: string
  commissionRate: number
  totalServices: number
  totalRevenue: number
  totalTips: number
  commission: number
  toPay: number
}

export function WeeklyClosing() {
  const [loading, setLoading] = useState(true)
  const [weekStart, setWeekStart] = useState<string>('')
  const [weekEnd, setWeekEnd] = useState<string>('')
  const [payments, setPayments] = useState<Payment[]>([])
  const [barberSummaries, setBarberSummaries] = useState<BarberSummary[]>([])
  const [selectedDay, setSelectedDay] = useState<string>('')
  const [weekDays, setWeekDays] = useState<string[]>([])

  useEffect(() => {
    // Calcular inicio y fin de la semana actual (Lunes a Domingo)
    const today = new Date()
    const dayOfWeek = today.getDay()
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek // Lunes como inicio

    const monday = new Date(today)
    monday.setDate(today.getDate() + diff)
    monday.setHours(0, 0, 0, 0)

    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    sunday.setHours(23, 59, 59, 999)

    setWeekStart(monday.toISOString().split('T')[0])
    setWeekEnd(sunday.toISOString().split('T')[0])
    setSelectedDay(today.toISOString().split('T')[0])

    // Generar array con todos los días de la semana
    const days: string[] = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(monday)
      day.setDate(monday.getDate() + i)
      days.push(day.toISOString().split('T')[0])
    }
    setWeekDays(days)

    fetchWeeklyData(monday.toISOString(), sunday.toISOString())
  }, [])

  const fetchWeeklyData = async (start: string, end: string) => {
    try {
      setLoading(true)
      
      // Obtener pagos de la semana con toda la información
      const paymentsRes = await fetch(`/api/payments?startDate=${start}&endDate=${end}`)
      const paymentsData = await paymentsRes.json()

      setPayments(paymentsData)

      // Agrupar por barbero para el resumen
      const barberMap = new Map<string, BarberSummary>()

      paymentsData.forEach((payment: Payment) => {
        const barberId = payment.barber.id
        
        if (!barberMap.has(barberId)) {
          barberMap.set(barberId, {
            barberId,
            barberName: payment.barber.name,
            commissionRate: payment.barber.commissionRate,
            totalServices: 0,
            totalRevenue: 0,
            totalTips: 0,
            commission: 0,
            toPay: 0
          })
        }

        const summary = barberMap.get(barberId)!
        summary.totalServices += 1
        summary.totalRevenue += payment.amount
        summary.totalTips += payment.tip || 0
      })

      // Calcular comisiones y totales a pagar
      const summaries = Array.from(barberMap.values()).map(summary => {
        summary.commission = (summary.totalRevenue * summary.commissionRate) / 100
        summary.toPay = summary.commission + summary.totalTips
        return summary
      })

      setBarberSummaries(summaries)
    } catch (error: any) {
      console.error('Error al obtener datos semanales:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleWeekChange = () => {
    if (weekStart && weekEnd) {
      const start = new Date(weekStart + 'T00:00:00')
      const end = new Date(weekEnd + 'T23:59:59')
      
      // Regenerar días de la semana
      const days: string[] = []
      const startDate = new Date(weekStart)
      for (let i = 0; i < 7; i++) {
        const day = new Date(startDate)
        day.setDate(startDate.getDate() + i)
        days.push(day.toISOString().split('T')[0])
      }
      setWeekDays(days)
      
      fetchWeeklyData(start.toISOString(), end.toISOString())
    }
  }

  // Filtrar pagos del día seleccionado
  const getDayPayments = (day: string): DayService[] => {
    // Crear inicio y fin del día en hora local
    const dayDate = new Date(day + 'T00:00:00')
    const startOfDay = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate())
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)
    
    return payments
      .filter(payment => {
        const paymentDate = new Date(payment.createdAt)
        return paymentDate >= startOfDay && paymentDate < endOfDay
      })
      .map(payment => ({
        id: payment.id,
        time: new Date(payment.createdAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
        barberName: payment.barber.name,
        clientName: payment.client?.name || 'Sin cliente',
        serviceName: payment.service.name,
        serviceDurationMinutes: payment.service.duration, // Duración estándar del servicio
        amount: payment.amount,
        tip: payment.tip || 0,
        method: payment.method,
        total: payment.amount + (payment.tip || 0),
        createdAt: payment.createdAt,
        serviceStartTime: (payment as any).serviceStartTime || null,
        serviceEndTime: (payment as any).serviceEndTime || null,
        serviceDuration: (payment as any).serviceDuration || null
      }))
      .sort((a, b) => a.time.localeCompare(b.time))
  }

  const getPaymentIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case 'transfer':
        return <Smartphone className="w-4 h-4" />
      case 'cash':
        return <Banknote className="w-4 h-4" />
      case 'card':
        return <CreditCard className="w-4 h-4" />
      default:
        return <DollarSign className="w-4 h-4" />
    }
  }

  const getPaymentMethodName = (method: string) => {
    switch (method.toLowerCase()) {
      case 'transfer':
        return 'Transferencia'
      case 'cash':
        return 'Efectivo'
      case 'card':
        return 'Tarjeta'
      default:
        return method
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Cargando datos semanales..." />
      </div>
    )
  }

  const totalToPay = barberSummaries.reduce((sum, s) => sum + s.toPay, 0)
  const totalRevenue = barberSummaries.reduce((sum, s) => sum + s.totalRevenue, 0)
  const totalServices = barberSummaries.reduce((sum, s) => sum + s.totalServices, 0)
  const totalTips = barberSummaries.reduce((sum, s) => sum + s.totalTips, 0)

  const dayPayments = getDayPayments(selectedDay)
  const dayTotal = dayPayments.reduce((sum, p) => sum + p.total, 0)

  return (
    <div className="space-y-6">
      {/* Selector de semana */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary-600" />
          Semana de Trabajo
        </h3>
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Inicio de semana (Lunes)
            </label>
            <input
              type="date"
              value={weekStart}
              onChange={(e) => setWeekStart(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fin de semana (Domingo)
            </label>
            <input
              type="date"
              value={weekEnd}
              onChange={(e) => setWeekEnd(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleWeekChange}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            Cambiar Semana
          </button>
        </div>
      </div>

      {/* Resumen general de la semana */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Servicios</p>
              <p className="text-3xl font-bold text-blue-900">{totalServices}</p>
            </div>
            <Scissors className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-green-50 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Ingresos Totales</p>
              <p className="text-3xl font-bold text-green-900">${totalRevenue.toLocaleString()}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-yellow-50 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 font-medium">Total Propinas</p>
              <p className="text-3xl font-bold text-yellow-900">${totalTips.toLocaleString()}</p>
            </div>
            <DollarSign className="w-8 h-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-purple-50 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Total a Pagar</p>
              <p className="text-3xl font-bold text-purple-900">${totalToPay.toLocaleString()}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Selector de día */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Servicios por Día</h3>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {weekDays.map((day) => {
            const dayDate = new Date(day + 'T00:00:00')
            const dayName = dayDate.toLocaleDateString('es-AR', { weekday: 'short' })
            const dayNumber = dayDate.getDate()
            const dayServicesCount = getDayPayments(day).length
            
            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`flex-shrink-0 px-4 py-3 rounded-lg border-2 transition-all ${
                  selectedDay === day
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-gray-900 border-gray-200 hover:border-primary-300'
                }`}
              >
                <div className="text-center">
                  <p className="text-xs font-medium uppercase">{dayName}</p>
                  <p className="text-2xl font-bold">{dayNumber}</p>
                  <p className="text-xs mt-1">{dayServicesCount} serv.</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Grilla de servicios del día seleccionado */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Servicios del {new Date(selectedDay + 'T00:00:00').toLocaleDateString('es-AR', { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'long' 
            })}
          </h3>
          <div className="text-sm font-medium text-gray-600">
            Total del día: <span className="text-primary-600 text-lg font-bold">${dayTotal.toLocaleString()}</span>
          </div>
        </div>

        {dayPayments.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>No hay servicios registrados en este día</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Barbero</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Servicio</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Inicio Corte</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fin Corte</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duración</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monto</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Propina</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pago</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {dayPayments.map((service) => (
                  <tr key={service.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-primary-600" />
                        <span className="text-gray-900">{service.barberName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                      {service.clientName}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Scissors className="w-4 h-4 text-blue-600" />
                        <span className="text-gray-900">{service.serviceName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {service.serviceStartTime ? (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-green-600" />
                          <span className="text-sm text-gray-900">
                            {new Date(service.serviceStartTime).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-orange-500" />
                          <span className="text-sm text-gray-700 italic">
                            {(() => {
                              // Calcular inicio estimado: createdAt - duración del servicio
                              const createdDate = new Date(service.createdAt)
                              const estimatedStart = new Date(createdDate.getTime() - service.serviceDurationMinutes * 60 * 1000)
                              return estimatedStart.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
                            })()}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {service.serviceEndTime ? (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-red-600" />
                          <span className="text-sm text-gray-900">
                            {new Date(service.serviceEndTime).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-orange-500" />
                          <span className="text-sm text-gray-700 italic">
                            {new Date(service.createdAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {service.serviceDuration ? (
                        <span className="text-sm font-medium text-blue-600">
                          {Math.floor(service.serviceDuration / 60)}:{(service.serviceDuration % 60).toString().padStart(2, '0')} min
                        </span>
                      ) : (
                        <span className="text-sm font-medium text-orange-500 italic">
                          {service.serviceDurationMinutes} min
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">
                      ${service.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {service.tip > 0 ? (
                        <span className="text-green-600 font-medium">+${service.tip.toLocaleString()}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getPaymentIcon(service.method)}
                        <span className="text-sm text-gray-900">{getPaymentMethodName(service.method)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-bold text-primary-600">
                        ${service.total.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Liquidación por barbero */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Liquidación Semanal por Barbero</h3>
          <p className="text-sm text-gray-600 mt-1">
            Resumen de comisiones y propinas a pagar
          </p>
        </div>

        {barberSummaries.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No hay servicios registrados en esta semana
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Barbero</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Servicios</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ingresos</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">% Com.</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Comisión</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Propinas</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total a Pagar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {barberSummaries.map((summary) => (
                  <tr key={summary.barberId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <User className="w-5 h-5 text-primary-600" />
                        <span className="font-medium text-gray-900">{summary.barberName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">{summary.totalServices}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">${summary.totalRevenue.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">{summary.commissionRate}%</td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">${summary.commission.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-green-600 font-medium">
                      ${summary.totalTips.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-bold text-purple-600 text-lg">
                        ${summary.toPay.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-100 font-bold">
                <tr>
                  <td className="px-6 py-4 text-gray-900">TOTAL GENERAL</td>
                  <td className="px-6 py-4 text-gray-900">{totalServices}</td>
                  <td className="px-6 py-4 text-gray-900">${totalRevenue.toLocaleString()}</td>
                  <td className="px-6 py-4 text-gray-900">-</td>
                  <td className="px-6 py-4 text-gray-900">${barberSummaries.reduce((sum, s) => sum + s.commission, 0).toLocaleString()}</td>
                  <td className="px-6 py-4 text-green-600">${totalTips.toLocaleString()}</td>
                  <td className="px-6 py-4 text-purple-600 text-lg">${totalToPay.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Nota informativa */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex gap-3">
          <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">Cierre Automático de Semana</p>
            <p className="text-blue-700">
              El cierre semanal se realizará automáticamente todos los domingos a las 23:59. 
              Los datos están siempre disponibles para consulta y se actualizan en tiempo real.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
