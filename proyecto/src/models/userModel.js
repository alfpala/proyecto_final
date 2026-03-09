// User Model — DB query abstraction layer
import pool from "../config/db.js";

const UserModel = {
  findAll: async ({ search = "", role = "", page = 1, limit = 20 } = {}) => {
    const params = [];
    const conditions = [];
    if (search) { params.push(`%${search}%`); conditions.push(`(name ILIKE $${params.length} OR email ILIKE $${params.length})`); }
    if (role)   { params.push(role); conditions.push(`role=$${params.length}`); }
    const where = conditions.length ? "WHERE " + conditions.join(" AND ") : "";
    const offset = (page - 1) * limit;
    params.push(limit); params.push(offset);
    const [rows, count] = await Promise.all([
      pool.query(`SELECT id,name,email,role,created_at FROM users ${where} ORDER BY created_at DESC LIMIT $${params.length-1} OFFSET $${params.length}`, params),
      pool.query(`SELECT COUNT(*) FROM users ${where}`, params.slice(0, params.length - 2)),
    ]);
    return { users: rows.rows, total: parseInt(count.rows[0].count) };
  },

  findById: async (id) => {
    const r = await pool.query("SELECT id,name,email,role,created_at FROM users WHERE id=$1", [id]);
    return r.rows[0] || null;
  },

  findByEmail: async (email) => {
    const r = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    return r.rows[0] || null;
  },

  create: async ({ name, email, passwordHash, role = "user" }) => {
    const r = await pool.query(
      "INSERT INTO users(name,email,password,role) VALUES($1,$2,$3,$4) RETURNING id,name,email,role,created_at",
      [name, email, passwordHash, role.toLowerCase()]
    );
    return r.rows[0];
  },

  update: async (id, fields) => {
    const sets = [];
    const params = [];
    for (const [key, val] of Object.entries(fields)) {
      params.push(val);
      sets.push(`${key}=$${params.length}`);
    }
    params.push(id);
    const r = await pool.query(
      `UPDATE users SET ${sets.join(",")} WHERE id=$${params.length} RETURNING id,name,email,role,created_at`,
      params
    );
    return r.rows[0] || null;
  },

  delete: async (id) => {
    await pool.query("DELETE FROM users WHERE id=$1", [id]);
  },

  count: async () => {
    const r = await pool.query("SELECT COUNT(*) FROM users");
    return parseInt(r.rows[0].count);
  },
};

export default UserModel;
