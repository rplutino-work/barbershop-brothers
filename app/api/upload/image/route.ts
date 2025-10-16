import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No se proporcionó ningún archivo' },
        { status: 400 }
      )
    }

    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'El archivo debe ser una imagen' },
        { status: 400 }
      )
    }

    // Convertir el archivo a buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Crear directorio si no existe
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'barbers')
    await mkdir(uploadsDir, { recursive: true })

    // Generar nombre único
    const timestamp = Date.now()
    const fileName = `barber-${timestamp}.webp`
    const filePath = path.join(uploadsDir, fileName)

    // Comprimir y optimizar la imagen con sharp
    await sharp(buffer)
      .resize(400, 400, { 
        fit: 'cover',
        position: 'center'
      })
      .webp({ 
        quality: 80,
        effort: 6
      })
      .toFile(filePath)

    // Retornar la URL relativa
    const imageUrl = `/uploads/barbers/${fileName}`

    return NextResponse.json({
      success: true,
      imageUrl,
    }, { status: 200 })
  } catch (error: any) {
    console.error('Error al subir imagen:', error)
    return NextResponse.json(
      { error: 'Error al procesar la imagen' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar imagen (opcional, para cuando se cambie la imagen)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get('imageUrl')

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'No se proporcionó URL de imagen' },
        { status: 400 }
      )
    }

    // Solo eliminar si es una imagen de uploads/barbers
    if (!imageUrl.startsWith('/uploads/barbers/')) {
      return NextResponse.json(
        { error: 'URL de imagen inválida' },
        { status: 400 }
      )
    }

    const filePath = path.join(process.cwd(), 'public', imageUrl)
    
    // Intentar eliminar el archivo (no falla si no existe)
    try {
      const fs = require('fs')
      fs.unlinkSync(filePath)
    } catch (err) {
      // Archivo no existe o no se pudo eliminar
      console.log('Archivo no encontrado o no se pudo eliminar:', filePath)
    }

    return NextResponse.json({
      success: true,
      message: 'Imagen eliminada'
    })
  } catch (error: any) {
    console.error('Error al eliminar imagen:', error)
    return NextResponse.json(
      { error: 'Error al eliminar imagen' },
      { status: 500 }
    )
  }
}

