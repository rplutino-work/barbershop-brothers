import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, email, password, role = 'BARBER', commissionRate, imageUrl } = body
    
    console.log('📝 PUT /api/users/' + params.id)
    console.log('Body recibido:', JSON.stringify(body, null, 2))
    console.log('ImageURL:', imageUrl)

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    const updateData: any = {
      name,
      email,
      role: role.toUpperCase(),
    }

    // Solo actualizar contraseña si se proporciona
    if (password && password.trim() !== '') {
      updateData.password = await bcrypt.hash(password, 12)
    }

    // Actualizar commissionRate si se proporciona
    if (commissionRate !== undefined) {
      updateData.commissionRate = parseFloat(commissionRate.toString())
    }

    // Actualizar imageUrl si se proporciona (incluyendo null para borrar)
    if (imageUrl !== undefined) {
      console.log('✅ Actualizando imageUrl a:', imageUrl)
      updateData.imageUrl = imageUrl
    } else {
      console.log('⚠️  imageUrl no está definido en el body')
    }

    const user = await prisma.user.update({
      where: {
        id: params.id,
      },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        commissionRate: true,
        imageUrl: true,
        createdAt: true,
      },
    })

    return NextResponse.json(user)
  } catch (error: any) {
    console.error('Error al actualizar usuario:', error)
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
    // Primero eliminar todos los pagos asociados al usuario
    await prisma.payment.deleteMany({
      where: {
        barberId: params.id,
      },
    })

    // Luego eliminar el usuario
    await prisma.user.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json({ message: 'Usuario eliminado exitosamente' })
  } catch (error: any) {
    console.error('Error al eliminar usuario:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
