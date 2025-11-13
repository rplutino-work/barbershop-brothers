const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('\n🔍 Probando filtro de fecha de hoy...\n')

  // Configurar zona horaria de Argentina
  const now = new Date()
  const todayStr = now.toLocaleDateString('es-AR')
  
  console.log('📅 Fecha actual:', now.toISOString())
  console.log('📅 Fecha de hoy (AR):', todayStr)
  
  // Buscar pagos de Valen
  const valen = await prisma.user.findFirst({
    where: { name: 'Valen', role: 'BARBER' }
  })
  
  if (!valen) {
    console.log('❌ Valen no encontrado')
    return
  }
  
  // Obtener todos los pagos de Valen
  const allPayments = await prisma.payment.findMany({
    where: {
      barberId: valen.id,
      status: 'COMPLETED'
    },
    select: {
      id: true,
      amount: true,
      tip: true,
      createdAt: true
    },
    orderBy: { createdAt: 'desc' },
    take: 10
  })
  
  console.log('\n💰 Últimos 10 pagos de Valen:')
  allPayments.forEach((payment, index) => {
    const paymentDate = new Date(payment.createdAt)
    const paymentStr = paymentDate.toLocaleDateString('es-AR')
    const isToday = paymentStr === todayStr
    
    console.log(`${index + 1}. ${paymentDate.toLocaleString('es-AR')} | ${paymentStr} | $${payment.amount} | ${isToday ? '✅ HOY' : '❌'}`)
  })
  
  // Filtrar pagos de hoy
  const todayPayments = allPayments.filter(p => {
    const paymentDate = new Date(p.createdAt)
    const paymentStr = paymentDate.toLocaleDateString('es-AR')
    return paymentStr === todayStr
  })
  
  console.log(`\n📊 Pagos de hoy encontrados: ${todayPayments.length}`)
  
  if (todayPayments.length > 0) {
    const todayEarnings = todayPayments.reduce((sum, p) => {
      const commission = p.amount * (valen.commissionRate / 100)
      const tip = p.tip || 0
      return sum + commission + tip
    }, 0)
    console.log(`💰 Ganancias de hoy: $${todayEarnings.toFixed(0)}`)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
