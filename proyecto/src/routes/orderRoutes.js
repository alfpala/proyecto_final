import express from "express";
import { getOrders, createOrder, updateOrderStatus } from "../controllers/orderController.js";
import { verifyToken, verifyAdmin } from "../middleware/auth.js";

const router = express.Router();
router.get("/", verifyToken, getOrders);
router.post("/", verifyToken, createOrder);
router.put("/:id/status", verifyAdmin, updateOrderStatus);
export default router;
