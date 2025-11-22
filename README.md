# Catalogos SaaS v1

Sistema de catálogos SaaS con frontend en React y backend en NestJS con base de datos PostgreSQL.

## Estructura del Proyecto

```
catalogos-saas-v1/
├── backend/          # API REST con NestJS
│   ├── src/
│   │   ├── products/    # Módulo de productos
│   │   ├── auth/        # Módulo de autenticación
│   │   ├── business/    # Módulo de negocios
│   │   ├── users/       # Módulo de usuarios
│   │   ├── clients/     # Módulo de clientes
│   │   ├── catalogs/    # Módulo de catálogos
│   │   ├── database/    # Configuración de base de datos
│   │   └── main.ts      # Punto de entrada
│   └── package.json
├── frontend/         # Aplicación React con Vite
│   ├── src/
│   │   ├── api/         # Servicios de API
│   │   ├── components/  # Componentes React
│   │   ├── pages/       # Páginas
│   │   ├── store/       # Estado global (Zustand)
│   │   └── hooks/       # Hooks personalizados
│   └── package.json
└── database/         # Scripts y documentación de BD
    ├── init.sql         # Script de inicialización
    └── README.md        # Documentación de la BD
```

## Características

### Backend (NestJS)
- ✅ API REST con CORS habilitado
- ✅ Base de datos PostgreSQL con TypeORM
- ✅ Módulo de Usuarios (gestión de cuentas)
- ✅ Módulo de Clientes (personalización de negocios)
- ✅ Módulo de Productos (CRUD completo)
- ✅ Módulo de Catálogos (vincular clientes y productos)
- ✅ Módulo de Autenticación (login/logout)
- ✅ **Recuperación de Contraseña (email seguro)** 🆕
- ✅ Módulo de Negocios (personalización legacy)
- ✅ **Módulo de Suscripciones (planes y límites)** 🆕
- ✅ Almacenamiento de imágenes en servidor
- ✅ TypeScript con tipado estricto

### Frontend (React + Vite)
- ✅ Interfaz de usuario moderna con TailwindCSS
- ✅ Gestión de estado con Zustand
- ✅ Integración con backend via Axios
- ✅ Autenticación de usuarios
- ✅ Panel de administración completo
- ✅ Carrito de compras
- ✅ Catálogo de productos
- ✅ **Página de Planes de Suscripción** 🆕
- ✅ **Badge de Plan Actual** 🆕

### Base de Datos (PostgreSQL)
- ✅ Esquema relacional normalizado
- ✅ 6 tablas principales: users, clients, products, catalogs, **subscription_plans, subscriptions** 🆕
- ✅ Relaciones many-to-many entre clientes y productos
- ✅ Timestamps automáticos (createdAt, updatedAt)
- ✅ Índices para mejor rendimiento
- ✅ Datos de prueba incluidos
- ✅ **Sistema de suscripciones con 4 planes (FREE, BASIC, PRO, ENTERPRISE)** 🆕

## Instalación

### Requisitos Previos

- Node.js 18+ y npm
- PostgreSQL 12+

### 1. Base de Datos

#### Instalar PostgreSQL

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

**macOS (Homebrew):**
```bash
brew install postgresql
brew services start postgresql
```

