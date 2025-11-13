import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { barberId, serviceId, amount, tip, method, clientId, serviceStartTime, serviceDuration } = await request.json()

    if (!barberId || !serviceId || !amount || !method) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    // Obtener datos del servicio y barbero para guardar valores históricos
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      select: {
        price: true,
        isServiceCut: true,
        barberCommissionRate: true,
      },
    })

    const barber = await prisma.user.findUnique({
      where: { id: barberId },
      select: {
        commissionRate: true,
      },
    })

    if (!service || !barber) {
      return NextResponse.json(
        { error: 'Servicio o barbero no encontrado' },
        { status: 404 }
      )
    }

    // Calcular comisión que se aplicará (usar la del servicio si existe, sino la del barbero)
    const commissionRate = service.barberCommissionRate ?? barber.commissionRate

    // Calcular serviceEndTime si tenemos startTime y duration
    let serviceEndTime = null
    if (serviceStartTime && serviceDuration) {
      const startDate = new Date(serviceStartTime)
      serviceEndTime = new Date(startDate.getTime() + serviceDuration * 1000) // duration está en segundos
    }

    const payment = await prisma.payment.create({
      data: {
        barberId,
        serviceId,
        amount: parseFloat(amount),
        tip: parseFloat(tip) || 0,
        method: method.toUpperCase(),
        status: 'COMPLETED',
        clientId: clientId || null,
        // Datos del servicio activo
        serviceStartTime: serviceStartTime ? new Date(serviceStartTime) : null,
        serviceEndTime: serviceEndTime,
        serviceDuration: serviceDuration || null,
        // Datos históricos del servicio al momento del pago
        servicePrice: service.price,
        commissionRate: commissionRate,
        isServiceCut: service.isServiceCut,
      },
      include: {
        barber: true,
        service: true,
        client: true,
      },
    })

    return NextResponse.json(payment, { status: 201 })
  } catch (error: any) {
    console.error('Error al crear pago:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    let whereClause: any = {}

    // Si se especifica un rango de fechas (ya vienen en ISO con la zona horaria correcta del cliente)
    if (startDate && endDate) {
      whereClause.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }
    // Si se especifica una fecha, filtrar por ese día
    else if (date) {
      // La fecha viene como string ISO del cliente
      const filterDate = new Date(date)
      const startOfDay = new Date(filterDate.getFullYear(), filterDate.getMonth(), filterDate.getDate(), 0, 0, 0, 0)
      const endOfDay = new Date(filterDate.getFullYear(), filterDate.getMonth(), filterDate.getDate(), 23, 59, 59, 999)
      
      whereClause.createdAt = {
        gte: startOfDay,
        lte: endOfDay
      }
    }

    const payments = await prisma.payment.findMany({
      where: whereClause,
      include: {
        barber: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            commissionRate: true,
            imageUrl: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            price: true,
            duration: true,
            description: true,
            isServiceCut: true,
            barberCommissionRate: true,
          },
        },
        client: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(payments, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error: any) {
    console.error('Error al obtener pagos:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
