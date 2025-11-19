# Guía de Configuración - Recuperación de Contraseña

## 📧 Sistema de Recuperación de Contraseña

Este sistema permite a los usuarios recuperar su contraseña de forma segura mediante correo electrónico.

## ✨ Características

- ✅ Tokens seguros con expiración de 1 hora
- ✅ Hash SHA-256 de tokens para seguridad
- ✅ Prevención de enumeración de emails
- ✅ Limpieza automática de tokens expirados
- ✅ Emails HTML profesionales con plantillas
- ✅ Interfaz amigable en español
- ✅ 100% Open Source (sin servicios pagos requeridos)

## 🚀 Configuración Rápida (Desarrollo)

### Opción 1: Sin Configuración (Ethereal - Recomendado para Pruebas)

El sistema automáticamente usa **Ethereal Email** si no configuras credenciales. Es perfecto para desarrollo y pruebas.

1. No necesitas configurar nada en el `.env`
2. Al ejecutar el backend, revisa los logs de consola
3. Verás una URL de preview como: `Preview URL: https://ethereal.email/message/xxx`
4. Abre esa URL para ver el email de recuperación

**Ventajas:**
- ✅ Cero configuración
- ✅ Totalmente gratis
- ✅ Ver emails sin cuenta
- ✅ Perfecto para testing

**Desventaja:**
- ❌ Los emails no llegan a usuarios reales (solo preview)

### Opción 2: Gmail SMTP (Producción/Testing Real)

Para enviar emails reales, puedes usar Gmail gratuitamente:

#### Paso 1: Crear App Password en Gmail

1. Ve a tu cuenta de Google: https://myaccount.google.com/
2. Seguridad → Verificación en dos pasos (actívala si no está)
3. Busca "Contraseñas de aplicaciones"
4. Crea una nueva para "Correo" → "Otro (nombre personalizado)" → "Catálogos SaaS"
5. Copia la contraseña de 16 caracteres (sin espacios)

#### Paso 2: Configurar Variables de Entorno

Edita tu archivo `backend/.env`:

```bash
# Email Configuration (Gmail)
EMAIL_SERVICE=gmail
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx  # App password de 16 caracteres
EMAIL_FROM="Catálogos SaaS <noreply@catalogos-saas.com>"

# Frontend URL (para enlaces en emails)
FRONTEND_URL=http://localhost:5173
```

#### Paso 3: Reiniciar Backend

```bash
cd backend
npm run start:dev
```

**Límites de Gmail:**
- 500 emails por día (gratis)
- 100 emails por hora
- Suficiente para desarrollo y pequeñas aplicaciones

### Opción 3: Otros Servicios SMTP Gratuitos

Puedes usar cualquier servicio SMTP. Algunos gratuitos:

#### SendGrid (100 emails/día gratis)
```bash
EMAIL_SERVICE=smtp
EMAIL_USER=apikey
EMAIL_PASSWORD=tu-api-key-aquí
```

#### Mailgun (5,000 emails/mes gratis primeros 3 meses)
```bash
EMAIL_SERVICE=smtp
EMAIL_USER=postmaster@tu-dominio.mailgun.org
EMAIL_PASSWORD=tu-password-mailgun
```

## 🔧 Endpoints API

### 1. Solicitar Recuperación de Contraseña

```bash
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "usuario@ejemplo.com"
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "If the email exists, a password reset link has been sent."
}
```

### 2. Verificar Token de Recuperación

```bash
POST /auth/verify-reset-token
Content-Type: application/json

{
  "token": "token-de-64-caracteres-aquí"
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Token is valid."
}
```

### 3. Restablecer Contraseña

```bash
POST /auth/reset-password
Content-Type: application/json

{
  "token": "token-de-64-caracteres-aquí",
  "newPassword": "nueva-contraseña-segura"
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Password has been reset successfully. You can now log in with your new password."
}
```

## 🖥️ Rutas Frontend

- `/forgot-password` - Solicitar recuperación de contraseña
- `/reset-password?token=xxx` - Restablecer contraseña con token
- `/login` - Login con enlace a "¿Olvidaste tu contraseña?"

## 🔒 Seguridad Implementada

1. **Tokens seguros**: Generados con crypto.randomBytes(32) = 64 caracteres hex
2. **Hash de tokens**: Almacenados como SHA-256 en base de datos
3. **Expiración**: Tokens expiran en 1 hora automáticamente
4. **Un solo uso**: Tokens se marcan como usados después de resetear
5. **Anti-enumeración**: Misma respuesta para emails existentes y no existentes
6. **Rate limiting**: Recomendado agregar en producción (max 3 intentos/hora)
7. **Limpieza automática**: Tokens expirados se eliminan de la BD

## 📊 Base de Datos

Nueva tabla `password_reset_tokens`:

