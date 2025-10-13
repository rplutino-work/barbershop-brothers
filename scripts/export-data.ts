const { PrismaClient } = require('@prisma/client')
const fs = require('fs')

const prisma = new PrismaClient()

async function exportData() {
  console.log('📦 Exportando datos de SQLite...')

  try {
    // Exportar Users
    const users = await prisma.user.findMany()
    console.log(`✅ Usuarios: ${users.length}`)

    // Exportar Services
    const services = await prisma.service.findMany()
    console.log(`✅ Servicios: ${services.length}`)

    // Exportar Clients
    const clients = await prisma.client.findMany()
    console.log(`✅ Clientes: ${clients.length}`)

    // Exportar Payments
    const payments = await prisma.payment.findMany()
    console.log(`✅ Pagos: ${payments.length}`)

    // Exportar Schedules
    const schedules = await prisma.barberSchedule.findMany()
    console.log(`✅ Horarios: ${schedules.length}`)

    // Exportar Appointments
    const appointments = await prisma.appointment.findMany()
    console.log(`✅ Citas: ${appointments.length}`)

    // Guardar todo en un archivo JSON
    const data = {
      users,
      services,
      clients,
      payments,
      schedules,
      appointments,
      exportDate: new Date().toISOString(),
    }

    fs.writeFileSync('data-backup.json', JSON.stringify(data, null, 2))
    console.log('\n✅ Datos exportados exitosamente a data-backup.json')
    console.log(`📊 Total de registros: ${users.length + services.length + clients.length + payments.length + schedules.length + appointments.length}`)
  } catch (error) {
    console.error('❌ Error al exportar datos:', error)
  } finally {
    await prisma.$disconnect()
  }
}

exportData()

