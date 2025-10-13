# 🏪 Barbería Elite - Sistema de Gestión

Sistema completo de gestión para barberías desarrollado con Next.js 14, TypeScript, Prisma y SQLite.

## ✨ Características

- **Protector de Pantalla**: Interfaz elegante que se activa al tocar la pantalla
- **Flujo de Checkout**: Sistema intuitivo para registrar servicios con barberos, servicios y métodos de pago
- **Panel de Administración**: Gestión completa de barberos, servicios y visualización de estadísticas
- **Dashboard**: Estadísticas en tiempo real de ingresos y actividad
- **Base de Datos Integrada**: SQLite con Prisma ORM
- **Autenticación**: Sistema de login con roles (Admin/Barbero)
- **Diseño Responsivo**: Optimizado para tablets y dispositivos táctiles

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js 18+ 
- npm o yarn

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <tu-repositorio>
   cd barbershop
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env.local
   ```
   
   Edita `.env.local` con tus configuraciones:
   ```env
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_SECRET="tu-clave-secreta-aqui"
   NEXTAUTH_URL="http://localhost:3000"
   BARBERSHOP_NAME="Tu Barbería"
   BARBERSHOP_LOGO="/logo.png"
   ```

4. **Configurar la base de datos**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Poblar la base de datos con datos de ejemplo**
   ```bash
   npx ts-node scripts/seed.ts
   ```

6. **Iniciar el servidor de desarrollo**
   ```bash
   npm run dev
   ```

7. **Abrir en el navegador**
   ```
   http://localhost:3000
   ```

## 🔑 Credenciales por Defecto

### Administrador
- **Email**: admin@barberia.com
- **Contraseña**: admin123

### Barberos
- **Email**: carlos@barberia.com
- **Contraseña**: barber123
- **Email**: miguel@barberia.com
- **Contraseña**: barber123
- **Email**: ana@barberia.com
- **Contraseña**: barber123
- **Email**: roberto@barberia.com
- **Contraseña**: barber123

## 📱 Uso del Sistema

### Para Barberos

1. **Acceso Principal**: Toca la pantalla del protector para acceder
2. **Selección de Barbero**: Elige tu nombre de la lista
3. **Selección de Servicio**: Selecciona el servicio realizado (Corte, Corte y Barba, Barba)
4. **Método de Pago**: Elige cómo se pagó (Efectivo, Tarjeta, Transferencia)
5. **Confirmación**: El sistema registra automáticamente el servicio

### Para Administradores

1. **Login**: Accede con las credenciales de administrador
2. **Dashboard**: Visualiza estadísticas generales
3. **Gestión de Barberos**: Agrega, edita o elimina barberos
4. **Gestión de Servicios**: Administra servicios y precios
5. **Historial de Pagos**: Revisa todos los servicios registrados

## 🛠️ Estructura del Proyecto

```
barbershop/
├── app/                    # App Router de Next.js
│   ├── admin/             # Panel de administración
│   ├── api/               # API routes
│   ├── login/             # Página de login
│   └── page.tsx           # Página principal
├── components/            # Componentes React
│   ├── admin/             # Componentes del panel admin
│   ├── ScreenSaver.tsx    # Protector de pantalla
│   ├── CheckoutFlow.tsx   # Flujo de checkout
│   └── ...
├── lib/                   # Utilidades y configuración
│   ├── prisma.ts          # Cliente de Prisma
│   └── auth.ts            # Configuración de NextAuth
├── prisma/                # Esquema de base de datos
├── scripts/               # Scripts de utilidad
└── public/                # Archivos estáticos
```

## 🗄️ Base de Datos

El sistema utiliza SQLite con Prisma ORM y incluye las siguientes entidades:

- **User**: Barberos y administradores
- **Service**: Servicios disponibles
- **Payment**: Registro de pagos
- **Session**: Sesiones de usuario
- **BarberShop**: Información de la barbería

## 🎨 Tecnologías Utilizadas

- **Next.js 14**: Framework de React
- **TypeScript**: Tipado estático
- **Prisma**: ORM para base de datos
- **SQLite**: Base de datos
- **NextAuth.js**: Autenticación
- **Tailwind CSS**: Estilos
- **Framer Motion**: Animaciones
- **Lucide React**: Iconos

## 📊 Características del Dashboard

- Ingresos totales y del día
- Cantidad de barberos activos
- Servicios disponibles
- Actividad reciente
- Filtros por período (hoy, semana, mes)

## 🔧 Scripts Disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run start        # Servidor de producción
npm run lint         # Linter
npm run db:generate  # Generar cliente Prisma
npm run db:push      # Sincronizar esquema
npm run db:migrate   # Crear migración
npm run db:studio    # Abrir Prisma Studio
```

## 🚀 Despliegue

Para desplegar en producción:

1. Configura las variables de entorno de producción
2. Ejecuta `npm run build`
3. Ejecuta `npm run start`
4. Configura tu base de datos de producción
5. Ejecuta las migraciones necesarias

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

Si tienes alguna pregunta o necesitas ayuda, puedes:

- Crear un issue en GitHub
- Contactar al equipo de desarrollo
- Revisar la documentación de las tecnologías utilizadas

---

