# 🚀 Guía Rápida de Inicio - Base de Datos PostgreSQL

Esta guía te ayudará a configurar la base de datos PostgreSQL en **5 minutos**.

## ⚡ Inicio Rápido

### 1️⃣ Instalar PostgreSQL

**Ubuntu/Debian:**
```bash
sudo apt update && sudo apt install postgresql postgresql-contrib -y
```

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

**Windows:**
Descargar desde: https://www.postgresql.org/download/windows/

### 2️⃣ Crear Base de Datos

```bash
# Acceder a PostgreSQL
sudo -u postgres psql

# Crear la base de datos
CREATE DATABASE catalogos_saas;

# Salir
\q
```

### 3️⃣ Inicializar Schema y Datos

```bash
# Desde la raíz del proyecto
cd /ruta/a/catalogos-saas-v1

# Ejecutar script de inicialización
psql -U postgres -d catalogos_saas -f database/init.sql
```

**Output esperado:**
```
CREATE TABLE
CREATE INDEX
INSERT 0 3
...
Database initialized successfully!
Users count: 3
Clients count: 1
Products count: 9
Catalogs count: 9
```

### 4️⃣ Configurar Backend

```bash
cd backend

# Crear archivo .env desde ejemplo
cp .env.example .env

# Editar .env con tu configuración
nano .env  # o usa tu editor favorito
```

**Contenido de .env:**
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=catalogos_saas
NODE_ENV=development
```

### 5️⃣ Instalar y Ejecutar

```bash
# Instalar dependencias (si no lo has hecho)
npm install

# Construir
npm run build

# Iniciar servidor
npm run start:dev
```

**Output esperado:**
```
[Nest] 12345  - LOG [NestFactory] Starting Nest application...
[Nest] 12345  - LOG [InstanceLoader] TypeOrmModule dependencies initialized
[Nest] 12345  - LOG [NestApplication] Nest application successfully started
```

## ✅ Verificar Instalación

### Opción 1: Usar psql
```bash
psql -U postgres -d catalogos_saas

# Verificar tablas
\dt

# Ver usuarios
SELECT email, role FROM users;

# Salir
\q
```

### Opción 2: Usar el Backend

```bash
# En otra terminal
curl http://localhost:3000/api/products

# Deberías ver 9 productos
```

### Opción 3: Login de prueba
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"123"}'

# Deberías recibir un token
```

## 🧪 Usuarios de Prueba

| Email | Password | Rol |
|-------|----------|-----|
| admin@test.com | 123 | admin |
| user@test.com | 123 | user |
| client@test.com | 123 | client |

## 📝 Endpoints Disponibles

### Productos
```bash
# Ver todos los productos
curl http://localhost:3000/api/products

# Ver un producto
curl http://localhost:3000/api/products/1

# Crear producto
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Nuevo Producto","precio":299,"description":"Test","ruta":"/test.png","stock":10,"category":"Test"}'
```

### Clientes
```bash
# Ver todos los clientes
curl http://localhost:3000/api/clients

# Ver un cliente
curl http://localhost:3000/api/clients/1

# Crear cliente
curl -X POST http://localhost:3000/api/clients \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Mi Tienda","userId":1,"color":"#3498db","telefono":"555-1234"}'
```

### Catálogos
```bash
# Ver catálogo de un cliente
curl http://localhost:3000/api/catalogs/client/1

# Agregar producto al catálogo
curl -X POST http://localhost:3000/api/catalogs \
  -H "Content-Type: application/json" \
  -d '{"clientId":1,"productId":1,"active":true,"customPrice":350}'
```

## 🔧 Comandos Útiles

### PostgreSQL

```bash
# Estado del servicio
sudo systemctl status postgresql

# Iniciar PostgreSQL
sudo systemctl start postgresql

# Detener PostgreSQL
sudo systemctl stop postgresql

# Reiniciar PostgreSQL
sudo systemctl restart postgresql
```

### Base de Datos

