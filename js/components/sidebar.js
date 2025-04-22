export function setupSidebar() {
  const menuToggle = document.getElementById("menu-toggle");
  const sidebar = document.getElementById("sidebar");
  const closeSidebar = document.querySelector(".close-sidebar");

  const sidebarOverlay = document.createElement("div");
  sidebarOverlay.className = "sidebar-overlay";
  document.body.appendChild(sidebarOverlay);

  function toggleSidebar() {
    sidebar.classList.toggle("active");
    sidebarOverlay.classList.toggle("active");
    document.body.style.overflow = sidebar.classList.contains("active")
      ? "hidden"
      : "";
  }

  menuToggle.addEventListener("click", toggleSidebar);
  closeSidebar.addEventListener("click", toggleSidebar);
  sidebarOverlay.addEventListener("click", toggleSidebar);

  const navButtons = document.querySelectorAll(".nav-button");
  navButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (window.innerWidth <= 768 && sidebar.classList.contains("active")) {
        toggleSidebar();
      }
    });
  });
}
