/* =========================================================
   Admin API Service — todas las llamadas pasan por este módulo.
Gestión centralizada de errores y tokens.
   ========================================================= */

const BASE = "http://localhost:3000/api";

// ── Auth ayudas ──────────────────────────────────────────
export const AdminAuth = {
  getToken:  () => localStorage.getItem("admin_token"),
  getUser:   () => { try { return JSON.parse(localStorage.getItem("admin_user")); } catch { return null; } },
  isAdmin:   () => { const u = AdminAuth.getUser(); return !!u && u.role === "admin"; },
  headers:   () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${AdminAuth.getToken() || ""}`,
  }),
  logout() {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    window.location.href = "/admin/login.html";
  },
  requireAdmin() {
    if (!AdminAuth.isAdmin()) { AdminAuth.logout(); }
  },
};

// ── Toast ─────────────────────────────────────────────────
export function toast(msg, type = "inf") {
  let box = document.getElementById("admin-toasts");
  if (!box) { box = document.createElement("div"); box.id = "admin-toasts"; document.body.appendChild(box); }
  const el = document.createElement("div");
  el.className = `admin-toast toast-${type}`;
  el.innerHTML = `<i class="bi bi-${type==="ok"?"check-circle":type==="err"?"x-circle":"info-circle"} me-2"></i>${msg}`;
  box.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

// ── Núcleo de fetch ─────────────────────────────────────
async function req(method, path, body = null) {
  const opts = { method, headers: AdminAuth.headers() };
  if (body) opts.body = JSON.stringify(body);
  let res;
  try { res = await fetch(`${BASE}${path}`, opts); }
  catch { toast("Sin conexión con el servidor", "err"); throw new Error("network"); }

  let data;
  try { data = await res.json(); } catch { data = {}; }

  if (res.status === 401 || res.status === 403) { AdminAuth.logout(); return; }

  if (!res.ok) {
    const msg = data.message || data.msg || `Error ${res.status}`;
    // Mostrar cada error de validación
    if (data.errors?.length) data.errors.forEach(e => toast(e, "err"));
    else toast(msg, "err");
    throw Object.assign(new Error(msg), { data });
  }
  return data;
}

const get  = (p)    => req("GET",    p);
const post = (p, b) => req("POST",   p, b);
const put  = (p, b) => req("PUT",    p, b);
const del  = (p)    => req("DELETE", p);

// ── Auth ──────────────────────────────────────────────────
export const authAPI = {
  login:  (body) => post("/auth/login", body),
};

// ── Panel de control ─────────────────────────────────────────────
export const dashboardAPI = {
  get: () => get("/admin/dashboard"),
};

// ── Usuarios ─────────────────────────────────────────────────
export const usersAPI = {
  list:   (p = {}) => get("/admin/users?" + new URLSearchParams(p)),
  get:    (id)     => get(`/admin/users/${id}`),
  create: (b)      => post("/admin/users", b),
  update: (id, b)  => put(`/admin/users/${id}`, b),
  delete: (id)     => del(`/admin/users/${id}`),
};

// ── Categorías ────────────────────────────────────────────
export const categoriesAPI = {
  list:   ()        => get("/admin/categories"),
  get:    (id)      => get(`/admin/categories/${id}`),
  create: (b)       => post("/admin/categories", b),
  update: (id, b)   => put(`/admin/categories/${id}`, b),
  delete: (id)      => del(`/admin/categories/${id}`),
};

// ── Productos ──────────────────────────────────────────────
export const productsAPI = {
  list:   (p = {}) => get("/admin/products?" + new URLSearchParams(p)),
  get:    (id)     => get(`/admin/products/${id}`),
  create: (b)      => post("/admin/products", b),
  update: (id, b)  => put(`/admin/products/${id}`, b),
  delete: (id)     => del(`/admin/products/${id}`),
};

// ── Pedidos ────────────────────────────────────────────────
export const ordersAPI = {
  list:        (p = {}) => get("/admin/orders?" + new URLSearchParams(p)),
  get:         (id)     => get(`/admin/orders/${id}`),
  updateStatus:(id, st) => put(`/admin/orders/${id}/status`, { status: st }),
};

// ── Favoritos ─────────────────────────────────────────────
export const favoritesAPI = {
  list:   (p = {}) => get("/admin/favorites?" + new URLSearchParams(p)),
  delete: (id)     => del(`/admin/favorites/${id}`),
};

// ── Shared: render sidebar estado activo de la barra lateral ──────────────────
export function activateSidebarLink(file) {
  document.querySelectorAll(".nav-item-admin").forEach(el => {
    if (el.getAttribute("href") === file) el.classList.add("active");
  });
}

// ── Shared: establecer usuario en la barra lateral ───────────────────────────────
export function renderSidebarUser() {
  const user = AdminAuth.getUser();
  if (!user) return;
  const avatar = document.getElementById("sidebarAvatar");
  const name   = document.getElementById("sidebarName");
  if (avatar) avatar.textContent = user.name.charAt(0).toUpperCase();
  if (name)   name.textContent = user.name;
}

// ── Shared: helper de confirmación simple ──────────────────
export function confirmAction(msg) {
  return window.confirm(msg);
}

// ── Shared: constructor de paginación ───────────────────────────
export function buildPagination(containerId, total, limit, current, onPage) {
  const pages = Math.ceil(total / limit);
  const el = document.getElementById(containerId);
  if (!el) return;
  if (pages <= 1) { el.innerHTML = ""; return; }
  let html = "";
  for (let i = 1; i <= pages; i++) {
    html += `<button class="${i === current ? "active" : ""}" data-p="${i}">${i}</button>`;
  }
  el.innerHTML = html;
  el.querySelectorAll("button").forEach(b =>
    b.addEventListener("click", () => onPage(parseInt(b.dataset.p)))
  );
}

// ── Shared: helper de debounce ─────────────────────────────────────
export function debounce(fn, delay = 350) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
}
