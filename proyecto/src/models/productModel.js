// Productos Model — DB capa de abstracción de consultas
import pool from "../config/db.js";

const ProductModel = {
  findAll: async ({ category, minPrice, maxPrice, search, featured, userId, page = 1, limit = 12 } = {}) => {
    const params = [];
    const conditions = [];
    if (category)  { params.push(category);          conditions.push(`p.category_id=$${params.length}`); }
    if (minPrice)  { params.push(minPrice);           conditions.push(`p.price>=$${params.length}`); }
    if (maxPrice)  { params.push(maxPrice);           conditions.push(`p.price<=$${params.length}`); }
    if (search)    { params.push(`%${search}%`);      conditions.push(`p.name ILIKE $${params.length}`); }
    if (featured !== undefined) { params.push(featured); conditions.push(`p.featured=$${params.length}`); }
    if (userId)    { params.push(userId);             conditions.push(`p.user_id=$${params.length}`); }

    const where = conditions.length ? "WHERE " + conditions.join(" AND ") : "";
    params.push(limit); params.push((page - 1) * limit);

    const sql = `
      SELECT p.*, c.name AS category_name, u.name AS seller_name
      FROM products p
      LEFT JOIN categories c ON c.id=p.category_id
      LEFT JOIN users u ON u.id=p.user_id
      ${where}
      ORDER BY p.created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}`;

    const [rows, count] = await Promise.all([
      pool.query(sql, params),
      pool.query(`SELECT COUNT(*) FROM products p ${where}`, params.slice(0, params.length - 2)),
    ]);
    return { products: rows.rows, total: parseInt(count.rows[0].count) };
  },

  findFeatured: async (limit = 5) => {
    const r = await pool.query(
      `SELECT p.*, c.name AS category_name FROM products p
       LEFT JOIN categories c ON c.id=p.category_id
       WHERE p.featured=TRUE ORDER BY p.created_at DESC LIMIT $1`,
      [limit]
    );
    return r.rows;
  },

  findById: async (id) => {
    const r = await pool.query(
      `SELECT p.*, c.name AS category_name, u.name AS seller_name
       FROM products p
       LEFT JOIN categories c ON c.id=p.category_id
       LEFT JOIN users u ON u.id=p.user_id
       WHERE p.id=$1`,
      [id]
    );
    return r.rows[0] || null;
  },

  create: async ({ userId, categoryId, name, description, price, stock, featured, imageUrl }) => {
    const r = await pool.query(
      `INSERT INTO products(user_id,category_id,name,description,price,stock,featured,image_url)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [userId, categoryId || null, name, description || null,
       parseFloat(price), parseInt(stock) || 0, !!featured, imageUrl || null]
    );
    return r.rows[0];
  },

  update: async (id, { categoryId, name, description, price, stock, featured, imageUrl }) => {
    const r = await pool.query(
      `UPDATE products SET category_id=$1,name=$2,description=$3,price=$4,stock=$5,featured=$6,image_url=$7
       WHERE id=$8 RETURNING *`,
      [categoryId || null, name, description || null, parseFloat(price),
       parseInt(stock), !!featured, imageUrl || null, id]
    );
    return r.rows[0] || null;
  },

  delete: async (id) => {
    await pool.query("DELETE FROM products WHERE id=$1", [id]);
  },

  count: async () => {
    const r = await pool.query("SELECT COUNT(*) FROM products");
    return parseInt(r.rows[0].count);
  },

  totalValue: async () => {
    const r = await pool.query("SELECT COALESCE(SUM(price * stock),0) AS total FROM products");
    return parseFloat(r.rows[0].total);
  },
};

export default ProductModel;
