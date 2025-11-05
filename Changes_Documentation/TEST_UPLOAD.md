# Testing Image Upload Functionality

This document provides step-by-step instructions to test the new image upload functionality.

## Prerequisites

1. PostgreSQL running with `catalogos_saas` database
2. Run migration if you have existing data:
   ```bash
   psql -U postgres -d catalogos_saas -f database/migration_text_columns.sql
   ```
3. Backend dependencies installed:
   ```bash
   cd backend && npm install
   ```
4. Frontend dependencies installed:
   ```bash
   cd frontend && npm install
   ```

## Test 1: Backend Upload Endpoint

### Start Backend
```bash
cd backend
npm run start:dev
```

Wait for: `Backend running on: http://[::1]:3000`

### Test Upload with curl

Create a test image or use any image file:
```bash
# Create a simple test image (requires ImageMagick)
convert -size 100x100 xc:red /tmp/test-image.png

# Or use any existing image
# Upload the image
curl -X POST http://localhost:3000/api/upload/image \
  -F "file=@/tmp/test-image.png" \
  -v

# Expected response:
# {
#   "url": "/uploads/file-1234567890-123456789.png",
#   "filename": "file-1234567890-123456789.png",
#   "originalName": "test-image.png",
#   "size": 1234,
#   "mimetype": "image/png"
# }
```

### Verify Image is Accessible
```bash
# Use the URL from the response above
curl http://localhost:3000/uploads/file-1234567890-123456789.png --output /tmp/downloaded.png

# Verify file was downloaded
ls -lh /tmp/downloaded.png
```

### Test Validations

#### Test 1: Invalid file type
```bash
echo "not an image" > /tmp/test.txt
curl -X POST http://localhost:3000/api/upload/image \
  -F "file=@/tmp/test.txt"

# Expected: 400 Bad Request
# {"message":"Solo se permiten archivos de imagen","error":"Bad Request","statusCode":400}
```

#### Test 2: No file provided
```bash
curl -X POST http://localhost:3000/api/upload/image

# Expected: 400 Bad Request
# {"message":"No se ha proporcionado ningún archivo","error":"Bad Request","statusCode":400}
```

#### Test 3: File too large (if you have a file > 5MB)
```bash
# Create a large file (requires ImageMagick)
convert -size 3000x3000 xc:blue /tmp/large-image.png

curl -X POST http://localhost:3000/api/upload/image \
  -F "file=@/tmp/large-image.png"

# Expected: 413 Request Entity Too Large (if > 5MB)
```

## Test 2: Frontend Integration

### Start Frontend
In a new terminal:
```bash
cd frontend
npm run dev
```

Visit: http://localhost:5173

### Test Product Image Upload

1. **Login** with test credentials:
   - Email: `admin@test.com`
   - Password: `123`

2. **Navigate to Products** section

3. **Add New Product**:
   - Click "Agregar Producto" button
   - Fill in product details:
     - Nombre: "Producto de Prueba"
     - Descripción: "Prueba de upload"
     - Precio: 100
     - Stock: 10
     - Categoría: "Test"
   - **Drag & Drop an image** or click to select
   - Wait for "Imagen cargada correctamente" message
   - Click "Guardar"

4. **Verify**:
   - Product should appear in the list
   - Image should display correctly
   - Check browser DevTools Network tab for upload request

### Test Logo Upload

1. **Navigate to Customization** section ("Personaliza tu Catálogo")

2. **Upload Logo**:
   - Drag & Drop a logo image or click to select
   - Wait for "Imagen cargada correctamente" message
   - Logo preview should update immediately
   - Click "Guardar Cambios"
   - Wait for "Personalización guardada" message

3. **Verify**:
   - Logo should display in preview
   - Refresh page - logo should persist
   - Check database to verify URL is stored

## Test 3: Database Verification

### Check stored URLs
```bash
psql -U postgres -d catalogos_saas

-- Check products with uploaded images
SELECT id, nombre, ruta FROM products ORDER BY id DESC LIMIT 5;

-- Check clients with uploaded logos
SELECT id, nombre, logo FROM clients ORDER BY id DESC LIMIT 5;

-- Exit
\q
```

### Expected Results
- `ruta` and `logo` columns should contain paths like `/uploads/file-123456.png`
- **NOT** base64 strings (which would start with `data:image/`)

## Test 4: Error Handling

### Frontend Error Scenarios

1. **Upload without backend running**:
   - Stop backend server
   - Try to upload image
   - Should see: "Error al subir imagen: Network Error"

2. **Upload invalid file**:
   - Try to upload a .txt file
   - Should see: "Error al subir imagen: ..."

3. **Network interruption simulation**:
   - Open DevTools > Network
   - Set throttling to "Offline"
   - Try to upload
   - Should see error message

## Test 5: Performance

### Upload Speed Test
```bash
# Time the upload of different image sizes
time curl -X POST http://localhost:3000/api/upload/image \
  -F "file=@/path/to/small-image.png"

time curl -X POST http://localhost:3000/api/upload/image \
  -F "file=@/path/to/medium-image.png"

time curl -X POST http://localhost:3000/api/upload/image \
  -F "file=@/path/to/large-image.png"
```

### Expected Times
- Small image (< 100KB): < 0.1s
- Medium image (< 1MB): < 0.5s
- Large image (< 5MB): < 2s

## Test 6: Concurrent Uploads

Test multiple uploads at once:
```bash
# Upload 5 images concurrently
for i in {1..5}; do
  curl -X POST http://localhost:3000/api/upload/image \
    -F "file=@/tmp/test-image.png" &
done
wait

# All should succeed with unique filenames
```

## Verification Checklist

After all tests:

- [ ] Backend starts without errors
- [ ] Upload endpoint accepts valid images
- [ ] Upload endpoint rejects invalid files
- [ ] Uploaded files are stored in `/backend/uploads/`
- [ ] Uploaded files are accessible via HTTP
- [ ] Frontend can upload product images
- [ ] Frontend can upload business logos
- [ ] Database stores URL paths (not base64)
- [ ] Images persist after page refresh
- [ ] Error messages are user-friendly
- [ ] Multiple uploads work correctly
- [ ] File size limits are enforced
- [ ] File type validation works

## Cleanup

```bash
# Remove test files
rm /tmp/test-image.png /tmp/downloaded.png /tmp/test.txt

# Optionally, clean up uploaded test files
rm backend/uploads/file-*.png
```

## Troubleshooting

### "Cannot POST /api/upload/image"
- Backend not running
- Check backend is on port 3000
- Verify backend started successfully

### "ENOENT: no such file or directory, open './uploads/...'"
- Create uploads directory: `mkdir -p backend/uploads`
- Check write permissions: `chmod 755 backend/uploads`

### Images not displaying in frontend
- Check browser console for errors
- Verify proxy is working: http://localhost:5173/uploads/
- Check if backend is serving static files

### Database column too small
- Run migration: `psql -U postgres -d catalogos_saas -f database/migration_text_columns.sql`
- Or recreate database: `psql -U postgres -d catalogos_saas -f database/init.sql`

## Success Criteria

✅ All tests pass
✅ No console errors
✅ Images upload and display correctly
✅ Database stores URLs properly
✅ Error handling works as expected
✅ Performance is acceptable
