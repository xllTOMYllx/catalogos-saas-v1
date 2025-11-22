# Guía de Autenticación y Gestión de Catálogos - Implementación Completa

## 📋 Resumen de Cambios

Este documento detalla las mejoras implementadas en el sistema de autenticación y gestión de catálogos basadas en los requerimientos especificados.

## ✅ Problemas Resueltos

### 1. Sistema de Autenticación Completo

**Antes:**
- Solo se pedía email y nombre del negocio
- No había contraseñas
- No se podía volver a iniciar sesión después de cerrar

**Ahora:**
- ✅ Registro requiere: nombre completo, email, contraseña (mínimo 6 caracteres), nombre del negocio, teléfono (opcional)
- ✅ Contraseñas encriptadas con bcrypt (10 salt rounds)
- ✅ Tokens JWT para sesiones (7 días de expiración)
- ✅ Panel de login separado para clientes existentes
- ✅ Clientes pueden volver a acceder después de cerrar sesión

### 2. Campos de Base de Datos Alineados

**Antes:**
- Campos `direccion` y `descripcion` existían en la BD pero no en el formulario

**Ahora:**
- ✅ Formulario de personalización incluye todos los campos:
  - Nombre del negocio
  - Logo (subida de imagen)
  - Color de marca
  - Teléfono
  - **Dirección** (nuevo en UI)
  - **Descripción** (nuevo en UI)
- ✅ Vista previa en tiempo real de todos los campos

### 3. Gestión de Sesiones Mejorada

**Antes:**
- Al cerrar sesión, se activaba automáticamente la sesión "UrbanStreet"
- Datos no se cargaban correctamente al navegar

**Ahora:**
- ✅ Logout limpia completamente: authToken, user, role, clientId, userId, admin-storage
- ✅ Después del logout, se muestra el catálogo por defecto en modo lectura
- ✅ Datos del catálogo se cargan correctamente al navegar entre páginas
- ✅ Validación de IDs para prevenir errores

## 🏗️ Arquitectura Implementada

### Backend (NestJS)

#### Endpoint de Registro
```typescript
POST /auth/register
Content-Type: application/json

{
  "email": "cliente@example.com",
  "password": "micontraseña123",
  "nombre": "Juan Pérez",
  "businessName": "Mi Tienda",
  "telefono": "5551234567"
}

Response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 2,
    "email": "cliente@example.com",
    "role": "client",
    "nombre": "Juan Pérez"
  },
  "client": {
    "id": 2,
    "nombre": "Mi Tienda",
    "logo": "/logosinfondo.png",
    "color": "#f24427",
    "telefono": "5551234567"
  }
}
```

#### Endpoint de Login
```typescript
POST /auth/login
Content-Type: application/json

{
  "email": "cliente@example.com",
  "password": "micontraseña123"
}

Response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 2,
    "email": "cliente@example.com",
    "role": "client",
    "nombre": "Juan Pérez"
  },
  "client": {
    "id": 2,
    "nombre": "Mi Tienda",
    "logo": "/logosinfondo.png",
    "color": "#f24427",
    "telefono": "5551234567"
  }
}
```

#### Características de Seguridad
- ✅ Contraseñas hasheadas con bcrypt (10 rounds)
- ✅ JWT tokens firmados con secret key
- ✅ Validación de datos con class-validator
- ✅ Soporte para contraseñas legacy (compatibilidad hacia atrás)

### Frontend (React + Vite)

#### Componente LoginRole
El componente ahora tiene tres modos:

1. **Selección de Rol** (pantalla inicial)
   - Crear Mi Cuenta (Cliente Nuevo)
   - Iniciar Sesión (Cliente Existente)
   - Soy Usuario: Explorar Catálogos

2. **Registro** (modo 'register')
   - Campos: nombre completo, email, contraseña, nombre del negocio, teléfono
   - Validación: contraseña mínimo 6 caracteres
   - Al completar: crea usuario + cliente, guarda token, redirige a admin

3. **Login** (modo 'login')
   - Campos: email, contraseña
   - Al completar: valida credenciales, carga catálogo, redirige a admin

#### Flujo de Autenticación

