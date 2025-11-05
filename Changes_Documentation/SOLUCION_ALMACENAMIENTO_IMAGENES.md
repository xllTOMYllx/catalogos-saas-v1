# Solución de Almacenamiento de Imágenes

## Problema Anterior
El sistema estaba intentando convertir las imágenes a formato base64 y almacenarlas directamente en la base de datos, pero:
- Las imágenes en base64 son muy grandes (típicamente 33% más grandes que el archivo original)
- Las columnas `logo` y `ruta` eran VARCHAR(500), demasiado pequeñas para base64
- Esto causaba errores al guardar en la base de datos

## Solución Implementada
Se implementó un sistema de almacenamiento de archivos en el servidor:

### Backend
1. **Nuevo módulo de Upload** (`/backend/src/upload/`)
   - Endpoint: `POST /api/upload/image`
   - Usa `multer` para manejar archivos
   - Guarda imágenes en `/backend/uploads/`
   - Validaciones: Solo imágenes (jpg, jpeg, png, gif, webp)
   - Límite de tamaño: 5MB máximo

2. **Servir archivos estáticos**
   - Los archivos en `/backend/uploads/` se sirven en `/uploads/`
   - Configurado en `main.ts` con `useStaticAssets`

3. **Base de datos actualizada**
   - Columnas cambiadas de VARCHAR(500) a TEXT
   - Permite almacenar URLs de cualquier longitud
   - Migración disponible en `database/migration_text_columns.sql`

### Frontend
1. **API de Upload** (`/frontend/src/api/upload.js`)
   - Función `uploadImage()` que sube archivos al servidor
   - Retorna la URL del archivo subido

2. **Formularios actualizados**
   - `CustomizationForm.jsx`: Sube logo del negocio
   - `ProductForm.jsx`: Sube imagen del producto
   - Ambos usan `react-dropzone` + `uploadApi`
   - Muestran mensajes de progreso con toast notifications

3. **Proxy configurado**
   - Vite proxy: `/uploads` → `http://localhost:3000`
   - Permite usar rutas relativas en desarrollo

## Flujo de Trabajo

### Cuando el usuario sube una imagen:
1. Usuario arrastra/selecciona imagen en el formulario
2. Frontend llama a `uploadApi.uploadImage(file)`
3. Backend recibe el archivo y lo guarda en `/uploads/`
4. Backend retorna: `{ url: '/uploads/file-123456.png', ... }`
5. Frontend guarda solo la ruta en el formulario
6. Al guardar, se envía la ruta (no base64) a la BD

### Almacenamiento:
```
/backend/uploads/
  ├── file-1234567890-123456789.png  (logo de negocio)
  ├── file-1234567891-987654321.jpg  (producto 1)
  └── file-1234567892-456789123.jpg  (producto 2)
```

### Base de datos:
```sql
-- Antes (causaba error con base64):
logo VARCHAR(500)
ruta VARCHAR(500)

-- Después (soporta URLs completas):
logo TEXT
ruta TEXT
```

## Ventajas
- ✅ Soporta imágenes de cualquier tamaño (hasta 5MB)
- ✅ Soporta cualquier dimensión de imagen
- ✅ Base de datos más ligera (solo guarda rutas)
- ✅ Más rápido (no convierte a base64)
- ✅ Escalable (se puede migrar a S3/Cloudinary después)
- ✅ Imágenes accesibles vía HTTP

## Migración desde base64

Si ya tienes datos con base64, puedes:

1. **Actualizar columnas**:
```bash
cd /ruta/a/catalogos-saas-v1
psql -U postgres -d catalogos_saas -f database/migration_text_columns.sql
```

2. **Convertir base64 existente** (script de ejemplo):
```javascript
// En Node.js o consola del navegador
const base64ToFile = async (base64String, clientId) => {
  const response = await fetch(base64String);
  const blob = await response.blob();
  const file = new File([blob], `logo-${clientId}.png`, { type: 'image/png' });
  
  const formData = new FormData();
  formData.append('file', file);
  
  const result = await fetch('/api/upload/image', {
    method: 'POST',
    body: formData
  });
  
  return await result.json();
};
```

## Testing

### Test manual del upload:
```bash
# 1. Iniciar backend
cd backend
npm run start:dev

# 2. Test con curl
curl -X POST http://localhost:3000/api/upload/image \
  -F "file=@/ruta/a/tu/imagen.png"

# Deberías recibir:
# {
#   "url": "/uploads/file-1234567890-123456789.png",
#   "filename": "file-1234567890-123456789.png",
#   "originalName": "imagen.png",
#   "size": 12345,
#   "mimetype": "image/png"
# }

# 3. Verificar que la imagen es accesible
curl http://localhost:3000/uploads/file-1234567890-123456789.png
```

### Test desde el frontend:
1. Iniciar frontend: `cd frontend && npm run dev`
2. Ir a la sección de personalización
3. Arrastrar una imagen al área de upload
4. Verificar mensaje "Imagen cargada correctamente"
5. Guardar y verificar que se muestre correctamente

## Producción

En producción, considera:

1. **Variables de entorno**:
```env
# backend/.env
UPLOADS_DIR=./uploads
MAX_FILE_SIZE=5242880  # 5MB in bytes
```

2. **Servir archivos con Nginx** (opcional):
```nginx
location /uploads/ {
    alias /var/www/catalogos-saas/backend/uploads/;
}
```

3. **Cloud Storage** (futuro):
- AWS S3
- Google Cloud Storage
- Cloudinary
- DigitalOcean Spaces

## Archivos Modificados

### Backend
- ✅ `src/upload/upload.controller.ts` (nuevo)
- ✅ `src/upload/upload.module.ts` (nuevo)
- ✅ `src/app.module.ts` (agregado UploadModule)
- ✅ `src/main.ts` (agregado servir archivos estáticos)
- ✅ `src/clients/client.entity.ts` (logo: TEXT)
- ✅ `src/products/product.entity.ts` (ruta: TEXT)
- ✅ `.gitignore` (ignorar /uploads/*)
- ✅ `package.json` (agregado multer y tipos)

### Frontend
- ✅ `src/api/upload.js` (nuevo)
- ✅ `src/components/admin/CustomizationForm.jsx` (usa upload)
- ✅ `src/components/admin/ProductForm.jsx` (usa upload)
- ✅ `vite.config.mjs` (proxy /uploads)

### Database
- ✅ `database/init.sql` (columnas TEXT)
- ✅ `database/migration_text_columns.sql` (nuevo)

## Soporte

Si encuentras problemas:
1. Verifica que `/backend/uploads/` exista
2. Verifica permisos de escritura en `/backend/uploads/`
3. Revisa logs del backend para errores de multer
4. Verifica que el tamaño del archivo sea < 5MB
5. Verifica que sea un formato de imagen válido
