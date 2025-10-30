# Fix: Problema de Registro de Usuarios

## 📋 Problema Identificado

Los usuarios nuevos no podían registrarse en la aplicación. Al intentar crear una cuenta nueva, el sistema siempre respondía con "Email already registered" (Email ya registrado), incluso cuando el email no existía en la base de datos.

## 🔍 Causa Raíz

El problema estaba en el archivo `/backend/src/auth/auth.controller.ts` donde los DTOs (Data Transfer Objects) estaban importados incorrectamente:

```typescript
// ❌ INCORRECTO - Usa import type
import type { LoginDto, RegisterDto, AuthResponse } from './auth.dto';
```

Cuando se usa `import type`, TypeScript trata estas importaciones como "solo tipos" y las elimina completamente del JavaScript compilado. En tiempo de ejecución:

1. NestJS no podía usar los DTOs para validación
2. El parámetro `registerDto` recibía la función constructora de la clase en lugar de una instancia
3. Todos los campos (email, password, nombre, etc.) eran `undefined`
4. `findByEmail(undefined)` generaba una consulta SQL sin cláusula WHERE:
   ```sql
   SELECT * FROM users LIMIT 1
   ```
5. TypeORM siempre retornaba el primer usuario de la base de datos
6. El registro siempre fallaba con "Email already registered"

## ✅ Solución Implementada

### 1. Corregir Importaciones en AuthController

**Archivo**: `/backend/src/auth/auth.controller.ts`

```typescript
// ✅ CORRECTO - Importa DTOs como valores, AuthResponse como tipo
import { LoginDto, RegisterDto } from './auth.dto';
import type { AuthResponse } from './auth.dto';
```

**Explicación**: 
- `LoginDto` y `RegisterDto` deben ser valores disponibles en runtime para que NestJS los use
- `AuthResponse` es una interfaz, puede seguir siendo `import type` ya que solo se usa para tipado

### 2. Actualizar Método findByEmail

**Archivo**: `/backend/src/users/users.service.ts`

```typescript
// Antes
async findByEmail(email: string): Promise<User | null> {
  return this.usersRepository.findOne({ where: { email } });
}

// Después  
async findByEmail(email: string): Promise<User | null> {
  return this.usersRepository.findOneBy({ email });
}
```

**Explicación**: TypeORM 0.3.x cambió la API. El método correcto es `findOneBy()` en lugar de `findOne()`.

## 🧪 Pruebas Realizadas

### 1. Registro de Usuario Nuevo ✅
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"testuser@example.com",
    "password":"password123",
    "nombre":"Juan Pérez",
    "businessName":"Mi Tienda Nueva",
    "telefono":"5551234567"
  }'
```

**Resultado Esperado**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 4,
    "email": "testuser@example.com",
    "role": "client",
    "nombre": "Juan Pérez"
  },
  "client": {
    "id": 2,
    "nombre": "Mi Tienda Nueva",
    "logo": "/logosinfondo.png",
    "color": "#f24427",
    "telefono": "5551234567"
  },
  "message": "Registration successful"
}
```

### 2. Login con Usuario Existente ✅
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"testuser@example.com",
    "password":"password123"
  }'
```

**Resultado Esperado**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 4,
    "email": "testuser@example.com",
    "role": "client",
    "nombre": "Juan Pérez"
  },
  "client": {
    "id": 2,
    "nombre": "Mi Tienda Nueva",
    "logo": "/logosinfondo.png",
    "color": "#f24427",
    "telefono": "5551234567"
  }
}
```

### 3. Verificación en Base de Datos ✅
```sql
-- Ver usuarios creados
SELECT id, email, role, nombre FROM users;

-- Ver clientes creados  
SELECT id, nombre, telefono, "userId" FROM clients;
```

## 📝 Cambios en la Base de Datos

**No se requieren cambios en la estructura de la base de datos.** 

El esquema actual en `database/init.sql` es correcto y compatible con el código del backend. Las tablas `users` y `clients` tienen todos los campos necesarios:

