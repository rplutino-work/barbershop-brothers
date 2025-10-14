# 📱 Cómo Usar la App en Tablet Android (PWA)

## ✅ El build fue exitoso - Todo listo para usar

---

## 🚀 Opción 1: PROBAR LOCALMENTE CON NGROK

### Paso 1: Iniciar el servidor
```bash
npm run dev
```

### Paso 2: En OTRA terminal, iniciar ngrok
```bash
ngrok http 3000
```

### Paso 3: Desde tu Tablet Android

1. **Abre Chrome** en tu tablet
2. **Ve a la URL de ngrok** (ej: https://1cd124a7d119.ngrok-free.app)
3. **Instalar como PWA:**
   - Toca el menú de Chrome (los 3 puntos arriba a la derecha)
   - Selecciona **"Agregar a pantalla de inicio"** o **"Instalar app"**
   - Toca **"Instalar"**
   - ¡Listo! Ahora tendrás un ícono en tu pantalla de inicio

4. **Usar en Pantalla Completa:**
   - Toca el ícono de la app en tu pantalla de inicio
   - Se abrirá en pantalla completa SIN la barra de Chrome
   - La pantalla NO se apagará mientras uses la app (Wake Lock activado)

---

## 🌐 Opción 2: DEPLOYAR EN VERCEL (RECOMENDADO)

Esto te permitirá acceder desde cualquier lugar sin ngrok.

### Deploy Rápido (5 minutos):

1. **Instalar Vercel CLI:**
```bash
npm i -g vercel
```

2. **Login en Vercel:**
```bash
vercel login
```

3. **Deploy:**
```bash
vercel --prod
```

4. **Cuando te pida variables de entorno, agrega:**
   - `DATABASE_URL`: 
     ```
     postgresql://neondb_owner:npg_szDo4eKCHnt8@ep-shiny-math-ad0p3q32-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
     ```
   
   - `NEXTAUTH_SECRET`: (genera uno con el comando que te dará)
     ```bash
     openssl rand -base64 32
     ```
   
   - `NEXTAUTH_URL`: (usa la URL que Vercel te dé, ej: https://barbershop.vercel.app)

5. **Una vez deployado:**
   - Vercel te dará una URL permanente (ej: `https://barbershop-xxx.vercel.app`)
   - Accede desde tu tablet
   - Instala como PWA (mismo proceso que arriba)

---

## 📲 Características de la PWA en Android

Cuando la instales como PWA, tendrás:

✅ **Pantalla Completa**
- Sin barra de dirección de Chrome
- Interfaz como app nativa
- Más espacio para trabajar

✅ **Pantalla Siempre Encendida**
- La pantalla NO se apagará mientras uses la app
- Perfecto para usar en el mostrador

✅ **Acceso Rápido**
- Ícono en la pantalla de inicio
- Abre directamente sin Chrome

✅ **Funciona Offline** (parcialmente)
- Cache básico de recursos
- Algunas funciones disponibles sin internet

---

## 🔧 Solución de Problemas

### Si no aparece la opción "Agregar a pantalla de inicio":

1. Asegúrate de estar usando **Chrome** (no otro navegador)
2. Verifica que estés usando **HTTPS** (ngrok lo hace automático)
3. Intenta recargar la página (Pull to refresh)
4. Busca un ícono de "+" o "instalar" en la barra de direcciones

### Si la pantalla se sigue apagando:

1. Ve a **Configuración** de Android
2. **Pantalla** → **Tiempo de espera**
3. Ponlo en **10 minutos** o más
4. O usa la app, que tiene Wake Lock activado automáticamente

---

## 🎯 Cómo Funciona en la Práctica

1. **Al abrir la app** (desde el ícono de inicio):
   - Se abre en pantalla completa
   - Sin barra de Chrome visible
   - La pantalla no se apagará

2. **Para salir**:
   - Usa el botón "Atrás" de Android
   - O desliza desde arriba para ver el botón de cerrar

3. **Para actualizar**:
   - Cierra la app completamente
   - Vuelve a abrirla
   - O recarga deslizando desde arriba

---

## ✨ PRUEBA AHORA

**CON NGROK (ya tienes ngrok corriendo):**
1. Asegúrate que `npm run dev` esté corriendo
2. Ve a https://1cd124a7d119.ngrok-free.app desde Chrome en tu tablet
3. Menú → "Agregar a pantalla de inicio"
4. ¡Listo!

**O DEPLOY EN VERCEL:**
Solo ejecuta: `vercel --prod`
Y sigue las instrucciones

