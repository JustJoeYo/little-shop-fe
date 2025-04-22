import { showStatus } from "../../errorHandling.js";
import { deleteData, fetchData } from "../../apiCalls.js";
import { getItems, findMerchant, setItems } from "../store/dataStore.js";
import { show, hide, removeActiveNavClass } from "../utils/domUtils.js";
import { setupItemEditForm } from "../components/itemEditor.js";

export function displayItems(items = getItems()) {
  const itemsView = document.querySelector("#items-view");
  const fragment = document.createDocumentFragment();

  itemsView.innerHTML = "";

  if (!items || items.length === 0) {
    itemsView.innerHTML =
      '<div class="empty-state"><i class="fas fa-box-open"></i><p>No items found</p></div>';
    return;
  }

  items.forEach((item) => {
    fragment.appendChild(createItemCard(item));
  });

  itemsView.appendChild(fragment);

  const newItemsView = itemsView.cloneNode(true);
  itemsView.parentNode.replaceChild(newItemsView, itemsView);

  newItemsView.addEventListener("click", handleItemClicks);
}

function createItemCard(item) {
  const merchant = findMerchant(item.attributes.merchant_id);
  const itemCard = document.createElement("div");
  itemCard.className = "item-card";
  itemCard.id = `item-${item.id}`;

  itemCard.innerHTML = `
    <div class="card-header">
      <h3 class="item-title">${item.attributes.name}</h3>
      <div class="card-actions">
        <button class="btn-icon edit-item" title="Edit Item"><i class="fas fa-edit"></i></button>
        <button class="btn-icon delete-item" title="Delete Item"><i class="fas fa-trash-alt"></i></button>
      </div>
    </div>
    <div class="card-body">
      <div class="item-details">
        <p>${item.attributes.description}</p>
        <p class="item-price">$${parseFloat(item.attributes.unit_price).toFixed(
          2
        )}</p>
        <p class="item-merchant">Merchant: ${
          merchant ? merchant.attributes.name : "Unknown"
        }</p>
      </div>
    </div>
  `;

  return itemCard;
}

function handleItemClicks(event) {
  const target = event.target;
  const isOrHasParent = (element, className) =>
    element.classList.contains(className) ||
    (element.parentElement &&
      element.parentElement.classList.contains(className));

  if (isOrHasParent(target, "delete-item")) {
    deleteItem(event);
  } else if (isOrHasParent(target, "edit-item")) {
    editItem(event);
  }
}

function deleteItem(event) {
  const card = event.target.closest(".item-card");
  const id = card.id.split("-")[1];

  if (
    confirm(
      "Are you sure you want to delete this item? This action cannot be undone."
    )
  ) {
    deleteData(`items/${id}`)
      .then(() => {
        card.remove();
        showStatus("Item successfully deleted!", true);
      })
      .catch((error) => {
        console.error("Error deleting item:", error);
        showStatus("Failed to delete item. Please try again.", false);
      });
  }
}

function editItem(event) {
  const card = event.target.closest(".item-card");
  const id = card.id.split("-")[1];
  const titleElement = card.querySelector(".item-title");
  const descriptionElement = card.querySelector(".item-details p:first-child");
  const priceElement = card.querySelector(".item-price");

  const currentTitle = titleElement.textContent;
  const currentDescription = descriptionElement.textContent;
  const currentPrice = priceElement.textContent.replace("$", "");

  setupItemEditForm(titleElement, descriptionElement, priceElement, {
    id,
    name: currentTitle,
    description: currentDescription,
    price: currentPrice,
  });
}

export function showItemsView() {
  const elements = {
    itemsView: document.querySelector("#items-view"),
    merchantsView: document.querySelector("#merchants-view"),
    dashboardView: document.querySelector("#dashboard-view"),
    formContainer: document.querySelector("#form-container"),
    pageTitle: document.querySelector("#page-title"),
    showingText: document.querySelector("#showing-text"),
    addNewButton: document.querySelector("#add-new-button"),
    sortControls: document.querySelector("#sort-controls"),
  };

  elements.pageTitle.textContent = "Items";
  elements.showingText.textContent = "All Items";
  elements.addNewButton.dataset.state = "item";

  const items = getItems();
  let minPrice = 0;
  let maxPrice = 1000;

  if (items && items.length > 0) {
    const prices = items.map((item) => parseFloat(item.attributes.unit_price));
    minPrice = Math.floor(Math.min(...prices));
    maxPrice = Math.ceil(Math.max(...prices));
  }

  elements.sortControls.innerHTML = `
    <div class="price-filter">
      <div class="range-slider-container">
        <label>Price Range: $<span id="min-price-display">${minPrice}</span> - $<span id="max-price-display">${maxPrice}</span></label>
        <div class="sliders-container">
          <input type="range" id="min-price-slider" class="price-slider" min="${minPrice}" max="${maxPrice}" value="${minPrice}" step="1">
          <input type="range" id="max-price-slider" class="price-slider" min="${minPrice}" max="${maxPrice}" value="${maxPrice}" step="1">
        </div>
      </div>
      <button id="reset-filters" class="btn-small">Reset</button>
    </div>
    <div class="sort-container">
      <select id="name-sort" class="sort-select">
        <option value="">Sort by Name</option>
        <option value="asc">Name (A-Z)</option>
        <option value="desc">Name (Z-A)</option>
      </select>
      <select id="price-sort" class="sort-select">
        <option value="">Sort by Price</option>
        <option value="asc">Price (Low-High)</option>
        <option value="desc">Price (High-Low)</option>
      </select>
    </div>
  `;

  const minPriceSlider = document.querySelector("#min-price-slider");
  const maxPriceSlider = document.querySelector("#max-price-slider");
  const minPriceDisplay = document.querySelector("#min-price-display");
  const maxPriceDisplay = document.querySelector("#max-price-display");
  const resetFiltersButton = document.querySelector("#reset-filters");

  minPriceSlider.addEventListener("input", updatePriceFilters);
  maxPriceSlider.addEventListener("input", updatePriceFilters);
  resetFiltersButton.addEventListener("click", resetFilters);
  document.querySelector("#name-sort").addEventListener("change", sortItems);
  document.querySelector("#price-sort").addEventListener("change", sortItems);

  show([elements.itemsView, elements.addNewButton, elements.sortControls]);
  hide([
    elements.merchantsView,
    elements.dashboardView,
    elements.formContainer,
  ]);

  removeActiveNavClass();
  document.querySelector("#items-nav").classList.add("active-nav");

  elements.itemsView.innerHTML =
    '<div class="empty-state"><i class="fas fa-spinner fa-spin"></i><p>Loading items...</p></div>';

  fetchAllItems(elements.itemsView);
}

