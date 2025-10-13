import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const client = await prisma.client.update({
      where: {
        id: params.id,
      },
      data: {
        name,
        phone: formattedPhone,
      },
    })

    return NextResponse.json(client)
  } catch (error: any) {
    console.error('Error al actualizar cliente:', error)
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.client.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json({ message: 'Cliente eliminado exitosamente' })
  } catch (error) {
    console.error('Error al eliminar cliente:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}