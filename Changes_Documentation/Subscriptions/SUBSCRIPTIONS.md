# 📋 Sistema de Suscripciones - Catalogos SaaS v1

## Resumen

Este documento describe la implementación completa del sistema de suscripciones para el proyecto Catalogos SaaS v1. El sistema permite a los usuarios suscribirse a diferentes planes con límites específicos de funcionalidades.

> **⚠️ Nota Importante - Cambios de Plan:** Los cambios de plan se gestionan manualmente a través de WhatsApp para garantizar un control adecuado sobre los servicios y verificación de pagos. Los usuarios contactan al soporte mediante WhatsApp para solicitar cambios de plan. Ver [CONFIGURACION_WHATSAPP.md](CONFIGURACION_WHATSAPP.md) para más detalles.

---

## 🎯 Objetivos

1. **Monetización**: Implementar un modelo de negocio basado en suscripciones
2. **Escalabilidad**: Diferentes planes para diferentes tipos de usuarios
3. **Flexibilidad**: Fácil cambio entre planes
4. **Control**: Límites claros por plan de suscripción

---

## 📊 Planes Disponibles

### Plan FREE (Gratuito)
- **Precio**: $0/mes
- **Límites**:
  - 1 catálogo/negocio
  - Hasta 20 productos en el catálogo
- **Características**:
  - Personalización básica
  - Soporte comunitario
  - Sin análisis

### Plan BASIC
- **Precio**: $299/mes
- **Límites**:
  - 3 catálogos/negocios
  - Hasta 100 productos por catálogo
- **Características**:
  - Personalización avanzada (colores, logo)
  - Soporte por email
  - Análisis básico

### Plan PRO
- **Precio**: $799/mes
- **Límites**:
  - 10 catálogos/negocios
  - Productos ilimitados por catálogo
- **Características**:
  - Personalización completa
  - Soporte prioritario
  - Análisis avanzado
  - Acceso API

### Plan ENTERPRISE
- **Precio**: $1,999/mes
- **Límites**:
  - Catálogos ilimitados
  - Productos ilimitados
- **Características**:
  - Todo lo de PRO +
  - Soporte dedicado
  - White label
  - Personalización máxima

---

## 🗄️ Estructura de Base de Datos

### Tabla: subscription_plans

