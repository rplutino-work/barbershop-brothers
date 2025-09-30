import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const payments = await prisma.payment.findMany({
      where: {
        clientId: params.id,
      },
      include: {
        barber: { select: { name: true } },
        service: { select: { name: true, price: true, duration: true } },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5, // Solo los últimos 5 cortes
    })

    return NextResponse.json(payments)
  } catch (error) {
    console.error('Error al obtener historial del cliente:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}