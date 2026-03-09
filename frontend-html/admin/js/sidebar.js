/*inyector de barra lateral compartida: llamar a injectSidebar("dashboard.html") una vez que el DOM esté listo */
export function injectSidebar(activePage) {
  const html = `
    <aside class="admin-sidebar" id="adminSidebar">
      <!-- Brand -->
      <div class="sidebar-brand">
        <i class="bi bi-lightning-charge-fill brand-icon"></i>
        <div>
          <div class="brand-text">MarketTech</div>
          <div class="brand-sub">Panel Admin</div>
        </div>
      </div>

      <!-- Main nav -->
      <div class="sidebar-section">Principal</div>
      <a href="dashboard.html"  class="nav-item-admin"><i class="bi bi-grid-1x2-fill"></i>Dashboard</a>

      <div class="sidebar-section">Gestión</div>
      <a href="users.html"      class="nav-item-admin"><i class="bi bi-people-fill"></i>Usuarios</a>
      <a href="categories.html" class="nav-item-admin"><i class="bi bi-tags-fill"></i>Categorías</a>
      <a href="products.html"   class="nav-item-admin"><i class="bi bi-box-seam-fill"></i>Productos</a>

      <div class="sidebar-section">Ventas</div>
      <a href="orders.html"     class="nav-item-admin"><i class="bi bi-receipt-cutoff"></i>Pedidos</a>
      <a href="favorites.html"  class="nav-item-admin"><i class="bi bi-heart-fill"></i>Favoritos</a>

      <div class="sidebar-section">Tienda</div>
      <a href="../index.html"   class="nav-item-admin" target="_blank"><i class="bi bi-shop"></i>Ver tienda <i class="bi bi-box-arrow-up-right ms-1" style="font-size:.7rem"></i></a>

      <!-- User info -->
      <div class="sidebar-footer">
        <div class="user-info-sidebar mb-2">
          <div class="user-avatar" id="sidebarAvatar">A</div>
          <div>
            <div class="user-name" id="sidebarName">Administrador</div>
            <div class="user-role">Admin</div>
          </div>
        </div>
        <a href="#" id="logoutBtn" class="nav-item-admin" style="padding:.45rem .75rem;border-radius:8px;margin-top:.25rem">
          <i class="bi bi-box-arrow-right"></i>Cerrar sesión
        </a>
      </div>
    </aside>
  `;
  const wrapper = document.getElementById("sidebarMount");
  if (wrapper) wrapper.innerHTML = html;

  // Activar enlace
  document.querySelectorAll(".nav-item-admin").forEach(el => {
    if (el.getAttribute("href") === activePage) el.classList.add("active");
  });

  // Cerrar sesión
  document.getElementById("logoutBtn")?.addEventListener("click", e => {
    e.preventDefault();
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    window.location.href = "login.html";
  });

  // Toggle móvil
  document.getElementById("sidebarToggle")?.addEventListener("click", () => {
    document.getElementById("adminSidebar")?.classList.toggle("open");
  });
}
