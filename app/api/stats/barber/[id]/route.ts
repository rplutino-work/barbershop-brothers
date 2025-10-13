import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const now = new Date()
    
    // Fechas para cálculos
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay()) // Domingo de esta semana
    startOfWeek.setHours(0, 0, 0, 0)
    
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Ingresos del barbero
    const todayRevenue = await prisma.payment.aggregate({
      where: {
        barberId: params.id,
        createdAt: { gte: startOfDay },
        status: 'COMPLETED'
      },
      _sum: { amount: true }
    })

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

    // Cantidad de servicios
    const todayServices = await prisma.payment.count({
      where: {
        barberId: params.id,
        createdAt: { gte: startOfDay },
        status: 'COMPLETED'
      }
    })

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
        service: { select: { name: true } },
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
        amount: payment.amount,
        method: payment.method,
        clientName: payment.client?.name,
        clientPhone: payment.client?.phone,
        createdAt: payment.createdAt
      }))
    })
  } catch (error) {
    console.error('Error al obtener estadísticas del barbero:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}