function updatePriceFilters() {
  const minPriceSlider = document.querySelector("#min-price-slider");
  const maxPriceSlider = document.querySelector("#max-price-slider");
  const minPriceDisplay = document.querySelector("#min-price-display");
  const maxPriceDisplay = document.querySelector("#max-price-display");

  if (parseInt(minPriceSlider.value) > parseInt(maxPriceSlider.value)) {
    minPriceSlider.value = maxPriceSlider.value;
  }

  minPriceDisplay.textContent = minPriceSlider.value;
  maxPriceDisplay.textContent = maxPriceSlider.value;

  filterItemsByPrice();
}

function resetFilters() {
  const minPriceSlider = document.querySelector("#min-price-slider");
  const maxPriceSlider = document.querySelector("#max-price-slider");

  minPriceSlider.value = minPriceSlider.min;
  maxPriceSlider.value = maxPriceSlider.max;

  document.querySelector("#min-price-display").textContent = minPriceSlider.min;
  document.querySelector("#max-price-display").textContent = maxPriceSlider.max;

  document.querySelector("#name-sort").value = "";
  document.querySelector("#price-sort").value = "";

  displayItems(getItems());
}

function filterItemsByPrice() {
  const minPrice = parseInt(document.querySelector("#min-price-slider").value);
  const maxPrice = parseInt(document.querySelector("#max-price-slider").value);

  const nameSort = document.querySelector("#name-sort").value;
  const priceSort = document.querySelector("#price-sort").value;

  let filteredItems = getItems().filter((item) => {
    const price = parseFloat(item.attributes.unit_price);
    return price >= minPrice && price <= maxPrice;
  });

  if (nameSort === "asc") {
    filteredItems.sort((a, b) =>
      a.attributes.name.localeCompare(b.attributes.name)
    );
  } else if (nameSort === "desc") {
    filteredItems.sort((a, b) =>
      b.attributes.name.localeCompare(a.attributes.name)
    );
  }

  if (priceSort === "asc") {
    filteredItems.sort(
      (a, b) =>
        parseFloat(a.attributes.unit_price) -
        parseFloat(b.attributes.unit_price)
    );
  } else if (priceSort === "desc") {
    filteredItems.sort(
      (a, b) =>
        parseFloat(b.attributes.unit_price) -
        parseFloat(a.attributes.unit_price)
    );
  }

  displayItems(filteredItems);
}

function sortItems() {
  const minPrice = parseInt(document.querySelector("#min-price-slider").value);
  const maxPrice = parseInt(document.querySelector("#max-price-slider").value);

  const nameSort = document.querySelector("#name-sort").value;
  const priceSort = document.querySelector("#price-sort").value;

  let items = getItems().filter((item) => {
    const price = parseFloat(item.attributes.unit_price);
    return price >= minPrice && price <= maxPrice;
  });

  if (this.id === "name-sort" && this.value !== "" && priceSort !== "") {
    document.querySelector("#price-sort").value = "";
  } else if (this.id === "price-sort" && this.value !== "" && nameSort !== "") {
    document.querySelector("#name-sort").value = "";
  }

  if (nameSort === "asc") {
    items.sort((a, b) => a.attributes.name.localeCompare(b.attributes.name));
  } else if (nameSort === "desc") {
    items.sort((a, b) => b.attributes.name.localeCompare(a.attributes.name));
  }

  if (priceSort === "asc") {
    items.sort(
      (a, b) =>
        parseFloat(a.attributes.unit_price) -
        parseFloat(b.attributes.unit_price)
    );
  } else if (priceSort === "desc") {
    items.sort(
      (a, b) =>
        parseFloat(b.attributes.unit_price) -
        parseFloat(a.attributes.unit_price)
    );
  }

  displayItems(items);
}

function fetchAllItems(itemsView) {
  fetchData("items")
    .then((response) => {
      if (response && response.data) {
        setItems(response.data);
        displayItems(response.data);
      } else {
        itemsView.innerHTML =
          '<div class="empty-state"><i class="fas fa-box-open"></i><p>No items found</p></div>';
      }
    })
    .catch((error) => {
      console.error("Error fetching items:", error);
      itemsView.innerHTML =
        '<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>Error loading items. Please try again.</p></div>';
      showStatus("Failed to load items. Please try again.", false);
    });
}
