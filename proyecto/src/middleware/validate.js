//Middleware de validación de entrada centralizada
// Usando: router.post("/", validate(rules.product), controller)

const rules = {
  register: [
    { field: "name",     required: true,  minLen: 2,  maxLen: 120, label: "Nombre" },
    { field: "email",    required: true,  email: true,             label: "Email" },
    { field: "password", required: true,  minLen: 6,               label: "Contraseña" },
  ],
  login: [
    { field: "email",    required: true,  email: true,  label: "Email" },
    { field: "password", required: true,               label: "Contraseña" },
  ],
  category: [
    { field: "name",        required: true,  minLen: 2, maxLen: 100, label: "Nombre" },
    { field: "description", required: false, maxLen: 500,            label: "Descripción" },
  ],
  product: [
    { field: "name",        required: true,  minLen: 2, maxLen: 200,  label: "Nombre" },
    { field: "price",       required: true,  numeric: true, min: 0.01, label: "Precio" },
    { field: "stock",       required: true,  numeric: true, min: 0,    label: "Stock" },
    { field: "description", required: false, maxLen: 2000,            label: "Descripción" },
  ],
  updateStatus: [
    { field: "status", required: true,
      oneOf: ["pending","confirmed","shipped","delivered","cancelled"], label: "Estado" },
  ],
  userCreate: [
    { field: "name",     required: true,  minLen: 2,  label: "Nombre" },
    { field: "email",    required: true,  email: true, label: "Email" },
    { field: "password", required: true,  minLen: 6,  label: "Contraseña" },
    { field: "role",     required: false, oneOf: ["user","admin"], label: "Rol" },
  ],
  userUpdate: [
    { field: "name",     required: false, minLen: 2,   label: "Nombre" },
    { field: "email",    required: false, email: true, label: "Email" },
    { field: "password", required: false, minLen: 6,   label: "Contraseña" },
    { field: "role",     required: false, oneOf: ["user","admin"], label: "Rol" },
  ],
};

function validate(fieldRules) {
  return (req, res, next) => {
    const errors = [];

    for (const rule of fieldRules) {
      const value = req.body[rule.field];
      const str   = (value === undefined || value === null) ? "" : String(value).trim();

      if (rule.required && !str) {
        errors.push(`${rule.label} es obligatorio`);
        continue;
      }
      if (!str) continue; // opcional y vacío — omitir verificaciones adicionales

      if (rule.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str))
        errors.push(`${rule.label} no tiene un formato de email válido`);

      if (rule.minLen && str.length < rule.minLen)
        errors.push(`${rule.label} debe tener al menos ${rule.minLen} caracteres`);

      if (rule.maxLen && str.length > rule.maxLen)
        errors.push(`${rule.label} no puede superar ${rule.maxLen} caracteres`);

      if (rule.numeric) {
        const num = parseFloat(str);
        if (isNaN(num)) errors.push(`${rule.label} debe ser un número`);
        else if (rule.min !== undefined && num < rule.min)
          errors.push(`${rule.label} debe ser mayor o igual a ${rule.min}`);
      }

      if (rule.oneOf && !rule.oneOf.includes(str.toLowerCase()))
        errors.push(`${rule.label} debe ser uno de: ${rule.oneOf.join(", ")}`);
    }

    if (errors.length > 0)
      return res.status(422).json({ error: true, message: "Datos inválidos", errors });

    next();
  };
}

export { validate, rules };