```javascript
// 1. Usuario se registra
authApi.register(email, password, nombre, businessName, telefono)

// 2. Backend crea usuario y cliente
// 3. Backend retorna JWT token + datos de usuario y cliente

// 4. Frontend guarda en localStorage:
localStorage.setItem('authToken', response.token)
localStorage.setItem('user', JSON.stringify(response.user))
localStorage.setItem('clientId', response.client.id)
localStorage.setItem('role', 'cliente')
localStorage.setItem('userId', slug)

// 5. Frontend carga el catálogo del cliente
loadCatalog(response.client.id, slug)

// 6. Usuario navega a su panel de administración
navigate(`/${slug}/admin`)
```

#### Flujo de Logout

```javascript
// 1. Usuario hace clic en "Cerrar Sesión"
handleLogout()

// 2. Frontend llama al endpoint de logout
await authApi.logout()

// 3. Limpia localStorage completamente
localStorage.removeItem('authToken')
localStorage.removeItem('user')
localStorage.removeItem('role')
localStorage.removeItem('clientId')
localStorage.removeItem('userId')

// 4. Limpia stores de Zustand
clearCart()
clearStorage()

// 5. Redirige a home con catálogo por defecto
navigate('/')
```

## 🗄️ Estructura de Base de Datos

### Tabla: users
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,        -- Hasheado con bcrypt
    role VARCHAR(50) DEFAULT 'user',       -- 'admin', 'client', 'user'
    nombre VARCHAR(255),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabla: clients
```sql
CREATE TABLE clients (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    logo VARCHAR(500),
    color VARCHAR(7) DEFAULT '#f24427',
    telefono VARCHAR(20),
    direccion TEXT,                        -- Ahora accesible en UI
    descripcion TEXT,                      -- Ahora accesible en UI
    "userId" INTEGER REFERENCES users(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Relaciones
- `users.id` → `clients.userId` (1:N - un usuario puede tener varios negocios)
- Al registrarse, se crea automáticamente un user y un client vinculado

## 🎨 Interfaz de Usuario

### Pantalla de Login/Registro (`/login-role`)

**Vista Inicial:**
```
┌─────────────────────────────┐
│   Elige tu Rol              │
├─────────────────────────────┤
│ [ Crear Mi Cuenta ]         │
│ [ Iniciar Sesión ]          │
│ [ Soy Usuario: Explorar ]   │
└─────────────────────────────┘
```

**Formulario de Registro:**
```
┌─────────────────────────────┐
│   Crear Nueva Cuenta        │
├─────────────────────────────┤
│ Nombre Completo: _________  │
│ Email: ___________________  │
│ Contraseña: _____________   │
│ Nombre del Negocio: ______  │
│ Teléfono: _______________   │
│                             │
│ [Crear Cuenta y Catálogo]   │
│ ¿Ya tienes cuenta? Inicia   │
│ sesión aquí                 │
└─────────────────────────────┘
```

**Formulario de Login:**
```
┌─────────────────────────────┐
│   Iniciar Sesión            │
├─────────────────────────────┤
│ Email: ___________________  │
│ Contraseña: _____________   │
│                             │
│ [Iniciar Sesión]            │
│ ¿No tienes cuenta?          │
│ Regístrate aquí             │
└─────────────────────────────┘
```

### Panel de Personalización (Actualizado)

**CustomizationForm ahora incluye:**
```
┌────────────────────────────────┐
│ Personaliza tu Catálogo        │
├────────────────────────────────┤
│ Nombre del Negocio: _________  │
│ Color de Marca: [■]            │
│ Teléfono WhatsApp: __________  │
│ Dirección: _________________   │  ← NUEVO
│ Descripción: _______________   │  ← NUEVO
│                  _______________│
│                  _______________│
│                                 │
│ [Arrastra logo o clic]          │
│                                 │
│ [Guardar Cambios]               │
├────────────────────────────────┤
│ Preview:                        │
│ [Logo] Hola, Mi Tienda!         │
│ Tel: 5551234567                 │
│ Dir: Calle Principal 123        │  ← NUEVO
│ Desc: La mejor tienda...        │  ← NUEVO
└────────────────────────────────┘
```

## 🧪 Guía de Pruebas

### Prueba 1: Registro de Cliente Nuevo

```bash
# 1. Inicia el backend
cd backend
npm run start:dev

# 2. Inicia el frontend (otra terminal)
cd frontend
npm run dev

# 3. Navega a http://localhost:5173/login-role
# 4. Haz clic en "Crear Mi Cuenta"
# 5. Completa el formulario:
   - Nombre: Juan Pérez
   - Email: juan@test.com
   - Contraseña: password123
   - Nombre del Negocio: Tienda Juan
   - Teléfono: 5551234567

