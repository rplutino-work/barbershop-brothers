import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Obtener todos los servicios activos
export async function GET() {
  try {
    const activeServices = await prisma.activeService.findMany({
      include: {
        barber: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json(activeServices)
  } catch (error: any) {
    console.error('Error al obtener servicios activos:', error)
    return NextResponse.json(
      { error: 'Error al obtener servicios activos' },
      { status: 500 }
    )
  }
}

// POST - Iniciar un servicio activo
export async function POST(request: NextRequest) {
  try {
    const { barberId } = await request.json()

    if (!barberId) {
      return NextResponse.json(
        { error: 'barberId es requerido' },
        { status: 400 }
      )
    }

    // Verificar si el barbero ya tiene un servicio activo
    const existing = await prisma.activeService.findUnique({
      where: { barberId },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'El barbero ya tiene un servicio activo' },
        { status: 400 }
      )
    }

    // Crear nuevo servicio activo
    const activeService = await prisma.activeService.create({
      data: {
        barberId,
        startTime: new Date(),
      },
      include: {
        barber: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json(activeService, { status: 201 })
  } catch (error: any) {
    console.error('Error al iniciar servicio:', error)
    return NextResponse.json(
      { error: 'Error al iniciar servicio' },
      { status: 500 }
    )
  }
}

// DELETE - Finalizar un servicio activo
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const barberId = searchParams.get('barberId')

    if (!barberId) {
      return NextResponse.json(
        { error: 'barberId es requerido' },
        { status: 400 }
      )
    }

    // Buscar y eliminar el servicio activo
    const activeService = await prisma.activeService.findUnique({
      where: { barberId },
    })

    if (!activeService) {
      return NextResponse.json(
        { error: 'No hay servicio activo para este barbero' },
        { status: 404 }
      )
    }

    // Calcular duración del servicio
    const duration = Math.floor(
      (new Date().getTime() - new Date(activeService.startTime).getTime()) / 1000
    )

    await prisma.activeService.delete({
      where: { barberId },
    })

    return NextResponse.json({
      message: 'Servicio finalizado',
      duration, // Duración en segundos
      startTime: activeService.startTime,
    })
  } catch (error: any) {
    console.error('Error al finalizar servicio:', error)
    return NextResponse.json(
      { error: 'Error al finalizar servicio' },
      { status: 500 }
    )
  }
}

