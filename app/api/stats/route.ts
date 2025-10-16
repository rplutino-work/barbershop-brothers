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

    // Obtener todos los pagos completados
    const allPayments = await prisma.payment.findMany({
      where: {
        status: 'COMPLETED'
      },
      select: {
        id: true,
        amount: true,
        createdAt: true
      }
    })

    // Filtrar por hoy comparando strings de fecha
    const todayStr = now.toLocaleDateString('es-AR')
    const todayPayments = allPayments.filter(p => {
      const paymentDate = new Date(p.createdAt)
      return paymentDate.toLocaleDateString('es-AR') === todayStr
    })

    // Ingresos HOY
    const todayRevenue = {
      _sum: {
        amount: todayPayments.reduce((sum, p) => sum + p.amount, 0)
      }
    }

    const weekRevenue = await prisma.payment.aggregate({
      where: {
        createdAt: { gte: startOfWeek },
        status: 'COMPLETED'
      },
      _sum: { amount: true }
    })

    const monthRevenue = await prisma.payment.aggregate({
      where: {
        createdAt: { gte: startOfMonth },
        status: 'COMPLETED'
      },
      _sum: { amount: true }
    })

    const lastMonthRevenue = await prisma.payment.aggregate({
      where: {
        createdAt: { 
          gte: startOfLastMonth,
          lt: startOfMonth
        },
        status: 'COMPLETED'
      },
      _sum: { amount: true }
    })

    // Cantidad de servicios HOY (ya filtrado arriba)
    const todayServices = todayPayments.length

    const weekServices = await prisma.payment.count({
      where: {
        createdAt: { gte: startOfWeek },
        status: 'COMPLETED'
      }
    })

    const monthServices = await prisma.payment.count({
      where: {
        createdAt: { gte: startOfMonth },
        status: 'COMPLETED'
      }
    })

    // Estadísticas por barbero (semanal)
    const barberStats = await prisma.payment.groupBy({
      by: ['barberId'],
      where: {
        createdAt: { gte: startOfWeek },
        status: 'COMPLETED'
      },
      _count: { id: true },
      _sum: { amount: true },
      _avg: { amount: true }
    })

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
    })
  } catch (error: any) {
    console.error('Error al obtener estadísticas:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}