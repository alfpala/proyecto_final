import pool from "../config/db.js";
import { asyncHandler } from "../middleware/errorHandler.js";

// GET /api/cart
export const getCart = asyncHandler(async (req, res) => {
  const result = await pool.query(
    `SELECT ci.id, ci.quantity,
            p.id AS product_id, p.name, p.price, p.stock, p.image_url, p.featured,
            c.name AS category_name
     FROM cart_items ci
     JOIN products p ON p.id=ci.product_id
     LEFT JOIN categories c ON c.id=p.category_id
     WHERE ci.user_id=$1
     ORDER BY ci.created_at DESC`,
    [req.user.id]
  );
  res.json(result.rows);
});

// POST /api/cart  { product_id, quantity }
export const addToCart = asyncHandler(async (req, res) => {
  const { product_id, quantity = 1 } = req.body;
  if (!product_id) return res.status(400).json({ msg: "product_id requerido" });

  const prod = await pool.query("SELECT stock FROM products WHERE id=$1", [product_id]);
  if (prod.rows.length === 0) return res.status(404).json({ msg: "Producto no encontrado" });
  if (prod.rows[0].stock < quantity)
    return res.status(400).json({ msg: "Stock insuficiente", available: prod.rows[0].stock });

  const result = await pool.query(
    `INSERT INTO cart_items(user_id,product_id,quantity) VALUES($1,$2,$3)
     ON CONFLICT(user_id,product_id)
     DO UPDATE SET quantity = LEAST(cart_items.quantity + $3, $4)
     RETURNING *`,
    [req.user.id, product_id, parseInt(quantity), prod.rows[0].stock]
  );
  res.status(201).json(result.rows[0]);
});

// PUT /api/cart/:id  { quantity }
export const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  if (!quantity || quantity < 1) return res.status(400).json({ msg: "Cantidad inválida" });

  const item = await pool.query(
    "SELECT ci.product_id, p.stock FROM cart_items ci JOIN products p ON p.id=ci.product_id WHERE ci.id=$1 AND ci.user_id=$2",
    [req.params.id, req.user.id]
  );
  if (item.rows.length === 0) return res.status(404).json({ msg: "Item no encontrado" });
  if (item.rows[0].stock < quantity)
    return res.status(400).json({ msg: "Stock insuficiente", available: item.rows[0].stock });

  const result = await pool.query(
    "UPDATE cart_items SET quantity=$1 WHERE id=$2 AND user_id=$3 RETURNING *",
    [quantity, req.params.id, req.user.id]
  );
  res.json(result.rows[0]);
});

// DELETE /api/cart/:id
export const removeCartItem = asyncHandler(async (req, res) => {
  await pool.query("DELETE FROM cart_items WHERE id=$1 AND user_id=$2", [req.params.id, req.user.id]);
  res.json({ msg: "Producto eliminado del carrito" });
});

// DELETE /api/cart  (clear whole cart)
export const clearCart = asyncHandler(async (req, res) => {
  await pool.query("DELETE FROM cart_items WHERE user_id=$1", [req.user.id]);
  res.json({ msg: "Carrito vaciado" });
});
