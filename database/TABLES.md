# 📋 Resumen de Tablas PostgreSQL - Catalogos SaaS v1

## Estructura General

Este documento proporciona un resumen conciso de las tablas principales de la base de datos.

---

## 1. 👥 USERS (Usuarios)

**Propósito**: Almacenar cuentas de usuario y autenticación

### Campos
| Campo | Tipo | Descripción | Constraints |
|-------|------|-------------|-------------|
| id | SERIAL | ID único del usuario | PRIMARY KEY |
| email | VARCHAR(255) | Email para login | UNIQUE, NOT NULL |
| password | VARCHAR(255) | Contraseña | NOT NULL |
| role | VARCHAR(50) | Rol del usuario | DEFAULT 'user' |
| nombre | VARCHAR(255) | Nombre completo | NULL |
| createdAt | TIMESTAMP | Fecha de creación | AUTO |
| updatedAt | TIMESTAMP | Fecha de actualización | AUTO |

### Roles Disponibles
- **admin**: Acceso completo al sistema
- **client**: Puede crear y gestionar catálogos
- **user**: Usuario final que consulta catálogos

### Relaciones
- `1:N` con **clients** (un usuario puede tener varios negocios)

### Ejemplo
```sql
INSERT INTO users (email, password, role, nombre)
VALUES ('juan@email.com', 'hashed_password', 'client', 'Juan Pérez');
```

---

## 2. 🏢 CLIENTS (Clientes/Negocios)

**Propósito**: Información de negocios para personalizar catálogos

### Campos
| Campo | Tipo | Descripción | Constraints |
|-------|------|-------------|-------------|
| id | SERIAL | ID único del cliente | PRIMARY KEY |
| nombre | VARCHAR(255) | Nombre del negocio | NOT NULL |
| logo | VARCHAR(500) | Ruta al logo | NULL |
| color | VARCHAR(7) | Color de marca (hex) | DEFAULT '#f24427' |
| telefono | VARCHAR(20) | Teléfono de contacto | NULL |
| direccion | TEXT | Dirección física | NULL |
| descripcion | TEXT | Descripción del negocio | NULL |
| userId | INTEGER | ID del usuario propietario | FK → users.id |
| createdAt | TIMESTAMP | Fecha de creación | AUTO |
| updatedAt | TIMESTAMP | Fecha de actualización | AUTO |

### Relaciones
- `N:1` con **users** (muchos clientes pueden pertenecer a un usuario)
- `1:N` con **catalogs** (un cliente tiene muchas entradas en su catálogo)

### Ejemplo
```sql
INSERT INTO clients (nombre, logo, color, telefono, userId)
VALUES ('Boutique Elegante', '/logos/boutique.png', '#e91e63', '555-1234', 1);
```

---

## 3. 📦 PRODUCTS (Productos)

**Propósito**: Catálogo maestro de productos disponibles

### Campos
| Campo | Tipo | Descripción | Constraints |
|-------|------|-------------|-------------|
| id | SERIAL | ID único del producto | PRIMARY KEY |
| ruta | VARCHAR(500) | Ruta a imagen del producto | NOT NULL |
| nombre | VARCHAR(255) | Nombre del producto | NOT NULL |
| precio | DECIMAL(10,2) | Precio base | NOT NULL |
| description | TEXT | Descripción detallada | NOT NULL |
| stock | INTEGER | Cantidad disponible | DEFAULT 0 |
| category | VARCHAR(100) | Categoría del producto | NOT NULL |
| createdAt | TIMESTAMP | Fecha de creación | AUTO |
| updatedAt | TIMESTAMP | Fecha de actualización | AUTO |

### Categorías Comunes
- Ropa
- Accesorios
- Calzado
- Electrónicos
- Hogar

### Relaciones
- `1:N` con **catalogs** (un producto puede estar en muchos catálogos)
- `1:N` con **product_variants** (un producto puede tener muchas variantes)

### Ejemplo
```sql
INSERT INTO products (ruta, nombre, precio, description, stock, category)
VALUES ('/products/shirt1.png', 'Camisa Casual', 399.00, 'Camisa 100% algodón', 50, 'Ropa');
```

---

## 4. 🎨 PRODUCT_VARIANTS (Variantes de Productos) 🆕

**Propósito**: Almacenar variantes de productos (tallas, colores, etc.)

