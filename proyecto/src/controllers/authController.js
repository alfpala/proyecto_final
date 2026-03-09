import pool from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../middleware/errorHandler.js";

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ msg: "Todos los campos son obligatorios" });

  const exists = await pool.query("SELECT id FROM users WHERE email=$1", [email]);
  if (exists.rows.length > 0)
    return res.status(409).json({ msg: "El correo ya está registrado" });

  const hash = await bcrypt.hash(password, 10);
  const result = await pool.query(
    "INSERT INTO users (name,email,password,role) VALUES($1,$2,$3,'user') RETURNING id,name,email,role",
    [name, email, hash]
  );

  const user = result.rows[0];
  user.role = user.role.toLowerCase();
  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "2h" });
  res.status(201).json({ token, user });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ msg: "Email y contraseña requeridos" });

  const result = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
  if (result.rows.length === 0)
    return res.status(401).json({ msg: "Usuario no encontrado" });

  const user = result.rows[0];
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ msg: "Contraseña incorrecta" });

  const token = jwt.sign({ id: user.id, role: user.role.toLowerCase() }, process.env.JWT_SECRET, { expiresIn: "2h" });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role.toLowerCase() } });
});

export const me = asyncHandler(async (req, res) => {
  const result = await pool.query(
    "SELECT id,name,email,role,created_at FROM users WHERE id=$1",
    [req.user.id]
  );
  if (result.rows.length === 0) return res.status(404).json({ msg: "Usuario no encontrado" });
  res.json(result.rows[0]);
});