```bash
# Conectar a base de datos
psql -U postgres -d catalogos_saas

# Listar bases de datos
psql -U postgres -l

# Ver tablas
psql -U postgres -d catalogos_saas -c "\dt"

# Ver usuarios
psql -U postgres -d catalogos_saas -c "SELECT * FROM users;"
```

### Backend

```bash
# Modo desarrollo (con hot reload)
npm run start:dev

# Modo producción
npm run build && npm run start:prod

# Ver logs en tiempo real
npm run start:dev 2>&1 | grep -i "error\|warning\|log"
```

## 🐛 Solución de Problemas

### Problema: "psql: error: connection to server on socket..."
**Solución:**
```bash
sudo systemctl start postgresql
# o en macOS:
brew services start postgresql
```

### Problema: "role 'postgres' does not exist"
**Solución:**
```bash
# Crear usuario postgres
sudo -u postgres createuser --superuser $USER
```

### Problema: "database 'catalogos_saas' does not exist"
**Solución:**
```bash
psql -U postgres -c "CREATE DATABASE catalogos_saas;"
psql -U postgres -d catalogos_saas -f database/init.sql
```

### Problema: Backend no conecta a DB
**Solución:**
1. Verificar que PostgreSQL esté corriendo
2. Verificar credenciales en `.env`
3. Verificar que la base de datos exista
```bash
psql -U postgres -l | grep catalogos_saas
```

### Problema: "password authentication failed"
**Solución:**
Editar `/etc/postgresql/*/main/pg_hba.conf` y cambiar:
```
local   all   postgres   peer
```
a:
```
local   all   postgres   md5
```
Luego:
```bash
sudo systemctl restart postgresql
psql -U postgres  # Te pedirá contraseña
```

## 🎯 Próximos Pasos

1. **Explorar la base de datos**: Abre `database/DIAGRAMS.md` para ver el esquema visual
2. **Leer la guía de integración**: Revisa `INTEGRATION_GUIDE.md` para ejemplos de código
3. **Probar los endpoints**: Usa Postman o curl para probar todas las APIs
4. **Iniciar el frontend**: 
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
5. **Crear tu primer catálogo**: Usa la UI del frontend para crear un cliente y su catálogo

## 📚 Documentación Completa

- **database/README.md**: Documentación técnica completa
- **database/DIAGRAMS.md**: Diagramas visuales y consultas SQL
- **database/init.sql**: Script de inicialización
- **INTEGRATION_GUIDE.md**: Guía de integración con ejemplos
- **README.md**: Documentación general del proyecto

## 💡 Tips

1. **pgAdmin**: Instala pgAdmin4 para una interfaz gráfica: https://www.pgadmin.org/
2. **DBeaver**: Alternativa multiplataforma: https://dbeaver.io/
3. **VS Code**: Usa extensión PostgreSQL para explorar la DB desde el editor
4. **Backup automático**: Crea un cron job para backups diarios:
   ```bash
   0 2 * * * pg_dump -U postgres catalogos_saas > /backups/catalogos_$(date +\%Y\%m\%d).sql
   ```

## ✨ Características Implementadas

- ✅ 4 tablas con relaciones (users, clients, products, catalogs)
- ✅ TypeORM con auto-sincronización en desarrollo
- ✅ Índices para mejor performance
- ✅ Triggers automáticos para timestamps
- ✅ Datos de prueba incluidos
- ✅ 3 usuarios de prueba listos para usar
- ✅ 9 productos de ejemplo
- ✅ 1 cliente pre-configurado con catálogo completo
- ✅ Backward compatibility con API anterior
- ✅ Frontend API services listos

## 🎉 ¡Listo!

Si todo funcionó correctamente, deberías poder:
- ✅ Conectarte a PostgreSQL
- ✅ Ver las 4 tablas en la base de datos
- ✅ Hacer login con usuarios de prueba
- ✅ Consultar productos, clientes y catálogos
- ✅ Crear nuevos registros vía API

**¿Problemas?** Revisa la sección de troubleshooting arriba o consulta `INTEGRATION_GUIDE.md`.

---

**Happy Coding! 🚀**
