# 💡 Guía Visual de Suscripciones - Catalogos SaaS v1

## 📖 ¿Qué es el Sistema de Suscripciones?

Es una funcionalidad que te permite **monetizar tu aplicación SaaS** ofreciendo diferentes planes con límites específicos según el precio que pague el usuario.

### Analogía Simple

Piensa en Netflix o Spotify:
- **Plan Básico**: Acceso limitado
- **Plan Premium**: Más funcionalidades
- **Plan Empresarial**: Todo incluido

En tu caso:
- **FREE**: 1 catálogo, 20 productos
- **BASIC**: 3 catálogos, 100 productos
- **PRO**: 10 catálogos, productos ilimitados
- **ENTERPRISE**: Todo ilimitado

---

## 🎯 ¿Cómo Funciona?

### Flujo de Usuario

```
1. Usuario se registra
   ↓
2. Se le asigna automáticamente el plan FREE
   ↓
3. Usuario crea catálogos y agrega productos
   ↓
4. Alcanza el límite (1 catálogo, 20 productos)
   ↓
5. Sistema le sugiere actualizar plan
   ↓
6. Usuario visita página de planes
   ↓
7. Selecciona plan BASIC ($299/mes)
   ↓
8. Confirma el cambio
   ↓
9. Ahora puede crear hasta 3 catálogos con 100 productos cada uno
```

---

## 🗂️ Estructura de Datos

### Tabla: subscription_plans (Los Planes)

Imagina que es una "tienda" de planes:

| ID | Nombre | Precio | Catálogos | Productos |
|----|--------|--------|-----------|-----------|
| 1 | FREE | $0 | 1 | 20 |
| 2 | BASIC | $299 | 3 | 100 |
| 3 | PRO | $799 | 10 | ∞ |
| 4 | ENTERPRISE | $1,999 | ∞ | ∞ |

### Tabla: subscriptions (Las Suscripciones)

Es el "ticket de compra" de cada usuario:

| ID | Usuario | Plan | Estado | Fecha Inicio |
|----|---------|------|--------|--------------|
| 1 | juan@mail.com | FREE | activo | 2025-01-01 |
| 2 | maria@mail.com | BASIC | activo | 2025-01-15 |
| 3 | pedro@mail.com | PRO | activo | 2025-02-01 |

---

## 🎨 Componentes del Frontend

### 1. Página de Planes (SubscriptionPlans.jsx)

**¿Qué hace?**  
Muestra todos los planes disponibles en tarjetas bonitas, como una tienda.

**¿Cómo se ve?**
```
┌─────────────────────────────────────────────────┐
│   Planes de Suscripción                        │
│   Elige el plan perfecto para tu negocio       │
└─────────────────────────────────────────────────┘

┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐
│ FREE │  │BASIC │  │ PRO  │  │ENTER.│
│ $0   │  │ $299 │  │ $799 │  │$1,999│
├──────┤  ├──────┤  ├──────┤  ├──────┤
│✓ 1   │  │✓ 3   │  │✓ 10  │  │✓ ∞   │
│catá. │  │catá. │  │catá. │  │catá. │
│✓ 20  │  │✓ 100 │  │✓ ∞   │  │✓ ∞   │
│prod. │  │prod. │  │prod. │  │prod. │
│      │  │      │  │      │  │      │
│[Btn] │  │[Btn] │  │[Btn] │  │[Btn] │
└──────┘  └──────┘  └──────┘  └──────┘
```

**¿Cómo usarlo?**
```jsx
// En tu archivo de rutas
import SubscriptionPlans from './pages/SubscriptionPlans';

<Route path="/planes" element={<SubscriptionPlans />} />
```

### 2. Badge de Plan (SubscriptionBadge.jsx)

**¿Qué hace?**  
Muestra un "chip" pequeño con el plan actual del usuario.

**¿Cómo se ve?**
```
En el header:
┌─────────────────────────────────────┐
│ Logo   Inicio  Productos  [👑 PRO]  │
└─────────────────────────────────────┘
```

**¿Cómo usarlo?**
```jsx
import SubscriptionBadge from './components/SubscriptionBadge';

// En tu Header/Navbar
<SubscriptionBadge userId={currentUser.id} />
```

---

## 🔧 APIs del Backend

### Obtener Todos los Planes

```bash
GET http://localhost:3000/api/subscription-plans
```