# 6. Verifica que:
   ✅ Se crea la cuenta
   ✅ Recibes un mensaje de bienvenida
   ✅ Eres redirigido a /tienda-juan/admin
   ✅ Puedes ver tu panel de administración
```

### Prueba 2: Login de Cliente Existente

```bash
# 1. Con los servidores corriendo
# 2. Navega a http://localhost:5173/login-role
# 3. Haz clic en "Iniciar Sesión"
# 4. Ingresa:
   - Email: juan@test.com
   - Contraseña: password123

# 5. Verifica que:
   ✅ Inicio de sesión exitoso
   ✅ Se carga tu catálogo con productos
   ✅ Eres redirigido a /tienda-juan/admin
   ✅ Puedes ver tu información personalizada
```

### Prueba 3: Personalización Completa

```bash
# 1. Con sesión iniciada, ve al panel admin
# 2. Haz clic en pestaña "Personalización"
# 3. Modifica:
   - Nombre del negocio
   - Color (elige cualquier color)
   - Teléfono
   - Dirección: "Calle Principal 123, Col. Centro"
   - Descripción: "La mejor tienda de ropa urbana"
   - Logo (sube una imagen)

# 4. Haz clic en "Guardar Cambios"
# 5. Verifica que:
   ✅ Se muestra mensaje de éxito
   ✅ Vista previa se actualiza inmediatamente
   ✅ Cambios persisten al recargar página
   ✅ Dirección y descripción se guardan correctamente
```

### Prueba 4: Gestión de Productos

```bash
# 1. En el panel admin, pestaña "Productos"
# 2. Haz clic en "Agregar Producto"
# 3. Completa el formulario:
   - Nombre: Camisa Negra
   - Precio: 450
   - Descripción: Camisa 100% algodón
   - Stock: 25
   - Categoría: Ropa
   - Imagen: (sube una imagen)

# 4. Guarda el producto
# 5. Navega de regreso con botón "Volver al Inicio"
# 6. Verifica que:
   ✅ Producto aparece en tu catálogo
   ✅ Datos se mantienen correctos
   ✅ Puedes editar el producto
   ✅ Cambios persisten después de navegar
```

### Prueba 5: Logout y Re-Login

```bash
# 1. Con sesión activa, haz clic en "Cerrar Sesión"
# 2. Verifica que:
   ✅ Se muestra mensaje "Sesión cerrada"
   ✅ Eres redirigido a la página principal
   ✅ Se muestra catálogo por defecto (UrbanStreet)
   ✅ El catálogo por defecto es read-only

# 3. Inicia sesión nuevamente
# 4. Verifica que:
   ✅ Tus productos siguen ahí
   ✅ Tu personalización se mantiene
   ✅ Puedes continuar trabajando normalmente
```

## 🔒 Seguridad

### Validaciones Implementadas

**Frontend:**
- Email válido (validación HTML5)
- Contraseña mínimo 6 caracteres
- Campos requeridos marcados como obligatorios
- Validación de enteros (parseInt con NaN check)

**Backend:**
- Email válido (class-validator @IsEmail)
- Contraseña mínimo 6 caracteres (@MinLength(6))
- Campos requeridos (@IsNotEmpty)
- Hash bcrypt con 10 salt rounds
- JWT tokens con secret key configurable

### Almacenamiento Seguro

**LocalStorage (frontend):**
```javascript
// Datos almacenados:
{
  "authToken": "JWT token",      // Para autenticación en APIs
  "user": {                      // Datos básicos del usuario
    "id": 2,
    "email": "juan@test.com",
    "role": "client",
    "nombre": "Juan Pérez"
  },
  "clientId": "2",              // ID del cliente
  "userId": "tienda-juan",       // Slug del catálogo
  "role": "cliente"              // Rol actual
}
```

**Base de Datos (backend):**
```javascript
// Contraseña almacenada:
"$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"
// ↑ Hash bcrypt, imposible de revertir
```

## 📊 Flujo de Datos

### Registro
```
Frontend          Backend              Base de Datos
   │                 │                      │
   │──POST /register→│                      │
   │  email          │──hashPassword()      │
   │  password       │  bcrypt.hash()       │
   │  nombre         │                      │
   │  businessName   │──createUser()───────→│
   │  telefono       │                      │
   │                 │──createClient()─────→│
   │                 │                      │
   │                 │←────user + client────│
   │                 │                      │
   │                 │──generateJWT()       │
   │←────response────│  jwtService.sign()   │
   │  token          │                      │
   │  user           │                      │
   │  client         │                      │
   │                 │                      │
   │──loadCatalog()→ │──GET /catalogs/{id}→│
   │                 │                      │
   │←────products────│←────catalog data────│
