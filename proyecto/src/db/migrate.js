/**
 * Migración: corregir la tabla order_items para que coincida con schema.sql
 */
import pkg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pkg;
const pool = new Pool({
  host:     process.env.DB_HOST,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port:     process.env.DB_PORT,
});

async function migrate() {
  const client = await pool.connect();
  try {
    // Mostrar columnas actuales de order_items
    const { rows } = await client.query(
      `SELECT column_name, data_type
       FROM information_schema.columns
       WHERE table_name = 'order_items'
       ORDER BY ordinal_position`
    );
    console.log('Columnas actuales de order_items:', rows.map(r => r.column_name));

    // Agregar unit_price si falta
    const hasUnitPrice = rows.some(r => r.column_name === 'unit_price');
    if (!hasUnitPrice) {
      // Verificar si hay una columna 'price' heredada para copiar
      const hasPrice = rows.some(r => r.column_name === 'price');
      if (hasPrice) {
        console.log('Renombrando price -> unit_price ...');
        await client.query(`ALTER TABLE order_items RENAME COLUMN price TO unit_price`);
      } else {
        console.log('Agregando columna unit_price ...');
        await client.query(`ALTER TABLE order_items ADD COLUMN unit_price NUMERIC(12,2) NOT NULL DEFAULT 0`);
      }
      console.log('Columna unit_price lista.');
    } else {
      console.log('unit_price ya existe — nada más que hacer.');
    }
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch(err => { console.error(err.message); process.exit(1); });
