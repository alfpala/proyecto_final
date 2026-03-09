-- ============================================================
-- MARKETPLACE TECH - Database Schema
-- Ejecuta este archivo una vez en base de datos PostgreSQL
-- psql -U postgres -d marketplace_tech -f schema.sql
-- ============================================================

-- USUARIOS
CREATE TABLE IF NOT EXISTS users (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(120) NOT NULL,
  email       VARCHAR(180) NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,
  role        VARCHAR(20)  NOT NULL DEFAULT 'user',  -- 'user' | 'admin'
  created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- CATEGORÍAS
CREATE TABLE IF NOT EXISTS categories (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL UNIQUE,
  description TEXT
);

-- PRODUCTOS
CREATE TABLE IF NOT EXISTS products (
  id           SERIAL PRIMARY KEY,
  user_id      INT REFERENCES users(id) ON DELETE SET NULL,
  category_id  INT REFERENCES categories(id) ON DELETE SET NULL,
  name         VARCHAR(200) NOT NULL,
  description  TEXT,
  price        NUMERIC(12,2) NOT NULL,
  stock        INT NOT NULL DEFAULT 0,
  featured     BOOLEAN NOT NULL DEFAULT FALSE,
  image_url    TEXT,
  created_at   TIMESTAMP NOT NULL DEFAULT NOW()
);

-- CARRITO
CREATE TABLE IF NOT EXISTS cart_items (
  id          SERIAL PRIMARY KEY,
  user_id     INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id  INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity    INT NOT NULL DEFAULT 1,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- FAVORITOS
CREATE TABLE IF NOT EXISTS favorites (
  id          SERIAL PRIMARY KEY,
  user_id     INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id  INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- PEDIDOS
CREATE TABLE IF NOT EXISTS orders (
  id          SERIAL PRIMARY KEY,
  user_id     INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total       NUMERIC(12,2) NOT NULL,
  status      VARCHAR(30) NOT NULL DEFAULT 'pending', -- pending | confirmed | shipped | delivered | cancelled
  created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- DETALLES DE PEDIDOS
CREATE TABLE IF NOT EXISTS order_items (
  id          SERIAL PRIMARY KEY,
  order_id    INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id  INT NOT NULL REFERENCES products(id) ON DELETE SET NULL,
  quantity    INT NOT NULL,
  unit_price  NUMERIC(12,2) NOT NULL
);

-- ============================================================
-- DATOS DE EJEMPLO
-- ============================================================

-- Admin user (password: admin123)
INSERT INTO users (name, email, password, role) VALUES
  ('Administrador', 'admin@marketplace.com', '$2b$10$RHbQg5v5Y6X7N4k92.2qAeF8rZRkFYI/eJ4fOGpYkDlXO4.3rL2me', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Categorías
INSERT INTO categories (name, description) VALUES
  ('Electrónica',    'Smartphones, laptops, tablets y más'),
  ('Ropa',           'Moda masculina, femenina e infantil'),
  ('Hogar',          'Muebles, decoración y electrodomésticos'),
  ('Deportes',       'Equipamiento deportivo y fitness'),
  ('Libros',         'Literatura, ciencia, tecnología'),
  ('Juguetes',       'Juguetes y juegos para todas las edades'),
  ('Belleza',        'Cosméticos, perfumes y cuidado personal'),
  ('Herramientas',   'Herramientas y materiales de construcción')
ON CONFLICT (name) DO NOTHING;

-- Ejemplos de productos (requiere que el usuario administrador exista)
INSERT INTO products (user_id, category_id, name, description, price, stock, featured, image_url) VALUES
  (1, 1, 'Smartphone Galaxy Pro', 'Pantalla AMOLED 6.7", 256GB, 5G, batería 5000mAh', 899.99, 25, TRUE,  'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600'),
  (1, 1, 'Laptop UltraBook 14"',  'Intel i7, 16GB RAM, SSD 512GB, pantalla FHD', 1199.99, 12, TRUE, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600'),
  (1, 1, 'Auriculares Bluetooth', 'Cancelación de ruido activa, 30h batería, Hi-Fi', 149.99, 40, FALSE, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600'),
  (1, 1, 'Tablet 10" HD',         'Octa-core, 4GB RAM, 64GB, WiFi+4G', 349.99, 18, TRUE, 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600'),
  (1, 2, 'Zapatillas Running Pro', 'Suela amortiguadora, transpirables, talla 36-48', 89.99, 60, FALSE, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600'),
  (1, 2, 'Camiseta Premium Sport', 'Dry-fit 100% poliéster reciclado, UV50+', 34.99, 100, FALSE, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600'),
  (1, 3, 'Cafetera Espresso',     'Bomba 15 bar, cappuccinatore, depósito 1.5L', 199.99, 15, TRUE, 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600'),
  (1, 4, 'Bicicleta MTB 29"',     'Shimano 21v, frenos disco, horquilla suspensión', 499.99, 8, FALSE, 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600'),
  (1, 5, 'Aprende Python 3',      'Guía completa con 400 ejercicios prácticos', 29.99, 200, FALSE, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600'),
  (1, 7, 'Perfume Elegance 100ml','Extracto de perfume floral-amaderado, duración 12h', 79.99, 30, FALSE, 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=600')
ON CONFLICT DO NOTHING;
