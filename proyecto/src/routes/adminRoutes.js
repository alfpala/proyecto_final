import express from "express";
import { verifyAdmin }     from "../middleware/auth.js";
import { validate, rules } from "../middleware/validate.js";
import {
  getDashboard,
  listUsers, getUser, createUser, updateUser, deleteUser,
  listCategories, getCategory, createCategory, updateCategory, deleteCategory,
  listProducts, getProduct, createProduct, updateProduct, deleteProduct,
  listOrders, getOrder, updateOrderStatus,
  listFavorites, deleteFavorite,
} from "../controllers/adminController.js";

const router = express.Router();
router.use(verifyAdmin); // all admin routes require admin JWT

// Dashboard
router.get("/dashboard", getDashboard);

// Users CRUD
router.get   ("/users",     listUsers);
router.get   ("/users/:id", getUser);
router.post  ("/users",     validate(rules.userCreate), createUser);
router.put   ("/users/:id", validate(rules.userUpdate), updateUser);
router.delete("/users/:id", deleteUser);

// Categories CRUD
router.get   ("/categories",     listCategories);
router.get   ("/categories/:id", getCategory);
router.post  ("/categories",     validate(rules.category), createCategory);
router.put   ("/categories/:id", validate(rules.category), updateCategory);
router.delete("/categories/:id", deleteCategory);

// Products CRUD
router.get   ("/products",     listProducts);
router.get   ("/products/:id", getProduct);
router.post  ("/products",     validate(rules.product), createProduct);
router.put   ("/products/:id", validate(rules.product), updateProduct);
router.delete("/products/:id", deleteProduct);

// Orders
router.get("/orders",            listOrders);
router.get("/orders/:id",        getOrder);
router.put("/orders/:id/status", validate(rules.updateStatus), updateOrderStatus);

// Favorites
router.get   ("/favorites",     listFavorites);
router.delete("/favorites/:id", deleteFavorite);

export default router;
