
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Marketplace Tech API",
      version: "1.0.0",
      description: "API REST completa para marketplace de tecnología con autenticación JWT, gestión de productos, carrito de compras, favoritos y órdenes.",
      contact: {
        name: "API Support",
        email: "support@marketplace.com"
      }
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Servidor de desarrollo"
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Ingrese el token JWT recibido al iniciar sesión"
        }
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            name: { type: "string", example: "Juan Pérez" },
            email: { type: "string", format: "email", example: "juan@example.com" },
            role: { type: "string", enum: ["user", "admin"], example: "user" },
            created_at: { type: "string", format: "date-time" }
          }
        },
        Product: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            user_id: { type: "integer", example: 1 },
            category_id: { type: "integer", example: 1 },
            name: { type: "string", example: "Laptop HP" },
            description: { type: "string", example: "Laptop de alta gama" },
            price: { type: "number", format: "float", example: 999.99 },
            stock: { type: "integer", example: 10 },
            featured: { type: "boolean", example: false },
            image_url: { type: "string", example: "https://example.com/image.jpg" },
            created_at: { type: "string", format: "date-time" }
          }
        },
        Category: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            name: { type: "string", example: "Electrónica" },
            description: { type: "string", example: "Productos electrónicos" }
          }
        },
        CartItem: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            user_id: { type: "integer", example: 1 },
            product_id: { type: "integer", example: 1 },
            quantity: { type: "integer", example: 2 },
            product_name: { type: "string", example: "Laptop HP" },
            product_price: { type: "number", example: 999.99 },
            subtotal: { type: "number", example: 1999.98 }
          }
        },
        Order: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            user_id: { type: "integer", example: 1 },
            total: { type: "number", example: 1999.98 },
            status: { type: "string", enum: ["pending", "processing", "shipped", "delivered", "cancelled"], example: "pending" },
            created_at: { type: "string", format: "date-time" }
          }
        },
        Error: {
          type: "object",
          properties: {
            msg: { type: "string", example: "Error message" }
          }
        }
      }
    },
    tags: [
      { name: "Auth", description: "Autenticación y registro de usuarios" },
      { name: "Products", description: "Gestión de productos" },
      { name: "Categories", description: "Gestión de categorías" },
      { name: "Cart", description: "Carrito de compras" },
      { name: "Favorites", description: "Productos favoritos" },
      { name: "Orders", description: "Órdenes de compra" },
      { name: "Admin", description: "Endpoints administrativos" }
    ]
  },
  apis: ["./src/routes/*.js"]
};

const specs = swaggerJsdoc(options);

export { swaggerUi, specs };
