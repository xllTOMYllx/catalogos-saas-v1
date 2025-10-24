# Catalogos SaaS v1

Sistema de catálogos SaaS con frontend en React y backend en NestJS.

## Estructura del Proyecto

```
catalogos-saas-v1/
├── backend/          # API REST con NestJS
│   ├── src/
│   │   ├── products/    # Módulo de productos
│   │   ├── auth/        # Módulo de autenticación
│   │   ├── business/    # Módulo de negocios
│   │   └── main.ts      # Punto de entrada
│   └── package.json
└── frontend/         # Aplicación React con Vite
    ├── src/
    │   ├── api/         # Servicios de API
    │   ├── components/  # Componentes React
    │   ├── pages/       # Páginas
    │   ├── store/       # Estado global (Zustand)
    │   └── hooks/       # Hooks personalizados
    └── package.json
```

## Características

### Backend (NestJS)
- ✅ API REST con CORS habilitado
- ✅ Módulo de Productos (CRUD completo)
- ✅ Módulo de Autenticación (login/logout)
- ✅ Módulo de Negocios (personalización)
- ✅ TypeScript con tipado estricto

### Frontend (React + Vite)
- ✅ Interfaz de usuario moderna con TailwindCSS
- ✅ Gestión de estado con Zustand
- ✅ Integración con backend via Axios
- ✅ Autenticación de usuarios
- ✅ Panel de administración completo
- ✅ Carrito de compras
- ✅ Catálogo de productos

## Instalación

### Backend

```bash
cd backend
npm install
npm run build
npm run start:dev
```

El backend estará disponible en `http://localhost:3000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

El frontend estará disponible en `http://localhost:5173`

## API Endpoints

### Productos
- `GET /api/products` - Obtener todos los productos
- `GET /api/products/:id` - Obtener un producto
- `POST /api/products` - Crear un producto
- `PUT /api/products/:id` - Actualizar un producto
- `DELETE /api/products/:id` - Eliminar un producto

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión

### Negocios
- `GET /api/business` - Obtener información del negocio
- `PUT /api/business` - Actualizar información del negocio

## Configuración

### Backend
El backend usa el puerto 3000 por defecto. Puedes cambiarlo con la variable de entorno `PORT`.

### Frontend
El frontend está configurado para hacer proxy de las peticiones `/api` al backend en `http://localhost:3000`.

## Flujo de Trabajo

1. **Usuario**: Puede explorar catálogos y agregar productos al carrito
2. **Cliente**: Puede crear y gestionar su propio catálogo
3. **Admin**: Tiene acceso completo para gestionar productos y personalización

## Tecnologías Utilizadas

### Backend
- NestJS 11
- TypeScript
- Express

### Frontend
- React 19
- Vite 7
- TailwindCSS 4
- Zustand (state management)
- Axios (HTTP client)
- React Router (routing)
- React Hook Form (forms)

## Desarrollo

### Backend
```bash
npm run start:dev    # Modo desarrollo con hot reload
npm run build        # Compilar producción
npm run test         # Ejecutar tests
npm run lint         # Linter
```

### Frontend
```bash
npm run dev          # Modo desarrollo
npm run build        # Compilar producción
npm run preview      # Preview de producción
npm run lint         # Linter
```

## Despliegue

### Backend
```bash
cd backend
npm run build
npm run start:prod
```

### Frontend
```bash
cd frontend
npm run build
# Los archivos estáticos estarán en dist/
```

## Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto es privado y no tiene licencia pública.
