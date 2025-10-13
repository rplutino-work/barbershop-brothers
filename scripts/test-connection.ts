const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testConnection() {
  console.log('🔍 Probando conexión a PostgreSQL...')
  console.log('')

  try {
    // Test 1: Contar usuarios
    const usersCount = await prisma.user.count()
    console.log(`✅ Usuarios en BD: ${usersCount}`)

    // Test 2: Contar servicios
    const servicesCount = await prisma.service.count()
    console.log(`✅ Servicios en BD: ${servicesCount}`)

    // Test 3: Contar clientes
    const clientsCount = await prisma.client.count()
    console.log(`✅ Clientes en BD: ${clientsCount}`)

    // Test 4: Contar pagos
    const paymentsCount = await prisma.payment.count()
    console.log(`✅ Pagos en BD: ${paymentsCount}`)

    // Test 5: Contar horarios
    const schedulesCount = await prisma.barberSchedule.count()
    console.log(`✅ Horarios en BD: ${schedulesCount}`)

    // Test 6: Obtener un usuario de prueba
    const testUser = await prisma.user.findFirst()
    console.log(`✅ Usuario de prueba: ${testUser?.name} (${testUser?.email})`)

    console.log('')
    console.log('✅ ¡CONEXIÓN A POSTGRESQL EXITOSA!')
    console.log('📊 Todos los datos están disponibles')
  } catch (error) {
    console.error('❌ Error al conectar:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()