Desarrollado con ❤️ para barberías modernas.

Sistema completo de gestión para barberías desarrollado con Next.js 14, TypeScript, Prisma y SQLite.

## ✨ Características

- **Protector de Pantalla**: Interfaz elegante que se activa al tocar la pantalla
- **Flujo de Checkout**: Sistema intuitivo para registrar servicios con barberos, servicios y métodos de pago
- **Panel de Administración**: Gestión completa de barberos, servicios y visualización de estadísticas
- **Dashboard**: Estadísticas en tiempo real de ingresos y actividad
- **Base de Datos Integrada**: SQLite con Prisma ORM
- **Autenticación**: Sistema de login con roles (Admin/Barbero)
- **Diseño Responsivo**: Optimizado para tablets y dispositivos táctiles

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js 18+ 
- npm o yarn

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <tu-repositorio>
   cd barbershop
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env.local
   ```
   
   Edita `.env.local` con tus configuraciones:
   ```env
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_SECRET="tu-clave-secreta-aqui"
   NEXTAUTH_URL="http://localhost:3000"
   BARBERSHOP_NAME="Tu Barbería"
   BARBERSHOP_LOGO="/logo.png"
   ```

4. **Configurar la base de datos**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Poblar la base de datos con datos de ejemplo**
   ```bash
   npx ts-node scripts/seed.ts
   ```

6. **Iniciar el servidor de desarrollo**
   ```bash
   npm run dev
   ```

7. **Abrir en el navegador**
   ```
   http://localhost:3000
   ```

## 🔑 Credenciales por Defecto

### Administrador
- **Email**: admin@barberia.com
- **Contraseña**: admin123

### Barberos
- **Email**: carlos@barberia.com
- **Contraseña**: barber123
- **Email**: miguel@barberia.com
- **Contraseña**: barber123
- **Email**: ana@barberia.com
- **Contraseña**: barber123
- **Email**: roberto@barberia.com
- **Contraseña**: barber123

## 📱 Uso del Sistema

### Para Barberos

1. **Acceso Principal**: Toca la pantalla del protector para acceder
2. **Selección de Barbero**: Elige tu nombre de la lista
3. **Selección de Servicio**: Selecciona el servicio realizado (Corte, Corte y Barba, Barba)
4. **Método de Pago**: Elige cómo se pagó (Efectivo, Tarjeta, Transferencia)
5. **Confirmación**: El sistema registra automáticamente el servicio

### Para Administradores

1. **Login**: Accede con las credenciales de administrador
2. **Dashboard**: Visualiza estadísticas generales
3. **Gestión de Barberos**: Agrega, edita o elimina barberos
4. **Gestión de Servicios**: Administra servicios y precios
5. **Historial de Pagos**: Revisa todos los servicios registrados

## 🛠️ Estructura del Proyecto

```
barbershop/
├── app/                    # App Router de Next.js
│   ├── admin/             # Panel de administración
│   ├── api/               # API routes
│   ├── login/             # Página de login
│   └── page.tsx           # Página principal
├── components/            # Componentes React
│   ├── admin/             # Componentes del panel admin
│   ├── ScreenSaver.tsx    # Protector de pantalla
│   ├── CheckoutFlow.tsx   # Flujo de checkout
│   └── ...
├── lib/                   # Utilidades y configuración
│   ├── prisma.ts          # Cliente de Prisma
│   └── auth.ts            # Configuración de NextAuth
├── prisma/                # Esquema de base de datos
├── scripts/               # Scripts de utilidad
└── public/                # Archivos estáticos
```

## 🗄️ Base de Datos

El sistema utiliza SQLite con Prisma ORM y incluye las siguientes entidades:

- **User**: Barberos y administradores
- **Service**: Servicios disponibles
- **Payment**: Registro de pagos
- **Session**: Sesiones de usuario
- **BarberShop**: Información de la barbería

## 🎨 Tecnologías Utilizadas

- **Next.js 14**: Framework de React
- **TypeScript**: Tipado estático
- **Prisma**: ORM para base de datos
- **SQLite**: Base de datos
- **NextAuth.js**: Autenticación
- **Tailwind CSS**: Estilos
- **Framer Motion**: Animaciones
- **Lucide React**: Iconos

## 📊 Características del Dashboard

- Ingresos totales y del día
- Cantidad de barberos activos
- Servicios disponibles
- Actividad reciente
- Filtros por período (hoy, semana, mes)

## 🔧 Scripts Disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run start        # Servidor de producción
npm run lint         # Linter
npm run db:generate  # Generar cliente Prisma
npm run db:push      # Sincronizar esquema
npm run db:migrate   # Crear migración
npm run db:studio    # Abrir Prisma Studio
```

## 🚀 Despliegue

Para desplegar en producción:

1. Configura las variables de entorno de producción
2. Ejecuta `npm run build`
3. Ejecuta `npm run start`
4. Configura tu base de datos de producción
5. Ejecuta las migraciones necesarias

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

Si tienes alguna pregunta o necesitas ayuda, puedes:

- Crear un issue en GitHub
- Contactar al equipo de desarrollo
- Revisar la documentación de las tecnologías utilizadas

---

Desarrollado con ❤️ para barberías modernas.