import { fetchData } from "../../apiCalls.js";
import { getItems, getMerchants } from "../store/dataStore.js";
import { show, hide, removeActiveNavClass } from "../utils/domUtils.js";

/**
 * Show the dashboard view with cool metrics n stuff
 */
export function showDashboardView() {
  // Grab the DOM Els
  const elements = {
    dashboardView: document.querySelector("#dashboard-view"),
    merchantsView: document.querySelector("#merchants-view"),
    itemsView: document.querySelector("#items-view"),
    formContainer: document.querySelector("#form-container"),
    pageTitle: document.querySelector("#page-title"),
    showingText: document.querySelector("#showing-text"),
    addNewButton: document.querySelector("#add-new-button"),
    sortControls: document.querySelector("#sort-controls"),
  };

  // Update text
  elements.pageTitle.textContent = "Dashboard";
  elements.showingText.textContent = "Overview";

  // Hide add btn
  hide([elements.addNewButton]);

  // Show/hide elements
  show([elements.dashboardView]);
  hide([
    elements.merchantsView,
    elements.itemsView,
    elements.formContainer,
    elements.sortControls,
  ]);

  // Update active nav
  removeActiveNavClass();
  document.querySelector("#dashboard-nav").classList.add("active-nav");

  // Show a loading spinna
  elements.dashboardView.innerHTML =
    '<div class="empty-state"><i class="fas fa-spinner fa-spin"></i><p>Loading dashboard data...</p></div>';

  // Get the data
  const merchants = getMerchants();
  const items = getItems();

  // Update dashboard
  updateDashboard(merchants, items);
}

/**
 * Update dashboard
 */
function updateDashboard(merchants, items) {
  const dashboardView = document.querySelector("#dashboard-view");

  // Calculate stats
  const merchantCount = merchants ? merchants.length : 0;
  const itemCount = items ? items.length : 0;

  // Calculate total price
  let totalPrice = 0;
  if (items && items.length > 0) {
    totalPrice = items.reduce((total, item) => {
      return total + parseFloat(item.attributes.unit_price);
    }, 0);
  }

  // Calculate price
  const averagePrice = itemCount > 0 ? (totalPrice / itemCount).toFixed(2) : 0;

  // Build HTML
  dashboardView.innerHTML = `
    <div class="dashboard-grid">
      <div class="dashboard-card">
        <h3>Total Merchants</h3>
        <p class="dashboard-number">${merchantCount}</p>
      </div>
      <div class="dashboard-card">
        <h3>Total Items</h3>
        <p class="dashboard-number">${itemCount}</p>
      </div>
      <div class="dashboard-card">
        <h3>Average Price</h3>
        <p class="dashboard-number">$${averagePrice}</p>
      </div>
    </div>
  `;
}
