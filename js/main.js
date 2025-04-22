import "../styles/main.css";
import { showStatus } from "../errorHandling.js";
import { displayMerchants } from "./views/merchantView.js";
import { displayItems } from "./views/itemView.js";
import { show, hide, removeActiveNavClass } from "./utils/domUtils.js";
import { fetchData, postData } from "../apiCalls.js";
import {
  getMerchants,
  getItems,
  setMerchants,
  setItems,
  findMerchant,
  filterByMerchant,
} from "./store/dataStore.js";

import { showMerchantsView } from "./views/merchantView.js";
import { showItemsView } from "./views/itemView.js";
import { showDashboardView, displayDashboard } from "./views/dashboardView.js";

document.addEventListener("DOMContentLoaded", () => {
  const merchantsNavButton = document.querySelector("#merchants-nav");
  const itemsNavButton = document.querySelector("#items-nav");
  const dashboardNavButton = document.querySelector("#dashboard-nav");

  if (merchantsNavButton)
    merchantsNavButton.addEventListener("click", showMerchantsView);
  if (itemsNavButton) itemsNavButton.addEventListener("click", showItemsView);
  if (dashboardNavButton)
    dashboardNavButton.addEventListener("click", showDashboardView);

  Promise.all([fetchData("merchants"), fetchData("items")])
    .then((responses) => {
      setMerchants(responses[0].data);
      setItems(responses[1].data);
      displayMerchants(getMerchants());
    })
    .catch((err) => {
      console.log("catch error: ", err);
      showStatus("Failed to load data. Please try again.", false);
    });
});

// had trouble accessing data so this is here now.
window.showMerchantItems = function (merchantId) {
  const items = getItems();
  const merchant = findMerchant(merchantId);

  const merchantItems = filterByMerchant(merchantId);

  console.log(
    `Found ${merchantItems.length} items for merchant ID: ${merchantId}`
  );

  const pageTitle = document.querySelector("#page-title");
  const showingText = document.querySelector("#showing-text");
  const addNewButton = document.querySelector("#add-new-button");
  const merchantsView = document.querySelector("#merchants-view");
  const itemsView = document.querySelector("#items-view");
  const dashboardView = document.querySelector("#dashboard-view");
  const formContainer = document.querySelector("#form-container");
  const itemsNavButton = document.querySelector("#items-nav");

  pageTitle.textContent = "Items";
  showingText.textContent = `Items for ${
    merchant ? merchant.attributes.name : "Merchant"
  }`;
  addNewButton.dataset.state = "item";

  show([itemsView, addNewButton]);
  hide([merchantsView, dashboardView, formContainer]);

  removeActiveNavClass();
  itemsNavButton.classList.add("active-nav");

  displayItems(merchantItems);
};