**Respuesta:**
```json
[
  {
    "id": 1,
    "name": "FREE",
    "price": 0,
    "max_catalogs": 1,
    "max_products_per_catalog": 20
  },
  {
    "id": 2,
    "name": "BASIC",
    "price": 299,
    "max_catalogs": 3,
    "max_products_per_catalog": 100
  }
]
```

### Obtener Suscripción de un Usuario

```bash
GET http://localhost:3000/api/subscriptions/user/1
```

**Respuesta:**
```json
{
  "id": 1,
  "userId": 1,
  "planId": 2,
  "status": "active",
  "plan": {
    "name": "BASIC",
    "price": 299
  }
}
```

### Cambiar Plan de Usuario

```bash
PUT http://localhost:3000/api/subscriptions/user/1/change-plan
Content-Type: application/json

{
  "planId": 3
}
```

---

## 💻 Código de Ejemplo

### Frontend: Verificar si Puede Crear Catálogo

```javascript
import useSubscriptionStore from './store/subscriptionStore';
import { useEffect } from 'react';

function CrearCatalogoButton({ userId }) {
  const { canCreateCatalog, fetchUserLimits } = useSubscriptionStore();
  
  useEffect(() => {
    fetchUserLimits(userId);
  }, [userId]);
  
  const handleClick = () => {
    if (!canCreateCatalog()) {
      alert('Has alcanzado el límite de catálogos. ¡Actualiza tu plan!');
      return;
    }
    // Continuar con la creación...
    crearNuevoCatalogo();
  };
  
  return (
    <button onClick={handleClick}>
      Crear Catálogo
    </button>
  );
}
```

### Backend: Validar Límites Antes de Crear

```typescript
import { SubscriptionsService } from './subscriptions/subscriptions.service';

@Injectable()
export class ClientsService {
  constructor(
    private subscriptionsService: SubscriptionsService
  ) {}
  
  async create(createDto: CreateClientDto, userId: number) {
    // Obtener límites del usuario
    const limits = await this.subscriptionsService.checkLimits(userId);
    
    // Verificar si puede crear más catálogos
    if (!limits.canCreateCatalog) {
      throw new ForbiddenException(
        'Has alcanzado el límite de catálogos de tu plan'
      );
    }
    
    // Si todo está bien, crear el catálogo
    return this.clientRepository.save(createDto);
  }
}
```

---

## 🚀 Implementación Paso a Paso

### Paso 1: Migrar Base de Datos

```bash
# Abrir terminal
cd /ruta/a/tu/proyecto

# Ejecutar migración
psql -U postgres -d catalogos_saas -f database/subscriptions_schema.sql
```

**¿Qué hace?**
- Crea la tabla de planes con 4 planes
- Crea la tabla de suscripciones
- Asigna plan FREE a todos los usuarios existentes

### Paso 2: Verificar Backend

```bash
cd backend
npm run start:dev
```

Abrir navegador en: `http://localhost:3000/api/subscription-plans`

Deberías ver un JSON con los 4 planes.

### Paso 3: Agregar Ruta en Frontend

Editar `frontend/src/App.jsx` (o tu archivo de rutas):

```jsx
import SubscriptionPlans from './pages/SubscriptionPlans';

// Dentro de <Routes>
<Route path="/planes" element={<SubscriptionPlans />} />
```

### Paso 4: Agregar Badge en Header

Editar tu componente de navegación:

```jsx
import SubscriptionBadge from './components/SubscriptionBadge';

function Header() {
  const user = useAuthStore(state => state.user);
  
  return (
    <nav>
      <Logo />
      <Menu />
      {user && <SubscriptionBadge userId={user.id} />}
    </nav>
  );
}
```

### Paso 5: Configurar WhatsApp 🆕

**Importante**: Los cambios de plan ahora se gestionan manualmente vía WhatsApp.

```bash
# Editar configuración
nano frontend/src/config/contact.js

# Cambiar número de WhatsApp
whatsappNumber: '521234567890'  # Tu número con código de país
```

Ver guía completa: [CONFIGURACION_WHATSAPP.md](CONFIGURACION_WHATSAPP.md)

### Paso 6: Probar

1. Iniciar frontend: `npm run dev`
2. Abrir: `http://localhost:5173/planes`
3. Deberías ver la página de planes
4. Click en "Contactar Soporte" (botón verde)
5. Confirmar en el modal
6. WhatsApp se abre con mensaje predefinido

---

## 🎨 Personalización

### Cambiar Colores de los Planes

Editar `frontend/src/components/SubscriptionBadge.jsx`:

