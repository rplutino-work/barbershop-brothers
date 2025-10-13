# 🚀 Guía de Deploy - Barbería Elite

## ✅ Estado Actual
- ✅ Migrado a PostgreSQL (Neon)
- ✅ 68 registros migrados exitosamente
- ✅ Proyecto listo para deploy

## 📋 Deploy en Vercel (Opción Recomendada)

### Opción A: Deploy con Vercel CLI (MÁS RÁPIDO)

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
   vercel
   ```
   
   Responde a las preguntas:
   - Set up and deploy? → Y
   - Which scope? → Tu cuenta
   - Link to existing project? → N
   - Project name? → barbershop (o el que prefieras)
   - Directory? → ./
   - Override settings? → N

4. **Agregar variables de entorno:**
   ```bash
   vercel env add DATABASE_URL
   ```
   Pega: `postgresql://neondb_owner:npg_szDo4eKCHnt8@ep-shiny-math-ad0p3q32-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require`
   
   ```bash
   vercel env add NEXTAUTH_SECRET
   ```
   Genera uno con: `openssl rand -base64 32`
   
   ```bash
   vercel env add NEXTAUTH_URL
   ```
   Usa la URL que Vercel te dio (ej: `https://barbershop.vercel.app`)

5. **Redeploy con las variables:**
   ```bash
   vercel --prod
   ```

### Opción B: Deploy con GitHub

1. **Inicializar Git:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - PostgreSQL migration"
   git branch -M main
   ```

2. **Crear repo en GitHub:**
   - Ve a https://github.com/new
   - Crea el repositorio (sin README)
   - Copia el comando que te da GitHub

3. **Push:**
   ```bash
   git remote add origin https://github.com/TU-USUARIO/TU-REPO.git
   git push -u origin main
   ```

4. **Deploy en Vercel:**
   - Ve a https://vercel.com
   - Login con GitHub
   - "Add New" → "Project"
   - Importa tu repo
   - En "Environment Variables" agrega:
     - `DATABASE_URL` = `postgresql://neondb_owner:npg_szDo4eKCHnt8@ep-shiny-math-ad0p3q32-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require`
     - `NEXTAUTH_SECRET` = (genera uno con `openssl rand -base64 32`)
     - `NEXTAUTH_URL` = (dejar vacío por ahora)
   - Click "Deploy"

5. **Después del primer deploy:**
   - Copia la URL que Vercel te dio (ej: `https://barbershop.vercel.app`)
   - Ve a Settings → Environment Variables
   - Edita `NEXTAUTH_URL` y ponle tu URL completa
   - Ve a Deployments → Click en los 3 puntos del más reciente → "Redeploy"

## 🔑 Variables de Entorno Necesarias

```env
DATABASE_URL=postgresql://neondb_owner:npg_szDo4eKCHnt8@ep-shiny-math-ad0p3q32-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
NEXTAUTH_URL=https://tu-app.vercel.app
NEXTAUTH_SECRET=tu-secret-generado
```

## 📱 Después del Deploy

Tu app estará disponible en:
- `https://tu-proyecto.vercel.app` (o el nombre que hayas elegido)
- Podrás acceder desde cualquier dispositivo
- HTTPS automático
- ¡Todo funcionando!

## 🎯 Próximos Pasos

1. Prueba el login con: `admin@barberia.com` / `admin123`
2. Verifica que todos los datos están presentes
3. ¡Disfruta tu app en línea!

## ⚡ Deploy Instantáneo (Sin configurar nada)

Si quieres la opción MÁS rápida de todas:

```bash
npx vercel --prod
```

Sigue las instrucciones y al final te preguntará por las variables de entorno.
¡En 2 minutos estará online!

