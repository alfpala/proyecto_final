// Favoritos Model — DB capa de abstracción de consultas
import pool from "../config/db.js";

const FavoriteModel = {
  findAll: async ({ userId, page = 1, limit = 20 } = {}) => {
    const params = userId ? [userId] : [];
    const where  = userId ? "WHERE f.user_id=$1" : "";
    params.push(limit); params.push((page - 1) * limit);

    const [rows, count] = await Promise.all([
      pool.query(
        `SELECT f.id, f.created_at,
                u.id AS user_id, u.name AS user_name, u.email AS user_email,
                p.id AS product_id, p.name AS product_name,
                p.price, p.image_url, p.featured
         FROM favorites f
         JOIN users u ON u.id=f.user_id
         JOIN products p ON p.id=f.product_id
         ${where}
         ORDER BY f.created_at DESC
         LIMIT $${params.length - 1} OFFSET $${params.length}`,
        params
      ),
      pool.query(`SELECT COUNT(*) FROM favorites f ${where}`, userId ? [userId] : []),
    ]);
    return { favorites: rows.rows, total: parseInt(count.rows[0].count) };
  },

  add: async (userId, productId) => {
    const r = await pool.query(
      "INSERT INTO favorites(user_id,product_id) VALUES($1,$2) ON CONFLICT DO NOTHING RETURNING *",
      [userId, productId]
    );
    return r.rows[0] || null;
  },

  remove: async (userId, productId) => {
    await pool.query("DELETE FROM favorites WHERE user_id=$1 AND product_id=$2", [userId, productId]);
  },

  removeById: async (id) => {
    await pool.query("DELETE FROM favorites WHERE id=$1", [id]);
  },

  count: async () => {
    const r = await pool.query("SELECT COUNT(*) FROM favorites");
    return parseInt(r.rows[0].count);
  },
};

export default FavoriteModel;