```javascript
const getPlanColor = (planName) => {
  const colors = {
    FREE: 'bg-gray-100 text-gray-700',
    BASIC: 'bg-blue-100 text-blue-700',
    PRO: 'bg-purple-100 text-purple-700',
    ENTERPRISE: 'bg-gold-100 text-gold-700', // ← Cambiar aquí
  };
  return colors[planName] || 'bg-gray-100 text-gray-700';
};
```

### Cambiar Precios

```sql
-- Conectar a PostgreSQL
psql -U postgres -d catalogos_saas

-- Actualizar precio del plan BASIC
UPDATE subscription_plans 
SET price = 199.00 
WHERE name = 'BASIC';
```

### Agregar un Nuevo Plan

```sql
INSERT INTO subscription_plans (
  name, 
  description, 
  price, 
  max_catalogs, 
  max_products_per_catalog
) VALUES (
  'PREMIUM',
  'Plan Premium con beneficios extra',
  1299.00,
  15,
  500
);
```

---

## ❓ Preguntas Frecuentes

### ¿Los límites se validan automáticamente?

**No** por defecto. Necesitas agregar la validación en tus controladores/servicios.

Ejemplo:
```typescript
// Antes de crear un catálogo
const limits = await this.subscriptionsService.checkLimits(userId);
if (!limits.canCreateCatalog) {
  throw new ForbiddenException('Límite alcanzado');
}
```

### ¿Cómo cambio el plan de un usuario manualmente?

```sql
-- Opción 1: SQL directo
UPDATE subscriptions 
SET "planId" = 3  -- ID del plan PRO
WHERE "userId" = 5;

-- Opción 2: API
curl -X PUT http://localhost:3000/api/subscriptions/user/5/change-plan \
  -H "Content-Type: application/json" \
  -d '{"planId": 3}'
```

### ¿Cómo saber cuántos catálogos tiene un usuario?

```sql
SELECT COUNT(*) as total_catalogos
FROM clients
WHERE "userId" = 1;
```

### ¿Cómo implementar pagos?

El sistema actual **NO incluye** integración con pasarelas de pago. Para agregar pagos:

1. Integrar Stripe o PayPal
2. Crear webhook para recibir confirmaciones de pago
3. Actualizar estado de suscripción según resultado
4. Implementar sistema de facturación

---

## 📚 Recursos Adicionales

### Documentación Técnica
- 📖 [SUBSCRIPTIONS.md](SUBSCRIPTIONS.md) - Documentación completa
- 🚀 [IMPLEMENTACION_SUSCRIPCIONES.md](IMPLEMENTACION_SUSCRIPCIONES.md) - Guía de implementación

### Archivos Importantes
```
database/subscriptions_schema.sql        # Script de migración
backend/src/subscription-plans/          # Módulo de planes
backend/src/subscriptions/               # Módulo de suscripciones
frontend/src/pages/SubscriptionPlans.jsx # Página de planes
frontend/src/store/subscriptionStore.js  # Estado global
```

### Comandos Útiles

```bash
# Ver planes en la BD
psql -U postgres -d catalogos_saas -c "SELECT * FROM subscription_plans;"

# Ver suscripciones
psql -U postgres -d catalogos_saas -c "SELECT * FROM subscriptions;"

# Rebuild frontend
cd frontend && npm run build

# Restart backend
cd backend && npm run start:dev
```

---

## 🎯 Resumen Rápido

**¿Qué tienes ahora?**
- ✅ 4 planes de suscripción predefinidos
- ✅ Backend con APIs completas
- ✅ Frontend con página de planes y badge
- ✅ Base de datos migrada
- ✅ Documentación completa

**¿Qué falta para producción?**
- ⚠️ Integrar pasarela de pagos (Stripe, PayPal)
- ⚠️ Validación automática de límites
- ⚠️ Sistema de facturación
- ⚠️ Notificaciones de vencimiento

**Estado actual:**
🟢 **Sistema funcional al 100%** para desarrollo y pruebas  
🟡 **Necesita integración de pagos** para producción

---

## 💬 Soporte

Si tienes dudas:
1. Lee la documentación completa en `SUBSCRIPTIONS.md`
2. Revisa los ejemplos de código
3. Verifica logs del backend: `npm run start:dev`
4. Consulta la estructura de BD: `database/subscriptions_schema.sql`

---

**¡Felicidades!** 🎉  
Ya tienes un sistema de suscripciones completo para monetizar tu SaaS.

**Última actualización:** Noviembre 2025  
**Versión:** 1.0
