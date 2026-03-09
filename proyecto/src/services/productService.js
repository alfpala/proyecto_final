// Productos Service — Capa de lógica de negocio
import ProductModel from "../models/productModel.js";
import CategoryModel from "../models/categoryModel.js";

const ProductService = {
  getAll: (filters) => ProductModel.findAll(filters),

  getFeatured: (limit) => ProductModel.findFeatured(limit),

  getById: async (id) => {
    const product = await ProductModel.findById(id);
    if (!product) throw Object.assign(new Error("Producto no encontrado"), { status: 404 });
    return product;
  },

  getByUser: (userId, filters) => ProductModel.findAll({ ...filters, userId }),

  create: async ({ userId, categoryId, name, description, price, stock, featured, imageUrl }) => {
    if (categoryId) {
      const cat = await CategoryModel.findById(categoryId);
      if (!cat) throw Object.assign(new Error("Categoría no encontrada"), { status: 400 });
    }
    if (price <= 0) throw Object.assign(new Error("El precio debe ser mayor a 0"), { status: 400 });
    if (stock < 0)  throw Object.assign(new Error("El stock no puede ser negativo"), { status: 400 });

    return ProductModel.create({ userId, categoryId, name, description, price, stock, featured, imageUrl });
  },

  update: async (id, data, requesterId, requesterRole) => {
    const product = await ProductModel.findById(id);
    if (!product) throw Object.assign(new Error("Producto no encontrado"), { status: 404 });

    if (product.user_id !== requesterId && requesterRole !== "admin")
      throw Object.assign(new Error("Sin permisos para editar este producto"), { status: 403 });

    if (data.categoryId) {
      const cat = await CategoryModel.findById(data.categoryId);
      if (!cat) throw Object.assign(new Error("Categoría no encontrada"), { status: 400 });
    }
    if (data.price !== undefined && data.price <= 0)
      throw Object.assign(new Error("El precio debe ser mayor a 0"), { status: 400 });
    if (data.stock !== undefined && data.stock < 0)
      throw Object.assign(new Error("El stock no puede ser negativo"), { status: 400 });

    return ProductModel.update(id, data);
  },

  delete: async (id, requesterId, requesterRole) => {
    const product = await ProductModel.findById(id);
    if (!product) throw Object.assign(new Error("Producto no encontrado"), { status: 404 });

    if (product.user_id !== requesterId && requesterRole !== "admin")
      throw Object.assign(new Error("Sin permisos para eliminar este producto"), { status: 403 });

    await ProductModel.delete(id);
  },
};

export default ProductService;