```

### Login
```
Frontend          Backend              Base de Datos
   │                 │                      │
   │──POST /login───→│                      │
   │  email          │──findByEmail()──────→│
   │  password       │                      │
   │                 │←────user─────────────│
   │                 │                      │
   │                 │──bcrypt.compare()    │
   │                 │  password, hash      │
   │                 │                      │
   │                 │──findByUserId()─────→│
   │                 │←────client───────────│
   │                 │                      │
   │                 │──generateJWT()       │
   │←────response────│                      │
   │  token          │                      │
   │  user           │                      │
   │  client         │                      │
```

## 🐛 Resolución de Problemas

### Error: "Email already registered"
**Causa:** El email ya existe en la base de datos.
**Solución:** Usa un email diferente o inicia sesión con ese email.

### Error: "Invalid credentials"
**Causa:** Email o contraseña incorrectos.
**Solución:** Verifica tus credenciales e intenta de nuevo.

### Error: "Could not load client by ID"
**Causa:** El clientId en localStorage es inválido o el cliente fue eliminado.
**Solución:**
```javascript
// Limpia localStorage y vuelve a iniciar sesión
localStorage.clear()
// Luego ve a /login-role
```

### Productos no se muestran después de navegar
**Causa:** Este problema ya está resuelto en esta implementación.
**Verificación:**
1. Abre la consola del navegador (F12)
2. Ve a la pestaña "Network"
3. Navega entre páginas
4. Verifica que se hagan las llamadas a `/api/catalogs/client/{id}`

### Logout no limpia la sesión
**Causa:** Este problema ya está resuelto.
**Verificación:**
1. Inicia sesión
2. Abre Application → Local Storage en DevTools
3. Cierra sesión
4. Verifica que todos los items se hayan eliminado

## 📝 Notas Técnicas

### Compatibilidad con Contraseñas Legacy
El sistema soporta contraseñas antiguas (texto plano) para backward compatibility:
```typescript
if (password.startsWith('$2b$') || password.startsWith('$2a$')) {
  // Contraseña hasheada, usa bcrypt
  isValidPassword = await bcrypt.compare(loginDto.password, user.password);
} else {
  // Contraseña legacy en texto plano
  isValidPassword = user.password === loginDto.password;
}
```

### Migración de Contraseñas Legacy
Para migrar contraseñas legacy a bcrypt:
```sql
-- Script de migración (ejecutar una sola vez)
UPDATE users 
SET password = '$2b$10$...'  -- Hash generado con bcrypt
WHERE password NOT LIKE '$2%';
```

### Configuración de JWT
En `.env` del backend:
```env
JWT_SECRET=tu-secret-key-super-segura-cambiar-en-produccion
JWT_EXPIRES_IN=7d
```

## 🎯 Próximos Pasos (Opcionales)

### Mejoras Sugeridas
1. **Recuperación de contraseña** via email
2. **Verificación de email** en el registro
3. **Refresh tokens** para sesiones más largas
4. **Perfiles de usuario** con foto y más datos
5. **Múltiples clientes** por usuario
6. **Roles y permisos** más granulares
7. **Auditoría de cambios** (quién modificó qué y cuándo)

## 📚 Referencias

- [bcrypt Documentation](https://github.com/kelektiv/node.bcrypt.js)
- [JWT Best Practices](https://jwt.io/introduction)
- [NestJS Authentication](https://docs.nestjs.com/security/authentication)
- [React Hook Form](https://react-hook-form.com/)

## ✅ Checklist de Implementación

- [x] Endpoint de registro con bcrypt
- [x] Endpoint de login con JWT
- [x] Validación de datos en backend
- [x] Componente LoginRole con 3 modos
- [x] Campos direccion y descripcion en UI
- [x] Logout completo que limpia sesión
- [x] Carga correcta de catálogo al navegar
- [x] Validación de parseInt para clientId
- [x] Tests backend actualizados y pasando
- [x] Linters pasando sin errores
- [x] Builds exitosos (frontend + backend)
- [x] Security scan limpio (CodeQL)
- [x] Documentación completa

---

**Implementado por:** GitHub Copilot Agent
**Fecha:** 2025-10-28
**Estado:** ✅ Completo y listo para producción
