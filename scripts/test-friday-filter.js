const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('\n🔍 Probando filtro para el viernes 17/10/2025...\n')

  // Simular que estamos en el viernes 17/10/2025
  const friday = new Date('2025-10-17T12:00:00-03:00') // Viernes 17/10/2025 12:00 AR
  const fridayStr = friday.toLocaleDateString('es-AR')
  
  console.log('📅 Fecha del viernes:', friday.toISOString())
  console.log('📅 Fecha del viernes (AR):', fridayStr)
  
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
    orderBy: { createdAt: 'desc' }
  })
  
  console.log('\n💰 Pagos de Valen:')
  allPayments.slice(0, 15).forEach((payment, index) => {
    const paymentDate = new Date(payment.createdAt)
    const paymentStr = paymentDate.toLocaleDateString('es-AR')
    const isFriday = paymentStr === fridayStr
    
    console.log(`${index + 1}. ${paymentDate.toLocaleString('es-AR')} | ${paymentStr} | $${payment.amount} | ${isFriday ? '✅ VIERNES' : '❌'}`)
  })
  
  // Filtrar pagos del viernes
  const fridayPayments = allPayments.filter(p => {
    const paymentDate = new Date(p.createdAt)
    const paymentStr = paymentDate.toLocaleDateString('es-AR')
    return paymentStr === fridayStr
  })
  
  console.log(`\n📊 Pagos del viernes encontrados: ${fridayPayments.length}`)
  
  if (fridayPayments.length > 0) {
    const fridayEarnings = fridayPayments.reduce((sum, p) => {
      const commission = p.amount * (valen.commissionRate / 100)
      const tip = p.tip || 0
      return sum + commission + tip
    }, 0)
    console.log(`💰 Ganancias del viernes: $${fridayEarnings.toFixed(0)}`)
    
    console.log('\n📋 Detalle de pagos del viernes:')
    fridayPayments.forEach((p, i) => {
      const commission = p.amount * (valen.commissionRate / 100)
      const tip = p.tip || 0
      const total = commission + tip
      console.log(`${i + 1}. $${p.amount} -> Comisión: $${commission.toFixed(0)} + Tip: $${tip} = $${total.toFixed(0)}`)
    })
  }
  
  // También probar la semana del viernes
  const dayOfWeek = friday.getDay() // 5 = viernes
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const monday = new Date(friday)
  monday.setDate(friday.getDate() + diff)
  monday.setHours(0, 0, 0, 0)
  
  const weekPayments = allPayments.filter(p => {
    const paymentDate = new Date(p.createdAt)
    return paymentDate >= monday
  })
  
  console.log(`\n📊 Pagos de la semana (lunes a domingo): ${weekPayments.length}`)
  
  if (weekPayments.length > 0) {
    const weekEarnings = weekPayments.reduce((sum, p) => {
      const commission = p.amount * (valen.commissionRate / 100)
      const tip = p.tip || 0
      return sum + commission + tip
    }, 0)
    console.log(`💰 Ganancias de la semana: $${weekEarnings.toFixed(0)}`)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
