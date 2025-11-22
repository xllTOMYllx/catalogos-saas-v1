# 🚀 Guía de Implementación de Suscripciones - Catalogos SaaS v1

## Resumen Ejecutivo

Se ha implementado un **sistema completo de suscripciones** para el proyecto Catalogos SaaS v1, permitiendo monetizar el servicio con diferentes planes de precio según las necesidades de los usuarios.

---

## ✅ ¿Qué se ha implementado?

### 1. Base de Datos (PostgreSQL)
- ✅ Nueva tabla `subscription_plans` con 4 planes predefinidos
- ✅ Nueva tabla `subscriptions` para gestionar suscripciones de usuarios
- ✅ Script SQL de migración (`database/subscriptions_schema.sql`)
- ✅ Relaciones con tabla `users` existente
- ✅ Índices para optimización de consultas

### 2. Backend (NestJS + TypeORM)
- ✅ **Módulo SubscriptionPlans** completo:
  - Entidad TypeORM
  - DTOs de validación
  - Service con lógica de negocio
  - Controller con endpoints REST
  - Module con configuración
  
- ✅ **Módulo Subscriptions** completo:
  - Entidad TypeORM
  - DTOs de validación
  - Service con lógica de negocio
  - Controller con endpoints REST
  - Module con configuración
  
- ✅ **Integración**:
  - Actualizada entidad User con relación OneToOne
  - Módulos integrados en app.module.ts
  - Build exitoso verificado

### 3. Frontend (React + Vite)
- ✅ **Servicios API** (`src/api/subscriptions.js`):
  - 11 funciones para consumir endpoints
  - Integrado con axios existente
  
- ✅ **Store de Zustand** (`src/store/subscriptionStore.js`):
  - Estado global de suscripciones
  - 8 acciones para gestionar planes
  - Helpers para verificar límites
  
- ✅ **Componentes UI**:
  - `SubscriptionPlans.jsx` - Página completa de planes
  - `SubscriptionBadge.jsx` - Badge del plan actual
  - Diseño responsive con TailwindCSS
  - Modal de confirmación
  - Animaciones y efectos visuales

### 4. Documentación
- ✅ `SUBSCRIPTIONS.md` - Documentación técnica completa
- ✅ `IMPLEMENTACION_SUSCRIPCIONES.md` (este archivo) - Guía de uso

---

## 💰 Planes Implementados

| Plan | Precio | Catálogos | Productos | Características Principales |
|------|--------|-----------|-----------|---------------------------|
| **FREE** | $0/mes | 1 | 20 por catálogo | Personalización básica, soporte comunitario |
| **BASIC** | $299/mes | 3 | 100 por catálogo | Personalización avanzada, soporte email, analytics |
| **PRO** | $799/mes | 10 | Ilimitados | Todo lo anterior + API access, soporte prioritario |
| **ENTERPRISE** | $1,999/mes | Ilimitados | Ilimitados | Todo lo anterior + white label, soporte dedicado |

---

## 🔧 Instalación Paso a Paso

### Paso 1: Migrar la Base de Datos

```bash
# Conectarse a PostgreSQL
psql -U postgres -d catalogos_saas

# Ejecutar el script de migración
\i database/subscriptions_schema.sql

# O desde la terminal:
psql -U postgres -d catalogos_saas -f database/subscriptions_schema.sql
```

**¿Qué hace este script?**
- Crea tabla `subscription_plans` con 4 planes
- Crea tabla `subscriptions`
- Crea índices para optimización
- Asigna plan FREE a todos los usuarios existentes

**Verificar que funcionó:**
```sql
-- Ver los planes creados
SELECT * FROM subscription_plans;

-- Ver las suscripciones
SELECT * FROM subscriptions;
```

### Paso 2: Backend (Ya está listo)

El backend ya está completamente integrado. Solo necesitas:

```bash
cd backend

# Instalar dependencias (si no lo has hecho)
npm install

# Iniciar el servidor
npm run start:dev
```

