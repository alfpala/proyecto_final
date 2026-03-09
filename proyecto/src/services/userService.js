// User Service — Capa de lógica de negocio
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import UserModel from "../models/userModel.js";

const ALLOWED_ROLES = ["user", "admin"];

const UserService = {
  // Autenticación
  register: async ({ name, email, password, role = "user" }) => {
    if (!ALLOWED_ROLES.includes(role.toLowerCase()))
      throw Object.assign(new Error("Rol inválido"), { status: 400 });

    const existing = await UserModel.findByEmail(email);
    if (existing) throw Object.assign(new Error("El correo ya está registrado"), { status: 409 });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await UserModel.create({ name, email, passwordHash, role: role.toLowerCase() });
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "2h" });
    return { token, user };
  },

  login: async ({ email, password }) => {
    const user = await UserModel.findByEmail(email);
    if (!user) throw Object.assign(new Error("Credenciales inválidas"), { status: 401 });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw Object.assign(new Error("Credenciales inválidas"), { status: 401 });

    const safeUser = { id: user.id, name: user.name, email: user.email, role: user.role.toLowerCase() };
    const token = jwt.sign({ id: safeUser.id, role: safeUser.role }, process.env.JWT_SECRET, { expiresIn: "2h" });
    return { token, user: safeUser };
  },

  // CRUD (admin)
  getAll: (filters) => UserModel.findAll(filters),

  getById: async (id) => {
    const user = await UserModel.findById(id);
    if (!user) throw Object.assign(new Error("Usuario no encontrado"), { status: 404 });
    return user;
  },

  create: async ({ name, email, password, role }) => {
    if (!ALLOWED_ROLES.includes((role || "user").toLowerCase()))
      throw Object.assign(new Error("Rol inválido"), { status: 400 });
    const existing = await UserModel.findByEmail(email);
    if (existing) throw Object.assign(new Error("El correo ya está registrado"), { status: 409 });
    const passwordHash = await bcrypt.hash(password, 10);
    return UserModel.create({ name, email, passwordHash, role: role.toLowerCase() });
  },

  update: async (id, { name, email, password, role }) => {
    const user = await UserModel.findById(id);
    if (!user) throw Object.assign(new Error("Usuario no encontrado"), { status: 404 });

    if (email && email !== user.email) {
      const existing = await UserModel.findByEmail(email);
      if (existing) throw Object.assign(new Error("El correo ya está en uso"), { status: 409 });
    }

    const fields = {};
    if (name)  fields.name  = name;
    if (email) fields.email = email;
    if (role)  fields.role  = role.toLowerCase();
    if (password) fields.password = await bcrypt.hash(password, 10);

    return UserModel.update(id, fields);
  },

  delete: async (id, requesterId) => {
    if (parseInt(id) === parseInt(requesterId))
      throw Object.assign(new Error("No puedes eliminar tu propio usuario"), { status: 400 });
    const user = await UserModel.findById(id);
    if (!user) throw Object.assign(new Error("Usuario no encontrado"), { status: 404 });
    await UserModel.delete(id);
  },
};

export default UserService;
