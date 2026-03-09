/* =============================================
   api.js — Capa de servicio API centralizada
Todas las llamadas HTTP pasan por aquí. 
Gestión de errores e inyección de tokens centralizados.
   ============================================= */

const BASE = "http://localhost:3000/api";

// ---- Toast Notification ----
export function toast(msg, type = "info") {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }
  const el = document.createElement("div");
  el.className = `toast-item toast-${type}`;
  el.textContent = msg;
  container.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

// ---- Auth API ----
export const Auth = {
  getToken: () => localStorage.getItem("token"),
  getUser:  () => { try { return JSON.parse(localStorage.getItem("user")); } catch { return null; } },
  isLoggedIn: () => !!localStorage.getItem("token"),
  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login.html";
  },
  headers() {
    const t = this.getToken();
    return { "Content-Type": "application/json", ...(t ? { Authorization: `Bearer ${t}` } : {}) };
  }
};

// ---- Core  wrapper ----
async function request(method, path, body = null) {
  const opts = { method, headers: Auth.headers() };
  if (body) opts.body = JSON.stringify(body);

  let res;
  try {
    res = await fetch(`${BASE}${path}`, opts);
  } catch {
    toast("No se pudo conectar con el servidor", "error");
    throw new Error("network_error");
  }

  const data = await res.json().catch(() => ({}));

  if (res.status === 401) {
    Auth.logout();
    return;
  }

  if (!res.ok) {
    const msg = data.msg || data.message || `Error ${res.status}`;
    toast(msg, "error");
    throw Object.assign(new Error(msg), { status: res.status, data });
  }

  return data;
}

const get    = (path)       => request("GET",    path);
const post   = (path, body) => request("POST",   path, body);
const put    = (path, body) => request("PUT",    path, body);
const del    = (path)       => request("DELETE", path);

// ---- Auth API ----
export const authAPI = {
  register: (payload) => post("/auth/register", payload),
  login:    (payload) => post("/auth/login",    payload),
  me:       ()        => get("/auth/me"),
};

// ---- Categorias ----
export const categoriesAPI = {
  list: () => get("/categories"),
};

// ---- Productos ----
export const productsAPI = {
  list:    (params = {}) => get("/products?" + new URLSearchParams(params).toString()),
  featured: ()           => get("/products/featured"),
  get:     (id)          => get(`/products/${id}`),
  my:      ()            => get("/products/my"),
  create:  (body)        => post("/products", body),
  update:  (id, body)    => put(`/products/${id}`, body),
  delete:  (id)          => del(`/products/${id}`),
};

// ---- Carrito ----
export const cartAPI = {
  get:    ()        => get("/cart"),
  add:    (body)    => post("/cart", body),
  update: (id, qty) => put(`/cart/${id}`, { quantity: qty }),
  remove: (id)      => del(`/cart/${id}`),
  clear:  ()        => del("/cart/clear"),
};

// ---- Favoritos ----
export const favoritesAPI = {
  list:   ()           => get("/favorites"),
  add:    (product_id) => post("/favorites", { product_id }),
  remove: (productId)  => del(`/favorites/${productId}`),
};

// ---- Pedidos ----
export const ordersAPI = {
  list:     ()            => get("/orders"),
  checkout: ()            => post("/orders"),
  status:   (id, status)  => put(`/orders/${id}/status`, { status }),
};

// ---- Badge de cantidad de carrito (compartido) ----
export async function updateCartBadge() {
  if (!Auth.isLoggedIn()) return;
  try {
    const items = await cartAPI.get();
    const badge = document.getElementById("cart-count");
    if (badge) {
      const total = items.reduce((s, i) => s + i.quantity, 0);
      badge.textContent = total;
      badge.style.display = total > 0 ? "flex" : "none";
    }
  } catch {}
}

// ---- Navbar estado de autenticación ----
export function syncNavbar() {
  const user = Auth.getUser();
  const navAuth   = document.getElementById("nav-auth");
  const navUser   = document.getElementById("nav-user");
  const navLogout = document.getElementById("nav-logout");
  const navFav    = document.getElementById("nav-fav");
  const navCart   = document.getElementById("nav-cart-wrap");
  const navMyProd  = document.getElementById("nav-myproducts");
  const navOrders  = document.getElementById("nav-orders");

  if (user) {
    if (navAuth)   navAuth.classList.add("d-none");
    if (navUser)   { navUser.textContent = user.name; navUser.classList.remove("d-none"); }
    if (navLogout) navLogout.classList.remove("d-none");
    if (navFav)    navFav.classList.remove("d-none");
    if (navCart)   navCart.classList.remove("d-none");
    
    // Admin functionality hidden
    // if (navMyProd && user.role === "admin") navMyProd.classList.remove("d-none");
    if (navOrders)  navOrders.classList.remove("d-none");
  } else {
    if (navAuth)   navAuth.classList.remove("d-none");
    if (navUser)   navUser.classList.add("d-none");
    if (navLogout) navLogout.classList.add("d-none");
    if (navFav)    navFav?.classList.add("d-none");
    if (navCart)   navCart?.classList.add("d-none");
    if (navMyProd)  navMyProd?.classList.add("d-none");
    if (navOrders)  navOrders?.classList.add("d-none");
  }

  if (navLogout) {
    navLogout.addEventListener("click", (e) => { e.preventDefault(); Auth.logout(); });
  }

  updateCartBadge();
}
