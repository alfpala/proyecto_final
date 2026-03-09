// Categoria Model — DB capa de abstracción de consultas
import pool from "../config/db.js";

const CategoryModel = {
  findAll: async () => {
    const r = await pool.query(`
      SELECT c.*, COUNT(p.id)::int AS product_count
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id
      GROUP BY c.id ORDER BY c.name
    `);
    return r.rows;
  },

  findById: async (id) => {
    const r = await pool.query("SELECT * FROM categories WHERE id=$1", [id]);
    return r.rows[0] || null;
  },

  findByName: async (name) => {
    const r = await pool.query("SELECT * FROM categories WHERE LOWER(name)=LOWER($1)", [name]);
    return r.rows[0] || null;
  },

  create: async ({ name, description }) => {
    const r = await pool.query(
      "INSERT INTO categories(name,description) VALUES($1,$2) RETURNING *",
      [name, description || null]
    );
    return r.rows[0];
  },

  update: async (id, { name, description }) => {
    const r = await pool.query(
      "UPDATE categories SET name=$1,description=$2 WHERE id=$3 RETURNING *",
      [name, description || null, id]
    );
    return r.rows[0] || null;
  },

  delete: async (id) => {
    await pool.query("DELETE FROM categories WHERE id=$1", [id]);
  },

  count: async () => {
    const r = await pool.query("SELECT COUNT(*) FROM categories");
    return parseInt(r.rows[0].count);
  },
};

export default CategoryModel;
