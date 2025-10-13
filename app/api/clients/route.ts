import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const clients = await prisma.client.findMany({
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json(clients)
  } catch (error) {
    console.error('Error al obtener clientes:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, phone } = await request.json()

    if (!name || !phone) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    // Formatear el teléfono
    const formattedPhone = phone.startsWith('+54') ? phone : `+54${phone}`

    // Verificar si ya existe un cliente con este teléfono
    const existingClient = await prisma.client.findUnique({
      where: { phone: formattedPhone }
    })

    if (existingClient) {
      return NextResponse.json(
        { error: 'Ya existe un cliente con este número de teléfono' },
        { status: 400 }
      )
    }

    const client = await prisma.client.create({
      data: {
        name,
        phone: formattedPhone,
      },
    })

    return NextResponse.json(client, { status: 201 })
  } catch (error) {
    console.error('Error al crear cliente:', error)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Ya existe un cliente con este número de teléfono' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}