**Verificar que funciona:**
```bash
# Probar el endpoint de planes
curl http://localhost:3000/api/subscription-plans

# Debería devolver un JSON con los 4 planes
```

### Paso 3: Frontend - Agregar Rutas

Edita tu archivo de rutas (probablemente `frontend/src/routes/index.jsx` o `frontend/src/App.jsx`):

```jsx
import SubscriptionPlans from '../pages/SubscriptionPlans';

// Dentro de tu Routes
<Route path="/subscription-plans" element={<SubscriptionPlans />} />
```

### Paso 4: Frontend - Agregar Badge al Header

Si quieres mostrar el plan actual en el header, edita tu componente de navegación:

```jsx
import SubscriptionBadge from '../components/SubscriptionBadge';

// Dentro de tu header/navbar
<SubscriptionBadge userId={currentUser?.id} />
```

### Paso 5: Configurar WhatsApp para Cambios de Plan 🆕

Los cambios de plan se gestionan manualmente a través de WhatsApp. Configura tu número:

```bash
# Editar el archivo de configuración
nano frontend/src/config/contact.js

# Cambiar el número de WhatsApp (incluye código de país sin +)
whatsappNumber: '521234567890'  # Ejemplo: México
```

**Ver guía completa:** [CONFIGURACION_WHATSAPP.md](CONFIGURACION_WHATSAPP.md)

### Paso 6: Iniciar Frontend

```bash
cd frontend

# Instalar dependencias (si no lo has hecho)
npm install

# Iniciar servidor de desarrollo
npm run dev
```

---

## 📝 Cómo Usar el Sistema

### Para Usuarios Finales

1. **Ver Planes Disponibles**
   - Navegar a `/subscription-plans`
   - Ver detalles de cada plan
   - Comparar características y precios

2. **Cambiar de Plan** 🆕
   - Click en "Contactar Soporte" del plan deseado
   - Se muestra modal informativo
   - Click en "Abrir WhatsApp"
   - WhatsApp se abre con mensaje predefinido
   - Enviar mensaje al soporte
   - El desarrollador procesa el cambio manualmente

3. **Ver Plan Actual**
   - Badge visible en el header/navbar
   - Click en el badge para ir a página de planes

### Para Desarrolladores

#### Backend - Obtener suscripción de un usuario

```typescript
// En cualquier servicio
constructor(
  private subscriptionsService: SubscriptionsService
) {}

async checkUserLimits(userId: number) {
  const subscription = await this.subscriptionsService.findByUserId(userId);
  const limits = await this.subscriptionsService.checkLimits(userId);
  
  if (!limits.canCreateCatalog) {
    throw new BadRequestException('Has alcanzado el límite de catálogos de tu plan');
  }
}
```

#### Frontend - Verificar límites antes de acción

```javascript
import useSubscriptionStore from './store/subscriptionStore';

function MyComponent() {
  const { canCreateCatalog, fetchUserLimits } = useSubscriptionStore();
  
  useEffect(() => {
    fetchUserLimits(user.id);
  }, [user.id]);
  
  const handleCreateCatalog = () => {
    if (!canCreateCatalog()) {
      alert('Has alcanzado el límite de catálogos. Actualiza tu plan.');
      return;
    }
    // Continuar con la creación...
  };
  
  return <button onClick={handleCreateCatalog}>Crear Catálogo</button>;
}
```

---

## 🔌 API Endpoints Disponibles

### Planes de Suscripción

```bash
# Obtener todos los planes activos
GET /api/subscription-plans

# Obtener un plan específico
GET /api/subscription-plans/:id

# Crear nuevo plan (admin)
POST /api/subscription-plans
Body: {
  "name": "PREMIUM",
  "price": 1499.00,
  "max_catalogs": 20,
  "max_products_per_catalog": -1
}

# Actualizar plan (admin)
PUT /api/subscription-plans/:id

# Eliminar plan (admin)
DELETE /api/subscription-plans/:id
```

### Suscripciones

