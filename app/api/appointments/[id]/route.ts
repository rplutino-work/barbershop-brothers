import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { status, notes } = await request.json()

    if (!status) {
      return NextResponse.json(
        { error: 'Estado es requerido' },
        { status: 400 }
      )
    }

    const validStatuses = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Estado inválido' },
        { status: 400 }
      )
    }

    const appointment = await prisma.appointment.update({
      where: { id: params.id },
      data: {
        status,
        ...(notes && { notes })
      },
      include: {
        barber: {
          select: { name: true }
        },
        service: {
          select: { name: true, price: true, duration: true }
        }
      }
    })

    return NextResponse.json(appointment)
  } catch (error: any) {
    console.error('Error al actualizar cita:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.appointment.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Cita eliminada exitosamente' })
  } catch (error: any) {
    console.error('Error al eliminar cita:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
