import {
  getMerchants,
  getItems,
  calculateAveragePrice,
} from "../store/dataStore.js";
import { show, hide, removeActiveNavClass } from "../utils/domUtils.js";

export function displayDashboard() {
  const dashboardView = document.querySelector("#dashboard-view");
  const merchants = getMerchants();
  const items = getItems();

  dashboardView.innerHTML = `
    <div class="dashboard-grid">
      <div class="dashboard-card">
        <h3>Total Merchants</h3>
        <p class="dashboard-number">${merchants.length}</p>
      </div>
      <div class="dashboard-card">
        <h3>Total Items</h3>
        <p class="dashboard-number">${items.length}</p>
      </div>
      <div class="dashboard-card">
        <h3>Average Item Price</h3>
        <p class="dashboard-number">$${calculateAveragePrice()}</p>
      </div>
    </div>
  `;
}

export function showDashboardView() {
  const pageTitle = document.querySelector("#page-title");
  const showingText = document.querySelector("#showing-text");
  const addNewButton = document.querySelector("#add-new-button");
  const merchantsView = document.querySelector("#merchants-view");
  const itemsView = document.querySelector("#items-view");
  const dashboardView = document.querySelector("#dashboard-view");
  const formContainer = document.querySelector("#form-container");
  const dashboardNavButton = document.querySelector("#dashboard-nav");

  pageTitle.textContent = "Dashboard";
  showingText.textContent = "Overview";

  show([dashboardView]);
  hide([merchantsView, itemsView, addNewButton, formContainer]);

  removeActiveNavClass();
  dashboardNavButton.classList.add("active-nav");

  displayDashboard();
}