```sql
CREATE TABLE subscription_plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    billing_period VARCHAR(20) DEFAULT 'monthly',
    max_catalogs INTEGER DEFAULT 1,
    max_products_per_catalog INTEGER DEFAULT 20,
    features JSONB,
    is_active BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Campos importantes**:
- `max_catalogs`: Número máximo de catálogos, -1 para ilimitado
- `max_products_per_catalog`: Número máximo de productos, -1 para ilimitado
- `features`: JSON con características adicionales del plan

### Tabla: subscriptions

```sql
CREATE TABLE subscriptions (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER REFERENCES users(id) ON DELETE CASCADE,
    "planId" INTEGER REFERENCES subscription_plans(id) ON DELETE RESTRICT,
    status VARCHAR(20) DEFAULT 'active',
    start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP,
    auto_renew BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("userId")
);
```

**Estados de suscripción**:
- `active`: Suscripción activa
- `cancelled`: Cancelada por el usuario
- `expired`: Expirada (vencida)
- `trialing`: En período de prueba

### Relaciones

```
users (1) ←→ (1) subscriptions (N) ←→ (1) subscription_plans
```

---

## 🔧 Backend - Arquitectura

### Módulos Implementados

#### 1. SubscriptionPlansModule
**Ubicación**: `backend/src/subscription-plans/`

**Archivos**:
- `subscription-plan.entity.ts`: Entidad TypeORM
- `subscription-plan.dto.ts`: DTOs de validación
- `subscription-plans.service.ts`: Lógica de negocio
- `subscription-plans.controller.ts`: Endpoints REST
- `subscription-plans.module.ts`: Configuración del módulo

**Endpoints**:
```typescript
GET    /api/subscription-plans       // Obtener todos los planes
GET    /api/subscription-plans/:id   // Obtener un plan específico
POST   /api/subscription-plans       // Crear plan (admin)
PUT    /api/subscription-plans/:id   // Actualizar plan (admin)
DELETE /api/subscription-plans/:id   // Eliminar plan (admin)
```

#### 2. SubscriptionsModule
**Ubicación**: `backend/src/subscriptions/`

**Archivos**:
- `subscription.entity.ts`: Entidad TypeORM
- `subscription.dto.ts`: DTOs de validación
- `subscriptions.service.ts`: Lógica de negocio
- `subscriptions.controller.ts`: Endpoints REST
- `subscriptions.module.ts`: Configuración del módulo

**Endpoints**:
```typescript
GET    /api/subscriptions                    // Todas las suscripciones
GET    /api/subscriptions/:id                // Una suscripción
GET    /api/subscriptions/user/:userId       // Suscripción del usuario
GET    /api/subscriptions/user/:userId/limits // Límites del usuario
POST   /api/subscriptions                    // Crear suscripción
PUT    /api/subscriptions/:id                // Actualizar suscripción
PUT    /api/subscriptions/user/:userId/change-plan // Cambiar plan
PUT    /api/subscriptions/user/:userId/cancel      // Cancelar suscripción
DELETE /api/subscriptions/:id                // Eliminar suscripción
```

### Servicios Principales

#### SubscriptionPlansService

```typescript
class SubscriptionPlansService {
  findAll(): Promise<SubscriptionPlan[]>
  findOne(id: number): Promise<SubscriptionPlan>
  findByName(name: string): Promise<SubscriptionPlan>
  create(dto: CreateSubscriptionPlanDto): Promise<SubscriptionPlan>
  update(id: number, dto: UpdateSubscriptionPlanDto): Promise<SubscriptionPlan>
  remove(id: number): Promise<void>
}
```

#### SubscriptionsService

```typescript
class SubscriptionsService {
  findAll(): Promise<Subscription[]>
  findOne(id: number): Promise<Subscription>
  findByUserId(userId: number): Promise<Subscription>
  create(dto: CreateSubscriptionDto): Promise<Subscription>
  update(id: number, dto: UpdateSubscriptionDto): Promise<Subscription>
  changePlan(userId: number, planId: number): Promise<Subscription>
  cancel(userId: number): Promise<Subscription>
  checkLimits(userId: number): Promise<LimitsInfo>
  remove(id: number): Promise<void>
}
```

---

## 🎨 Frontend - Arquitectura

### Componentes Implementados

#### 1. SubscriptionPlans Page
**Ubicación**: `frontend/src/pages/SubscriptionPlans.jsx`

**Características**:
- Muestra todos los planes disponibles en tarjetas
- Indica el plan actual del usuario
- Permite cambiar de plan
- Modal de confirmación antes de cambiar
- Diseño responsive (1, 2 o 4 columnas)
- Gradientes de color atractivos
- Animaciones hover

**Uso**:
```jsx
import SubscriptionPlans from './pages/SubscriptionPlans';

// En el router
<Route path="/subscription-plans" element={<SubscriptionPlans />} />
```

#### 2. SubscriptionBadge Component
**Ubicación**: `frontend/src/components/SubscriptionBadge.jsx`

**Características**:
- Badge pequeño que muestra el plan actual
- Colores diferentes por tipo de plan
- Clickeable para ir a página de planes
- Icono de corona
- Animación al hover

**Uso**:
```jsx
import SubscriptionBadge from './components/SubscriptionBadge';

