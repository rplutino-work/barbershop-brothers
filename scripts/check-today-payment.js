const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Verificando pagos de hoy...\n')

  // Obtener todos los pagos
  const allPayments = await prisma.payment.findMany({
    include: {
      barber: true,
      service: true,
      client: true,
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  console.log(`📊 Total de pagos en BD: ${allPayments.length}\n`)

  // Fecha actual
  const now = new Date()
  console.log(`📅 Fecha/Hora actual (local): ${now.toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })}`)
  console.log(`📅 Fecha/Hora actual (UTC): ${now.toISOString()}\n`)

  // Inicio de hoy en hora local
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
  console.log(`📅 Inicio de hoy (00:00): ${startOfToday.toLocaleString('es-AR')}`)
  console.log(`📅 Inicio de hoy (ISO): ${startOfToday.toISOString()}\n`)

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  // Mostrar TODOS los pagos con detalle
  allPayments.forEach((payment, index) => {
    const paymentDate = new Date(payment.createdAt)
    const isToday = paymentDate >= startOfToday

    console.log(`${isToday ? '✅' : '❌'} PAGO #${index + 1} ${isToday ? '(HOY)' : '(ANTERIOR)'}`)
    console.log(`   ID: ${payment.id}`)
    console.log(`   Barbero: ${payment.barber.name}`)
    console.log(`   Servicio: ${payment.service.name}`)
    console.log(`   Cliente: ${payment.client ? payment.client.name : 'Sin cliente'}`)
    console.log(`   Monto: $${payment.amount}`)
    console.log(`   Propina: $${payment.tip || 0}`)
    console.log(`   Método: ${payment.method}`)
    console.log(`   `)
    console.log(`   📅 FECHA GUARDADA (createdAt):`)
    console.log(`      UTC: ${payment.createdAt}`)
    console.log(`      Local: ${paymentDate.toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })}`)
    console.log(`   `)
    console.log(`   ⏱️  TIEMPOS DEL CRONÓMETRO:`)
    
    if (payment.serviceStartTime) {
      const startTime = new Date(payment.serviceStartTime)
      console.log(`      Inicio: ${startTime.toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })}`)
    } else {
      console.log(`      Inicio: ❌ NO REGISTRADO`)
    }
    
    if (payment.serviceEndTime) {
      const endTime = new Date(payment.serviceEndTime)
      console.log(`      Fin: ${endTime.toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })}`)
    } else {
      console.log(`      Fin: ❌ NO REGISTRADO`)
    }
    
    if (payment.serviceDuration) {
      const minutes = Math.floor(payment.serviceDuration / 60)
      const seconds = payment.serviceDuration % 60
      console.log(`      Duración: ${minutes}:${seconds.toString().padStart(2, '0')} (${payment.serviceDuration} segundos)`)
    } else {
      console.log(`      Duración: ❌ NO REGISTRADO`)
    }
    
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)
  })

  // Resumen
  const todayPayments = allPayments.filter(p => new Date(p.createdAt) >= startOfToday)
  const withTimesPayments = todayPayments.filter(p => p.serviceStartTime && p.serviceEndTime && p.serviceDuration)
  const withoutTimesPayments = todayPayments.filter(p => !p.serviceStartTime)

  console.log('\n📊 RESUMEN:')
  console.log(`   Total de pagos de HOY: ${todayPayments.length}`)
  console.log(`   ✅ Con tiempos del cronómetro: ${withTimesPayments.length}`)
  console.log(`   ❌ Sin tiempos del cronómetro: ${withoutTimesPayments.length}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

