import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { startTime, endTime, isActive } = await request.json()

    const updateData: any = {}
    if (startTime !== undefined) updateData.startTime = startTime
    if (endTime !== undefined) updateData.endTime = endTime
    if (isActive !== undefined) updateData.isActive = isActive

    const schedule = await prisma.barberSchedule.update({
      where: { id: params.id },
      data: updateData,
      include: {
        barber: {
          select: { name: true }
        }
      }
    })

    return NextResponse.json(schedule)
  } catch (error: any) {
    console.error('Error al actualizar horario:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // En lugar de eliminar, desactivamos el horario
    await prisma.barberSchedule.update({
      where: { id: params.id },
      data: { isActive: false }
    })

    return NextResponse.json({ message: 'Horario desactivado exitosamente' })
  } catch (error: any) {
    console.error('Error al eliminar horario:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}