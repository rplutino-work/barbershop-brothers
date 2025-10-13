const { PrismaClient } = require('@prisma/client')
const fs = require('fs')

const prisma = new PrismaClient()

async function importData() {
  console.log('📥 Importando datos a PostgreSQL...')

  try {
    // Leer el archivo de backup
    const data = JSON.parse(fs.readFileSync('data-backup.json', 'utf-8'))
    
    console.log(`📦 Datos a importar:`)
    console.log(`   - Usuarios: ${data.users.length}`)
    console.log(`   - Servicios: ${data.services.length}`)
    console.log(`   - Clientes: ${data.clients.length}`)
    console.log(`   - Pagos: ${data.payments.length}`)
    console.log(`   - Horarios: ${data.schedules.length}`)
    console.log(`   - Citas: ${data.appointments.length}`)
    console.log('')

    // Importar Users
    console.log('1️⃣  Importando usuarios...')
    for (const user of data.users) {
      await prisma.user.create({
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          password: user.password,
          role: user.role,
          commissionRate: user.commissionRate,
          createdAt: new Date(user.createdAt),
          updatedAt: new Date(user.updatedAt),
        },
      })
    }
    console.log(`   ✅ ${data.users.length} usuarios importados`)

    // Importar Services
    console.log('2️⃣  Importando servicios...')
    for (const service of data.services) {
      await prisma.service.create({
        data: {
          id: service.id,
          name: service.name,
          price: service.price,
          duration: service.duration,
          description: service.description,
          isActive: service.isActive,
          createdAt: new Date(service.createdAt),
          updatedAt: new Date(service.updatedAt),
        },
      })
    }
    console.log(`   ✅ ${data.services.length} servicios importados`)

    // Importar Clients
    console.log('3️⃣  Importando clientes...')
    for (const client of data.clients) {
      await prisma.client.create({
        data: {
          id: client.id,
          name: client.name,
          phone: client.phone,
          createdAt: new Date(client.createdAt),
          updatedAt: new Date(client.updatedAt),
        },
      })
    }
    console.log(`   ✅ ${data.clients.length} clientes importados`)

    // Importar Payments
    console.log('4️⃣  Importando pagos...')
    for (const payment of data.payments) {
      await prisma.payment.create({
        data: {
          id: payment.id,
          barberId: payment.barberId,
          serviceId: payment.serviceId,
          clientId: payment.clientId,
          amount: payment.amount,
          method: payment.method,
          status: payment.status,
          createdAt: new Date(payment.createdAt),
          updatedAt: new Date(payment.updatedAt),
        },
      })
    }
    console.log(`   ✅ ${data.payments.length} pagos importados`)

    // Importar Schedules
    console.log('5️⃣  Importando horarios...')
    for (const schedule of data.schedules) {
      await prisma.barberSchedule.create({
        data: {
          id: schedule.id,
          barberId: schedule.barberId,
          dayOfWeek: schedule.dayOfWeek,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          isActive: schedule.isActive,
          createdAt: new Date(schedule.createdAt),
          updatedAt: new Date(schedule.updatedAt),
        },
      })
    }
    console.log(`   ✅ ${data.schedules.length} horarios importados`)

    // Importar Appointments (si hay)
    if (data.appointments && data.appointments.length > 0) {
      console.log('6️⃣  Importando citas...')
      for (const appointment of data.appointments) {
        await prisma.appointment.create({
          data: {
            id: appointment.id,
            clientName: appointment.clientName,
            clientPhone: appointment.clientPhone,
            barberId: appointment.barberId,
            serviceId: appointment.serviceId,
            date: new Date(appointment.date),
            status: appointment.status,
            notes: appointment.notes,
            createdAt: new Date(appointment.createdAt),
            updatedAt: new Date(appointment.updatedAt),
          },
        })
      }
      console.log(`   ✅ ${data.appointments.length} citas importadas`)
    }

    console.log('')
    console.log('✅ ¡MIGRACIÓN COMPLETADA EXITOSAMENTE!')
    console.log(`📊 Total de registros importados: ${data.users.length + data.services.length + data.clients.length + data.payments.length + data.schedules.length + (data.appointments?.length || 0)}`)
  } catch (error) {
    console.error('❌ Error al importar datos:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

importData()

