import "../styles/main.css";
import { showStatus } from "../errorHandling.js";
import {
  displayMerchants,
  displayAddedMerchant,
  showMerchantsView,
} from "./views/merchantView.js";
import { displayItems, showItemsView } from "./views/itemView.js";
import { showDashboardView, displayDashboard } from "./views/dashboardView.js";
import { show, hide, removeActiveNavClass } from "./utils/domUtils.js";
import { fetchData, postData, deleteData } from "../apiCalls.js";
import {
  getMerchants,
  getItems,
  setMerchants,
  setItems,
  findMerchant,
  filterByMerchant,
} from "./store/dataStore.js";

const UI = {};

function initializeUIElements() {
  UI.merchantsNavButton = document.querySelector("#merchants-nav");
  UI.itemsNavButton = document.querySelector("#items-nav");
  UI.dashboardNavButton = document.querySelector("#dashboard-nav");
  UI.addNewButton = document.querySelector("#add-new-button");
  UI.formContainer = document.querySelector("#form-container");
  UI.formTitle = document.querySelector("#form-title");
  UI.merchantForm = document.querySelector("#new-merchant-form");
  UI.itemForm = document.querySelector("#new-item-form");
  UI.closeFormBtn = document.querySelector("#close-form");
  UI.searchInput = document.querySelector("#search-input");
  UI.searchButton = document.querySelector("#search-button");
  UI.submitMerchantButton = document.querySelector("#submit-merchant");
  UI.cancelMerchantButton = document.querySelector("#cancel-merchant");
  UI.submitItemButton = document.querySelector("#submit-item");
  UI.cancelItemButton = document.querySelector("#cancel-item");
  UI.pageTitle = document.querySelector("#page-title");
  UI.showingText = document.querySelector("#showing-text");
  UI.merchantsView = document.querySelector("#merchants-view");
  UI.itemsView = document.querySelector("#items-view");
  UI.dashboardView = document.querySelector("#dashboard-view");
}

function setupEventListeners() {
  const menuToggle = document.querySelector(".menu-toggle");
  const sidebar = document.querySelector(".sidebar");
  const sidebarOverlay = document.querySelector(".sidebar-overlay");
  const closeSidebar = document.querySelector(".close-sidebar");

  if (UI.merchantsNavButton) {
    UI.merchantsNavButton.addEventListener("click", showMerchantsView);
  }

  if (UI.itemsNavButton) {
    UI.itemsNavButton.addEventListener("click", showItemsView);
  }

  if (UI.dashboardNavButton) {
    UI.dashboardNavButton.addEventListener("click", showDashboardView);
  }

  if (UI.addNewButton) {
    UI.addNewButton.addEventListener("click", handleAddNewClick);
  }

  if (UI.closeFormBtn) {
    UI.closeFormBtn.addEventListener("click", () => hide([UI.formContainer]));
  }

  if (UI.submitMerchantButton) {
    UI.submitMerchantButton.addEventListener("click", submitMerchant);
  }

  if (UI.cancelMerchantButton) {
    UI.cancelMerchantButton.addEventListener("click", () => {
      hide([UI.formContainer]);
      document.querySelector("#new-merchant-name").value = "";
    });
  }

  if (UI.submitItemButton) {
    UI.submitItemButton.addEventListener("click", submitItem);
  }

  if (UI.cancelItemButton) {
    UI.cancelItemButton.addEventListener("click", () => {
      hide([UI.formContainer]);
      resetItemForm();
    });
  }

  if (UI.searchButton) {
    UI.searchButton.addEventListener("click", performSearch);
  }

  if (UI.searchInput) {
    UI.searchInput.addEventListener("keyup", (e) => {
      if (e.key === "Enter") performSearch();
    });
  }

  if (menuToggle) {
    menuToggle.addEventListener("click", () => {
      sidebar.classList.toggle("active");
      if (sidebarOverlay) {
        sidebarOverlay.classList.toggle("active");
      }
    });
  }

  if (closeSidebar) {
    closeSidebar.addEventListener("click", () => {
      sidebar.classList.remove("active");
      if (sidebarOverlay) {
        sidebarOverlay.classList.remove("active");
      }
    });
  }

  if (sidebarOverlay) {
    sidebarOverlay.addEventListener("click", () => {
      sidebar.classList.remove("active");
      sidebarOverlay.classList.remove("active");
    });
  }
}

