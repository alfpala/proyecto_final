# Backend E-commerce - Marketplace Tech

API REST completa para un marketplace de tecnología con autenticación JWT, gestión de productos, carrito de compras, favoritos y órdenes.

##  Características

-  **Autenticación JWT** - Sistema completo de registro y login
- **Gestión de Productos** - CRUD completo con imágenes
- **Categorías** - Organización de productos
- **Carrito de Compras** - Agregar, actualizar y eliminar productos
- **Favoritos** - Lista de deseos de usuarios
- **Órdenes** - Sistema completo de órdenes de compra
- **Panel Admin** - Gestión completa para administradores
- **Documentación Swagger** - API docs interactiva
- **Tests Automatizados** - Suite completa con Jest
- **PostgreSQL** - Base de datos relacional
- **ES Modules** - Sintaxis moderna de JavaScript

##  Requisitos Previos

- Node.js 18+ 
- PostgreSQL 14+
- npm o yarn

##  Instalación

1. **Clonar el repositorio**
```bash
cd backend
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**

Crear archivo `.env` en la raíz del backend:

```env
PORT=3000
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=tu_contraseña
DB_NAME=marketplace_tech
DB_PORT=5432
JWT_SECRET=tu_secreto_jwt_super_seguro
```

4. **Crear base de datos**
```bash
# Conectarse a PostgreSQL
psql -U postgres

# Crear base de datos
CREATE DATABASE marketplace_tech;
```

5. **Ejecutar migraciones**
```bash
# Las tablas se crean automáticamente con el script migrate.js
node src/db/migrate.js
```

6. **Cargar datos de prueba (opcional)**
```bash
npm run seed
```

## Ejecutar el Proyecto

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm start
```

El servidor estará disponible en: `http://localhost:3000`

## Documentación API

La documentación interactiva Swagger está disponible en:
```
http://localhost:3000/api-docs
```

##  Tests

### Ejecutar todos los tests
```bash
npm test
```

### Ejecutar tests en modo watch
```bash
npm run test:watch
```

### Generar reporte de cobertura
```bash
npm run test:coverage
```

##  Endpoints Principales

### Autenticación
- `POST /api/auth/register` - Registrar nuevo usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/me` - Obtener perfil del usuario (requiere auth)

### Productos
- `GET /api/products` - Listar todos los productos
- `GET /api/products/featured` - Productos destacados
- `GET /api/products/:id` - Obtener producto por ID
- `GET /api/products/my/list` - Mis productos (requiere auth)
- `POST /api/products` - Crear producto (requiere auth)
- `PUT /api/products/:id` - Actualizar producto (requiere auth)
- `DELETE /api/products/:id` - Eliminar producto (requiere auth)

### Categorías
- `GET /api/categories` - Listar categorías
- `GET /api/categories/:id` - Obtener categoría por ID
- `POST /api/categories` - Crear categoría (requiere auth admin)
- `PUT /api/categories/:id` - Actualizar categoría (requiere auth admin)
- `DELETE /api/categories/:id` - Eliminar categoría (requiere auth admin)

### Carrito
- `GET /api/cart` - Obtener carrito (requiere auth)
- `POST /api/cart` - Agregar producto (requiere auth)
- `PUT /api/cart/:id` - Actualizar cantidad (requiere auth)
- `DELETE /api/cart/:id` - Eliminar producto (requiere auth)
- `DELETE /api/cart/clear` - Vaciar carrito (requiere auth)

### Favoritos
- `GET /api/favorites` - Listar favoritos (requiere auth)
- `POST /api/favorites` - Agregar a favoritos (requiere auth)
- `DELETE /api/favorites/:id` - Eliminar de favoritos (requiere auth)

### Órdenes
- `GET /api/orders` - Listar órdenes (requiere auth)
- `POST /api/orders` - Crear orden (requiere auth)
- `GET /api/orders/:id` - Obtener orden por ID (requiere auth)
- `PUT /api/orders/:id/status` - Actualizar estado (requiere auth)

### Admin
- `GET /api/admin/users` - Listar usuarios (requiere admin)
- `PUT /api/admin/users/:id` - Actualizar usuario (requiere admin)
- `DELETE /api/admin/users/:id` - Eliminar usuario (requiere admin)

##  Autenticación

El backend usa **JWT (JSON Web Tokens)** para la autenticación.

### Cómo usar:

1. **Registrarse o iniciar sesión** para obtener un token
2. **Incluir el token** en las peticiones protegidas:

```javascript
headers: {
  'Authorization': 'Bearer tu_token_aqui'
}
```

### Roles:
- `user` - Usuario normal (puede crear/editar sus propios productos)
- `admin` - Administrador (acceso completo)



## Tecnologías Utilizadas

- **Node.js** - Runtime de JavaScript
- **Express** - Framework web
- **PostgreSQL** - Base de datos relacional
- **JWT** - Autenticación con tokens
- **bcrypt** - Hash de contraseñas
- **Swagger** - Documentación API
- **Jest** - Framework de testing
- **Supertest** - Testing de APIs HTTP
- **Helmet** - Seguridad HTTP headers
- **CORS** - Cross-Origin Resource Sharing

## Base de Datos

### Tablas Principales:

- **users** - Usuarios del sistema
- **categories** - Categorías de productos
- **products** - Productos del marketplace
- **cart_items** - Items del carrito de compras
- **favorites** - Productos favoritos
- **orders** - Órdenes de compra
- **order_items** - Detalle de items en órdenes

## Seguridad

- Contraseñas hasheadas con bcrypt
- Tokens JWT con expiración
- Validación de inputs
- Headers de seguridad con Helmet
- CORS configurado
- Protección contra SQL injection (prepared statements)
- Variables de entorno para secretos

## Manejo de Errores

El backend implementa un sistema centralizado de manejo de errores:

- Errores de validación (400)
- Errores de autenticación (401)
- Errores de permisos (403)
- Errores de recurso no encontrado (404)
- Errores de conflicto (409)
- Errores del servidor (500)

## Testing

Suite completa de tests que cubren:

- Endpoints de autenticación
- CRUD de productos
- Gestión de carrito
- Sistema de favoritos
- Órdenes de compra
- Validaciones
- Manejo de errores
- Autenticación y autorización



## Notas Adicionales

- El usuario admin por defecto es: `admin@admin.com` / `admin123` (si ejecutaste el seed)
- Todos los endpoints que modifican datos requieren autenticación
- Los endpoints de admin requieren rol de administrador
- Los productos pueden tener imágenes mediante URL
- El carrito se asocia automáticamente al usuario autenticado

## Licencia

Este proyecto está bajo la Licencia MIT.

## Autor

- Alfonso Palacios - Desarrollo inicial
- Desafio Latam - Examen final


