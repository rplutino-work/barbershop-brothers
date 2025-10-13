import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { barberId, serviceId, amount, method, clientId } = await request.json()

    if (!barberId || !serviceId || !amount || !method) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    const payment = await prisma.payment.create({
      data: {
        barberId,
        serviceId,
        amount: parseFloat(amount),
        method: method.toUpperCase(),
        status: 'COMPLETED',
        clientId: clientId || null,
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

    let whereClause: any = {}

    // Si se especifica una fecha, filtrar por ese día
    if (date) {
      const filterDate = new Date(date)
      const startOfDay = new Date(filterDate.getFullYear(), filterDate.getMonth(), filterDate.getDate())
      const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)
      
      whereClause.createdAt = {
        gte: startOfDay,
        lt: endOfDay
      }
    }

    const payments = await prisma.payment.findMany({
      where: whereClause,
      include: {
        barber: true,
        service: true,
        client: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(payments)
  } catch (error: any) {
    console.error('Error al obtener pagos:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
