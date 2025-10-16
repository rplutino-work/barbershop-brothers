const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const nico = await prisma.user.findFirst({
    where: {
      name: {
        contains: 'Nico',
        mode: 'insensitive'
      }
    }
  })
  
  if (nico) {
    console.log('\n👤 Barbero Nico:')
    console.log('ID:', nico.id)
    console.log('Nombre:', nico.name)
    console.log('Email:', nico.email)
    console.log('ImageURL:', nico.imageUrl || '❌ NO TIENE IMAGEN')
    console.log('CommissionRate:', nico.commissionRate)
  } else {
    console.log('❌ No se encontró barbero Nico')
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

