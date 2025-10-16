const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('\n🔍 Verificando último pago...\n')

  // Obtener el pago más reciente
  const latestPayment = await prisma.payment.findFirst({
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      barber: true,
      service: true,
      client: true
    }
  })

  if (latestPayment) {
    const paymentDate = new Date(latestPayment.createdAt)
    
    console.log('📋 ÚLTIMO PAGO:')
    console.log('ID:', latestPayment.id)
    console.log('Barbero:', latestPayment.barber.name)
    console.log('Servicio:', latestPayment.service.name)
    console.log('Cliente:', latestPayment.client?.name || 'Sin cliente')
    console.log('Monto:', '$' + latestPayment.amount)
    console.log('Método:', latestPayment.method)
    console.log('')
    console.log('📅 FECHA Y HORA:')
    console.log('UTC guardado:', latestPayment.createdAt)
    console.log('Hora local (AR):', paymentDate.toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' }))
    console.log('Fecha string (AR):', paymentDate.toLocaleDateString('es-AR'))
    console.log('')
    
    // Verificar fecha de hoy
    const now = new Date()
    const todayStr = now.toLocaleDateString('es-AR')
    const paymentStr = paymentDate.toLocaleDateString('es-AR')
    
    console.log('📊 COMPARACIÓN:')
    console.log('Hoy:', todayStr)
    console.log('Pago:', paymentStr)
    console.log('¿Es de hoy?:', todayStr === paymentStr ? '✅ SÍ' : '❌ NO')
    
    // Calcular semana actual
    const dayOfWeek = now.getDay()
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    const monday = new Date(now)
    monday.setDate(now.getDate() + diff)
    monday.setHours(0, 0, 0, 0)
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    sunday.setHours(23, 59, 59, 999)
    
    console.log('')
    console.log('📅 SEMANA ACTUAL:')
    console.log('Lunes:', monday.toLocaleDateString('es-AR'))
    console.log('Domingo:', sunday.toLocaleDateString('es-AR'))
    console.log('¿Está en la semana?:', paymentDate >= monday && paymentDate <= sunday ? '✅ SÍ' : '❌ NO')
  } else {
    console.log('❌ No hay pagos en la base de datos')
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
