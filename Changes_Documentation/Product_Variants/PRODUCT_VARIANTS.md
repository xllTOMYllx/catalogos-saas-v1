# 🎨 Sistema de Variantes de Productos

## Descripción General

Este módulo permite agregar variantes a los productos (tallas, colores, tamaños, etc.) para un control más detallado antes de agregar al carrito. Los clientes pueden ver y seleccionar las opciones disponibles en un modal de detalle del producto.

## Características

### ✅ Implementado

- **Modal de Detalle de Producto**: Vista individual al hacer clic en cualquier producto
- **Variantes Flexibles**: Soporte para cualquier tipo de variante (Talla, Color, Tamaño, Material, etc.)
- **Stock por Variante**: Control de inventario específico para cada variante
- **Precio Adicional**: Posibilidad de agregar cargo extra por variante (ej: Talla XL +$10)
- **Imágenes por Variante**: Opción de tener imagen específica para cada variante
- **Integración con Carrito**: Muestra información de variantes seleccionadas
- **WhatsApp**: Incluye variantes en el mensaje de pedido

## Estructura de Base de Datos

### Tabla: product_variants

```sql
CREATE TABLE product_variants (
    id SERIAL PRIMARY KEY,
    "productId" INTEGER REFERENCES products(id) ON DELETE CASCADE,
    "variantType" VARCHAR(100) NOT NULL,  -- 'Talla', 'Color', 'Tamaño'
    "variantValue" VARCHAR(255) NOT NULL, -- 'S', 'M', 'L', 'Rojo', 'Azul'
    "additionalPrice" DECIMAL(10, 2) DEFAULT 0,
    stock INTEGER DEFAULT 0,
    "imageUrl" TEXT,
    active BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("productId", "variantType", "variantValue")
);
```

## Instalación

### 1. Migrar la Base de Datos

```bash
psql -U postgres -d catalogos_saas -f database/product_variants_schema.sql
```

### 2. Backend

El backend ya incluye los módulos de variantes. Solo reiniciar:

```bash
cd backend && npm run start:dev
```

### 3. Frontend

El frontend ya incluye el modal de detalle. Solo reiniciar:

```bash
cd frontend && npm run dev
```

## API Endpoints

### Variantes de Productos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/product-variants` | Obtener todas las variantes |
| GET | `/api/product-variants/:id` | Obtener una variante |
| GET | `/api/product-variants/product/:productId` | Obtener variantes de un producto |
| POST | `/api/product-variants` | Crear una variante |
| POST | `/api/product-variants/bulk` | Crear múltiples variantes |
| PUT | `/api/product-variants/:id` | Actualizar variante |
| PUT | `/api/product-variants/:id/stock` | Actualizar stock de variante |
| DELETE | `/api/product-variants/:id` | Eliminar variante |

### Productos con Variantes

```bash
# Obtener producto con sus variantes
GET /api/products/1?includeVariants=true

# Obtener todos los productos con variantes
GET /api/products?includeVariants=true
```

## Componentes Frontend

### ProductDetailModal

Modal que se abre al hacer clic en cualquier producto. Características:

- Muestra imagen grande del producto
- Lista variantes agrupadas por tipo
- Selector de cantidad
- Cálculo de precio total en tiempo real
- Botón para agregar al carrito con validación

### Uso

```jsx
import ProductDetailModal from './components/ProductDetailModal';

<ProductDetailModal
  isOpen={isModalOpen}
  onClose={handleCloseModal}
  product={product}
  clientName="Mi Tienda"
  clientColor="#f24427"
/>
```

## Flujo de Usuario

1. **Ver Catálogo**: El usuario navega por los productos
2. **Clic en Producto**: Se abre el modal de detalle
3. **Seleccionar Variantes**: El usuario elige talla, color, etc.
4. **Elegir Cantidad**: Ajusta la cantidad deseada
5. **Ver Precio Total**: El precio se actualiza en tiempo real
6. **Agregar al Carrito**: Click en "Agregar al Carrito"
7. **Ver en Carrito**: Las variantes se muestran junto al producto

## Ejemplos de Uso

### Agregar Variantes a un Producto Existente

```javascript
// Frontend API
import { productsApi } from './api/products';

// Agregar tallas a una camisa
await productsApi.createVariantsBulk([
  { productId: 2, variantType: 'Talla', variantValue: 'S', stock: 10 },
  { productId: 2, variantType: 'Talla', variantValue: 'M', stock: 15 },
  { productId: 2, variantType: 'Talla', variantValue: 'L', stock: 12 },
  { productId: 2, variantType: 'Talla', variantValue: 'XL', additionalPrice: 10, stock: 8 }
]);
```

### Consultar Variantes de un Producto

```javascript
const variants = await productsApi.getVariants(productId);
console.log(variants);
// [
//   { id: 1, variantType: 'Talla', variantValue: 'S', stock: 10, ... },
//   { id: 2, variantType: 'Talla', variantValue: 'M', stock: 15, ... },
//   ...
// ]
```

