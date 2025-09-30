const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...')

  // Crear usuarios de ejemplo
  const adminPassword = await bcrypt.hash('admin123', 12)
  const barberPassword = await bcrypt.hash('barber123', 12)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@barberia.com' },
    update: {},
    create: {
      email: 'admin@barberia.com',
      name: 'Administrador',
      password: adminPassword,
      role: 'ADMIN',
    },
  })

  const barbers = await Promise.all([
    prisma.user.upsert({
      where: { email: 'carlos@barberia.com' },
      update: {},
      create: {
        email: 'carlos@barberia.com',
        name: 'Carlos',
        password: barberPassword,
        role: 'BARBER',
      },
    }),
    prisma.user.upsert({
      where: { email: 'miguel@barberia.com' },
      update: {},
      create: {
        email: 'miguel@barberia.com',
        name: 'Miguel',
        password: barberPassword,
        role: 'BARBER',
      },
    }),
    prisma.user.upsert({
      where: { email: 'ana@barberia.com' },
      update: {},
      create: {
        email: 'ana@barberia.com',
        name: 'Ana',
        password: barberPassword,
        role: 'BARBER',
      },
    }),
    prisma.user.upsert({
      where: { email: 'roberto@barberia.com' },
      update: {},
      create: {
        email: 'roberto@barberia.com',
        name: 'Roberto',
        password: barberPassword,
        role: 'BARBER',
      },
    }),
  ])

  // Crear servicios
  const services = await Promise.all([
    prisma.service.upsert({
      where: { id: 'corte-service' },
      update: {},
      create: {
        id: 'corte-service',
        name: 'Corte',
        price: 2500,
        duration: 30,
        description: 'Corte de cabello profesional',
      },
    }),
    prisma.service.upsert({
      where: { id: 'corte-barba-service' },
      update: {},
      create: {
        id: 'corte-barba-service',
        name: 'Corte y Barba',
        price: 3500,
        duration: 45,
        description: 'Corte de cabello y arreglo de barba',
      },
    }),
    prisma.service.upsert({
      where: { id: 'barba-service' },
      update: {},
      create: {
        id: 'barba-service',
        name: 'Barba',
        price: 1500,
        duration: 20,
        description: 'Arreglo y perfilado de barba',
      },
    }),
  ])

  // Crear clientes de ejemplo
  const clients = await Promise.all([
    prisma.client.upsert({
      where: { phone: '+5491173675464' },
      update: {},
      create: {
        name: 'Juan Pérez',
        phone: '+5491173675464',
      },
    }),
    prisma.client.upsert({
      where: { phone: '+5491156789012' },
      update: {},
      create: {
        name: 'María González',
        phone: '+5491156789012',
      },
    }),
    prisma.client.upsert({
      where: { phone: '+5491145678901' },
      update: {},
      create: {
        name: 'Carlos Rodríguez',
        phone: '+5491145678901',
      },
    }),
  ])

  // Crear barbería
  const barbershop = await prisma.barberShop.upsert({
    where: { id: 'main-barbershop' },
    update: {},
    create: {
      id: 'main-barbershop',
      name: 'Barbería Elite',
      address: 'Av. Principal 123, Ciudad',
      phone: '+54 9 11 1234-5678',
      email: 'info@barberiaelite.com',
    },
  })

  // Crear algunos pagos de ejemplo con fechas variadas
  const payments = await Promise.all([
    // Pagos de hoy
    prisma.payment.create({
      data: {
        barberId: barbers[0].id,
        serviceId: services[0].id,
        amount: services[0].price,
        method: 'CASH',
        status: 'COMPLETED',
        clientId: clients[0].id,
        createdAt: new Date(),
      },
    }),
    prisma.payment.create({
      data: {
        barberId: barbers[1].id,
        serviceId: services[1].id,
        amount: services[1].price,
        method: 'CARD',
        status: 'COMPLETED',
        clientId: clients[1].id,
        createdAt: new Date(),
      },
    }),
    // Pagos de ayer
    prisma.payment.create({
      data: {
        barberId: barbers[2].id,
        serviceId: services[2].id,
        amount: services[2].price,
        method: 'TRANSFER',
        status: 'COMPLETED',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
    }),
    prisma.payment.create({
      data: {
        barberId: barbers[0].id,
        serviceId: services[1].id,
        amount: services[1].price,
        method: 'CASH',
        status: 'COMPLETED',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
    }),
    // Pagos de la semana pasada
    prisma.payment.create({
      data: {
        barberId: barbers[1].id,
        serviceId: services[0].id,
        amount: services[0].price,
        method: 'CARD',
        status: 'COMPLETED',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.payment.create({
      data: {
        barberId: barbers[3].id,
        serviceId: services[2].id,
        amount: services[2].price,
        method: 'TRANSFER',
        status: 'COMPLETED',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
    }),
  ])

  console.log('✅ Seed completado exitosamente!')
  console.log(`👤 Admin creado: ${admin.email}`)
  console.log(`👥 Barberos creados: ${barbers.length}`)
  console.log(`✂️ Servicios creados: ${services.length}`)
  console.log(`👤 Clientes creados: ${clients.length}`)
  console.log(`💰 Pagos de ejemplo: ${payments.length}`)
  console.log(`🏪 Barbería: ${barbershop.name}`)
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })