# Diagrama de Base de Datos - Catalogos SaaS v1

## Esquema Relacional Visual

```
┌────────────────────────────────────────┐
│            USERS (usuarios)            │
│────────────────────────────────────────│
│ 🔑 id (SERIAL, PK)                     │
│ 📧 email (VARCHAR, UNIQUE, NOT NULL)   │
│ 🔒 password (VARCHAR, NOT NULL)        │
│ 👤 role (VARCHAR, DEFAULT 'user')      │
│ 📝 nombre (VARCHAR)                    │
│ 📅 createdAt (TIMESTAMP)               │
│ 📅 updatedAt (TIMESTAMP)               │
└──────────────┬─────────────────────────┘
               │
               │ 1:N (un usuario puede tener muchos clientes)
               │
┌──────────────▼─────────────────────────┐
│          CLIENTS (clientes)            │
│────────────────────────────────────────│
│ 🔑 id (SERIAL, PK)                     │
│ 🏢 nombre (VARCHAR, NOT NULL)          │
│ 🖼️  logo (VARCHAR)                     │
│ 🎨 color (VARCHAR, DEFAULT '#f24427')  │
│ 📞 telefono (VARCHAR)                  │
│ 📍 direccion (TEXT)                    │
│ 📄 descripcion (TEXT)                  │
│ 🔗 userId (INTEGER, FK → users.id)    │
│ 📅 createdAt (TIMESTAMP)               │
│ 📅 updatedAt (TIMESTAMP)               │
└──────────────┬─────────────────────────┘
               │
               │ N:N (muchos clientes ↔ muchos productos)
               │     a través de CATALOGS
               │
┌──────────────▼─────────────────────────┐
│         CATALOGS (catálogos)           │
│────────────────────────────────────────│
│ 🔑 id (SERIAL, PK)                     │
│ 🔗 clientId (INTEGER, FK → clients.id)│
│ 🔗 productId (INTEGER, FK → products) │
│ ✅ active (BOOLEAN, DEFAULT true)      │
│ 💰 customPrice (DECIMAL)               │
│ 📅 createdAt (TIMESTAMP)               │
│ 📅 updatedAt (TIMESTAMP)               │
│                                        │
│ UNIQUE(clientId, productId)            │
└──────────────┬─────────────────────────┘
               │
               │ N:1 (muchos catálogos → un producto)
               │
┌──────────────▼─────────────────────────┐
│         PRODUCTS (productos)           │
│────────────────────────────────────────│
│ 🔑 id (SERIAL, PK)                     │
│ 🖼️  ruta (VARCHAR, NOT NULL)           │
│ 📦 nombre (VARCHAR, NOT NULL)          │
│ 💵 precio (DECIMAL(10,2), NOT NULL)    │
│ 📝 description (TEXT, NOT NULL)        │
│ 📊 stock (INTEGER, DEFAULT 0)          │
│ 🏷️  category (VARCHAR, NOT NULL)       │
│ 📅 createdAt (TIMESTAMP)               │
│ 📅 updatedAt (TIMESTAMP)               │
└────────────────────────────────────────┘
```

## Flujo de Relaciones

### 1. Registro de Usuario y Creación de Negocio
```
┌──────────┐      ┌──────────┐
│  User    │ 1:N  │  Client  │
│  (Juan)  │─────→│(Boutique)│
└──────────┘      └──────────┘
email: juan@email.com
role: client
```

### 2. Cliente Crea Su Catálogo
```
┌──────────┐      ┌──────────┐      ┌──────────┐
│  Client  │  N   │ Catalog  │  N   │ Product  │
│(Boutique)│←────→│  Entry   │←────→│ (Gorra)  │
└──────────┘      └──────────┘      └──────────┘
                  clientId: 1
                  productId: 1
                  active: true
                  customPrice: 350
```

### 3. Vista Completa de un Cliente
```
User (admin@test.com)
  │
  └─→ Client (UrbanStreet)
        │
        ├─→ Catalog Entry 1
        │     └─→ Product: Gorra #2 (precio base: 399, custom: 350)
        │
        ├─→ Catalog Entry 2
        │     └─→ Product: Camisa #1 (precio base: 399, custom: null)
        │
        └─→ Catalog Entry 3
              └─→ Product: Gorro #1 (precio base: 399, custom: 450)
```

## Índices Creados

```sql
-- Para búsquedas rápidas de usuarios por email
CREATE INDEX idx_users_email ON users(email);

-- Para encontrar todos los clientes de un usuario
CREATE INDEX idx_clients_userId ON clients(userId);

-- Para obtener el catálogo de un cliente
CREATE INDEX idx_catalogs_clientId ON catalogs(clientId);

-- Para ver qué clientes tienen un producto
CREATE INDEX idx_catalogs_productId ON catalogs(productId);

-- Para filtrar productos por categoría
CREATE INDEX idx_products_category ON products(category);
```

## Casos de Uso

### Caso 1: Cliente Personaliza Su Catálogo

**Paso 1: Usuario se registra**
```sql
INSERT INTO users (email, password, role, nombre)
VALUES ('maria@tienda.com', '123', 'client', 'María García');
```

**Paso 2: Crea su negocio**
```sql
INSERT INTO clients (nombre, logo, color, telefono, userId)
VALUES ('Boutique María', '/logos/maria.png', '#e91e63', '555-1234', 1);
```

**Paso 3: Selecciona productos para su catálogo**
```sql
-- Agregar producto 1 con precio personalizado
INSERT INTO catalogs (clientId, productId, active, customPrice)
VALUES (1, 1, true, 350.00);

-- Agregar producto 2 con precio estándar
INSERT INTO catalogs (clientId, productId, active)
VALUES (1, 2, true);

-- Agregar producto 3 desactivado
INSERT INTO catalogs (clientId, productId, active)
VALUES (1, 3, false);
```

### Caso 2: Obtener Catálogo Completo de un Cliente

```sql
SELECT 
    c.id as catalog_id,
    cl.nombre as cliente,
    p.nombre as producto,
    COALESCE(c.customPrice, p.precio) as precio_final,
    c.active as activo
FROM catalogs c
INNER JOIN clients cl ON c.clientId = cl.id
INNER JOIN products p ON c.productId = p.id
WHERE cl.id = 1
ORDER BY p.category, p.nombre;
```

### Caso 3: Ver Todos los Clientes que Venden un Producto

```sql
SELECT 
    cl.nombre as cliente,
    cl.telefono,
    c.customPrice,
    c.active
FROM catalogs c
INNER JOIN clients cl ON c.clientId = cl.id
WHERE c.productId = 1
AND c.active = true;
```

## Consultas Útiles

### Estadísticas Generales
```sql
-- Total de usuarios por rol
SELECT role, COUNT(*) 
FROM users 
GROUP BY role;

-- Total de productos por categoría
SELECT category, COUNT(*), AVG(precio) as precio_promedio
FROM products 
GROUP BY category;

-- Clientes con más productos en catálogo
SELECT 
    cl.nombre,
    COUNT(c.id) as total_productos
FROM clients cl
LEFT JOIN catalogs c ON cl.id = c.clientId
GROUP BY cl.id, cl.nombre
ORDER BY total_productos DESC;
```

### Productos Más Populares
```sql
-- Productos en más catálogos
SELECT 
    p.nombre,
    COUNT(c.id) as total_clientes
FROM products p
LEFT JOIN catalogs c ON p.id = c.productId
GROUP BY p.id, p.nombre
ORDER BY total_clientes DESC
LIMIT 10;
```

### Clientes Sin Productos
```sql
SELECT cl.* 
FROM clients cl
LEFT JOIN catalogs c ON cl.id = c.clientId
WHERE c.id IS NULL;
```

## Operaciones de Mantenimiento

### Backup Completo
```bash
# Backup de toda la base de datos
pg_dump -U postgres catalogos_saas > backup_full.sql

# Backup solo de datos (sin schema)
pg_dump -U postgres --data-only catalogos_saas > backup_data.sql

# Backup solo de schema
pg_dump -U postgres --schema-only catalogos_saas > backup_schema.sql
```

### Restauración
```bash
# Restaurar todo
psql -U postgres catalogos_saas < backup_full.sql

# Restaurar solo datos
psql -U postgres catalogos_saas < backup_data.sql
```

### Limpiar Datos de Prueba
```sql
-- Limpiar catálogos
DELETE FROM catalogs WHERE clientId = 1;

-- Limpiar clientes de prueba (excepto el default)
DELETE FROM clients WHERE id > 1;

-- Limpiar usuarios de prueba
DELETE FROM users WHERE email LIKE '%test.com';
```

## Triggers Automáticos

El sistema incluye triggers para actualizar automáticamente `updatedAt`:

```sql
-- Ejemplo: Al actualizar un producto
UPDATE products 
SET precio = 450.00 
WHERE id = 1;
-- El campo updatedAt se actualiza automáticamente

-- Verificar
SELECT nombre, precio, updatedAt 
FROM products 
WHERE id = 1;
```

## Constraints y Validaciones

### Reglas de Negocio Implementadas

1. **Email único**: No pueden haber dos usuarios con el mismo email
2. **Catálogo único**: Un cliente no puede tener el mismo producto dos veces
3. **Integridad referencial**: 
   - Si se elimina un usuario, se eliminan sus clientes
   - Si se elimina un cliente, se eliminan sus entradas de catálogo
   - Si se elimina un producto, se eliminan sus entradas de catálogo

### Ejemplo de Constraint
```sql
-- Intentar agregar el mismo producto dos veces al mismo cliente
INSERT INTO catalogs (clientId, productId) VALUES (1, 1);
-- Primera vez: ✅ Funciona

INSERT INTO catalogs (clientId, productId) VALUES (1, 1);
-- Segunda vez: ❌ Error por UNIQUE constraint
```

## Performance Tips

1. **Usar índices apropiadamente**: Los índices ya están creados para consultas comunes
2. **Limitar resultados**: Usar LIMIT en consultas que puedan retornar muchos registros
3. **Joins eficientes**: Los foreign keys e índices hacen los joins rápidos
4. **Evitar SELECT ***: Seleccionar solo columnas necesarias

### Ejemplo de Consulta Optimizada
```sql
-- ❌ Mal: trae todo
SELECT * FROM products;

-- ✅ Bien: solo lo necesario
SELECT id, nombre, precio FROM products WHERE category = 'Ropa';

-- ✅ Mejor: con límite
SELECT id, nombre, precio FROM products WHERE category = 'Ropa' LIMIT 20;
```

## Próximas Mejoras Sugeridas

1. **Tabla de categorías**: Normalizar categories en tabla separada
2. **Tabla de imágenes**: Múltiples imágenes por producto
3. **Tabla de órdenes**: Sistema de pedidos
4. **Tabla de reviews**: Reseñas de productos
5. **Full-text search**: Búsqueda avanzada en productos
6. **Historial de precios**: Track de cambios de precio
7. **Logs de auditoría**: Rastrear todas las modificaciones

## Referencias

- **TypeORM**: https://typeorm.io/
- **PostgreSQL**: https://www.postgresql.org/docs/
- **NestJS**: https://docs.nestjs.com/
- Ver `database/README.md` para documentación técnica completa
- Ver `INTEGRATION_GUIDE.md` para ejemplos de código
