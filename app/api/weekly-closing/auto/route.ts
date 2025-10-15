import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Este endpoint puede ser llamado por un cron job los domingos a las 23:59
export async function POST(request: NextRequest) {
  try {
    // Verificar que sea domingo
    const now = new Date()
    const dayOfWeek = now.getDay()
    
    // Calcular inicio y fin de la semana (Lunes a Domingo)
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    const monday = new Date(now)
    monday.setDate(now.getDate() + diff)
    monday.setHours(0, 0, 0, 0)

    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    sunday.setHours(23, 59, 59, 999)

    // Obtener todos los pagos de la semana
    const payments = await prisma.payment.findMany({
      where: {
        createdAt: {
          gte: monday,
          lte: sunday,
        },
      },
      include: {
        barber: true,
      },
    })

    if (payments.length === 0) {
      return NextResponse.json({ 
        message: 'No hay pagos para cerrar esta semana' 
      }, { status: 200 })
    }

    // Agrupar por barbero
    const barberMap = new Map<string, any>()

    payments.forEach((payment: any) => {
      const barberId = payment.barber.id

      if (!barberMap.has(barberId)) {
        barberMap.set(barberId, {
          barberId,
          barberName: payment.barber.name,
          commissionRate: payment.barber.commissionRate,
          totalServices: 0,
          totalRevenue: 0,
          totalTips: 0,
        })
      }

      const summary = barberMap.get(barberId)!
      summary.totalServices += 1
      summary.totalRevenue += payment.amount
      summary.totalTips += (payment.tip || 0)
    })

    // Crear registros de cierre semanal
    const weeklyClosingsData = Array.from(barberMap.values()).map((summary) => {
      const commission = (summary.totalRevenue * summary.commissionRate) / 100
      const toPay = commission + summary.totalTips

      return {
        weekStart: monday,
        weekEnd: sunday,
        barberId: summary.barberId,
        totalServices: summary.totalServices,
        totalRevenue: summary.totalRevenue,
        totalTips: summary.totalTips,
        commission: toPay,
        status: 'PENDING',
      }
    })

    // Insertar cierres semanales (usar modelo directamente)
    const createdClosings = []
    for (const closing of weeklyClosingsData) {
      const created = await prisma.$executeRaw`
        INSERT INTO weekly_closings (id, "weekStart", "weekEnd", "barberId", "totalServices", "totalRevenue", "totalTips", commission, status, "createdAt", "updatedAt")
        VALUES (gen_random_uuid()::text, ${closing.weekStart}, ${closing.weekEnd}, ${closing.barberId}, ${closing.totalServices}, ${closing.totalRevenue}, ${closing.totalTips}, ${closing.commission}, ${closing.status}, NOW(), NOW())
      `
      createdClosings.push(created)
    }

    return NextResponse.json({
      message: 'Cierre semanal automático completado',
      weekStart: monday.toISOString(),
      weekEnd: sunday.toISOString(),
      closings: weeklyClosingsData.length,
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error en cierre automático:', error)
    return NextResponse.json(
      { error: 'Error al procesar cierre automático' },
      { status: 500 }
    )
  }
}

