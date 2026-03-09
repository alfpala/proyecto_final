import pool from "../config/db.js";
import { asyncHandler } from "../middleware/errorHandler.js";

export const getFavorites = asyncHandler(async (req, res) => {
  const result = await pool.query(
    `SELECT f.id, p.id AS product_id, p.name, p.price, p.image_url, p.featured, p.stock,
            c.name AS category_name
     FROM favorites f
     JOIN products p ON p.id=f.product_id
     LEFT JOIN categories c ON c.id=p.category_id
     WHERE f.user_id=$1 ORDER BY f.created_at DESC`,
    [req.user.id]
  );
  res.json(result.rows);
});

export const addFavorite = asyncHandler(async (req, res) => {
  const { product_id } = req.body;
  if (!product_id) return res.status(400).json({ msg: "product_id requerido" });

  const exists = await pool.query("SELECT id FROM products WHERE id=$1", [product_id]);
  if (exists.rows.length === 0) return res.status(404).json({ msg: "Producto no encontrado" });

  const result = await pool.query(
    "INSERT INTO favorites(user_id,product_id) VALUES($1,$2) ON CONFLICT DO NOTHING RETURNING *",
    [req.user.id, product_id]
  );
  res.status(201).json(result.rows[0] || { msg: "Ya está en favoritos" });
});

export const removeFavorite = asyncHandler(async (req, res) => {
  await pool.query(
    "DELETE FROM favorites WHERE user_id=$1 AND product_id=$2",
    [req.user.id, req.params.productId]
  );
  res.json({ msg: "Eliminado de favoritos" });
});
