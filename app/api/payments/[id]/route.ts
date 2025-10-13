import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { serviceId, clientId } = await request.json()

    if (!serviceId) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    // Obtener el servicio para actualizar el monto
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      select: { price: true }
    })

    if (!service) {
      return NextResponse.json(
        { error: 'Servicio no encontrado' },
        { status: 404 }
      )
    }

    const payment = await prisma.payment.update({
      where: {
        id: params.id,
      },
      data: {
        serviceId,
        clientId: clientId || null,
        amount: service.price,
      },
      include: {
        barber: { select: { name: true } },
        service: { select: { name: true } },
        client: { select: { name: true, phone: true } },
      },
    })

    return NextResponse.json(payment)
  } catch (error) {
    console.error('Error al actualizar pago:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { serviceId, clientId } = await request.json()

    if (!serviceId) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    // Obtener el servicio para actualizar el monto
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      select: { price: true }
    })

    if (!service) {
      return NextResponse.json(
        { error: 'Servicio no encontrado' },
        { status: 404 }
      )
    }

    const payment = await prisma.payment.update({
      where: {
        id: params.id,
      },
      data: {
        serviceId,
        clientId: clientId || null,
        amount: service.price,
      },
      include: {
        barber: { select: { name: true } },
        service: { select: { name: true } },
        client: { select: { name: true, phone: true } },
      },
    })

    return NextResponse.json(payment)
  } catch (error) {
    console.error('Error al actualizar pago:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}