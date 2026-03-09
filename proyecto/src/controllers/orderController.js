import pool from "../config/db.js";
import { asyncHandler } from "../middleware/errorHandler.js";

// GET /api/orders
export const getOrders = asyncHandler(async (req, res) => {
  const orders = await pool.query(
    "SELECT * FROM orders WHERE user_id=$1 ORDER BY created_at DESC",
    [req.user.id]
  );

  const result = await Promise.all(
    orders.rows.map(async (order) => {
      try {
        const items = await pool.query(
          `SELECT oi.id, oi.order_id, oi.product_id, oi.quantity, oi.unit_price,
                  p.name, p.image_url
           FROM order_items oi
           LEFT JOIN products p ON p.id = oi.product_id
           WHERE oi.order_id = $1`,
          [order.id]
        );
        return { ...order, items: items.rows };
      } catch {
        return { ...order, items: [] };
      }
    })
  );

  res.json(result);
});

// POST /api/orders  (checkout from cart)
export const createOrder = asyncHandler(async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Get cart items
    const cartResult = await client.query(
      `SELECT ci.quantity, p.id AS product_id, p.price, p.stock, p.name
       FROM cart_items ci JOIN products p ON p.id=ci.product_id
       WHERE ci.user_id=$1`,
      [req.user.id]
    );

    if (cartResult.rows.length === 0)
      return res.status(400).json({ msg: "El carrito está vacío" });

    // Validate stock
    for (const item of cartResult.rows) {
      if (item.stock < item.quantity)
        throw Object.assign(new Error(`Stock insuficiente para "${item.name}"`), { status: 400 });
    }

    const total = cartResult.rows.reduce((sum, i) => sum + i.price * i.quantity, 0);

    // Create order
    const orderResult = await client.query(
      "INSERT INTO orders(user_id,total) VALUES($1,$2) RETURNING *",
      [req.user.id, total.toFixed(2)]
    );
    const order = orderResult.rows[0];

    // Create order items + reduce stock
    for (const item of cartResult.rows) {
      await client.query(
        "INSERT INTO order_items(order_id,product_id,quantity,unit_price) VALUES($1,$2,$3,$4)",
        [order.id, item.product_id, item.quantity, item.price]
      );
      await client.query(
        "UPDATE products SET stock=stock-$1 WHERE id=$2",
        [item.quantity, item.product_id]
      );
    }

    // Clear cart
    await client.query("DELETE FROM cart_items WHERE user_id=$1", [req.user.id]);

    await client.query("COMMIT");
    res.status(201).json({ ...order, items: cartResult.rows });
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
});

// PUT /api/orders/:id/status  (admin only)
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const allowed = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
  if (!allowed.includes(status))
    return res.status(400).json({ msg: "Estado inválido", allowed });

  const result = await pool.query(
    "UPDATE orders SET status=$1 WHERE id=$2 RETURNING *",
    [status, req.params.id]
  );
  if (result.rows.length === 0) return res.status(404).json({ msg: "Orden no encontrada" });
  res.json(result.rows[0]);
});
