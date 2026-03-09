// Ordenes Service — Capa de lógica de negocio
import OrderModel from "../models/orderModel.js";
import pool from "../config/db.js";

const VALID_STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

const OrderService = {
  getAll: (filters) => OrderModel.findAll(filters),

  getById: async (id) => {
    const order = await OrderModel.findById(id);
    if (!order) throw Object.assign(new Error("Orden no encontrada"), { status: 404 });
    return order;
  },

  getByUser: (userId, filters) => OrderModel.findAll({ ...filters, userId }),

  checkout: async (userId) => {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const cartResult = await client.query(
        `SELECT ci.quantity, p.id AS product_id, p.price, p.stock, p.name
         FROM cart_items ci JOIN products p ON p.id=ci.product_id
         WHERE ci.user_id=$1`,
        [userId]
      );
      if (!cartResult.rows.length)
        throw Object.assign(new Error("El carrito está vacío"), { status: 400 });

      // Validar stock para todos los artículos
      for (const item of cartResult.rows) {
        if (item.stock < item.quantity)
          throw Object.assign(
            new Error(`Stock insuficiente para "${item.name}" (disponible: ${item.stock})`),
            { status: 400 }
          );
      }

      const total = cartResult.rows.reduce((s, i) => s + parseFloat(i.price) * i.quantity, 0);
      const orderResult = await client.query(
        "INSERT INTO orders(user_id,total) VALUES($1,$2) RETURNING *",
        [userId, total.toFixed(2)]
      );
      const order = orderResult.rows[0];

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

      await client.query("DELETE FROM cart_items WHERE user_id=$1", [userId]);
      await client.query("COMMIT");
      return { ...order, items: cartResult.rows };
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },

  updateStatus: async (id, status) => {
    if (!VALID_STATUSES.includes(status))
      throw Object.assign(new Error(`Estado inválido. Válidos: ${VALID_STATUSES.join(", ")}`), { status: 400 });

    const order = await OrderModel.findById(id);
    if (!order) throw Object.assign(new Error("Orden no encontrada"), { status: 404 });

    if (order.status === "delivered" && status !== "cancelled")
      throw Object.assign(new Error("Una orden entregada solo puede cancelarse"), { status: 400 });

    return OrderModel.updateStatus(id, status);
  },

  getStats: async () => {
    const [total, revenue, byStatus] = await Promise.all([
      OrderModel.count(),
      OrderModel.revenue(),
      OrderModel.countByStatus(),
    ]);
    return { total, revenue, byStatus };
  },
};

export default OrderService;