### Campos
| Campo | Tipo | Descripción | Constraints |
|-------|------|-------------|-------------|
| id | SERIAL | ID único de la variante | PRIMARY KEY |
| productId | INTEGER | ID del producto base | FK → products.id |
| variantType | VARCHAR(100) | Tipo de variante (ej: 'Talla', 'Color') | NOT NULL |
| variantValue | VARCHAR(255) | Valor de la variante (ej: 'S', 'M', 'Rojo') | NOT NULL |
| additionalPrice | DECIMAL(10,2) | Precio adicional de la variante | DEFAULT 0 |
| stock | INTEGER | Stock específico de la variante | DEFAULT 0 |
| imageUrl | TEXT | Imagen específica de la variante | NULL |
| active | BOOLEAN | Si la variante está activa | DEFAULT true |
| createdAt | TIMESTAMP | Fecha de creación | AUTO |
| updatedAt | TIMESTAMP | Fecha de actualización | AUTO |

### Constraints Especiales
- `UNIQUE(productId, variantType, variantValue)`: No se puede repetir la misma combinación de variante

### Tipos de Variante Comunes
- **Talla**: S, M, L, XL, XXL (ropa)
- **Talla**: 28, 30, 32, 34, 36 (pantalones)
- **Color**: Rojo, Azul, Negro, Blanco
- **Tamaño**: Pequeño, Mediano, Grande
- **Material**: Algodón, Poliéster, Cuero

### Relaciones
- `N:1` con **products** (muchas variantes pertenecen a un producto)

### Ejemplo
```sql
-- Agregar tallas a una camisa
INSERT INTO product_variants (productId, variantType, variantValue, additionalPrice, stock)
VALUES 
    (2, 'Talla', 'S', 0, 10),
    (2, 'Talla', 'M', 0, 15),
    (2, 'Talla', 'L', 0, 12),
    (2, 'Talla', 'XL', 10.00, 8);  -- Talla XL cuesta $10 más

-- Agregar colores a un gorro
INSERT INTO product_variants (productId, variantType, variantValue, stock, imageUrl)
VALUES 
    (1, 'Color', 'Negro', 20, '/products/cap1-negro.png'),
    (1, 'Color', 'Rojo', 15, '/products/cap1-rojo.png');
```

---

## 5. 📋 CATALOGS (Catálogos)

**Propósito**: Vincular clientes con productos (tabla de unión many-to-many)

### Campos
| Campo | Tipo | Descripción | Constraints |
|-------|------|-------------|-------------|
| id | SERIAL | ID único de la entrada | PRIMARY KEY |
| clientId | INTEGER | ID del cliente | FK → clients.id |
| productId | INTEGER | ID del producto | FK → products.id |
| active | BOOLEAN | Producto activo en catálogo | DEFAULT true |
| customPrice | DECIMAL(10,2) | Precio personalizado (opcional) | NULL |
| createdAt | TIMESTAMP | Fecha de creación | AUTO |
| updatedAt | TIMESTAMP | Fecha de actualización | AUTO |

### Constraints Especiales
- `UNIQUE(clientId, productId)`: Un cliente no puede tener el mismo producto dos veces

### Relaciones
- `N:1` con **clients** (muchas entradas pertenecen a un cliente)
- `N:1` con **products** (muchas entradas referencian un producto)

### Ejemplo
```sql
-- Agregar producto al catálogo con precio personalizado
INSERT INTO catalogs (clientId, productId, active, customPrice)
VALUES (1, 5, true, 350.00);

-- Agregar producto con precio estándar
INSERT INTO catalogs (clientId, productId, active)
VALUES (1, 6, true);
```

---

## 🔗 Diagrama de Relaciones Simplificado

```
USERS
  ↓ (1:N)
CLIENTS ←→ CATALOGS ←→ PRODUCTS ←→ PRODUCT_VARIANTS
        (N:N a través de CATALOGS)    (1:N)
```

---

## 📊 Estadísticas de Datos Iniciales

Después de ejecutar `database/init.sql` y `database/product_variants_schema.sql`:

| Tabla | Registros | Descripción |
|-------|-----------|-------------|
| users | 3 | admin, user, client |
| clients | 1 | UrbanStreet (negocio por defecto) |
| products | 9 | Productos de ejemplo (ropa y accesorios) |
| catalogs | 9 | Todos los productos vinculados al cliente 1 |
| product_variants | 20+ | Variantes de talla para ropa |

---

## 🎯 Casos de Uso Principales

