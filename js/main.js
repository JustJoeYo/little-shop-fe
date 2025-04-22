import "../styles/main.css";
import { fetchData, postData, deleteData, editData } from "../apiCalls.js";
import { showStatus } from "../errorHandling.js";
import { setupSidebar } from "./components/sidebar.js";
import {
  displayMerchants,
  displayAddedMerchant,
  showMerchantsView,
} from "./views/merchantView.js";
import { displayItems, showItemsView } from "./views/itemView.js";
import { displayDashboard, showDashboardView } from "./views/dashboardView.js";
import { show, hide } from "./utils/domUtils.js";
import {
  getMerchants,
  getItems,
  setMerchants,
  setItems,
} from "./store/dataStore.js";

setupSidebar();

const merchantsNavButton = document.querySelector("#merchants-nav");
const itemsNavButton = document.querySelector("#items-nav");
const dashboardNavButton = document.querySelector("#dashboard-nav");
const addNewButton = document.querySelector("#add-new-button");
const formContainer = document.querySelector("#form-container");
const formTitle = document.querySelector("#form-title");
const closeFormBtn = document.querySelector("#close-form");
const searchInput = document.querySelector("#search-input");
const searchButton = document.querySelector("#search-button");
const merchantForm = document.querySelector("#new-merchant-form");
const itemForm = document.querySelector("#new-item-form");
const newMerchantName = document.querySelector("#new-merchant-name");
const submitMerchantButton = document.querySelector("#submit-merchant");
const cancelMerchantButton = document.querySelector("#cancel-merchant");
const submitItemButton = document.querySelector("#submit-item");
const cancelItemButton = document.querySelector("#cancel-item");
const merchantSelect = document.querySelector("#item-merchant-select");

closeFormBtn.addEventListener("click", () => hide([formContainer]));

merchantsNavButton.addEventListener("click", showMerchantsView);
itemsNavButton.addEventListener("click", showItemsView);
dashboardNavButton.addEventListener("click", showDashboardView);

addNewButton.addEventListener("click", () => {
  if (addNewButton.dataset.state === "merchant") {
    formTitle.textContent = "Add New Merchant";
    show([formContainer, merchantForm]);
    hide([itemForm]);
  } else if (addNewButton.dataset.state === "item") {
    formTitle.textContent = "Add New Item";
    populateMerchantSelect();
    show([formContainer, itemForm]);
    hide([merchantForm]);
  }
});

submitMerchantButton.addEventListener("click", submitMerchant);
cancelMerchantButton.addEventListener("click", () => {
  hide([formContainer]);
  newMerchantName.value = "";
});

submitItemButton.addEventListener("click", submitItem);
cancelItemButton.addEventListener("click", () => {
  hide([formContainer]);
  resetItemForm();
});

searchButton.addEventListener("click", performSearch);
searchInput.addEventListener("keyup", (e) => {
  if (e.key === "Enter") performSearch();
});

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

function performSearch() {
  const searchTerm = searchInput.value.toLowerCase();
  const merchantsView = document.querySelector("#merchants-view");

  if (merchantsView.classList.contains("hidden")) {
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
  const merchantName = newMerchantName.value;

  if (!merchantName.trim()) {
    showStatus("Merchant name cannot be empty", false);
    return;
  }

  postData("merchants", { name: merchantName }).then((postedMerchant) => {
    const merchants = [...getMerchants(), postedMerchant.data];
    setMerchants(merchants);
    displayAddedMerchant(postedMerchant.data);
    newMerchantName.value = "";
    hide([formContainer]);
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
    hide([formContainer]);
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

function updateItem(event) {
  event.preventDefault();

  const itemId = event.target.dataset.itemId;
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

  editData(`items/${itemId}`, itemData).then((response) => {
    const items = getItems();
    const updatedItems = items.map((item) =>
      item.id === itemId ? response.data : item
    );
    setItems(updatedItems);

    resetItemForm();
    hide([formContainer]);
    showStatus("Item successfully updated!", true);

    const merchantsView = document.querySelector("#merchants-view");
    if (merchantsView.classList.contains("hidden")) {
      displayItems(getItems());
    } else {
      displayMerchants(getMerchants());
    }

    submitItemButton.removeEventListener("click", updateItem);
    submitItemButton.addEventListener("click", submitItem);
    submitItemButton.textContent = "Save Item";
    delete submitItemButton.dataset.itemId;
  });
}
