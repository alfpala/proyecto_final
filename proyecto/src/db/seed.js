// Run: node src/db/seed.js
import bcrypt from "bcrypt";
import pool from "../config/db.js";
import dotenv from "dotenv";
dotenv.config();

async function seed() {
  const client = await pool.connect();
  try {
    // 1. Restablecer contraseña de administrador
    const hash = await bcrypt.hash("admin123", 10);
    await client.query(
      "UPDATE users SET password=$1, name=$2 WHERE email=$3",
      [hash, "Administrador", "admin@admin.com"]
    );
    console.log("Contraseña de administrador restablecida  →  admin@admin.com / admin123");

    // 2. Categorías Iniciales (solo si está vacío)
    const existingCats = await client.query("SELECT COUNT(*) FROM categories");
    let catCount = 0;
    if (parseInt(existingCats.rows[0].count) === 0) {
      const catRes = await client.query(`
        INSERT INTO categories(name,description) VALUES
          ('Electrónica','Smartphones, laptops, tablets y más'),
          ('Ropa','Moda masculina, femenina e infantil'),
          ('Hogar','Muebles, decoración y electrodomésticos'),
          ('Deportes','Equipamiento deportivo y fitness'),
          ('Libros','Literatura, ciencia, tecnología'),
          ('Juguetes','Juguetes y juegos para todas las edades'),
          ('Belleza','Cosméticos, perfumes y cuidado personal'),
          ('Herramientas','Herramientas y materiales de construcción')
        RETURNING id,name`);
      catCount = catRes.rowCount;
    } else {
      catCount = parseInt(existingCats.rows[0].count);
      console.log("  (categorías ya existen, salteado)");
    }
    console.log(` ${catCount} categorías disponibles`);

    // 3. Obtener IDs de categorías
    const cats = await client.query("SELECT id,name FROM categories ORDER BY id LIMIT 8");
    const byName = {};
    cats.rows.forEach(c => (byName[c.name] = c.id));
    const E = byName["Electrónica"];
    const R = byName["Ropa"];
    const H = byName["Hogar"];
    const D = byName["Deportes"];
    const L = byName["Libros"];
    const B = byName["Belleza"];

    // 4. Obtener ID del usuario administrador
    const adminRes = await client.query(
      "SELECT id FROM users WHERE email=$1",
      ["admin@admin.com"]
    );
    const uid = adminRes.rows[0].id;

    // 5. Insertar productos
    const products = [
      [uid, E, "Smartphone Galaxy Pro",
       "Pantalla AMOLED 6.7\", 256GB, 5G, batería 5000mAh",
       899.99, 25, true,
       "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600"],
      [uid, E, "Laptop UltraBook 14\"",
       "Intel i7, 16GB RAM, SSD 512GB, pantalla Full HD",
       1199.99, 12, true,
       "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600"],
      [uid, E, "Auriculares Bluetooth",
       "Cancelación de ruido activa, 30h batería, audio Hi-Fi",
       149.99, 40, false,
       "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600"],
      [uid, E, "Tablet 10\" HD",
       "Octa-core, 4GB RAM, 64GB, WiFi y 4G LTE",
       349.99, 18, true,
       "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600"],
      [uid, E, "Smartwatch Pro Series 5",
       "GPS integrado, monitor cardíaco, 7 días de batería, resistente al agua",
       199.99, 30, true,
       "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600"],
      [uid, R, "Zapatillas Running Pro",
       "Suela amortiguadora, material transpirable, talla 36-48",
       89.99, 60, false,
       "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600"],
      [uid, H, "Cafetera Espresso Italiana",
       "Bomba 15 bar, cappuccinatore integrado, depósito 1.5L",
       199.99, 15, false,
       "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600"],
      [uid, D, "Bicicleta MTB 29\"",
       "Cambios Shimano 21v, frenos de disco, horquilla con suspensión",
       499.99, 8, false,
       "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600"],
      [uid, L, "Aprende Python 3 Completo",
       "Guía definitiva con 400 ejercicios prácticos y proyectos reales",
       29.99, 200, false,
       "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600"],
      [uid, B, "Perfume Elegance 100ml",
       "Extracto de perfume floral-amaderado, duración superior a 12 horas",
       79.99, 30, false,
       "https://images.unsplash.com/photo-1541643600914-78b084683702?w=600"],
    ];

    // Solo insertar si no hay productos existentes
    const existing = await client.query("SELECT COUNT(*) FROM products");
    let inserted = 0;
    if (parseInt(existing.rows[0].count) === 0) {
      for (const p of products) {
        await client.query(
          `INSERT INTO products(user_id,category_id,name,description,price,stock,featured,image_url)
           VALUES($1,$2,$3,$4,$5,$6,$7,$8)`,
          p
        );
        inserted++;
      }
    } else {
      console.log("  (productos ya existen, salteado)");
    }
    console.log(` ${inserted} productos insertados`);

    const total = await client.query("SELECT COUNT(*) FROM products");
    console.log(`Total productos en BD: ${total.rows[0].count}`);
    console.log("\n=== SEED COMPLETO ===");
    console.log("  Login admin: admin@admin.com");
    console.log("  Password:    admin123");
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch(e => { console.error("SEED ERROR:", e.message); process.exit(1); });
