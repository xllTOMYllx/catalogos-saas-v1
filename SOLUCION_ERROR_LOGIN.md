# Fix para Error de Login: "duplicate key violates unique constraint clients_pkey"

## Resumen del Problema

Cuando un nuevo cliente intentaba registrarse en el sistema, se producía el siguiente error:

```
Error al inicializar el catálogo
Error de axios al crear el catálogo
Backend error: llave duplicada viola restricción de unicidad «clients_pkey»
```

Este error ocurría porque la secuencia de PostgreSQL que genera IDs automáticos para la tabla `clients` no estaba correctamente sincronizada.

## Causa Raíz

El script de inicialización de la base de datos (`database/init.sql`) insertaba explícitamente un cliente con `id=1`:

```sql
INSERT INTO clients (id, nombre, ...) VALUES (1, 'UrbanStreet', ...);
```

Cuando insertas registros con IDs explícitos en PostgreSQL, la secuencia NO se actualiza automáticamente. Por lo tanto, cuando un nuevo cliente intentaba registrarse, el sistema intentaba usar `id=1` nuevamente, causando el error de clave duplicada.

## Solución Implementada

### 1. Arreglo de la Secuencia en init.sql

**ANTES:**
```sql
SELECT setval('clients_id_seq', COALESCE((SELECT MAX(id) FROM clients), 0) + 1, false);
```

**DESPUÉS:**
```sql
SELECT setval('clients_id_seq', COALESCE((SELECT MAX(id) FROM clients), 1), true);
```

**¿Por qué funciona?**

El tercer parámetro de `setval()` indica si el valor ya fue usado:
- `setval(seq, 1, true)` → "El valor 1 ya fue usado, el próximo `nextval()` devolverá 2"
- Con MAX(id)=1, el próximo cliente obtendrá id=2 ✅
- Con MAX(id)=5, el próximo cliente obtendrá id=6 ✅

### 2. Script de Verificación (database/verify_sequences.sql)

Nuevo script para verificar que las secuencias estén correctamente configuradas:

```bash
psql -U postgres -d catalogos_saas -f database/verify_sequences.sql
```

Este script te mostrará:
- El ID máximo actual en cada tabla
- El próximo valor que generará la secuencia
- Si hay discrepancia, sabrás que hay un problema

### 3. Mejor Manejo de Errores en el Frontend

Actualizado `LoginRole.jsx` para mostrar mensajes de error más detallados:

```javascript
catch (err) {
  const errorMessage = err.response?.data?.message || err.message || 'Error desconocido';
  toast.error(`No se pudo crear el catálogo: ${errorMessage}. Reintenta.`);
}
```

Ahora verás el mensaje de error real del servidor, no solo un mensaje genérico.

### 4. Documentación Actualizada

Se agregó una sección de "Troubleshooting" en `database/README.md` con pasos para resolver este problema si vuelve a ocurrir.

## Cómo Aplicar la Solución

### Opción 1: Reiniciar la Base de Datos (Recomendado)

Si tu base de datos actual no tiene datos importantes:

```bash
# Eliminar y recrear la base de datos
psql -U postgres -c "DROP DATABASE IF EXISTS catalogos_saas;"
psql -U postgres -c "CREATE DATABASE catalogos_saas;"

# Ejecutar el script de inicialización arreglado
psql -U postgres -d catalogos_saas -f database/init.sql

# Verificar que las secuencias estén bien configuradas
psql -U postgres -d catalogos_saas -f database/verify_sequences.sql
```

### Opción 2: Arreglar la Secuencia Manualmente

Si ya tienes datos importantes en la base de datos:

```bash
# Conectar a la base de datos
psql -U postgres -d catalogos_saas

# Verificar el estado actual
SELECT MAX(id) FROM clients;
SELECT last_value, is_called FROM clients_id_seq;

# Arreglar la secuencia (reemplaza X con el MAX(id))
SELECT setval('clients_id_seq', X, true);

# Salir
\q
```

