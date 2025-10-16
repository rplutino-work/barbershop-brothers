import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: NextRequest) {
  try {
    console.log('📤 Iniciando upload de imagen a Cloudinary...')
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      console.error('❌ No se proporcionó archivo')
      return NextResponse.json(
        { error: 'No se proporcionó ningún archivo' },
        { status: 400 }
      )
    }

    console.log('📄 Archivo recibido:', file.name, 'Tipo:', file.type, 'Tamaño:', file.size)

    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
      console.error('❌ Archivo no es imagen:', file.type)
      return NextResponse.json(
        { error: 'El archivo debe ser una imagen' },
        { status: 400 }
      )
    }

    // Convertir el archivo a buffer y luego a base64
    console.log('🔄 Convirtiendo a buffer...')
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const dataURI = `data:${file.type};base64,${base64}`
    console.log('✅ Buffer y DataURI creados')

    // Subir a Cloudinary
    console.log('☁️ Subiendo a Cloudinary...')
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'barbershop/barbers',
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' },
        { quality: 'auto:good', fetch_format: 'auto' }
      ]
    })
    
    console.log('✅ Imagen subida a Cloudinary:', result.secure_url)

    return NextResponse.json({
      success: true,
      imageUrl: result.secure_url,
      publicId: result.public_id
    }, { status: 200 })
  } catch (error: any) {
    console.error('❌ Error detallado al subir imagen:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    })
    return NextResponse.json(
      { 
        error: 'Error al procesar la imagen',
        details: error.message,
        code: error.code 
      },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar imagen de Cloudinary
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const publicId = searchParams.get('publicId')

    if (!publicId) {
      return NextResponse.json(
        { error: 'No se proporcionó ID de imagen' },
        { status: 400 }
      )
    }

    // Eliminar de Cloudinary
    console.log('🗑️ Eliminando imagen de Cloudinary:', publicId)
    await cloudinary.uploader.destroy(publicId)
    console.log('✅ Imagen eliminada de Cloudinary')

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

