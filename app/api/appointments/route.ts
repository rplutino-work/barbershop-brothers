import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { clientName, clientPhone, barberId, serviceId, date } = await request.json()

    // Validaciones básicas
    if (!clientName || !clientPhone || !barberId || !serviceId || !date) {
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

    // Verificar que el servicio existe
    const service = await prisma.service.findUnique({
      where: { id: serviceId, isActive: true }
    })

    if (!service) {
      return NextResponse.json(
        { error: 'Servicio no encontrado' },
        { status: 404 }
      )
    }

    // Verificar que no hay conflicto de horarios
    const appointmentDate = new Date(date)
    const endTime = new Date(appointmentDate.getTime() + service.duration * 60000)

    const conflictingAppointment = await prisma.appointment.findFirst({
      where: {
        barberId,
        status: { in: ['PENDING', 'CONFIRMED'] },
        OR: [
          {
            AND: [
              { date: { lte: appointmentDate } },
              {
                date: {
                  gte: new Date(appointmentDate.getTime() - service.duration * 60000)
                }
              }
            ]
          },
          {
            AND: [
              { date: { lte: endTime } },
              { date: { gte: appointmentDate } }
            ]
          }
        ]
      }
    })

    if (conflictingAppointment) {
      return NextResponse.json(
        { error: 'Ya hay una cita en ese horario' },
        { status: 409 }
      )
    }

    // Crear la cita
    const appointment = await prisma.appointment.create({
      data: {
        clientName,
        clientPhone,
        barberId,
        serviceId,
        date: appointmentDate,
        status: 'PENDING'
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

    return NextResponse.json(appointment, { status: 201 })
  } catch (error) {
    console.error('Error al crear cita:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const barberId = searchParams.get('barberId')
    const date = searchParams.get('date')
    const status = searchParams.get('status')

    let whereClause: any = {}

    if (barberId) {
      whereClause.barberId = barberId
    }

    if (date) {
      const startDate = new Date(date)
      const endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + 1)
      
      whereClause.date = {
        gte: startDate,
        lt: endDate
      }
    }

    if (status) {
      whereClause.status = status
    }

    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      include: {
        barber: {
          select: { name: true }
        },
        service: {
          select: { name: true, price: true, duration: true }
        }
      },
      orderBy: { date: 'asc' }
    })

    return NextResponse.json(appointments)
  } catch (error) {
    console.error('Error al obtener citas:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