```sql
CREATE TABLE password_reset_tokens (
  id SERIAL PRIMARY KEY,
  token VARCHAR(255) NOT NULL,        -- Hash SHA-256 del token
  userId INTEGER NOT NULL,             -- FK a users
  expiresAt TIMESTAMP NOT NULL,        -- Fecha de expiración
  used BOOLEAN DEFAULT false,          -- Si fue usado
  createdAt TIMESTAMP DEFAULT NOW()
);
```

TypeORM creará esta tabla automáticamente al iniciar la aplicación.

## 🧪 Testing del Sistema

### 1. Prueba con Ethereal (Sin configuración)

```bash
# 1. Iniciar backend
cd backend
npm run start:dev

# 2. Solicitar reset (usa Postman, cURL, o el frontend)
curl -X POST http://localhost:3000/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "test@ejemplo.com"}'

# 3. Revisar logs del backend para ver la URL de Ethereal
# Ejemplo: Preview URL: https://ethereal.email/message/xxx

# 4. Abrir la URL en navegador para ver el email
```

### 2. Prueba Completa con Frontend

```bash
# 1. Iniciar backend
cd backend
npm run start:dev

# 2. En otra terminal, iniciar frontend
cd frontend
npm run dev

# 3. Abrir http://localhost:5173/login
# 4. Click en "¿Olvidaste tu contraseña?"
# 5. Ingresar email
# 6. Revisar logs del backend para URL de Ethereal
# 7. Copiar token del email
# 8. Usar el enlace para resetear contraseña
```

## 🌐 Integración WhatsApp (Futuro)

El proyecto ya tiene integración de WhatsApp (ver `CONFIGURACION_WHATSAPP.md`). En el futuro se puede agregar:

```javascript
// Enviar código de recuperación por WhatsApp
const code = Math.floor(100000 + Math.random() * 900000); // 6 dígitos
await whatsappService.sendMessage(
  phoneNumber,
  `Tu código de recuperación es: ${code}\nExpira en 10 minutos.`
);
```

## 📝 Notas Importantes

1. **Producción**: En producción, usa un servicio SMTP profesional o configura tu propio servidor SMTP
2. **Variables de entorno**: Nunca commitees tu archivo `.env` con credenciales reales
3. **HTTPS**: En producción, asegúrate de usar HTTPS para todos los endpoints
4. **Rate Limiting**: Implementa rate limiting para prevenir abuso (ej: max 3 intentos/hora)
5. **Logs**: Los emails de recuperación se registran en los logs del backend

## 🐛 Troubleshooting

### "Failed to send email"

- Verifica que las credenciales en `.env` sean correctas
- Verifica que 2FA esté activo en Gmail y uses App Password
- Revisa los logs del backend para más detalles

### "Token inválido o expirado"

- Los tokens expiran en 1 hora
- Solicita uno nuevo desde `/forgot-password`

### No recibo el email

- Si usas Ethereal, revisa los logs del backend para la URL
- Si usas Gmail, revisa spam/correo no deseado
- Verifica que el email esté registrado en el sistema

## 📚 Archivos Modificados/Creados

### Backend
- ✅ `src/auth/password-reset-token.entity.ts` - Nueva entidad
- ✅ `src/auth/email.service.ts` - Servicio de emails
- ✅ `src/auth/auth.dto.ts` - Nuevos DTOs
- ✅ `src/auth/auth.service.ts` - Métodos de recuperación
- ✅ `src/auth/auth.controller.ts` - Nuevos endpoints
- ✅ `src/auth/auth.module.ts` - Configuración del módulo
- ✅ `src/users/users.service.ts` - Método updatePassword
- ✅ `.env.example` - Variables de email

### Frontend
- ✅ `src/components/auth/ForgotPassword.jsx` - Pantalla solicitar reset
- ✅ `src/components/auth/ResetPassword.jsx` - Pantalla resetear password
- ✅ `src/components/auth/LoginRole.jsx` - Enlace "Olvidé contraseña"
- ✅ `src/api/auth.js` - API calls
- ✅ `src/routes/Router.jsx` - Rutas nuevas

### Documentación
- ✅ `PASSWORD_RECOVERY_SETUP.md` - Esta guía

## 🎓 Para Entrega Universitaria

Este sistema cumple con los requisitos de:
- ✅ Seguridad (tokens seguros, hash, expiración)
- ✅ Usabilidad (interfaz amigable, mensajes claros)
- ✅ Open Source (sin costos, 100% código abierto)
- ✅ Profesionalismo (emails HTML, validaciones, manejo de errores)
- ✅ Documentación (guía completa de uso)

**Características técnicas destacables:**
- Arquitectura modular (NestJS + React)
- RESTful API design
- TypeScript/JavaScript moderno
- Validación de datos (class-validator)
- Base de datos relacional (PostgreSQL)
- ORM (TypeORM)
- Seguridad (bcrypt, JWT, tokens únicos)

¡Buena suerte con tu proyecto! 🚀
