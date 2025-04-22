import "../styles/main.css";
import { fetchData } from "../apiCalls.js";
import { displayMerchants, showMerchantsView } from "./views/merchantView.js";
import { showItemsView } from "./views/itemView.js";
import { showDashboardView } from "./views/dashboardView.js";
import { show, hide } from "./utils/domUtils.js";
import { setMerchants, setItems } from "./store/dataStore.js";
import {
  setupItemForm,
  submitItem,
  submitMerchant,
} from "./components/formHandlers.js";

const UI = {};

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
}

function setupEventListeners() {
  if (UI.menuToggle) {
    UI.menuToggle.addEventListener("click", toggleSidebar);
  }

  if (UI.closeSidebar) {
    UI.closeSidebar.addEventListener("click", closeSidebar);
  }

  if (UI.sidebarOverlay) {
    UI.sidebarOverlay.addEventListener("click", closeSidebar);
  }

  // nav
  UI.dashboardNavButton.addEventListener("click", showDashboardView);
  UI.merchantsNavButton.addEventListener("click", showMerchantsView);
  UI.itemsNavButton.addEventListener("click", showItemsView);

  UI.addNewButton.addEventListener("click", handleAddNew);
  UI.merchantForm.addEventListener("submit", submitMerchant);
  UI.itemForm.addEventListener("submit", submitItem);

  UI.cancelButtons.forEach((button) => {
    button.addEventListener("click", () => {
      hide([UI.formContainer]);
    });
  });
}

function toggleSidebar() {
  UI.sidebar.classList.toggle("active");
  if (UI.sidebarOverlay) {
    UI.sidebarOverlay.classList.toggle("active");
  }
}

function closeSidebar() {
  UI.sidebar.classList.remove("active");
  if (UI.sidebarOverlay) {
    UI.sidebarOverlay.classList.remove("active");
  }
}

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

function loadInitialData() {
  fetchData("merchants").then((response) => {
    setMerchants(response.data);
    displayMerchants(response.data);

    fetchData("items").then((response) => {
      setItems(response.data);
    });
  });

  showDashboardView();
}

function initializeApp() {
  initializeUIElements();
  setupEventListeners();
  loadInitialData();
}

document.addEventListener("DOMContentLoaded", initializeApp);