**Ejemplo:** Si `MAX(id)` = 1, ejecuta:
```sql
SELECT setval('clients_id_seq', 1, true);
```

## Verificar que el Problema está Resuelto

1. **Reinicia el backend:**
   ```bash
   cd backend
   npm run start:dev
   ```

2. **Reinicia el frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Prueba crear un nuevo cliente:**
   - Ve a `http://localhost:5173/login-role`
   - Selecciona "Soy Cliente"
   - Ingresa un email y nombre de negocio
   - Haz clic en "Crear Catálogo"

4. **Verifica el resultado:**
   - ✅ Si funciona: Verás un mensaje "Bienvenido, [NombreNegocio]! Catálogo creado."
   - ❌ Si falla: Verás un mensaje de error detallado en pantalla

5. **Verifica en la base de datos:**
   ```bash
   psql -U postgres -d catalogos_saas -c "SELECT id, nombre FROM clients;"
   ```
   Deberías ver:
   - Cliente con id=1 (UrbanStreet - el predeterminado)
   - Cliente con id=2 (tu primer nuevo cliente)
   - Cliente con id=3 (tu segundo nuevo cliente)
   - etc.

## Cambios en el Código

### Archivos Modificados:
1. ✅ `database/init.sql` - Arreglado setval para todas las secuencias
2. ✅ `frontend/src/components/auth/LoginRole.jsx` - Mejor manejo de errores
3. ✅ `database/README.md` - Documentación de troubleshooting

### Archivos Nuevos:
1. ✅ `database/verify_sequences.sql` - Script de verificación

## Prevención Futura

Para evitar este problema en el futuro:

1. **Siempre verifica las secuencias** después de insertar registros con IDs explícitos
2. **Usa el script de verificación** después de cualquier cambio en init.sql
3. **Documenta IDs reservados** (como id=1 para el cliente predeterminado)
4. **Considera usar IDs UUID** en lugar de SERIAL si este problema es frecuente

## Notas Técnicas para Desarrolladores

### setval() en PostgreSQL

```sql
setval(sequence_name, value, is_called)
```

- `is_called = true`: "Este valor ya fue usado, próximo nextval() = value + 1"
- `is_called = false`: "Este valor NO fue usado, próximo nextval() = value"

### Comportamiento con INSERT explícito

```sql
-- Insertar con ID explícito NO actualiza la secuencia
INSERT INTO clients (id, nombre) VALUES (1, 'Test');
-- La secuencia sigue en su valor por defecto (probablemente 1)

-- Próximo INSERT sin ID especificado intentará usar id=1
INSERT INTO clients (nombre) VALUES ('Test2');
-- ERROR: duplicate key value violates unique constraint "clients_pkey"

-- Solución: Sincronizar la secuencia
SELECT setval('clients_id_seq', 1, true);
-- Ahora próximo INSERT sin ID usará id=2
```

## Soporte

Si después de aplicar esta solución sigues teniendo problemas:

1. Ejecuta el script de verificación y comparte el resultado:
   ```bash
   psql -U postgres -d catalogos_saas -f database/verify_sequences.sql
   ```

2. Revisa los logs del backend para errores específicos:
   ```bash
   cd backend
   npm run start:dev
   # Los errores aparecerán en la terminal
   ```

3. Revisa la consola del navegador (F12) para errores del frontend

4. Verifica la estructura de la base de datos:
   ```bash
   psql -U postgres -d catalogos_saas -c "\dt"
   psql -U postgres -d catalogos_saas -c "SELECT * FROM clients;"
   ```

## Conclusión

El problema estaba en la sincronización de secuencias de PostgreSQL después de inserts con IDs explícitos. La solución es simple pero crítica: usar `setval(seq, max_id, true)` para indicar que el valor ya fue consumido, permitiendo que nuevos inserts obtengan IDs incrementales correctamente.

Este fix es permanente - una vez aplicado, todos los nuevos clientes podrán registrarse sin problemas.
