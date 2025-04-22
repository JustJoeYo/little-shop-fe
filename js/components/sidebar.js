/**
 * sidebar toggle
 */
function setupSidebar() {
  const menuToggle = document.getElementById("menu-toggle");
  const sidebar = document.getElementById("sidebar");
  const closeSidebar = document.querySelector(".close-sidebar");

  // darken screen
  const sidebarOverlay = document.createElement("div");
  sidebarOverlay.className = "sidebar-overlay";
  document.body.appendChild(sidebarOverlay);

  /**
   * Toggle the sidebar
   */
  function toggleSidebar() {
    sidebar.classList.toggle("active");
    sidebarOverlay.classList.toggle("active");

    // remove scroll-abilitity for mobile devices (makes it so they cant scroll up and down on sidebar)
    document.body.style.overflow = sidebar.classList.contains("active")
      ? "hidden"
      : "";
  }

  // Add event listeners
  menuToggle.addEventListener("click", toggleSidebar);
  closeSidebar.addEventListener("click", toggleSidebar);
  sidebarOverlay.addEventListener("click", toggleSidebar);

  // Close sidebar (mobile only)
  const navButtons = document.querySelectorAll(".nav-button");
  navButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (window.innerWidth <= 768 && sidebar.classList.contains("active")) {
        toggleSidebar();
      }
    });
  });
}

export { setupSidebar };
