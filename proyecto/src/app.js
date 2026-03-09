import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes      from "./routes/authRoutes.js";
import adminRoutes     from "./routes/adminRoutes.js";
import categoryRoutes  from "./routes/categoryRoutes.js";
import productRoutes   from "./routes/productRoutes.js";
import cartRoutes      from "./routes/cartRoutes.js";
import favoriteRoutes  from "./routes/favoriteRoutes.js";
import orderRoutes     from "./routes/orderRoutes.js";

import { swaggerUi, specs } from "./docs/swagger.js";
import { errorHandler } from "./middleware/errorHandler.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors({ origin: "*" }));
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json());

// Servir archivos frontend estáticos (**solo en producción)
if (process.env.NODE_ENV !== 'test') {
  app.use(express.static(path.join(__dirname, "../../frontend-html")));
}

// Control de check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend corriendo' });
});

// Rutas de la API
app.use("/api/auth",       authRoutes);
app.use("/api/admin",      adminRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products",   productRoutes);
app.use("/api/cart",       cartRoutes);
app.use("/api/favorites",  favoriteRoutes);
app.use("/api/orders",     orderRoutes);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// Manejador de errores centralizado
app.use(errorHandler);

export default app;
