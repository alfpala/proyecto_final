import pool from "../config/db.js";
import { asyncHandler } from "../middleware/errorHandler.js";

export const listCategories = asyncHandler(async (req, res) => {
  const result = await pool.query("SELECT * FROM categories ORDER BY name");
  res.json(result.rows);
});

export const createCategory = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ msg: "Nombre requerido" });
  const result = await pool.query(
    "INSERT INTO categories(name,description) VALUES($1,$2) RETURNING *",
    [name, description || null]
  );
  res.status(201).json(result.rows[0]);
});
