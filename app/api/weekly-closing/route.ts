import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { weekStart, weekEnd, barberId, totalServices, totalRevenue, totalTips, commission } = await request.json()

    if (!weekStart || !weekEnd || !barberId) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    const closing = await prisma.weeklyClosing.create({
      data: {
        weekStart: new Date(weekStart),
        weekEnd: new Date(weekEnd),
        barberId,
        totalServices: parseInt(totalServices),
        totalRevenue: parseFloat(totalRevenue),
        totalTips: parseFloat(totalTips) || 0,
        commission: parseFloat(commission),
        status: 'PENDING'
      },
      include: {
        barber: {
          select: { name: true }
        }
      }
    })

    return NextResponse.json(closing, { status: 201 })
  } catch (error: any) {
    console.error('Error al crear cierre semanal:', error)
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
    const status = searchParams.get('status')

    let whereClause: any = {}

    if (barberId) {
      whereClause.barberId = barberId
    }

    if (status) {
      whereClause.status = status
    }

    const closings = await prisma.weeklyClosing.findMany({
      where: whereClause,
      include: {
        barber: {
          select: { name: true }
        }
      },
      orderBy: { weekStart: 'desc' }
    })

    return NextResponse.json(closings)
  } catch (error: any) {
    console.error('Error al obtener cierres semanales:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
