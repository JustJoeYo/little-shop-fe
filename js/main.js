import "../styles/main.css";
import { fetchData } from "../apiCalls.js";
import { displayMerchants, showMerchantsView } from "./views/merchantView.js";
import { showItemsView, displayItems } from "./views/itemView.js";
import { showDashboardView } from "./views/dashboardView.js";
import { show, hide } from "./utils/domUtils.js";
import {
  setMerchants,
  setItems,
  getMerchants,
  getItems,
} from "./store/dataStore.js";
import {
  setupItemForm,
  submitItem,
  submitMerchant,
} from "./components/formHandlers.js";

// store DOM element references
const UI = {};

/**
 * Initialize UI element refs
 */
function initializeUIElements() {
  UI.merchantsNavButton = document.querySelector("#merchants-nav");
  UI.itemsNavButton = document.querySelector("#items-nav");
  UI.dashboardNavButton = document.querySelector("#dashboard-nav");
  UI.addNewButton = document.querySelector("#add-new-button");
  UI.formContainer = document.querySelector("#form-container");
  UI.merchantForm = document.querySelector("#new-merchant-form");
  UI.itemForm = document.querySelector("#new-item-form");
  UI.cancelButtons = document.querySelectorAll(".cancel-form");
  UI.menuToggle = document.querySelector(".menu-toggle");
  UI.sidebar = document.querySelector(".sidebar");
  UI.sidebarOverlay = document.querySelector(".sidebar-overlay");
  UI.closeSidebar = document.querySelector(".close-sidebar");
  UI.searchInput = document.querySelector("#search-input");
}

/**
 * Set up all event listeners onto DOM El
 */
function setupEventListeners() {
  // Sidebar nav
  if (UI.menuToggle) {
    UI.menuToggle.addEventListener("click", toggleSidebar);
  }

  if (UI.closeSidebar) {
    UI.closeSidebar.addEventListener("click", closeSidebar);
  }

  if (UI.sidebarOverlay) {
    UI.sidebarOverlay.addEventListener("click", closeSidebar);
  }

  // Main nav
  UI.dashboardNavButton.addEventListener("click", showDashboardView);
  UI.merchantsNavButton.addEventListener("click", showMerchantsView);
  UI.itemsNavButton.addEventListener("click", showItemsView);

  // Form handler
  UI.addNewButton.addEventListener("click", handleAddNew);
  UI.merchantForm.addEventListener("submit", submitMerchant);
  UI.itemForm.addEventListener("submit", submitItem);

  UI.cancelButtons.forEach((button) => {
    button.addEventListener("click", () => {
      hide([UI.formContainer]);
    });
  });

  // Search Bar
  UI.searchInput.addEventListener("input", handleSearch);
}

/**
 * Handle search functionality (Filter and display items/merchants based on search query)
 */
function handleSearch() {
  const searchQuery = UI.searchInput.value.trim().toLowerCase();
  const activePage = getActivePage();

  // If search is empty show everythanggg (added datastoring to stop 10mil requests)
  if (searchQuery === "") {
    if (activePage === "merchants") {
      displayMerchants(getMerchants());
    } else if (activePage === "items") {
      displayItems(getItems());
    }
    return;
  }

  // Filtering
  if (activePage === "merchants") {
    const filteredMerchants = getMerchants().filter((merchant) =>
      merchant.attributes.name.toLowerCase().includes(searchQuery)
    );
    displayMerchants(filteredMerchants);
  } else if (activePage === "items") {
    const filteredItems = getItems().filter(
      (item) =>
        item.attributes.name.toLowerCase().includes(searchQuery) ||
        item.attributes.description.toLowerCase().includes(searchQuery)
    );
    displayItems(filteredItems);
  }
}

/**
 * Get the current page (@returns {string} - 'merchants', 'items', or 'dashboard')
 */
function getActivePage() {
  if (
    document.querySelector("#merchants-view").classList.contains("hidden") ===
    false
  ) {
    return "merchants";
  } else if (
    document.querySelector("#items-view").classList.contains("hidden") === false
  ) {
    return "items";
  } else {
    return "dashboard";
  }
}

/**
 * Toggle sidebar vis?
 */
function toggleSidebar() {
  UI.sidebar.classList.toggle("active");
  if (UI.sidebarOverlay) {
    UI.sidebarOverlay.classList.toggle("active");
  }
}

/**
 * Close the sidebar
 */
function closeSidebar() {
  UI.sidebar.classList.remove("active");
  if (UI.sidebarOverlay) {
    UI.sidebarOverlay.classList.remove("active");
  }
}

/**
 * "Add New" button clicked
 */
function handleAddNew() {
  const state = UI.addNewButton.dataset.state;
  const merchantFormContainer = document.querySelector(
    "#add-merchant-container"
  );
  const itemFormContainer = document.querySelector("#add-item-container");

  if (state === "merchant") {
    show([UI.formContainer, merchantFormContainer]);
    hide([itemFormContainer]);
  } else if (state === "item") {
    show([UI.formContainer, itemFormContainer]);
    hide([merchantFormContainer]);
    setupItemForm();
  }
}

/**
 * Load initial application data (fetch data)
 */
function loadInitialData() {
  // Show loading spinner
  const dashboardView = document.querySelector("#dashboard-view");
  if (dashboardView) {
    dashboardView.innerHTML =
      '<div class="empty-state"><i class="fas fa-spinner fa-spin"></i><p>Loading dashboard data...</p></div>';
  }

  // fetch merchants
  fetchData("merchants")
    .then((response) => {
      setMerchants(response.data);
      displayMerchants(response.data);

      // fetch their items
      return fetchData("items");
    })
    .then((response) => {
      setItems(response.data);

      // Refresh dashboard
      showDashboardView();
    })
    .catch((error) => {
      console.error("Error loading initial data:", error);
      // Even if there was an issue we still want to show something.
      showDashboardView();
    });
}

/**
 * Initialize the app (run all the stuff above ^^^)
 */
function initializeApp() {
  initializeUIElements();
  setupEventListeners();
  loadInitialData();
}

// Start the app when DOM is loaded
document.addEventListener("DOMContentLoaded", initializeApp);