```bash
# Obtener todas las suscripciones
GET /api/subscriptions

# Obtener suscripción específica
GET /api/subscriptions/:id

# Obtener suscripción de un usuario
GET /api/subscriptions/user/:userId

# Obtener límites de un usuario
GET /api/subscriptions/user/:userId/limits

# Crear suscripción
POST /api/subscriptions
Body: {
  "userId": 1,
  "planId": 2
}

# Cambiar plan de usuario
PUT /api/subscriptions/user/:userId/change-plan
Body: {
  "planId": 3
}

# Cancelar suscripción
PUT /api/subscriptions/user/:userId/cancel
```

---

## 🎨 Personalización

### Modificar Precios de Planes

```sql
UPDATE subscription_plans 
SET price = 399.00 
WHERE name = 'BASIC';
```

### Agregar un Nuevo Plan

```sql
INSERT INTO subscription_plans (
  name, 
  description, 
  price, 
  max_catalogs, 
  max_products_per_catalog,
  features
) VALUES (
  'PREMIUM',
  'Plan Premium con más beneficios',
  1499.00,
  20,
  -1,
  '{"custom_domain": true, "advanced_analytics": true}'::jsonb
);
```

### Cambiar Límites de un Plan

```sql
UPDATE subscription_plans 
SET 
  max_catalogs = 5,
  max_products_per_catalog = 200
WHERE name = 'BASIC';
```

### Personalizar Colores en Frontend

Edita `frontend/src/components/SubscriptionBadge.jsx`:

```javascript
const getPlanColor = (planName) => {
  const colors = {
    FREE: 'bg-gray-100 text-gray-700',
    BASIC: 'bg-green-100 text-green-700',  // Cambiar aquí
    PRO: 'bg-purple-100 text-purple-700',
    ENTERPRISE: 'bg-orange-100 text-orange-700',  // Cambiar aquí
  };
  return colors[planName] || 'bg-gray-100 text-gray-700';
};
```

---

## 🧪 Pruebas

### Prueba Manual Completa

1. **Setup inicial**
   ```bash
   # Ejecutar migración de BD
   psql -U postgres -d catalogos_saas -f database/subscriptions_schema.sql
   
   # Iniciar backend
   cd backend && npm run start:dev
   
   # Iniciar frontend (otra terminal)
   cd frontend && npm run dev
   ```

2. **Probar endpoints de backend**
   ```bash
   # Obtener planes
   curl http://localhost:3000/api/subscription-plans
   
   # Obtener suscripción del usuario 1
   curl http://localhost:3000/api/subscriptions/user/1
   ```

3. **Probar frontend**
   - Abrir `http://localhost:5173/subscription-plans`
   - Ver que se muestran los 4 planes
   - Intentar cambiar de plan
   - Ver que el badge muestra el plan actual

### Verificar Base de Datos

```sql
-- Ver todos los planes
SELECT id, name, price, max_catalogs, max_products_per_catalog 
FROM subscription_plans;

-- Ver todas las suscripciones
SELECT s.id, u.email, sp.name as plan, s.status 
FROM subscriptions s
JOIN users u ON s."userId" = u.id
JOIN subscription_plans sp ON s."planId" = sp.id;

-- Ver cuántos usuarios tiene cada plan
SELECT sp.name, COUNT(s.id) as usuarios
FROM subscription_plans sp
LEFT JOIN subscriptions s ON sp.id = s."planId"
GROUP BY sp.name;
```

---

## ⚠️ Consideraciones Importantes

### Validación de Límites

Actualmente el sistema **NO valida automáticamente** los límites en el backend. Necesitarás implementar guards/middleware en los endpoints de creación:

```typescript
// Ejemplo de validación en clients.controller.ts
@Post()
async create(@Body() createDto: CreateClientDto, @Request() req) {
  const userId = req.user.id;
  const limits = await this.subscriptionsService.checkLimits(userId);
  
  if (!limits.canCreateCatalog) {
    throw new ForbiddenException('Has alcanzado el límite de catálogos');
  }
  
  return this.clientsService.create(createDto);
}
```

### Integración con Pagos

Este sistema **NO incluye** integración con pasarelas de pago. Para producción necesitarás:

