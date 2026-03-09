// Ordenes Model — DB capa de abstracción de consultas
import pool from "../config/db.js";

const OrderModel = {
  findAll: async ({ userId, status, page = 1, limit = 20 } = {}) => {
    const params = [];
    const conditions = [];
    if (userId) { params.push(userId); conditions.push(`o.user_id=$${params.length}`); }
    if (status) { params.push(status); conditions.push(`o.status=$${params.length}`); }
    const where = conditions.length ? "WHERE " + conditions.join(" AND ") : "";
    params.push(limit); params.push((page - 1) * limit);

    const [rows, count] = await Promise.all([
      pool.query(
        `SELECT o.*, u.name AS user_name, u.email AS user_email
         FROM orders o JOIN users u ON u.id=o.user_id
         ${where} ORDER BY o.created_at DESC
         LIMIT $${params.length - 1} OFFSET $${params.length}`,
        params
      ),
      pool.query(`SELECT COUNT(*) FROM orders o ${where}`, params.slice(0, params.length - 2)),
    ]);

    const orders = await Promise.all(
      rows.rows.map(async (order) => {
        const items = await pool.query(
          `SELECT oi.*, p.name AS product_name, p.image_url FROM order_items oi
           LEFT JOIN products p ON p.id=oi.product_id WHERE oi.order_id=$1`,
          [order.id]
        );
        return { ...order, items: items.rows };
      })
    );
    return { orders, total: parseInt(count.rows[0].count) };
  },

  findById: async (id) => {
    const r = await pool.query(
      `SELECT o.*, u.name AS user_name, u.email AS user_email
       FROM orders o JOIN users u ON u.id=o.user_id WHERE o.id=$1`,
      [id]
    );
    if (!r.rows[0]) return null;
    const items = await pool.query(
      `SELECT oi.*, p.name AS product_name, p.image_url FROM order_items oi
       LEFT JOIN products p ON p.id=oi.product_id WHERE oi.order_id=$1`,
      [id]
    );
    return { ...r.rows[0], items: items.rows };
  },

  updateStatus: async (id, status) => {
    const r = await pool.query(
      "UPDATE orders SET status=$1 WHERE id=$2 RETURNING *",
      [status, id]
    );
    return r.rows[0] || null;
  },

  count: async () => {
    const r = await pool.query("SELECT COUNT(*) FROM orders");
    return parseInt(r.rows[0].count);
  },

  revenue: async () => {
    const r = await pool.query(
      "SELECT COALESCE(SUM(total),0) AS total FROM orders WHERE status NOT IN ('cancelled')"
    );
    return parseFloat(r.rows[0].total);
  },

  countByStatus: async () => {
    const r = await pool.query(
      "SELECT status, COUNT(*)::int AS count FROM orders GROUP BY status"
    );
    return r.rows;
  },
};

export default OrderModel;
