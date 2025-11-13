import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        name: 'asc',
      },
      // Incluir todos los campos
      select: {
        id: true,
        name: true,
        price: true,
        duration: true,
        description: true,
        isActive: true,
        isServiceCut: true,
        barberCommissionRate: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json(services)
  } catch (error: any) {
    console.error('Error al obtener servicios:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, price, duration = 30, description, isServiceCut = false, barberCommissionRate = 50 } = await request.json()

    if (!name || !price) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    const service = await prisma.service.create({
      data: {
        name,
        price: parseFloat(price),
        duration: parseInt(duration),
        description,
        isServiceCut: Boolean(isServiceCut),
        barberCommissionRate: barberCommissionRate ? parseFloat(barberCommissionRate) : 50,
      },
    })

    return NextResponse.json(service, { status: 201 })
  } catch (error: any) {
    console.error('Error al crear servicio:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}