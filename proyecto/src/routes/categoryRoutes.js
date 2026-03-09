import express from "express";
import { validate, rules } from "../middleware/validate.js";
import { verifyToken }     from "../middleware/auth.js";
import { asyncHandler }    from "../middleware/errorHandler.js";
import CategoryService     from "../services/categoryService.js";

const router = express.Router();

router.get("/",    asyncHandler(async (req, res) => res.json(await CategoryService.getAll())));
router.get("/:id", asyncHandler(async (req, res) => res.json(await CategoryService.getById(req.params.id))));
router.post("/", verifyToken, validate(rules.category), asyncHandler(async (req, res) => {
  res.status(201).json(await CategoryService.create(req.body));
}));

export default router;
