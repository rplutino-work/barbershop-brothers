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

    // Obtener el pago actual para obtener el barbero
    const existingPayment = await prisma.payment.findUnique({
      where: { id: params.id },
      select: {
        barberId: true,
      }
    })

    if (!existingPayment) {
      return NextResponse.json(
        { error: 'Pago no encontrado' },
        { status: 404 }
      )
    }

    // Obtener el servicio NUEVO que se está asignando
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      select: {
        price: true,
        name: true,
        isServiceCut: true,
        barberCommissionRate: true,
      }
    })

    if (!service) {
      return NextResponse.json(
        { error: 'Servicio no encontrado' },
        { status: 404 }
      )
    }

    // Obtener el barbero para calcular la comisión
    const barber = await prisma.user.findUnique({
      where: { id: existingPayment.barberId },
      select: {
        commissionRate: true,
      }
    })

    if (!barber) {
      return NextResponse.json(
        { error: 'Barbero no encontrado' },
        { status: 404 }
      )
    }

    // IMPORTANTE: Cuando se edita un pago desde "Servicios del Día",
    // DEBEMOS actualizar los datos históricos con los valores del NUEVO servicio
    // Esto permite corregir errores o cambiar servicios específicos
    const commissionRate = service.barberCommissionRate ?? barber.commissionRate

    const payment = await prisma.payment.update({
      where: {
        id: params.id,
      },
      data: {
        serviceId, // Cambiar la referencia al servicio
        clientId: clientId || null, // Cambiar el cliente si es necesario
        // Actualizar los datos históricos con los valores del NUEVO servicio
        amount: service.price,
        servicePrice: service.price,
        commissionRate: commissionRate,
        isServiceCut: service.isServiceCut,
      },
      include: {
        barber: { select: { name: true } },
        service: { select: { name: true } },
        client: { select: { name: true, phone: true } },
      },
    })

    return NextResponse.json(payment)
  } catch (error: any) {
    console.error('Error al actualizar pago:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