1. Integrar Stripe, PayPal, MercadoPago, etc.
2. Manejar webhooks de pagos
3. Actualizar estado de suscripción según pago
4. Implementar facturación

### Seguridad

- Los endpoints deberían protegerse con guards de autenticación
- Los endpoints de admin deberían tener guards de rol
- Validar que usuarios solo puedan ver/modificar sus propias suscripciones

---

## 🚀 Próximos Pasos Sugeridos

### Corto Plazo (1-2 semanas)
- [ ] Implementar validación de límites en backend
- [ ] Agregar guards de autenticación a endpoints
- [ ] Crear guards de rol para endpoints admin
- [ ] Agregar notificaciones cuando se alcancen límites

### Mediano Plazo (1 mes)
- [ ] Integrar pasarela de pagos (Stripe recomendado)
- [ ] Implementar período de prueba (trial)
- [ ] Crear panel admin para gestionar planes
- [ ] Agregar métricas de uso por usuario

### Largo Plazo (2-3 meses)
- [ ] Sistema de facturación automática
- [ ] Historial de suscripciones
- [ ] Cupones de descuento
- [ ] Programa de referidos
- [ ] Planes anuales con descuento

---

## 📚 Recursos Adicionales

### Documentación
- **SUBSCRIPTIONS.md**: Documentación técnica detallada
- **README.md**: Guía general del proyecto
- **database/TABLES.md**: Estructura de base de datos

### Código de Ejemplo
```javascript
// Ver frontend/src/pages/SubscriptionPlans.jsx para ejemplo completo de UI
// Ver backend/src/subscriptions/subscriptions.service.ts para lógica de negocio
```

### Comandos Útiles
```bash
# Ver logs del backend
cd backend && npm run start:dev

# Rebuild del frontend
cd frontend && npm run build

# Linter
npm run lint

# Ver estructura de tabla en PostgreSQL
psql -U postgres -d catalogos_saas -c "\d subscription_plans"
```

---

## ❓ Preguntas Frecuentes

### ¿Cómo asignar un plan específico a un nuevo usuario?

```typescript
// En el servicio de registro de usuarios
async register(userData) {
  const user = await this.usersService.create(userData);
  
  // Asignar plan FREE por defecto
  const freePlan = await this.subscriptionPlansService.findByName('FREE');
  await this.subscriptionsService.create({
    userId: user.id,
    planId: freePlan.id,
  });
  
  return user;
}
```

### ¿Cómo hacer que un usuario tenga acceso temporal a un plan superior?

```sql
-- Cambiar temporalmente a plan PRO
UPDATE subscriptions 
SET "planId" = (SELECT id FROM subscription_plans WHERE name = 'PRO'),
    end_date = NOW() + INTERVAL '30 days'
WHERE "userId" = 5;
```

### ¿Cómo obtener estadísticas de suscripciones?

```sql
-- Usuarios por plan
SELECT sp.name, COUNT(s.id) as total
FROM subscription_plans sp
LEFT JOIN subscriptions s ON sp.id = s."planId"
GROUP BY sp.name;

-- Ingresos mensuales estimados
SELECT SUM(sp.price) as ingresos_mensuales
FROM subscriptions s
JOIN subscription_plans sp ON s."planId" = sp.id
WHERE s.status = 'active';
```

---

## 🎯 Conclusión

El sistema de suscripciones está **completamente funcional** y listo para usar. Los principales componentes están implementados:

✅ Base de datos migrada  
✅ Backend con APIs REST  
✅ Frontend con UI completo  
✅ Documentación detallada  

Lo que **falta** para producción:
- Integración con pasarela de pagos
- Validación de límites automática
- Sistema de facturación
- Seguridad avanzada (guards, roles)

**¡El sistema base está listo para comenzar a monetizar tu SaaS!** 🚀

---

**Fecha de implementación**: Noviembre 2025  
**Versión**: 1.0  
**Autor**: GitHub Copilot Agent  
**Estado**: ✅ Implementado y Funcional