### 1. Crear un Nuevo Cliente con Catálogo
```sql
-- Paso 1: Usuario se registra
INSERT INTO users (email, password, role, nombre)
VALUES ('maria@tienda.com', '123', 'client', 'María García')
RETURNING id; -- Obtiene id = 2

-- Paso 2: Crea su negocio
INSERT INTO clients (nombre, userId, color, telefono)
VALUES ('Boutique María', 2, '#e91e63', '555-9876')
RETURNING id; -- Obtiene id = 2

-- Paso 3: Selecciona productos para su catálogo
INSERT INTO catalogs (clientId, productId, active) VALUES (2, 1, true);
INSERT INTO catalogs (clientId, productId, active) VALUES (2, 2, true);
INSERT INTO catalogs (clientId, productId, active) VALUES (2, 3, true);
```

### 2. Consultar Catálogo de un Cliente
```sql
SELECT 
    p.id,
    p.nombre,
    p.description,
    COALESCE(c.customPrice, p.precio) as precio_final,
    p.stock,
    p.category,
    c.active
FROM catalogs c
INNER JOIN products p ON c.productId = p.id
WHERE c.clientId = 1
AND c.active = true
ORDER BY p.category, p.nombre;
```

### 3. Buscar Productos sin Vincular a un Cliente
```sql
-- Productos que el cliente 1 NO tiene en su catálogo
SELECT p.*
FROM products p
WHERE p.id NOT IN (
    SELECT productId 
    FROM catalogs 
    WHERE clientId = 1
);
```

### 4. Estadísticas de Cliente
```sql
SELECT 
    cl.nombre as cliente,
    COUNT(CASE WHEN c.active = true THEN 1 END) as productos_activos,
    COUNT(*) as total_productos,
    COUNT(c.customPrice) as productos_con_precio_custom
FROM clients cl
LEFT JOIN catalogs c ON cl.id = c.clientId
WHERE cl.id = 1
GROUP BY cl.id, cl.nombre;
```

---

## 🔍 Índices para Performance

| Índice | Tabla | Columna(s) | Propósito |
|--------|-------|------------|-----------|
| idx_users_email | users | email | Login rápido |
| idx_clients_userId | clients | userId | Buscar clientes de un usuario |
| idx_catalogs_clientId | catalogs | clientId | Obtener catálogo de cliente |
| idx_catalogs_productId | catalogs | productId | Ver qué clientes tienen un producto |
| idx_products_category | products | category | Filtrar por categoría |

---

## 🔐 Reglas de Integridad

### Cascadas (ON DELETE CASCADE)
- Si eliminas un **user**, se eliminan sus **clients**
- Si eliminas un **client**, se eliminan sus **catalogs**
- Si eliminas un **product**, se eliminan sus **catalogs**

### Ejemplo de Cascada
```sql
-- Eliminar usuario también elimina sus clientes y catálogos
DELETE FROM users WHERE id = 2;
-- Automáticamente elimina:
-- - clients donde userId = 2
-- - catalogs donde clientId estaba asociado a ese usuario
```

---

## 📈 Métricas Útiles

### Total de Productos por Cliente
```sql
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
SELECT 
    p.nombre,
    COUNT(c.id) as en_cuantos_catalogos
FROM products p
LEFT JOIN catalogs c ON p.id = c.productId
GROUP BY p.id, p.nombre
ORDER BY en_cuantos_catalogos DESC
LIMIT 10;
```

### Valor Total del Inventario
```sql
SELECT 
    SUM(precio * stock) as valor_total_inventario
FROM products;
```

---

## 🛠️ Comandos de Mantenimiento Rápido

### Ver Estructura
```bash
# Ver todas las tablas
psql -U postgres -d catalogos_saas -c "\dt"

# Ver estructura de una tabla
psql -U postgres -d catalogos_saas -c "\d users"
```

### Contar Registros
```bash
psql -U postgres -d catalogos_saas -c "
SELECT 
    'users' as tabla, COUNT(*) as registros FROM users
UNION ALL
SELECT 'clients', COUNT(*) FROM clients
UNION ALL
SELECT 'products', COUNT(*) FROM products
UNION ALL
SELECT 'catalogs', COUNT(*) FROM catalogs;
"
```

### Resetear Datos
```bash
# Limpiar todo y reiniciar
psql -U postgres -d catalogos_saas -c "
TRUNCATE users, clients, products, catalogs RESTART IDENTITY CASCADE;
"

# Recargar datos iniciales
psql -U postgres -d catalogos_saas -f database/init.sql
```

---

## 📖 Referencias

- **Documentación completa**: `database/README.md`
- **Diagramas visuales**: `database/DIAGRAMS.md`
- **Guía de integración**: `INTEGRATION_GUIDE.md`
- **Inicio rápido**: `QUICKSTART.md`
- **Script SQL**: `database/init.sql`

---

**Creado para Catalogos SaaS v1** 🚀
