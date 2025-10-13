#!/bin/bash

echo "🏪 Configurando Barbería Elite..."
echo ""

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor instala Node.js 18+ primero."
    exit 1
fi

# Verificar versión de Node.js
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Se requiere Node.js 18 o superior. Versión actual: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detectado"

# Instalar dependencias
echo ""
echo "📦 Instalando dependencias..."
npm install

# Crear archivo de entorno si no existe
if [ ! -f .env.local ]; then
    echo ""
    echo "🔧 Creando archivo de configuración..."
    cat > .env.local << EOF
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="barberia-elite-secret-key-$(date +%s)"
NEXTAUTH_URL="http://localhost:3000"
BARBERSHOP_NAME="Barbería Elite"
BARBERSHOP_LOGO="/logo.png"
EOF
    echo "✅ Archivo .env.local creado"
fi

# Configurar base de datos
echo ""
echo "🗄️ Configurando base de datos..."
npx prisma generate
npx prisma db push

# Poblar con datos de ejemplo
echo ""
echo "🌱 Poblando base de datos con datos de ejemplo..."
npx ts-node scripts/seed.ts

echo ""
echo "🎉 ¡Configuración completada!"
echo ""
echo "📋 Credenciales de acceso:"
echo "   👤 Admin: admin@barberia.com / admin123"
echo "   👥 Barberos: carlos@barberia.com / barber123"
echo ""
echo "🚀 Para iniciar el servidor:"
echo "   npm run dev"
echo ""
echo "🌐 Luego abre: http://localhost:3000"
echo ""
echo "📱 Para el panel de admin: http://localhost:3000/admin"
echo ""
echo "¡Disfruta tu nueva barbería! ✂️"

echo "🏪 Configurando Barbería Elite..."
echo ""

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor instala Node.js 18+ primero."
    exit 1
fi

# Verificar versión de Node.js
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Se requiere Node.js 18 o superior. Versión actual: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detectado"

# Instalar dependencias
echo ""
echo "📦 Instalando dependencias..."
npm install

# Crear archivo de entorno si no existe
if [ ! -f .env.local ]; then
    echo ""
    echo "🔧 Creando archivo de configuración..."
    cat > .env.local << EOF
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="barberia-elite-secret-key-$(date +%s)"
NEXTAUTH_URL="http://localhost:3000"
BARBERSHOP_NAME="Barbería Elite"
BARBERSHOP_LOGO="/logo.png"
EOF
    echo "✅ Archivo .env.local creado"
fi

# Configurar base de datos
echo ""
echo "🗄️ Configurando base de datos..."
npx prisma generate
npx prisma db push

# Poblar con datos de ejemplo
echo ""
echo "🌱 Poblando base de datos con datos de ejemplo..."
npx ts-node scripts/seed.ts

echo ""
echo "🎉 ¡Configuración completada!"
echo ""
echo "📋 Credenciales de acceso:"
echo "   👤 Admin: admin@barberia.com / admin123"
echo "   👥 Barberos: carlos@barberia.com / barber123"
echo ""
echo "🚀 Para iniciar el servidor:"
echo "   npm run dev"
echo ""
echo "🌐 Luego abre: http://localhost:3000"
echo ""
echo "📱 Para el panel de admin: http://localhost:3000/admin"
echo ""
echo "¡Disfruta tu nueva barbería! ✂️"