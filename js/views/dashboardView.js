import { fetchData } from "../../apiCalls.js";
import { getItems, getMerchants } from "../store/dataStore.js";
import { show, hide, removeActiveNavClass } from "../utils/domUtils.js";

export function showDashboardView() {
  const dashboardView = document.querySelector("#dashboard-view");
  const merchantsView = document.querySelector("#merchants-view");
  const itemsView = document.querySelector("#items-view");
  const formContainer = document.querySelector("#form-container");
  const pageTitle = document.querySelector("#page-title");
  const showingText = document.querySelector("#showing-text");
  const addNewButton = document.querySelector("#add-new-button");
  const sortControls = document.querySelector("#sort-controls");

  pageTitle.textContent = "Dashboard";
  showingText.textContent = "Overview";
  addNewButton.dataset.state = "merchant";

  show([dashboardView, addNewButton]);
  hide([merchantsView, itemsView, formContainer, sortControls]);

  removeActiveNavClass();
  document.querySelector("#dashboard-nav").classList.add("active-nav");

  dashboardView.innerHTML =
    '<div class="empty-state"><i class="fas fa-spinner fa-spin"></i><p>Loading dashboard data...</p></div>';

  Promise.all([fetchData("merchants"), fetchData("items")])
    .then(([merchantsResponse, itemsResponse]) => {
      const merchants = merchantsResponse.data;
      const items = itemsResponse.data;

      updateDashboard(merchants, items);
    })
    .catch((error) => {
      console.error("Error loading dashboard data:", error);
      dashboardView.innerHTML =
        '<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>Error loading dashboard data</p></div>';
    });
}

function updateDashboard(merchants, items) {
  const dashboardView = document.querySelector("#dashboard-view");

  const merchantCount = merchants ? merchants.length : 0;
  const itemCount = items ? items.length : 0;

  let totalPrice = 0;
  if (items && items.length > 0) {
    totalPrice = items.reduce((total, item) => {
      return total + parseFloat(item.attributes.unit_price);
    }, 0);
  }

  const averagePrice = itemCount > 0 ? (totalPrice / itemCount).toFixed(2) : 0;

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
