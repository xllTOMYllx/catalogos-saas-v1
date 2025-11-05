# Guía de Integración de Base de Datos PostgreSQL

## Resumen

Este documento explica cómo se integró PostgreSQL en el proyecto Catalogos SaaS v1 y cómo utilizar las nuevas características de base de datos.

## Cambios Realizados

### 1. Estructura de Base de Datos

Se crearon 4 tablas principales:

#### **users** (Usuarios)
Almacena información de autenticación y perfiles de usuario.
- `id`: Identificador único
- `email`: Email único para autenticación
- `password`: Contraseña (demo - debe hashearse en producción)
- `role`: Rol del usuario (admin, client, user)
- `nombre`: Nombre completo
- `createdAt`, `updatedAt`: Timestamps automáticos

#### **clients** (Clientes/Negocios)
Almacena información de negocios para personalización de catálogos.
- `id`: Identificador único
- `nombre`: Nombre del negocio
- `logo`: Ruta al logo del negocio
- `color`: Color de marca (formato hex)
- `telefono`: Teléfono de contacto
- `direccion`: Dirección del negocio
- `descripcion`: Descripción del negocio
- `userId`: ID del usuario propietario
- `createdAt`, `updatedAt`: Timestamps automáticos

#### **products** (Productos)
Almacena el catálogo de productos.
- `id`: Identificador único
- `ruta`: Ruta a la imagen del producto
- `nombre`: Nombre del producto
- `precio`: Precio del producto
- `description`: Descripción del producto
- `stock`: Cantidad disponible
- `category`: Categoría del producto
- `createdAt`, `updatedAt`: Timestamps automáticos

#### **catalogs** (Catálogos)
Tabla de unión que relaciona clientes con productos (relación many-to-many).
Permite que cada cliente tenga su propio catálogo personalizado.
- `id`: Identificador único
- `clientId`: ID del cliente
- `productId`: ID del producto
- `active`: Si el producto está activo en este catálogo
- `customPrice`: Precio personalizado opcional para este cliente
- `createdAt`, `updatedAt`: Timestamps automáticos

### 2. Relaciones entre Tablas

```
users (1) ──→ (N) clients
clients (N) ──→ (N) products (a través de catalogs)
```

### 3. Nuevos Módulos de Backend

#### UsersModule
- **Servicio**: `UsersService`
- **Funciones**: CRUD completo de usuarios, búsqueda por email
- **No tiene controlador** (usado internamente por AuthModule)

#### ClientsModule
- **Servicio**: `ClientsService`
- **Controlador**: `ClientsController`
- **Endpoints**: `/api/clients/*`
- **Funciones**: CRUD completo de clientes, búsqueda por userId

#### CatalogsModule
- **Servicio**: `CatalogsService`
- **Controlador**: `CatalogsController`
- **Endpoints**: `/api/catalogs/*`
- **Funciones**: CRUD de catálogos, búsqueda por clientId

### 4. Módulos Actualizados

#### ProductsModule
- Ahora usa TypeORM en lugar de array en memoria
- Todas las operaciones son asíncronas
- Los datos persisten en la base de datos

#### AuthModule
- Ahora consulta la tabla `users` para autenticación
- Usa `UsersService` para validar credenciales

#### BusinessModule
- Mantiene compatibilidad con API anterior
- Ahora usa `ClientsService` internamente
- Trabaja con el cliente ID=1 por defecto

## Uso de la Base de Datos

### Configuración Inicial

1. **Instalar PostgreSQL** (ver README principal)

2. **Crear la base de datos:**
```bash
sudo -u postgres psql
CREATE DATABASE catalogos_saas;
\q
```

3. **Ejecutar script de inicialización:**
```bash
psql -U postgres -d catalogos_saas -f database/init.sql
```

4. **Configurar variables de entorno:**
Crear archivo `.env` en `backend/`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=catalogos_saas
NODE_ENV=development
```

### Usuarios de Prueba

El script de inicialización crea estos usuarios:
- `admin@test.com` / `123` (rol: admin)
- `user@test.com` / `123` (rol: user)
- `client@test.com` / `123` (rol: client)

### Ejemplos de Uso desde el Frontend

#### 1. Obtener todos los clientes
```javascript
import { clientsApi } from './api/clients';

const clients = await clientsApi.getAll();
console.log(clients);
```

#### 2. Crear un nuevo cliente
```javascript
import { clientsApi } from './api/clients';

const newClient = await clientsApi.create({
  nombre: 'Mi Tienda',
  logo: '/logos/mi-logo.png',
  color: '#3498db',
  telefono: '555-1234',
  userId: 1, // ID del usuario propietario
  descripcion: 'Una tienda increíble'
});
```

#### 3. Obtener el catálogo de un cliente
```javascript
import { catalogsApi } from './api/catalogs';

const clientId = 1;
const catalog = await catalogsApi.getByClientId(clientId);
// Retorna array de productos vinculados a este cliente
console.log(catalog);
```

#### 4. Agregar producto al catálogo de un cliente
```javascript
import { catalogsApi } from './api/catalogs';

const entry = await catalogsApi.create({
  clientId: 1,
  productId: 5,
  active: true,
  customPrice: 449.99 // Opcional: precio personalizado
});
```

#### 5. Actualizar precio personalizado de un producto
```javascript
import { catalogsApi } from './api/catalogs';