// En el header o perfil
<SubscriptionBadge userId={currentUser.id} />
```

### Store de Zustand

**Ubicación**: `frontend/src/store/subscriptionStore.js`

**Estado**:
```javascript
{
  plans: [],                    // Lista de planes disponibles
  currentSubscription: null,    // Suscripción actual del usuario
  limits: null,                 // Límites del plan actual
  loading: false,               // Estado de carga
  error: null                   // Errores
}
```

**Acciones**:
```javascript
fetchPlans()                     // Cargar planes disponibles
fetchUserSubscription(userId)    // Cargar suscripción del usuario
fetchUserLimits(userId)          // Cargar límites del usuario
changePlan(userId, planId)       // Cambiar plan
cancelSubscription(userId)       // Cancelar suscripción
canCreateCatalog()               // Verificar si puede crear catálogo
canAddProduct()                  // Verificar si puede agregar producto
reset()                          // Limpiar el store
```

**Uso**:
```javascript
import useSubscriptionStore from './store/subscriptionStore';

function MyComponent() {
  const { plans, fetchPlans } = useSubscriptionStore();
  
  useEffect(() => {
    fetchPlans();
  }, []);
  
  return (
    <div>
      {plans.map(plan => (
        <div key={plan.id}>{plan.name}</div>
      ))}
    </div>
  );
}
```

### API Service

**Ubicación**: `frontend/src/api/subscriptions.js`

**Funciones disponibles**:
```javascript
getSubscriptionPlans()              // GET /api/subscription-plans
getSubscriptionPlan(id)             // GET /api/subscription-plans/:id
getSubscriptions()                  // GET /api/subscriptions
getSubscription(id)                 // GET /api/subscriptions/:id
getUserSubscription(userId)         // GET /api/subscriptions/user/:userId
getUserLimits(userId)               // GET /api/subscriptions/user/:userId/limits
createSubscription(data)            // POST /api/subscriptions
updateSubscription(id, data)        // PUT /api/subscriptions/:id
changePlan(userId, planId)          // PUT /api/subscriptions/user/:userId/change-plan
cancelSubscription(userId)          // PUT /api/subscriptions/user/:userId/cancel
deleteSubscription(id)              // DELETE /api/subscriptions/:id
```

---

## 🚀 Instalación y Configuración

### 1. Base de Datos

Ejecutar el script de migración:

```bash
psql -U postgres -d catalogos_saas -f database/subscriptions_schema.sql
```

Esto creará:
- Tabla `subscription_plans` con 4 planes predefinidos
- Tabla `subscriptions`
- Índices para optimización
- Asignará el plan FREE a todos los usuarios existentes

### 2. Backend

Los módulos ya están integrados en `app.module.ts`. Solo asegúrate de que el backend esté corriendo:

```bash
cd backend
npm run start:dev
```

Verificar que los endpoints funcionen:
```bash
curl http://localhost:3000/api/subscription-plans
```

### 3. Frontend

Los componentes están listos. Solo necesitas agregarlos a tu routing:

```jsx
// En tu archivo de rutas (routes o App.jsx)
import SubscriptionPlans from './pages/SubscriptionPlans';

<Route path="/subscription-plans" element={<SubscriptionPlans />} />
```

---

## 📝 Ejemplos de Uso

### Backend - Crear una suscripción

```typescript
POST /api/subscriptions
Content-Type: application/json

{
  "userId": 1,
  "planId": 2,
  "status": "active"
}
```

### Backend - Cambiar plan de un usuario

```typescript
PUT /api/subscriptions/user/1/change-plan
Content-Type: application/json

{
  "planId": 3
}
```

### Backend - Verificar límites de un usuario

```typescript
GET /api/subscriptions/user/1/limits

Response:
{
  "canCreateCatalog": true,
  "canAddProduct": true,
  "currentCatalogs": 2,
  "maxCatalogs": 3,
  "maxProducts": 100
}
```

### Frontend - Usar el store

```javascript
import useSubscriptionStore from './store/subscriptionStore';

