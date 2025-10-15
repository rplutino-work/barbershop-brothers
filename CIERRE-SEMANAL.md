# Sistema de Cierre Semanal Automático

## 📊 Características del Sistema

### 1. **Vista de Consulta en Tiempo Real**
- **Semana Actual**: Al entrar al panel, se muestra automáticamente la semana en curso (Lunes a Domingo)
- **Selector de Días**: Botones interactivos para ver los servicios de cada día específico
- **Grilla Detallada**: Muestra todos los servicios realizados con:
  - Hora del servicio
  - Barbero que lo realizó
  - Cliente atendido
  - Servicio realizado
  - Monto del servicio
  - Propina recibida (si aplica)
  - Método de pago (Transferencia/Efectivo/Tarjeta)
  - Total (monto + propina)

### 2. **Resumen Semanal por Barbero**
- Total de servicios realizados
- Ingresos totales generados
- Porcentaje de comisión del barbero
- Comisión a pagar (calculada automáticamente)
- Total de propinas recibidas
- **Total a pagar**: Comisión + Propinas

### 3. **Cierre Automático**
- **Cuándo**: Todos los domingos a las 23:59 hs
- **Qué hace**: 
  - Calcula automáticamente todos los totales de la semana
  - Guarda un registro del cierre semanal en la base de datos
  - Genera el detalle de pago para cada barbero
- **Estado**: Los cierres se marcan como "PENDING" (pendiente de pago)

## 🔄 Cómo Funciona

### Propinas
- **Transferencia**: Se solicita el monto de propina al registrar el pago
- **Efectivo**: Las propinas en efectivo NO se registran (el barbero las conserva directamente)
- **Tarjeta**: No hay propinas en pagos con tarjeta

### Cálculo de Comisiones
1. Se suma el total de ingresos por servicios del barbero
2. Se aplica el porcentaje de comisión del barbero
3. Se suman las propinas registradas (solo transferencias)
4. **Total a pagar = Comisión + Propinas**

### Ejemplo:
- Barbero con 50% de comisión
- Ingresos de la semana: $10,000
- Propinas: $500
- **Comisión**: $10,000 × 50% = $5,000
- **Total a pagar**: $5,000 + $500 = **$5,500**

## 📅 Uso del Panel

### Navegación
1. **Selector de Semana**: Puedes cambiar a semanas anteriores para consultar historial
2. **Selector de Día**: Click en cada día para ver el detalle de servicios
3. **Resumen General**: Cards superiores muestran totales de la semana completa
4. **Liquidación**: Tabla inferior con el detalle de pago por barbero

### Datos Visibles
- ✅ Información actualizada en tiempo real
- ✅ Consulta de semanas anteriores
- ✅ Detalle completo de cada servicio
- ✅ Totales automáticos por día y por barbero
- ✅ Distinción de métodos de pago

## 🚀 Configuración Técnica

### Cron Job en Vercel
El archivo `vercel.json` configura la tarea automática:
```json
{
  "crons": [
    {
      "path": "/api/weekly-closing/auto",
      "schedule": "59 23 * * 0"
    }
  ]
}
```

- **Schedule**: `59 23 * * 0` = Domingos a las 23:59
- **Endpoint**: `/api/weekly-closing/auto`

### API Endpoints
- `GET /api/weekly-closing?barberId={id}` - Consultar cierres de un barbero
- `GET /api/weekly-closing?weekStart={date}&weekEnd={date}` - Consultar cierres de una semana
- `POST /api/weekly-closing/auto` - Ejecutar cierre automático (llamado por cron)

## 📝 Notas Importantes

1. **Los datos están siempre disponibles**: No es necesario "cerrar" manualmente la semana para ver la información
2. **El cierre automático es informativo**: Registra el estado de la semana pero no bloquea consultas futuras
3. **Las propinas en efectivo no se rastrean**: El sistema solo registra propinas en transferencias
4. **Cada barbero tiene su propia comisión**: Se configura individualmente en la gestión de barberos

## 🔐 Seguridad

- Solo los administradores pueden acceder al panel de cierre semanal
- Los cierres automáticos se registran con timestamp para auditoría
- Los datos históricos se mantienen para consultas futuras

