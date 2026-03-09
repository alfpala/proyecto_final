import express from "express";
import { getFavorites, addFavorite, removeFavorite } from "../controllers/favoriteController.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();
router.use(verifyToken);
router.get("/", getFavorites);
router.post("/", addFavorite);
router.delete("/:productId", removeFavorite);
export default router;
