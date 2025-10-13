import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const payments = await prisma.payment.findMany({
      where: {
        barberId: params.id,
      },
      include: {
        barber: { select: { name: true } },
        service: { select: { id: true, name: true, price: true, duration: true } },
        client: { select: { id: true, name: true, phone: true } },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(payments)
  } catch (error: any) {
    console.error('Error al obtener pagos del barbero:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
