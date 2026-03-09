// Admin Controller — uses service layer for all CRUD operations
import { asyncHandler } from "../middleware/errorHandler.js";
import UserService    from "../services/userService.js";
import CategoryService from "../services/categoryService.js";
import ProductService  from "../services/productService.js";
import OrderService    from "../services/orderService.js";
import FavoriteModel   from "../models/favoriteModel.js";
import UserModel       from "../models/userModel.js";
import ProductModel    from "../models/productModel.js";

// ─── Dashboard ───────────────────────────────────────────────────────────────
export const getDashboard = asyncHandler(async (req, res) => {
  const [users, products, orderStats, favorites, inventory] = await Promise.all([
    UserModel.count(),
    ProductModel.count(),
    OrderService.getStats(),
    FavoriteModel.count(),
    ProductModel.totalValue(),
  ]);
  res.json({
    users,
    products,
    orders:    orderStats.total,
    revenue:   orderStats.revenue,
    favorites,
    inventory,
    ordersByStatus: orderStats.byStatus,
  });
});

// ─── Users CRUD ──────────────────────────────────────────────────────────────
export const listUsers = asyncHandler(async (req, res) => {
  const { search, role, page, limit } = req.query;
  res.json(await UserService.getAll({ search, role, page: parseInt(page)||1, limit: parseInt(limit)||20 }));
});

export const getUser = asyncHandler(async (req, res) => {
  res.json(await UserService.getById(req.params.id));
});

export const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  const user = await UserService.create({ name, email, password, role: role||"user" });
  res.status(201).json(user);
});

export const updateUser = asyncHandler(async (req, res) => {
  const user = await UserService.update(req.params.id, req.body);
  res.json(user);
});

export const deleteUser = asyncHandler(async (req, res) => {
  await UserService.delete(req.params.id, req.user.id);
  res.json({ msg: "Usuario eliminado" });
});

// ─── Categories CRUD ─────────────────────────────────────────────────────────
export const listCategories = asyncHandler(async (req, res) => {
  res.json(await CategoryService.getAll());
});

export const getCategory = asyncHandler(async (req, res) => {
  res.json(await CategoryService.getById(req.params.id));
});

export const createCategory = asyncHandler(async (req, res) => {
  res.status(201).json(await CategoryService.create(req.body));
});

export const updateCategory = asyncHandler(async (req, res) => {
  res.json(await CategoryService.update(req.params.id, req.body));
});

export const deleteCategory = asyncHandler(async (req, res) => {
  await CategoryService.delete(req.params.id);
  res.json({ msg: "Categoría eliminada" });
});

// ─── Products CRUD ───────────────────────────────────────────────────────────
export const listProducts = asyncHandler(async (req, res) => {
  const { category, search, minPrice, maxPrice, featured, page, limit } = req.query;
  res.json(await ProductService.getAll({
    category, search, minPrice, maxPrice,
    featured: featured !== undefined ? featured === "true" : undefined,
    page: parseInt(page)||1,
    limit: parseInt(limit)||20,
  }));
});

export const getProduct = asyncHandler(async (req, res) => {
  res.json(await ProductService.getById(req.params.id));
});

export const createProduct = asyncHandler(async (req, res) => {
  const { category_id, name, description, price, stock, featured, image_url } = req.body;
  res.status(201).json(await ProductService.create({
    userId: req.user.id,
    categoryId: category_id ? parseInt(category_id) : null,
    name, description,
    price: parseFloat(price),
    stock: parseInt(stock) || 0,
    featured: featured === true || featured === "true",
    imageUrl: image_url,
  }));
});

export const updateProduct = asyncHandler(async (req, res) => {
  const { category_id, name, description, price, stock, featured, image_url } = req.body;
  res.json(await ProductService.update(
    req.params.id,
    { categoryId: category_id ? parseInt(category_id) : null, name, description,
      price: parseFloat(price), stock: parseInt(stock), featured: featured === true || featured === "true", imageUrl: image_url },
    req.user.id, req.user.role
  ));
});

export const deleteProduct = asyncHandler(async (req, res) => {
  await ProductService.delete(req.params.id, req.user.id, req.user.role);
  res.json({ msg: "Producto eliminado" });
});

// ─── Orders ──────────────────────────────────────────────────────────────────
export const listOrders = asyncHandler(async (req, res) => {
  const { userId, status, page, limit } = req.query;
  res.json(await OrderService.getAll({
    userId: userId ? parseInt(userId) : undefined,
    status,
    page: parseInt(page)||1,
    limit: parseInt(limit)||20,
  }));
});

export const getOrder = asyncHandler(async (req, res) => {
  res.json(await OrderService.getById(req.params.id));
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  res.json(await OrderService.updateStatus(req.params.id, req.body.status));
});

// ─── Favorites ───────────────────────────────────────────────────────────────
export const listFavorites = asyncHandler(async (req, res) => {
  const { userId, page, limit } = req.query;
  res.json(await FavoriteModel.findAll({
    userId: userId ? parseInt(userId) : undefined,
    page: parseInt(page)||1,
    limit: parseInt(limit)||20,
  }));
});

export const deleteFavorite = asyncHandler(async (req, res) => {
  await FavoriteModel.removeById(req.params.id);
  res.json({ msg: "Favorito eliminado" });
});
