# 📱 Configuración de WhatsApp para Cambios de Plan

## Resumen

El sistema de suscripciones ha sido modificado para que los cambios de plan se gestionen manualmente a través de WhatsApp. Esto permite a los desarrolladores tener control completo sobre:

- ✅ Verificación de pagos antes de activar planes
- ✅ Gestión personalizada de cada cliente
- ✅ Manejo de casos especiales y negociaciones
- ✅ Garantizar que los cambios se reflejen correctamente en las cuentas

## 🚀 Configuración Rápida

### Opción 1: Archivo de Configuración (Recomendado)

Edita el archivo `frontend/src/config/contact.js`:

```javascript
export const CONTACT_CONFIG = {
  whatsappNumber: '521234567890', // 👈 Cambia este número
  supportEmail: 'soporte@catalogos-saas.com',
  // ...
};
```

**Formato del número:**
- Incluye el código de país (sin el símbolo +)
- No incluyas espacios, guiones ni paréntesis
- Ejemplos:
  - México: `521234567890` (código 52)
  - USA: `11234567890` (código 1)
  - España: `341234567890` (código 34)
  - Argentina: `541234567890` (código 54)

### Opción 2: Variable de Entorno

1. Crea un archivo `.env` en la carpeta `frontend/`:
   ```bash
   cp frontend/.env.example frontend/.env
   ```

2. Edita el archivo `.env`:
   ```env
   VITE_API_URL=http://localhost:3000/api
   VITE_WHATSAPP_NUMBER=521234567890
   ```

3. Reinicia el servidor de desarrollo:
   ```bash
   cd frontend
   npm run dev
   ```

## 🎯 Cómo Funciona

### Flujo del Usuario

```
1. Usuario visita /subscription-plans
   ↓
2. Ve los planes disponibles
   ↓
3. Click en "Contactar Soporte"
   ↓
4. Se muestra modal explicativo
   ↓
5. Usuario confirma y abre WhatsApp
   ↓
6. WhatsApp se abre con mensaje predefinido
   ↓
7. Usuario envía mensaje a soporte
   ↓
8. Desarrollador procesa la solicitud manualmente
```

### Mensaje Predefinido

Cuando un usuario solicita un cambio de plan, se envía un mensaje como este:

```
Hola, me gustaría cambiar mi plan a *PRO*.

*Nombre:* Juan Pérez
*Email:* juan@example.com

¿Me pueden ayudar con el cambio de plan?
```

## 🛠️ Personalización

### Cambiar el Texto del Mensaje

Edita `frontend/src/config/contact.js`:

```javascript
export const CONTACT_CONFIG = {
  // ...
  messages: {
    planChangeRequest: (planName, userName, userEmail) => 
      `¡Hola! Quiero cambiar a ${planName}.\n\n` +
      `📧 Email: ${userEmail}\n` +
      `👤 Nombre: ${userName}\n\n` +
      `Por favor, contáctenme para completar el cambio.`,
  },
};
```

### Cambiar el Color del Botón

Edita `frontend/src/pages/SubscriptionPlans.jsx`:

```jsx
// Línea ~147
<button
  onClick={() => handleSelectPlan(plan)}
  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
>
  <MessageCircle className="w-5 h-5" />
  Contactar Soporte
</button>
```

Opciones de color:
- `bg-green-600` / `hover:bg-green-700` (Verde - actual)
- `bg-blue-600` / `hover:bg-blue-700` (Azul)
- `bg-purple-600` / `hover:bg-purple-700` (Morado)
- `bg-orange-600` / `hover:bg-orange-700` (Naranja)

### Cambiar el Texto del Botón

En el mismo archivo, cambia el texto:

```jsx
<MessageCircle className="w-5 h-5" />
Solicitar Cambio de Plan  {/* ← Cambia este texto */}
```

## 📝 Información del Modal

El modal que aparece al hacer clic en "Contactar Soporte" muestra:

1. **Título:** Plan seleccionado
2. **Beneficios del proceso:**
   - Verificar disponibilidad
   - Coordinar el pago
   - Activar el plan
   - Resolver dudas
3. **Nota informativa:** Explicación del mensaje predefinido
4. **Botones:** Cancelar / Abrir WhatsApp

Puedes personalizar este contenido en `SubscriptionPlans.jsx` líneas 170-210.

## 🔄 Actualizar Después de Configurar

Después de cambiar el número de WhatsApp:

### En Desarrollo
```bash
# No es necesario reiniciar si usaste el archivo de config
# Solo refresca el navegador

# Si usaste variables de entorno (.env), reinicia:
cd frontend
npm run dev
```

### En Producción
```bash
cd frontend
npm run build
# Despliega los archivos del directorio dist/
```

## ✅ Verificar la Configuración

1. **Probar el número:**
   - Visita la página de planes
   - Haz clic en "Contactar Soporte"
   - Verifica que el número en WhatsApp sea correcto

2. **Probar el mensaje:**
   - Completa el flujo hasta abrir WhatsApp
   - Verifica que el mensaje contenga la información correcta
   - **NO ENVÍES** el mensaje si es una prueba

## 🎨 Capturas del Cambio

### Antes (Automático)
- Botón: "Seleccionar Plan" (azul)
- Acción: Cambio automático inmediato
- Problema: No se reflejaba en la cuenta

### Después (Manual con WhatsApp)
- Botón: "Contactar Soporte" (verde) con ícono WhatsApp
- Acción: Abre WhatsApp con mensaje predefinido
- Ventaja: Control total por parte de desarrolladores

## 🚨 Solución de Problemas

### El número no es correcto
- Verifica que incluiste el código de país
- Verifica que no hay espacios ni símbolos
- Usa el formato: `[código país][número]`

### WhatsApp no se abre
- Verifica que WhatsApp Web está accesible
- Prueba el enlace manualmente: `https://wa.me/TU_NUMERO`
- Verifica que el navegador permite popups

### El mensaje aparece vacío
- Verifica que el usuario tiene email en localStorage
- Revisa la consola del navegador por errores
- Verifica la función `planChangeRequest` en `contact.js`

## 📚 Archivos Modificados

```
frontend/
├── .env.example                          # ← Actualizado (variable WhatsApp)
├── src/
│   ├── config/
│   │   └── contact.js                    # ← Nuevo (config WhatsApp)
│   └── pages/
│       └── SubscriptionPlans.jsx         # ← Modificado (UI WhatsApp)
```

## 🔗 Referencias

- [WhatsApp Click to Chat API](https://faq.whatsapp.com/5913398998672934)
- [Documentación de Suscripciones](SUBSCRIPTIONS.md)
- [Guía de Implementación](IMPLEMENTACION_SUSCRIPCIONES.md)

## 📞 Ejemplo de Uso Real

### Configurar para México
```javascript
whatsappNumber: '5215512345678'  // +52 55 1234 5678
```

### Configurar para España
```javascript
whatsappNumber: '34612345678'    // +34 612 34 56 78
```

### Configurar para USA
```javascript
whatsappNumber: '15551234567'    // +1 555 123 4567
```

## ⚡ Ventajas de Este Enfoque

1. **Control Total:** Los desarrolladores aprueban cada cambio
2. **Verificación de Pago:** Se puede verificar el pago antes de activar
3. **Mejor Servicio:** Interacción directa con los clientes
4. **Previene Errores:** No hay cambios automáticos fallidos
5. **Flexibilidad:** Se pueden hacer ofertas o ajustes personalizados

---

**Última actualización:** Noviembre 2025  
**Versión:** 1.0  
**Cambio:** Migración de cambio automático a contacto manual por WhatsApp