**Windows:**
Descargar desde [postgresql.org](https://www.postgresql.org/download/windows/)

#### Crear Base de Datos

```bash
# Acceder a PostgreSQL
sudo -u postgres psql

# Crear base de datos
CREATE DATABASE catalogos_saas;

# Salir
\q
```

#### Inicializar Esquema y Datos

```bash
# Desde la raíz del proyecto
psql -U postgres -d catalogos_saas -f database/init.sql
```

Ver `database/README.md` para más detalles sobre la estructura de la base de datos.

### 2. Backend

```bash
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tu configuración de PostgreSQL

# Construir
npm run build

# Iniciar en modo desarrollo
npm run start:dev
```

El backend estará disponible en `http://localhost:3000`

**Variables de entorno importantes:**
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=catalogos_saas
NODE_ENV=development
JWT_SECRET=tu-secreto-jwt
# Opcional para recuperación de contraseña (usa Ethereal por defecto en desarrollo)
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USER=your-email@example.com
MAIL_PASSWORD=your-email-password
MAIL_FROM=noreply@example.com
FRONTEND_URL=http://localhost:5173
```

### 3. Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Iniciar en modo desarrollo
npm run dev
```

El frontend estará disponible en `http://localhost:5173`

## API Endpoints

### Usuarios
- `GET /api/users` - Obtener todos los usuarios
- `GET /api/users/:id` - Obtener un usuario
- `POST /api/users` - Crear un usuario
- `PUT /api/users/:id` - Actualizar un usuario
- `DELETE /api/users/:id` - Eliminar un usuario

### Clientes (Negocios)
- `GET /api/clients` - Obtener todos los clientes
- `GET /api/clients/:id` - Obtener un cliente
- `GET /api/clients/user/:userId` - Obtener clientes de un usuario
- `POST /api/clients` - Crear un cliente
- `PUT /api/clients/:id` - Actualizar un cliente
- `DELETE /api/clients/:id` - Eliminar un cliente

### Productos
- `GET /api/products` - Obtener todos los productos
- `GET /api/products/:id` - Obtener un producto
- `POST /api/products` - Crear un producto
- `PUT /api/products/:id` - Actualizar un producto
- `DELETE /api/products/:id` - Eliminar un producto

### Catálogos
- `GET /api/catalogs` - Obtener todas las entradas de catálogo
- `GET /api/catalogs/:id` - Obtener una entrada de catálogo
- `GET /api/catalogs/client/:clientId` - Obtener productos del catálogo de un cliente
- `POST /api/catalogs` - Agregar producto al catálogo de un cliente
- `PUT /api/catalogs/:id` - Actualizar entrada de catálogo
- `DELETE /api/catalogs/:id` - Eliminar producto del catálogo

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión
- `POST /api/auth/forgot-password` - Solicitar recuperación de contraseña 🆕
- `POST /api/auth/reset-password` - Restablecer contraseña con token 🆕

### Negocios (Legacy)
- `GET /api/business` - Obtener información del negocio por defecto
- `PUT /api/business` - Actualizar información del negocio

### Planes de Suscripción 🆕
- `GET /api/subscription-plans` - Obtener todos los planes disponibles
- `GET /api/subscription-plans/:id` - Obtener un plan específico
- `POST /api/subscription-plans` - Crear un plan (admin)
- `PUT /api/subscription-plans/:id` - Actualizar un plan (admin)
- `DELETE /api/subscription-plans/:id` - Eliminar un plan (admin)

### Suscripciones 🆕
- `GET /api/subscriptions` - Obtener todas las suscripciones
- `GET /api/subscriptions/:id` - Obtener una suscripción específica
- `GET /api/subscriptions/user/:userId` - Obtener suscripción de un usuario
- `GET /api/subscriptions/user/:userId/limits` - Obtener límites del usuario
- `POST /api/subscriptions` - Crear una suscripción
- `PUT /api/subscriptions/:id` - Actualizar suscripción
- `PUT /api/subscriptions/user/:userId/change-plan` - Cambiar plan de usuario
- `PUT /api/subscriptions/user/:userId/cancel` - Cancelar suscripción
- `DELETE /api/subscriptions/:id` - Eliminar suscripción

## Sistema de Suscripciones 🆕

Este proyecto incluye un **sistema completo de suscripciones** con 4 planes:

| Plan | Precio | Catálogos | Productos | Características |
|------|--------|-----------|-----------|-----------------|
| FREE | $0/mes | 1 | 20 | Básico, soporte comunitario |
| BASIC | $299/mes | 3 | 100 | Personalización avanzada, analytics |
| PRO | $799/mes | 10 | Ilimitados | API access, soporte prioritario |
| ENTERPRISE | $1,999/mes | Ilimitados | Ilimitados | White label, soporte dedicado |

**Cambios de Plan:**
Los cambios de plan se gestionan manualmente a través de WhatsApp para garantizar un control adecuado y verificación de pagos. Los usuarios contactan al soporte mediante WhatsApp para solicitar cambios de plan.

**Para más información:**
- 📚 [Documentación Completa de Suscripciones](Changes_Documentation/Subscriptions/SUBSCRIPTIONS.md)
- 🚀 [Guía de Implementación](Changes_Documentation/Subscriptions/IMPLEMENTACION_SUSCRIPCIONES.md)
- 📱 [Configuración de WhatsApp](Changes_Documentation/WhatsApp_Integration/CONFIGURACION_WHATSAPP.md)

### Instalación del Sistema de Suscripciones

```bash
# 1. Migrar la base de datos
psql -U postgres -d catalogos_saas -f database/subscriptions_schema.sql

# 2. El backend ya incluye los módulos, solo reiniciar
cd backend && npm run start:dev

# 3. Agregar ruta en el frontend (ver IMPLEMENTACION_SUSCRIPCIONES.md)
```

## Sistema de Recuperación de Contraseña 🆕

El proyecto incluye un **sistema completo de recuperación de contraseña** con las siguientes características:

- ✅ Tokens seguros con expiración de 1 hora
- ✅ Hash SHA-256 para seguridad
- ✅ Prevención de enumeración de emails
- ✅ Emails HTML profesionales
- ✅ 100% Open Source (Ethereal Email en desarrollo, sin servicios pagos)

**Configuración:**
- En desarrollo, usa Ethereal Email automáticamente (sin configuración)
- En producción, configura las variables MAIL_* en el `.env`

**Documentación:**
- 🔑 [Guía de Configuración](Changes_Documentation/Password_Recovery/PASSWORD_RECOVERY_SETUP.md)
- 📋 [Resumen de Implementación](Changes_Documentation/Password_Recovery/IMPLEMENTATION_SUMMARY_PASSWORD_RECOVERY.md)

## Datos de Prueba

El script `database/init.sql` crea usuarios de prueba:

- **Admin:** `admin@test.com` / `123`
- **Usuario:** `user@test.com` / `123`
- **Cliente:** `client@test.com` / `123`

También incluye:
- 1 cliente/negocio por defecto (UrbanStreet)
- 9 productos de ejemplo
- Catálogo completo vinculado al cliente por defecto

## Configuración

### Backend
El backend usa el puerto 3000 por defecto. Puedes cambiarlo con la variable de entorno `PORT`.

**TypeORM** está configurado para:
- Auto-sincronización en desarrollo (crea/actualiza tablas automáticamente)
- Logging en desarrollo
- En producción, usar migraciones en lugar de auto-sync

### Frontend
El frontend está configurado para hacer proxy de las peticiones `/api` al backend en `http://localhost:3000`.

## Esquema de Base de Datos

```
┌─────────────┐
│    users    │
│─────────────│
│ id (PK)     │
│ email       │
│ password    │
│ role        │
└──────┬──────┘
       │ 1:N
┌──────▼──────┐        ┌─────────────┐
│   clients   │   N:N  │  catalogs   │   N:1    ┌─────────────┐
│─────────────│────────│─────────────│──────────│  products   │
│ id (PK)     │        │ id (PK)     │          │─────────────│
│ nombre      │        │ clientId(FK)│          │ id (PK)     │
│ logo        │        │ productId(FK│          │ nombre      │
│ color       │        │ active      │          │ precio      │
│ telefono    │        │ customPrice │          │ stock       │
└─────────────┘        └─────────────┘          └─────────────┘
```

Ver `database/README.md` para documentación completa del esquema.

## Flujo de Trabajo

1. **Usuario**: Puede explorar catálogos y agregar productos al carrito
2. **Cliente**: Puede crear y gestionar su propio catálogo con productos personalizados
3. **Admin**: Tiene acceso completo para gestionar usuarios, clientes, productos y catálogos

## Mantenimiento de Base de Datos

### Backup
```bash
pg_dump -U postgres catalogos_saas > backup.sql
```

### Restore
```bash
psql -U postgres catalogos_saas < backup.sql
```

### Reset (Reiniciar datos)
```bash
psql -U postgres -c "DROP DATABASE IF EXISTS catalogos_saas;"
psql -U postgres -c "CREATE DATABASE catalogos_saas;"
psql -U postgres -d catalogos_saas -f database/init.sql
```

## Tecnologías Utilizadas

### Backend
- NestJS 11
- TypeScript
- Express
- TypeORM
- PostgreSQL

### Frontend
- React 19
- Vite 7
- TailwindCSS 4
- Zustand (state management)
- Axios (HTTP client)
- React Router (routing)
- React Hook Form (forms)

## Desarrollo

### Backend
```bash
npm run start:dev    # Modo desarrollo con hot reload
npm run build        # Compilar producción
npm run test         # Ejecutar tests
npm run lint         # Linter
```

### Frontend
```bash
npm run dev          # Modo desarrollo
npm run build        # Compilar producción
npm run preview      # Preview de producción
npm run lint         # Linter
```

## Despliegue

### Backend
```bash
cd backend
npm run build
npm run start:prod
```

### Frontend
```bash
cd frontend
npm run build
# Los archivos estáticos estarán en dist/
```

## 📚 Documentación

Toda la documentación de cambios, implementaciones y mejoras se encuentra organizada en la carpeta `Changes_Documentation/`:

- **Authentication/** - Autenticación, seguridad y gestión de usuarios
- **Database_Integration/** - Integración de PostgreSQL
- **General_Fixes/** - Correcciones generales y alineación frontend-backend
- **Image_Upload/** - Sistema de almacenamiento de imágenes
- **Password_Recovery/** - Recuperación de contraseña
- **Product_Limits/** - Límites de productos por plan
- **Subscriptions/** - Sistema completo de suscripciones
- **WhatsApp_Integration/** - Integración de WhatsApp para cambios de plan

Ver el [índice completo de documentación](Changes_Documentation/README.md) para más detalles.

## Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto es privado y no tiene licencia pública.
