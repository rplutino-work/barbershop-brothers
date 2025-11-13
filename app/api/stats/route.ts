import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const now = new Date()
    
    // Fechas para cálculos
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay()) // Domingo de esta semana
    startOfWeek.setHours(0, 0, 0, 0)
    
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0)
    
    // Estadísticas generales
    const totalBarbers = await prisma.user.count({
      where: { role: 'BARBER' }
    })
    
    const totalServices = await prisma.service.count({
      where: { isActive: true }
    })

    // Obtener todos los pagos completados con servicio para filtrar cortes de servicio
    // Usar datos históricos guardados en el pago si existen
    const allPayments = await prisma.payment.findMany({
      where: {
        status: 'COMPLETED'
      },
      include: {
        service: true
      }
    })

    // Filtrar por hoy comparando strings de fecha y excluir cortes de servicio
    // Usar SIEMPRE los datos históricos guardados en el pago
    const todayStr = now.toLocaleDateString('es-AR')
    const todayPayments = allPayments.filter(p => {
      const paymentDate = new Date(p.createdAt)
      const paymentData = p as any
      // Usar SIEMPRE los datos históricos guardados en el pago
      // NO usar el estado actual del servicio, solo los datos guardados
      const isServiceCut = paymentData.isServiceCut !== null && paymentData.isServiceCut !== undefined
        ? Boolean(paymentData.isServiceCut) // Usar el valor guardado en el pago
        : false // Pagos antiguos sin datos históricos no eran cortes de servicio
      return paymentDate.toLocaleDateString('es-AR') === todayStr && !isServiceCut
    })

    // Ingresos HOY (excluyendo cortes de servicio)
    const todayRevenue = {
      _sum: {
        amount: todayPayments.reduce((sum, p) => sum + p.amount, 0)
      }
    }

    // Obtener todos los pagos de la semana y mes con servicio para filtrar
    const weekPayments = await prisma.payment.findMany({
      where: {
        createdAt: { gte: startOfWeek },
        status: 'COMPLETED'
      },
      include: {
        service: true
      }
    })

    const monthPayments = await prisma.payment.findMany({
      where: {
        createdAt: { gte: startOfMonth },
        status: 'COMPLETED'
      },
      include: {
        service: true
      }
    })

    const lastMonthPayments = await prisma.payment.findMany({
      where: {
        createdAt: { 
          gte: startOfLastMonth,
          lt: startOfMonth
        },
        status: 'COMPLETED'
      },
      include: {
        service: true
      }
    })

    // Función helper para determinar si un pago es un corte de servicio
    const getIsServiceCut = (p: any) => {
      // Usar SIEMPRE los datos históricos guardados en el pago
      // NO usar el estado actual del servicio, solo los datos guardados
      return p.isServiceCut !== null && p.isServiceCut !== undefined
        ? Boolean(p.isServiceCut) // Usar el valor guardado en el pago
        : false // Pagos antiguos sin datos históricos no eran cortes de servicio
    }

    // Calcular ingresos excluyendo cortes de servicio
    // Usar datos históricos guardados en el pago si existen
    const weekRevenue = {
      _sum: {
        amount: weekPayments
          .filter(p => !getIsServiceCut(p))
          .reduce((sum, p) => sum + p.amount, 0)
      }
    }

    const monthRevenue = {
      _sum: {
        amount: monthPayments
          .filter(p => !getIsServiceCut(p))
          .reduce((sum, p) => sum + p.amount, 0)
      }
    }

    const lastMonthRevenue = {
      _sum: {
        amount: lastMonthPayments
          .filter(p => !getIsServiceCut(p))
          .reduce((sum, p) => sum + p.amount, 0)
      }
    }

    // Cantidad de servicios HOY (ya filtrado arriba, excluyendo cortes de servicio)
    const todayServices = todayPayments.length

    const weekServices = weekPayments.filter(p => !getIsServiceCut(p)).length

    const monthServices = monthPayments.filter(p => !getIsServiceCut(p)).length

    // Estadísticas por barbero (semanal) - excluyendo cortes de servicio de ingresos
    const barberStatsData = await prisma.payment.findMany({
      where: {
        createdAt: { gte: startOfWeek },
        status: 'COMPLETED'
      },
      include: {
        barber: {
          select: {
            id: true,
            name: true
          }
        },
        service: true
      }
    })

    // Agrupar por barbero excluyendo cortes de servicio de ingresos
    const barberStatsMap = new Map<string, { count: number; total: number; amounts: number[] }>()
    barberStatsData.forEach(payment => {
      if (!barberStatsMap.has(payment.barberId)) {
        barberStatsMap.set(payment.barberId, { count: 0, total: 0, amounts: [] })
      }
      const stat = barberStatsMap.get(payment.barberId)!
      stat.count += 1
      // Solo sumar ingresos si NO es corte de servicio
      // Usar SIEMPRE los datos históricos guardados en el pago
      const paymentData = payment as any
      const isServiceCut = paymentData.isServiceCut !== null && paymentData.isServiceCut !== undefined
        ? Boolean(paymentData.isServiceCut) // Usar el valor guardado en el pago
        : false // Pagos antiguos sin datos históricos no eran cortes de servicio
      if (!isServiceCut) {
        stat.total += payment.amount
      }
      stat.amounts.push(payment.amount)
    })

    const barberStats = Array.from(barberStatsMap.entries()).map(([barberId, stat]) => ({
      barberId,
      _count: { id: stat.count },
      _sum: { amount: stat.total },
      _avg: { amount: stat.amounts.length > 0 ? stat.amounts.reduce((a, b) => a + b, 0) / stat.amounts.length : 0 }
    }))

    // Obtener nombres de barberos
    const barberIds = barberStats.map(stat => stat.barberId)
    const barbers = await prisma.user.findMany({
      where: {
        id: { in: barberIds },
        role: 'BARBER'
      },
      select: {
        id: true,
        name: true
      }
    })

    const barberStatsWithNames = barberStats.map(stat => {
      const barber = barbers.find(b => b.id === stat.barberId)
      return {
        barberId: stat.barberId,
        barberName: barber?.name || 'Desconocido',
        servicesCount: stat._count.id,
        totalRevenue: stat._sum.amount || 0,
        averageService: stat._avg.amount || 0
      }
    })

    // Actividad reciente
    const recentActivity = await prisma.payment.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        barber: { select: { name: true } },
        service: { select: { name: true } }
      }
    })

    return NextResponse.json({
      general: {
        totalBarbers,
        totalServices,
        todayRevenue: todayRevenue._sum.amount || 0,
        weekRevenue: weekRevenue._sum.amount || 0,
        monthRevenue: monthRevenue._sum.amount || 0,
        lastMonthRevenue: lastMonthRevenue._sum.amount || 0,
        todayServices,
        weekServices,
        monthServices,
      },
      barberStats: barberStatsWithNames,
      recentActivity: recentActivity.map(payment => ({
        id: payment.id,
        barberName: payment.barber.name,
        serviceName: payment.service.name,
        amount: payment.amount,
        method: payment.method,
        createdAt: payment.createdAt
      }))
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error: any) {
    console.error('Error al obtener estadísticas:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}