function handleAddNewClick() {
  if (UI.addNewButton.dataset.state === "merchant") {
    UI.formTitle.textContent = "Add New Merchant";
    show([UI.formContainer, UI.merchantForm]);
    hide([UI.itemForm]);
  } else if (UI.addNewButton.dataset.state === "item") {
    UI.formTitle.textContent = "Add New Item";
    populateMerchantSelect();
    show([UI.formContainer, UI.itemForm]);
    hide([UI.merchantForm]);
  }
}

function loadInitialData() {
  Promise.all([fetchData("merchants"), fetchData("items")])
    .then((responses) => {
      // sorts on refresh
      const sortedMerchants = responses[0].data.sort(
        (a, b) => parseInt(a.id) - parseInt(b.id)
      );
      setMerchants(sortedMerchants);
      setItems(responses[1].data);
      displayMerchants(getMerchants());
    })
    .catch((err) => {
      console.log("catch error: ", err);
      showStatus("Failed to load data. Please try again.", false);
    });
}

function performSearch() {
  const searchTerm = UI.searchInput.value.toLowerCase();

  if (UI.merchantsView.classList.contains("hidden")) {
    const filteredItems = getItems().filter(
      (item) =>
        item.attributes.name.toLowerCase().includes(searchTerm) ||
        item.attributes.description.toLowerCase().includes(searchTerm)
    );
    displayItems(filteredItems);
  } else {
    const filteredMerchants = getMerchants().filter((merchant) =>
      merchant.attributes.name.toLowerCase().includes(searchTerm)
    );
    displayMerchants(filteredMerchants);
  }
}

function submitMerchant(event) {
  event.preventDefault();
  const merchantName = document.querySelector("#new-merchant-name").value;

  if (!merchantName.trim()) {
    showStatus("Merchant name cannot be empty", false);
    return;
  }

  postData("merchants", { name: merchantName }).then((postedMerchant) => {
    const merchants = [...getMerchants(), postedMerchant.data];
    setMerchants(merchants);
    displayAddedMerchant(postedMerchant.data);
    document.querySelector("#new-merchant-name").value = "";
    hide([UI.formContainer]);
    showStatus("Merchant successfully added!", true);
  });
}

function submitItem(event) {
  event.preventDefault();

  const name = document.getElementById("new-item-name").value;
  const description = document.getElementById("new-item-description").value;
  const price = document.getElementById("new-item-price").value;
  const merchantId = document.getElementById("item-merchant-select").value;

  if (!name.trim() || !description.trim() || !price || !merchantId) {
    showStatus("All fields are required", false);
    return;
  }

  const itemData = {
    name: name,
    description: description,
    unit_price: parseFloat(price),
    merchant_id: parseInt(merchantId),
  };

  postData("items", itemData).then((response) => {
    const items = [...getItems(), response.data];
    setItems(items);
    displayItems(getItems());
    resetItemForm();
    hide([UI.formContainer]);
    showStatus("Item successfully added!", true);
  });
}

function resetItemForm() {
  document.getElementById("new-item-name").value = "";
  document.getElementById("new-item-description").value = "";
  document.getElementById("new-item-price").value = "";
  document.getElementById("item-merchant-select").value = "";
}

function populateMerchantSelect() {
  const merchantSelect = document.querySelector("#item-merchant-select");

  while (merchantSelect.options.length > 1) {
    merchantSelect.remove(1);
  }

  getMerchants().forEach((merchant) => {
    const option = document.createElement("option");
    option.value = merchant.id;
    option.textContent = merchant.attributes.name;
    merchantSelect.appendChild(option);
  });
}

window.showMerchantItems = function (merchantId) {
  const merchant = findMerchant(merchantId);
  const merchantItems = filterByMerchant(merchantId);

  console.log(
    `Found ${merchantItems.length} items for merchant ID: ${merchantId}`
  );

  UI.pageTitle.textContent = "Items";
  UI.showingText.textContent = `Items for ${
    merchant ? merchant.attributes.name : "Merchant"
  }`;
  UI.addNewButton.dataset.state = "item";

  show([UI.itemsView, UI.addNewButton]);
  hide([UI.merchantsView, UI.dashboardView, UI.formContainer]);

  removeActiveNavClass();
  UI.itemsNavButton.classList.add("active-nav");

  displayItems(merchantItems);
};

document.addEventListener("DOMContentLoaded", () => {
  initializeUIElements();
  setupEventListeners();
  loadInitialData();
});