## Configuración por Tipo de Producto

### Ropa (Camisas, Pantalones)

```sql
INSERT INTO product_variants (productId, variantType, variantValue, stock) VALUES
    (1, 'Talla', 'S', 10),
    (1, 'Talla', 'M', 15),
    (1, 'Talla', 'L', 12),
    (1, 'Talla', 'XL', 8);
```

### Accesorios (Gorras, Gorros)

```sql
INSERT INTO product_variants (productId, variantType, variantValue, stock, imageUrl) VALUES
    (5, 'Color', 'Negro', 20, '/products/gorro-negro.png'),
    (5, 'Color', 'Rojo', 15, '/products/gorro-rojo.png'),
    (5, 'Color', 'Azul', 18, '/products/gorro-azul.png');
```

### Electrónicos

```sql
INSERT INTO product_variants (productId, variantType, variantValue, additionalPrice, stock) VALUES
    (10, 'Almacenamiento', '64GB', 0, 25),
    (10, 'Almacenamiento', '128GB', 50, 20),
    (10, 'Almacenamiento', '256GB', 100, 15);
```

## Integración con Carrito

El carrito almacena la información de variantes:

```javascript
// Estructura de item en el carrito
{
  id: '2-1-2', // productId-variantId-variantId
  productId: 2,
  nombre: 'Camisa número 1',
  precio: 409, // Precio base + adicionales
  variantInfo: 'Talla: M, Color: Azul',
  variantIds: [1, 5],
  quantity: 2
}
```

## Mensaje de WhatsApp

El mensaje de WhatsApp incluye las variantes seleccionadas:

```
¡Hola! Mi pedido de Mi Tienda:
Camisa número 1 (Talla: M) x2 - $818.00,
Gorro número 1 (Color: Negro) x1 - $399.00
Total: $1,217.00
```

## Notas Técnicas

- Las variantes se cargan al abrir el modal para minimizar peticiones
- Si un producto no tiene variantes, se puede agregar directamente al carrito
- El stock se valida tanto a nivel de producto como de variante
- Los IDs de carrito incluyen los IDs de variantes para diferenciar el mismo producto con diferentes opciones

## Gestión de Variantes en Admin

### Funcionalidades del Panel de Administración

El panel de administración ahora permite gestionar variantes directamente desde el formulario de productos:

1. **Agregar Variantes al Crear Producto**
   - Click en "Agregar Variantes (Talla, Color, etc.)" para expandir la sección
   - Seleccionar tipo de variante (Talla, Color, Tamaño, Material, Estilo) o escribir uno personalizado
   - Agregar valor, precio adicional y stock
   - Las variantes se crean automáticamente junto con el producto

2. **Editar Variantes de Producto Existente**
   - Al editar un producto, las variantes existentes se cargan automáticamente
   - Modificar valor, precio adicional o stock de cualquier variante
   - Eliminar variantes con el botón X
   - Agregar nuevas variantes al producto existente

3. **Indicador de Variantes en Lista**
   - Cada producto muestra un badge con el número de variantes
   - Ejemplo: "3 variantes" en color púrpura
   - Se actualiza automáticamente al cerrar el formulario

### Componentes Actualizados

- `ProductForm.jsx` - Formulario con sección de gestión de variantes
- `ProductList.jsx` - Lista con indicador de variantes por producto
- `adminStore.js` - Store actualizado para devolver el producto creado

## Archivos Modificados

### Backend
- `backend/src/products/product.entity.ts` - Relación con variantes
- `backend/src/products/product-variant.entity.ts` - Nueva entidad
- `backend/src/products/products.module.ts` - Registro de módulo
- `backend/src/products/products.service.ts` - Métodos con variantes
- `backend/src/products/products.controller.ts` - Endpoint con variantes
- `backend/src/products/product-variants.service.ts` - Nuevo servicio
- `backend/src/products/product-variants.controller.ts` - Nuevo controller
- `backend/src/app.module.ts` - Registro de entidad

### Frontend
- `frontend/src/components/ProductCard.jsx` - Click para abrir modal
- `frontend/src/components/ProductDetailModal.jsx` - Nuevo componente
- `frontend/src/components/admin/ProductForm.jsx` - Gestión de variantes en formulario
- `frontend/src/components/admin/ProductList.jsx` - Indicador de variantes
- `frontend/src/api/products.js` - APIs de variantes
- `frontend/src/store/adminStore.js` - Devuelve producto creado
- `frontend/src/store/cartStore.js` - Soporte para variantInfo
- `frontend/src/pages/Carrito.jsx` - Mostrar variantes
- `frontend/src/styles/carrito.module.css` - Estilos para variantes

### Base de Datos
- `database/product_variants_schema.sql` - Nueva migración
- `database/TABLES.md` - Documentación actualizada

---

**Creado para Catalogos SaaS v1** 🚀
