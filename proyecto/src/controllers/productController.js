import pool from "../config/db.js";
import { asyncHandler } from "../middleware/errorHandler.js";

// GET /api/products?category=&minPrice=&maxPrice=&search=&page=&limit=
export const listProducts = asyncHandler(async (req, res) => {
  const { category, minPrice, maxPrice, search, page = 1, limit = 12 } = req.query;
  const offset = (page - 1) * limit;
  const params = [];
  const conditions = [];

  if (category) { params.push(category); conditions.push(`p.category_id=$${params.length}`); }
  if (minPrice)  { params.push(minPrice); conditions.push(`p.price>=$${params.length}`); }
  if (maxPrice)  { params.push(maxPrice); conditions.push(`p.price<=$${params.length}`); }
  if (search)    { params.push(`%${search}%`); conditions.push(`p.name ILIKE $${params.length}`); }

  const where = conditions.length ? "WHERE " + conditions.join(" AND ") : "";

  params.push(limit);
  params.push(offset);

  const sql = `
    SELECT p.*, c.name AS category_name, u.name AS seller_name
    FROM products p
    LEFT JOIN categories c ON c.id=p.category_id
    LEFT JOIN users u ON u.id=p.user_id
    ${where}
    ORDER BY p.created_at DESC
    LIMIT $${params.length - 1} OFFSET $${params.length}
  `;

  const countSql = `SELECT COUNT(*) FROM products p ${where}`;
  const [rows, count] = await Promise.all([
    pool.query(sql, params),
    pool.query(countSql, params.slice(0, params.length - 2))
  ]);

  res.json({ products: rows.rows, total: parseInt(count.rows[0].count), page: parseInt(page), limit: parseInt(limit) });
});

// GET /api/products/featured
export const getFeatured = asyncHandler(async (req, res) => {
  const result = await pool.query(
    `SELECT p.*, c.name AS category_name
     FROM products p LEFT JOIN categories c ON c.id=p.category_id
     WHERE p.featured=TRUE ORDER BY p.created_at DESC LIMIT 5`
  );
  res.json(result.rows);
});

// GET /api/products/:id
export const getProduct = asyncHandler(async (req, res) => {
  const result = await pool.query(
    `SELECT p.*, c.name AS category_name, u.name AS seller_name
     FROM products p
     LEFT JOIN categories c ON c.id=p.category_id
     LEFT JOIN users u ON u.id=p.user_id
     WHERE p.id=$1`,
    [req.params.id]
  );
  if (result.rows.length === 0) return res.status(404).json({ msg: "Producto no encontrado" });
  res.json(result.rows[0]);
});

// GET /api/products/my  (auth required)
export const getMyProducts = asyncHandler(async (req, res) => {
  const result = await pool.query(
    `SELECT p.*, c.name AS category_name FROM products p
     LEFT JOIN categories c ON c.id=p.category_id
     WHERE p.user_id=$1 ORDER BY p.created_at DESC`,
    [req.user.id]
  );
  res.json(result.rows);
});

// POST /api/products (auth required)
export const createProduct = asyncHandler(async (req, res) => {
  const { category_id, name, description, price, stock, featured, image_url } = req.body;
  if (!name || !price) return res.status(400).json({ msg: "Nombre y precio son obligatorios" });

  const result = await pool.query(
    `INSERT INTO products(user_id,category_id,name,description,price,stock,featured,image_url)
     VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [req.user.id, category_id || null, name, description || null,
     parseFloat(price), parseInt(stock) || 0, !!featured, image_url || null]
  );
  res.status(201).json(result.rows[0]);
});

// PUT /api/products/:id (auth required, owner or admin)
export const updateProduct = asyncHandler(async (req, res) => {
  const check = await pool.query("SELECT user_id FROM products WHERE id=$1", [req.params.id]);
  if (check.rows.length === 0) return res.status(404).json({ msg: "Producto no encontrado" });
  if (check.rows[0].user_id !== req.user.id && req.user.role !== "admin")
    return res.status(403).json({ msg: "Sin permisos para editar este producto" });

  const { category_id, name, description, price, stock, featured, image_url } = req.body;
  const result = await pool.query(
    `UPDATE products SET category_id=$1,name=$2,description=$3,price=$4,stock=$5,featured=$6,image_url=$7
     WHERE id=$8 RETURNING *`,
    [category_id || null, name, description || null, parseFloat(price),
     parseInt(stock), !!featured, image_url || null, req.params.id]
  );
  res.json(result.rows[0]);
});

// DELETE /api/products/:id (auth required, owner or admin)
export const deleteProduct = asyncHandler(async (req, res) => {
  const check = await pool.query("SELECT user_id FROM products WHERE id=$1", [req.params.id]);
  if (check.rows.length === 0) return res.status(404).json({ msg: "Producto no encontrado" });
  if (check.rows[0].user_id !== req.user.id && req.user.role !== "admin")
    return res.status(403).json({ msg: "Sin permisos para eliminar este producto" });

  await pool.query("DELETE FROM products WHERE id=$1", [req.params.id]);
  res.json({ msg: "Producto eliminado" });
});
