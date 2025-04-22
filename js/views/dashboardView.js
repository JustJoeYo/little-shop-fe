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

  // Update the header text
  elements.pageTitle.textContent = "Dashboard";
  elements.showingText.textContent = "Overview";
  elements.addNewButton.dataset.state = "merchant";

  // Show/hide elements
  show([elements.dashboardView, elements.addNewButton]);
  hide([
    elements.merchantsView,
    elements.itemsView,
    elements.formContainer,
    elements.sortControls,
  ]);

  // Update active page
  removeActiveNavClass();
  document.querySelector("#dashboard-nav").classList.add("active-nav");

  // Show a loading spinner again.
  elements.dashboardView.innerHTML =
    '<div class="empty-state"><i class="fas fa-spinner fa-spin"></i><p>Loading dashboard data...</p></div>';

  // Fetch the data
  Promise.all([fetchData("merchants"), fetchData("items")])
    .then(([merchantsResponse, itemsResponse]) => {
      const merchants = merchantsResponse.data;
      const items = itemsResponse.data;

      // Update the dashboard with our data
      updateDashboard(merchants, items);
    })
    .catch((error) => {
      console.error("Error loading dashboard data:", error);
      elements.dashboardView.innerHTML =
        '<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>Error loading dashboard data</p></div>';
    });
}

/**
 * Update the dashboard cards (# of merchants/items etc)
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

  // Calculate ave price
  const averagePrice = itemCount > 0 ? (totalPrice / itemCount).toFixed(2) : 0;

  // Dashboard HTML
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
