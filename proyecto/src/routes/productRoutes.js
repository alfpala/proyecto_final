import express from "express";
import { validate, rules } from "../middleware/validate.js";
import { verifyToken }     from "../middleware/auth.js";
import { asyncHandler }    from "../middleware/errorHandler.js";
import ProductService      from "../services/productService.js";

const router = express.Router();

// Public
router.get("/featured", asyncHandler(async (req, res) => res.json(await ProductService.getFeatured(5))));
router.get("/", asyncHandler(async (req, res) => {
  const { category, minPrice, maxPrice, search, page, limit } = req.query;
  res.json(await ProductService.getAll({ category, minPrice, maxPrice, search,
    page: parseInt(page)||1, limit: parseInt(limit)||12 }));
}));
// Protected — must be declared BEFORE /:id to avoid "my" being parsed as an integer id
router.get("/my/list", verifyToken, asyncHandler(async (req, res) => {
  res.json(await ProductService.getByUser(req.user.id, {}));
}));

router.get("/:id", asyncHandler(async (req, res) => res.json(await ProductService.getById(req.params.id))));

router.post("/", verifyToken, validate(rules.product), asyncHandler(async (req, res) => {
  const { category_id, name, description, price, stock, featured, image_url } = req.body;
  res.status(201).json(await ProductService.create({
    userId: req.user.id,
    categoryId: category_id ? parseInt(category_id) : null,
    name, description,
    price: parseFloat(price), stock: parseInt(stock)||0,
    featured: featured === true || featured === "true",
    imageUrl: image_url,
  }));
}));

router.put("/:id", verifyToken, validate(rules.product), asyncHandler(async (req, res) => {
  const { category_id, name, description, price, stock, featured, image_url } = req.body;
  res.json(await ProductService.update(req.params.id,
    { categoryId: category_id ? parseInt(category_id) : null, name, description,
      price: parseFloat(price), stock: parseInt(stock),
      featured: featured === true || featured === "true", imageUrl: image_url },
    req.user.id, req.user.role
  ));
}));

router.delete("/:id", verifyToken, asyncHandler(async (req, res) => {
  await ProductService.delete(req.params.id, req.user.id, req.user.role);
  res.json({ msg: "Producto eliminado" });
}));

export default router;
