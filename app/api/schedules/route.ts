import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { barberId, dayOfWeek, startTime, endTime } = await request.json()

    // Validaciones básicas
    if (!barberId || dayOfWeek === undefined || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    // Verificar que el barbero existe
    const barber = await prisma.user.findUnique({
      where: { id: barberId, role: 'BARBER' }
    })

    if (!barber) {
      return NextResponse.json(
        { error: 'Barbero no encontrado' },
        { status: 404 }
      )
    }

    // Verificar que no hay horario duplicado para el mismo día
    const existingSchedule = await prisma.barberSchedule.findFirst({
      where: {
        barberId,
        dayOfWeek,
        isActive: true
      }
    })

    if (existingSchedule) {
      return NextResponse.json(
        { error: 'Ya existe un horario para este día' },
        { status: 409 }
      )
    }

    // Crear el horario
    const schedule = await prisma.barberSchedule.create({
      data: {
        barberId,
        dayOfWeek,
        startTime,
        endTime,
        isActive: true
      },
      include: {
        barber: {
          select: { name: true }
        }
      }
    })

    return NextResponse.json(schedule, { status: 201 })
  } catch (error) {
    console.error('Error al crear horario:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const barberId = searchParams.get('barberId')

    let whereClause: any = { isActive: true }

    if (barberId) {
      whereClause.barberId = barberId
    }

    const schedules = await prisma.barberSchedule.findMany({
      where: whereClause,
      include: {
        barber: {
          select: { name: true }
        }
      },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }]
    })

    return NextResponse.json(schedules)
  } catch (error) {
    console.error('Error al obtener horarios:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