function MyComponent() {
  const { 
    plans, 
    currentSubscription, 
    fetchPlans, 
    changePlan 
  } = useSubscriptionStore();

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleUpgrade = async () => {
    try {
      await changePlan(userId, premiumPlanId);
      alert('Plan actualizado!');
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  return <div>...</div>;
}
```

---

## 🔐 Seguridad y Validaciones

### Backend

1. **Validación de DTOs**: Uso de `class-validator` para validar datos de entrada
2. **Restricciones de BD**: 
   - Un usuario solo puede tener una suscripción activa (UNIQUE constraint)
   - No se pueden eliminar planes que tienen suscripciones activas (ON DELETE RESTRICT)
3. **Validación de negocio**:
   - Verificar que el plan existe antes de crear suscripción
   - Verificar que el usuario no tenga ya una suscripción

### Frontend

1. **Validación de límites**: Verificar límites antes de permitir acciones
2. **Confirmación**: Modal de confirmación antes de cambiar planes
3. **Feedback**: Mensajes de error y éxito con toast

---

## 🎨 Personalización

### Agregar un nuevo plan

1. **Base de datos**:
```sql
INSERT INTO subscription_plans (name, description, price, max_catalogs, max_products_per_catalog, features)
VALUES ('PREMIUM', 'Plan Premium', 1499.00, 20, -1, '{"custom_domain": true}');
```

2. **Frontend**: El nuevo plan aparecerá automáticamente en la página de planes

### Modificar límites de un plan existente

```sql
UPDATE subscription_plans 
SET max_catalogs = 5, max_products_per_catalog = 200 
WHERE name = 'BASIC';
```

### Agregar nuevas características a un plan

```sql
UPDATE subscription_plans 
SET features = features || '{"new_feature": true}'::jsonb
WHERE name = 'PRO';
```

---

## 🔄 Flujo de Usuario

### Flujo de Suscripción Inicial

1. Usuario se registra en el sistema
2. Automáticamente se le asigna el plan FREE
3. Usuario puede ver su plan actual en el badge
4. Usuario navega a `/subscription-plans`
5. Usuario selecciona un plan diferente
6. Aparece modal de confirmación
7. Al confirmar, se actualiza su suscripción
8. Se actualizan los límites disponibles

### Flujo de Cambio de Plan

1. Usuario está en plan BASIC
2. Llega al límite de catálogos (3)
3. Sistema no permite crear más catálogos
4. Usuario va a página de planes
5. Usuario selecciona plan PRO
6. Se valida y actualiza suscripción
7. Nuevos límites disponibles inmediatamente

---

## 🧪 Testing

### Test de endpoints (Postman/cURL)

```bash
# Obtener planes
curl http://localhost:3000/api/subscription-plans

# Obtener suscripción de usuario
curl http://localhost:3000/api/subscriptions/user/1

# Cambiar plan
curl -X PUT http://localhost:3000/api/subscriptions/user/1/change-plan \
  -H "Content-Type: application/json" \
  -d '{"planId": 3}'

# Verificar límites
curl http://localhost:3000/api/subscriptions/user/1/limits
```

---

## 🚧 Futuras Mejoras

### Corto Plazo
- [ ] Integración con pasarela de pagos (Stripe, PayPal)
- [ ] Período de prueba gratuito (trial)
- [ ] Validación de límites en tiempo real en el backend
- [ ] Guards para proteger endpoints según plan

### Mediano Plazo
- [ ] Facturación automática
- [ ] Historial de suscripciones
- [ ] Métricas de uso (analytics)
- [ ] Notificaciones de vencimiento

### Largo Plazo
- [ ] Planes anuales con descuento
- [ ] Cupones de descuento
- [ ] Programa de referidos
- [ ] API pública para terceros (plan ENTERPRISE)

---

## 📚 Referencias

- **Backend**: NestJS + TypeORM + PostgreSQL
- **Frontend**: React + Zustand + TailwindCSS
- **Documentación de TypeORM**: https://typeorm.io/
- **Documentación de Zustand**: https://docs.pmnd.rs/zustand/

---

## 👨‍💻 Soporte

Para cualquier duda o problema con el sistema de suscripciones:

1. Revisa esta documentación
2. Revisa los logs del backend para errores
3. Verifica que la base de datos tenga las tablas correctas
4. Asegúrate de que todos los módulos estén importados en `app.module.ts`

---

**Última actualización**: Noviembre 2025  
**Versión**: 1.0  
**Estado**: ✅ Implementado y funcional
