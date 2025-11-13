const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('\n🔍 Verificando estadísticas de Valen...\n')

  // 1. Buscar barbero Valen
  const valen = await prisma.user.findFirst({
    where: {
      OR: [
        { name: { contains: 'valen', mode: 'insensitive' } },
        { name: { contains: 'Valen', mode: 'insensitive' } }
      ],
      role: 'BARBER'
    }
  })

  if (!valen) {
    console.log('❌ No se encontró barbero Valen')
    
    // Mostrar todos los barberos
    const allBarbers = await prisma.user.findMany({
      where: { role: 'BARBER' },
      select: { id: true, name: true, commissionRate: true }
    })
    
    console.log('\n📋 Barberos disponibles:')
    allBarbers.forEach(barber => {
      console.log(`- ${barber.name} (ID: ${barber.id}, Comisión: ${barber.commissionRate}%)`)
    })
    return
  }

  console.log('✅ Barbero encontrado:')
  console.log('ID:', valen.id)
  console.log('Nombre:', valen.name)
  console.log('Comisión:', valen.commissionRate + '%')

  // 2. Verificar pagos de Valen
  const now = new Date()
  const todayStr = now.toLocaleDateString('es-AR')
  
  const allPayments = await prisma.payment.findMany({
    where: {
      barberId: valen.id,
      status: 'COMPLETED'
    },
    select: {
      id: true,
      amount: true,
      tip: true,
      createdAt: true,
      barber: { select: { name: true, commissionRate: true } }
    },
    orderBy: { createdAt: 'desc' }
  })

  console.log('\n💰 Pagos de Valen (últimos 10):')
  allPayments.slice(0, 10).forEach(payment => {
    const paymentDate = new Date(payment.createdAt)
    const isToday = paymentDate.toLocaleDateString('es-AR') === todayStr
    
    const commission = payment.amount * (payment.barber.commissionRate / 100)
    const totalEarnings = commission + (payment.tip || 0)
    
    console.log(`- ${paymentDate.toLocaleString('es-AR')} | $${payment.amount} | Tip: $${payment.tip || 0} | Ganancia: $${totalEarnings.toFixed(0)} ${isToday ? '📅 HOY' : ''}`)
  })

  // 3. Filtrar pagos de hoy
  const todayPayments = allPayments.filter(p => {
    const paymentDate = new Date(p.createdAt)
    return paymentDate.toLocaleDateString('es-AR') === todayStr
  })

  console.log('\n📊 ESTADÍSTICAS DE HOY:')
  console.log('Pagos de hoy:', todayPayments.length)
  
  if (todayPayments.length > 0) {
    const todayEarnings = todayPayments.reduce((sum, p) => {
      const commission = p.amount * (p.barber.commissionRate / 100)
      const tip = p.tip || 0
      return sum + commission + tip
    }, 0)
    
    console.log('Ganancias de hoy: $' + todayEarnings.toFixed(0))
  } else {
    console.log('❌ No hay pagos de hoy')
  }

  // 4. Verificar semana actual
  const dayOfWeek = now.getDay()
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const monday = new Date(now)
  monday.setDate(now.getDate() + diff)
  monday.setHours(0, 0, 0, 0)

  const weekPayments = allPayments.filter(p => {
    const paymentDate = new Date(p.createdAt)
    return paymentDate >= monday
  })

  console.log('\n📊 ESTADÍSTICAS DE LA SEMANA:')
  console.log('Pagos de la semana:', weekPayments.length)
  
  if (weekPayments.length > 0) {
    const weekEarnings = weekPayments.reduce((sum, p) => {
      const commission = p.amount * (p.barber.commissionRate / 100)
      const tip = p.tip || 0
      return sum + commission + tip
    }, 0)
    
    console.log('Ganancias de la semana: $' + weekEarnings.toFixed(0))
  }

  // 5. Probar el endpoint de estadísticas
  console.log('\n🌐 Probando endpoint de estadísticas...')
  try {
    const response = await fetch(`http://localhost:3000/api/stats/barber/${valen.id}`)
    if (response.ok) {
      const stats = await response.json()
      console.log('✅ Respuesta del endpoint:')
      console.log('Today Earnings:', stats.todayEarnings)
      console.log('Week Earnings:', stats.weekEarnings)
      console.log('Today Services:', stats.todayServices)
      console.log('Week Services:', stats.weekServices)
    } else {
      console.log('❌ Error en endpoint:', response.status)
    }
  } catch (error) {
    console.log('❌ Error al llamar endpoint:', error.message)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
