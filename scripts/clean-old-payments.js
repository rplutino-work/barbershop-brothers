const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('🧹 Limpiando pagos antiguos...\n')

  // Obtener todos los pagos
  const allPayments = await prisma.payment.findMany({
    include: {
      barber: true,
      service: true,
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  console.log(`📊 Total de pagos: ${allPayments.length}\n`)

  // Calcular inicio de hoy (hora local)
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)

  console.log(`📅 Fecha actual: ${now.toLocaleString('es-AR')}`)
  console.log(`📅 Inicio de hoy: ${startOfToday.toLocaleString('es-AR')}\n`)

  // Filtrar pagos de hoy vs anteriores
  const todayPayments = allPayments.filter(p => new Date(p.createdAt) >= startOfToday)
  const oldPayments = allPayments.filter(p => new Date(p.createdAt) < startOfToday)

  console.log(`✅ Pagos de HOY: ${todayPayments.length}`)
  todayPayments.forEach(p => {
    console.log(`  - ${new Date(p.createdAt).toLocaleString('es-AR')} | ${p.barber.name} | ${p.service.name} | $${p.amount}`)
  })

  console.log(`\n❌ Pagos ANTERIORES: ${oldPayments.length}`)
  oldPayments.forEach(p => {
    console.log(`  - ${new Date(p.createdAt).toLocaleString('es-AR')} | ${p.barber.name} | ${p.service.name} | $${p.amount}`)
  })

  // Preguntar si quiere eliminar los antiguos
  console.log(`\n⚠️  Para eliminar los pagos antiguos, descomenta la línea de eliminación en el script`)
  
  // DESCOMENTAR ESTA LÍNEA PARA ELIMINAR PAGOS ANTIGUOS:
  // const deleted = await prisma.payment.deleteMany({
  //   where: {
  //     createdAt: {
  //       lt: startOfToday
  //     }
  //   }
  // })
  // console.log(`\n🗑️  Eliminados: ${deleted.count} pagos antiguos`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

