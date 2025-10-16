import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const now = new Date()
    
    // Fechas para cálculos en hora local
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
    
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay()) // Domingo de esta semana
    startOfWeek.setHours(0, 0, 0, 0)
    
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Obtener todos los pagos y filtrar en el servidor por fecha local
    const allPayments = await prisma.payment.findMany({
      where: {
        barberId: params.id,
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

    // Ingresos del barbero HOY
    const todayRevenue = {
      _sum: {
        amount: todayPayments.reduce((sum, p) => sum + p.amount, 0)
      }
    }

    const weekRevenue = await prisma.payment.aggregate({
      where: {
        barberId: params.id,
        createdAt: { gte: startOfWeek },
        status: 'COMPLETED'
      },
      _sum: { amount: true }
    })

    const monthRevenue = await prisma.payment.aggregate({
      where: {
        barberId: params.id,
        createdAt: { gte: startOfMonth },
        status: 'COMPLETED'
      },
      _sum: { amount: true }
    })

    // Cantidad de servicios HOY (ya filtrado arriba)
    const todayServices = todayPayments.length

    const weekServices = await prisma.payment.count({
      where: {
        barberId: params.id,
        createdAt: { gte: startOfWeek },
        status: 'COMPLETED'
      }
    })

    const monthServices = await prisma.payment.count({
      where: {
        barberId: params.id,
        createdAt: { gte: startOfMonth },
        status: 'COMPLETED'
      }
    })

    // Promedio de servicios (últimos 30 días)
    const averageStats = await prisma.payment.aggregate({
      where: {
        barberId: params.id,
        createdAt: { gte: thirtyDaysAgo },
        status: 'COMPLETED'
      },
      _avg: { amount: true },
      _count: { id: true }
    })

    // Servicios recientes del barbero
    const recentServices = await prisma.payment.findMany({
      where: {
        barberId: params.id,
        status: 'COMPLETED'
      },
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        service: { select: { name: true, duration: true } },
        client: { select: { name: true, phone: true } }
      }
    })

    // Obtener datos del barbero incluyendo comisión
    const barber = await prisma.user.findUnique({
      where: { id: params.id },
      select: { id: true, name: true, commissionRate: true }
    })

    return NextResponse.json({
      todayRevenue: todayRevenue._sum.amount || 0,
      weekRevenue: weekRevenue._sum.amount || 0,
      monthRevenue: monthRevenue._sum.amount || 0,
      todayServices,
      weekServices,
      monthServices,
      averageService: averageStats._avg.amount || 0,
      barber: barber,
      recentServices: recentServices.map(payment => ({
        id: payment.id,
        serviceName: payment.service.name,
        serviceDurationMinutes: payment.service.duration,
        amount: payment.amount,
        method: payment.method,
        clientName: payment.client?.name,
        clientPhone: payment.client?.phone,
        createdAt: payment.createdAt,
        serviceStartTime: (payment as any).serviceStartTime,
        serviceEndTime: (payment as any).serviceEndTime,
        serviceDuration: (payment as any).serviceDuration
      }))
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error: any) {
    console.error('Error al obtener estadísticas del barbero:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}