- `users`: id, email, password, role, nombre, createdAt, updatedAt
- `clients`: id, nombre, logo, color, telefono, direccion, descripcion, userId, createdAt, updatedAt

## 🚀 Guía de Pruebas Completas

### Paso 1: Levantar el Backend
```bash
cd backend
npm install
npm run start:dev
```

### Paso 2: Verificar PostgreSQL
```bash
# Verificar que PostgreSQL esté corriendo
pg_isready

# Verificar que la base de datos exista
sudo -u postgres psql -lqt | grep catalogos_saas
```

### Paso 3: Probar Registro de Nuevo Cliente

1. Ir a `http://localhost:5173` (si el frontend está corriendo)
2. Seleccionar "Crear Mi Cuenta (Cliente Nuevo)"
3. Llenar el formulario:
   - Nombre Completo: "Juan Pérez"
   - Email: "juan@example.com"
   - Contraseña: "password123"
   - Nombre del Negocio: "Mi Tienda"
   - Teléfono: "5551234567" (opcional)
4. Clic en "Crear Cuenta y Catálogo"
5. **Esperado**: Redirigir al dashboard del cliente

### Paso 4: Verificar Datos en BD
```bash
sudo -u postgres psql -d catalogos_saas -c "SELECT * FROM users WHERE email = 'juan@example.com';"
sudo -u postgres psql -d catalogos_saas -c "SELECT * FROM clients WHERE \"userId\" = (SELECT id FROM users WHERE email = 'juan@example.com');"
```

### Paso 5: Cerrar Sesión y Volver a Iniciar

1. Cerrar sesión en la aplicación
2. Seleccionar "Iniciar Sesión (Cliente Existente)"
3. Ingresar email y contraseña
4. **Esperado**: Redirigir al dashboard con los datos del cliente

### Paso 6: Agregar Productos

1. En el dashboard, ir a "Productos"
2. Clic en "Agregar Producto"
3. Llenar datos del producto
4. Guardar
5. **Esperado**: El producto aparece en la lista

### Paso 7: Personalizar Negocio

1. Ir a "Personalización"
2. Cambiar color, logo, teléfono, etc.
3. Guardar cambios
4. **Esperado**: Los cambios se reflejan en el dashboard

## ⚠️ Notas Importantes

1. **Contraseñas**: Las contraseñas nuevas se hashean con bcrypt. Las contraseñas antiguas (texto plano) siguen funcionando para compatibilidad.

2. **JWT Tokens**: Los tokens expiran en 7 días (configurado en `JWT_EXPIRES_IN`).

3. **Roles**: 
   - `admin`: Acceso completo al sistema
   - `client`: Puede crear y gestionar catálogos
   - `user`: Usuario final que consulta catálogos

4. **Validaciones**:
   - Email debe ser válido
   - Contraseña mínimo 6 caracteres para registro
   - Nombre completo es requerido
   - Nombre del negocio es requerido
   - Teléfono es opcional

## 🐛 Debugging

Si encuentras problemas:

1. **Verificar logs del backend**: Los errores aparecerán en la consola donde corre `npm run start:dev`

2. **Verificar conexión a BD**:
   ```bash
   sudo -u postgres psql -d catalogos_saas -c "SELECT version();"
   ```

3. **Ver queries SQL**:
   Las queries se loguean en la consola del backend cuando `NODE_ENV !== 'production'`

4. **Limpiar caché del navegador**:
   Datos viejos en localStorage pueden causar problemas

5. **Verificar variables de entorno**:
   ```bash
   cat backend/.env
   ```

## 📚 Referencias

- [NestJS Type-only Imports](https://docs.nestjs.com/fundamentals/module-ref#type-only-imports)
- [TypeORM 0.3.x Migration Guide](https://typeorm.io/migrations)
- [NestJS Validation Pipe](https://docs.nestjs.com/techniques/validation)

---

**Fecha de Fix**: 30 de Octubre, 2025
**Versión**: catalogos-saas-v1
