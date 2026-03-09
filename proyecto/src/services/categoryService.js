// Categorias Service — Capa de lógica de negocio
import CategoryModel from "../models/categoryModel.js";
import ProductModel from "../models/productModel.js";

const CategoryService = {
  getAll: () => CategoryModel.findAll(),

  getById: async (id) => {
    const cat = await CategoryModel.findById(id);
    if (!cat) throw Object.assign(new Error("Categoría no encontrada"), { status: 404 });
    return cat;
  },

  create: async ({ name, description }) => {
    const existing = await CategoryModel.findByName(name);
    if (existing) throw Object.assign(new Error("Ya existe una categoría con ese nombre"), { status: 409 });
    return CategoryModel.create({ name: name.trim(), description });
  },

  update: async (id, { name, description }) => {
    const cat = await CategoryModel.findById(id);
    if (!cat) throw Object.assign(new Error("Categoría no encontrada"), { status: 404 });

    if (name && name.toLowerCase() !== cat.name.toLowerCase()) {
      const existing = await CategoryModel.findByName(name);
      if (existing) throw Object.assign(new Error("Ya existe una categoría con ese nombre"), { status: 409 });
    }
    return CategoryModel.update(id, { name: name.trim(), description });
  },

  delete: async (id) => {
    const cat = await CategoryModel.findById(id);
    if (!cat) throw Object.assign(new Error("Categoría no encontrada"), { status: 404 });

    // Verificar productos asociados
    const { total } = await ProductModel.findAll({ category: id, limit: 1 });
    if (total > 0)
      throw Object.assign(
        new Error(`No se puede eliminar: la categoría tiene ${total} producto(s) asociado(s). Reasígnalos primero.`),
        { status: 400 }
      );

    await CategoryModel.delete(id);
  },
};

export default CategoryService;