const catalogId = 1; // ID de la entrada en la tabla catalogs
await catalogsApi.update(catalogId, {
  customPrice: 399.99,
  active: true
});
```

### Casos de Uso Típicos

#### Caso 1: Cliente crea su catálogo personalizado
```javascript
// 1. Usuario se registra
const user = await usersService.create({
  email: 'nuevo@cliente.com',
  password: '123',
  role: 'client',
  nombre: 'Juan Pérez'
});

// 2. Crea su negocio/cliente
const client = await clientsApi.create({
  nombre: 'Boutique Juan',
  userId: user.id,
  color: '#ff6b6b',
  telefono: '555-5678'
});

// 3. Selecciona productos para su catálogo
const products = await productsApi.getAll();
for (const product of selectedProducts) {
  await catalogsApi.create({
    clientId: client.id,
    productId: product.id,
    active: true
  });
}
```

#### Caso 2: Administrador gestiona productos
```javascript
// 1. Crear nuevo producto
const newProduct = await productsApi.create({
  nombre: 'Camisa Premium',
  precio: 599,
  description: 'Camisa de alta calidad',
  ruta: '/products/premium-shirt.png',
  stock: 50,
  category: 'Ropa'
});

// 2. El producto estará disponible para que los clientes lo agreguen a sus catálogos
```

#### Caso 3: Cliente personaliza precios
```javascript
// Obtener catálogo actual
const catalog = await catalogsApi.getByClientId(clientId);

// Actualizar precio personalizado de un producto
const item = catalog.find(c => c.productId === 3);
await catalogsApi.update(item.id, {
  customPrice: 449.99 // Precio especial para este cliente
});
```

## TypeORM

El proyecto usa TypeORM como ORM (Object-Relational Mapping):

### Ventajas
- Tipado TypeScript completo
- Migraciones automáticas en desarrollo
- Query builder intuitivo
- Relaciones automáticas

### Sincronización Automática
En modo desarrollo (`NODE_ENV=development`), TypeORM sincroniza automáticamente el esquema:
- Crea tablas si no existen
- Actualiza columnas modificadas
- ⚠️ **NO usar en producción** - usar migraciones

### Migraciones (Producción)
```bash
# Generar migración
npm run typeorm migration:generate -- -n NombreMigracion

# Ejecutar migraciones
npm run typeorm migration:run

# Revertir migración
npm run typeorm migration:revert
```

## Seguridad

### ⚠️ Consideraciones Importantes

1. **Contraseñas en texto plano**: Actualmente las contraseñas se almacenan sin hashear para propósitos de demo. En producción, implementar:
```bash
npm install bcrypt
```

2. **Validación de entrada**: Siempre validar datos de usuario antes de guardar

3. **SQL Injection**: TypeORM proporciona protección, pero siempre usar prepared statements

4. **Variables de entorno**: Nunca commitear archivos `.env` al repositorio

## Índices y Performance

El script `init.sql` crea estos índices:
- `idx_users_email` en users(email)
- `idx_clients_userId` en clients(userId)
- `idx_catalogs_clientId` en catalogs(clientId)
- `idx_catalogs_productId` en catalogs(productId)
- `idx_products_category` en products(category)

Estos mejoran el rendimiento de consultas frecuentes.

## Respaldo y Restauración

### Backup
```bash
pg_dump -U postgres catalogos_saas > backup_$(date +%Y%m%d).sql
```

### Restaurar
```bash
psql -U postgres catalogos_saas < backup_20250101.sql
```

### Reiniciar con datos limpios
```bash
psql -U postgres -c "DROP DATABASE IF EXISTS catalogos_saas;"
psql -U postgres -c "CREATE DATABASE catalogos_saas;"
psql -U postgres -d catalogos_saas -f database/init.sql
```

## Troubleshooting

### Error: "relation does not exist"
**Solución**: Ejecutar script de inicialización
```bash
psql -U postgres -d catalogos_saas -f database/init.sql
```

### Error: "password authentication failed"
**Solución**: Verificar credenciales en `.env`

### TypeORM no conecta
**Solución**: 
1. Verificar que PostgreSQL esté corriendo: `sudo systemctl status postgresql`
2. Verificar variables de entorno en `.env`
3. Verificar que la base de datos exista: `psql -U postgres -l`

### Los cambios no persisten
**Solución**: Verificar que la aplicación use la versión correcta del servicio (con TypeORM, no in-memory)

## Próximos Pasos

Mejoras sugeridas para el futuro:

1. **Autenticación JWT**: Implementar tokens JWT en lugar de tokens mock
2. **Hash de contraseñas**: Usar bcrypt para hashear contraseñas
3. **Paginación**: Agregar paginación a endpoints que retornan listas
4. **Filtros y búsqueda**: Agregar capacidades de filtrado y búsqueda
5. **Imágenes**: Implementar upload de imágenes para logos y productos
6. **Roles y permisos**: Sistema más robusto de autorización
7. **Auditoría**: Tabla de logs para tracking de cambios
8. **Caché**: Redis para cachear consultas frecuentes
9. **Testing**: Tests unitarios e integración con base de datos de prueba

## Soporte

Para más información:
- Ver `database/README.md` para documentación completa del esquema
- Ver código fuente en `backend/src/` para detalles de implementación
- Consultar documentación de [TypeORM](https://typeorm.io/)
- Consultar documentación de [NestJS](https://nestjs.com/)
