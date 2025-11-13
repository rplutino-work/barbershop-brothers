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

    // Obtener datos del barbero primero
    const barber = await prisma.user.findUnique({
      where: { id: params.id },
      select: { id: true, name: true, commissionRate: true }
    })

    // Obtener todos los pagos con información del servicio para calcular comisiones correctas
    const allPayments = await prisma.payment.findMany({
      where: {
        barberId: params.id,
        status: 'COMPLETED'
      },
      include: {
        service: true,
      }
    })

    // Filtrar por hoy comparando fechas en zona horaria de Argentina
    const todayStr = now.toLocaleDateString('es-AR')
    console.log('📅 Fecha de hoy (AR):', todayStr)
    const todayPayments = allPayments.filter(p => {
      const paymentDate = new Date(p.createdAt)
      const paymentStr = paymentDate.toLocaleDateString('es-AR')
      console.log(`🔍 Comparando: ${paymentStr} === ${todayStr} ? ${paymentStr === todayStr}`)
      return paymentStr === todayStr
    })
    console.log('📊 Pagos de hoy encontrados:', todayPayments.length)

    // Ganancias del barbero HOY (comisión + propinas) usando datos históricos guardados
    const todayEarnings = todayPayments.reduce((sum, p) => {
      // Usar comisión guardada en el pago (datos históricos), sino usar del servicio actual
      const paymentData = p as any
      const commissionRate = paymentData.commissionRate !== null && paymentData.commissionRate !== undefined
        ? paymentData.commissionRate
        : ((p.service as any)?.barberCommissionRate ?? barber?.commissionRate ?? 50)
      const commission = p.amount * commissionRate / 100
      const tip = p.tip || 0
      return sum + commission + tip
    }, 0)

    // Calcular ganancias de la semana
    const weekPayments = await prisma.payment.findMany({
      where: {
        barberId: params.id,
        createdAt: { gte: startOfWeek },
        status: 'COMPLETED'
      },
      include: {
        service: true,
      }
    })
    const weekEarnings = weekPayments.reduce((sum, p) => {
      // Usar comisión guardada en el pago (datos históricos), sino usar del servicio actual
      const paymentData = p as any
      const commissionRate = paymentData.commissionRate !== null && paymentData.commissionRate !== undefined
        ? paymentData.commissionRate
        : ((p.service as any)?.barberCommissionRate ?? barber?.commissionRate ?? 50)
      const commission = p.amount * commissionRate / 100
      const tip = p.tip || 0
      return sum + commission + tip
    }, 0)

    // Calcular ganancias del mes
    const monthPayments = await prisma.payment.findMany({
      where: {
        barberId: params.id,
        createdAt: { gte: startOfMonth },
        status: 'COMPLETED'
      },
      include: {
        service: true,
      }
    })
    const monthEarnings = monthPayments.reduce((sum, p) => {
      // Usar comisión guardada en el pago (datos históricos), sino usar del servicio actual
      const paymentData = p as any
      const commissionRate = paymentData.commissionRate !== null && paymentData.commissionRate !== undefined
        ? paymentData.commissionRate
        : ((p.service as any)?.barberCommissionRate ?? barber?.commissionRate ?? 50)
      const commission = p.amount * commissionRate / 100
      const tip = p.tip || 0
      return sum + commission + tip
    }, 0)

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

    // Promedio de ganancias por servicio (últimos 30 días)
    const averagePayments = await prisma.payment.findMany({
      where: {
        barberId: params.id,
        createdAt: { gte: thirtyDaysAgo },
        status: 'COMPLETED'
      },
      include: {
        service: true,
      }
    })
    const averageEarnings = averagePayments.length > 0 
      ? averagePayments.reduce((sum, p) => {
          // Usar comisión guardada en el pago (datos históricos), sino usar del servicio actual
          const paymentData = p as any
          const commissionRate = paymentData.commissionRate !== null && paymentData.commissionRate !== undefined
            ? paymentData.commissionRate
            : ((p.service as any)?.barberCommissionRate ?? barber?.commissionRate ?? 50)
          const commission = p.amount * commissionRate / 100
          const tip = p.tip || 0
          return sum + commission + tip
        }, 0) / averagePayments.length
      : 0

    // Servicios recientes del barbero con datos de tiempo
    const recentServices = await prisma.payment.findMany({
      where: {
        barberId: params.id,
        status: 'COMPLETED'
      },
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        amount: true,
        tip: true,
        method: true,
        createdAt: true,
        serviceStartTime: true,
        serviceEndTime: true,
        serviceDuration: true,
        service: { select: { name: true, duration: true } },
        client: { select: { name: true, phone: true } }
      }
    })


    console.log('📊 Estadísticas calculadas para barbero:', barber?.name)
    console.log('💰 Today Earnings:', todayEarnings)
    console.log('💰 Week Earnings:', weekEarnings)
    console.log('💰 Month Earnings:', monthEarnings)
    console.log('📅 Today Services:', todayServices)
    console.log('📅 Week Services:', weekServices)
    console.log('📅 Month Services:', monthServices)

    return NextResponse.json({
      todayEarnings,
      weekEarnings,
      monthEarnings,
      todayServices,
      weekServices,
      monthServices,
      averageEarnings,
      barber: barber,
      recentServices: recentServices.map(payment => ({
        id: payment.id,
        serviceName: payment.service.name,
        serviceDurationMinutes: payment.service.duration,
        amount: payment.amount,
        tip: payment.tip || 0,
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