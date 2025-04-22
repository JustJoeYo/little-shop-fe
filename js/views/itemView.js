import { showStatus } from "../../errorHandling.js";
import { deleteData, fetchData } from "../../apiCalls.js";
import { getItems, findMerchant, setItems } from "../store/dataStore.js";
import { show, hide, removeActiveNavClass } from "../utils/domUtils.js";
import { setupItemEditForm } from "../components/itemEditor.js";

/**
 * Display the items
 */
export function displayItems(items = getItems()) {
  const itemsView = document.querySelector("#items-view");
  const fragment = document.createDocumentFragment();

  itemsView.innerHTML = "";

  // No items
  if (!items || items.length === 0) {
    itemsView.innerHTML =
      '<div class="empty-state"><i class="fas fa-box-open"></i><p>No items found</p></div>';
    return;
  }

  // Create item cards
  items.forEach((item) => {
    fragment.appendChild(createItemCard(item));
  });

  // Append cards to the view (add orphan to papa)
  itemsView.appendChild(fragment);

  // Dont duplicate Els. we create a clone of it and replace the prev
  const newItemsView = itemsView.cloneNode(true);
  itemsView.parentNode.replaceChild(newItemsView, itemsView);

  // Set up event listener
  newItemsView.addEventListener("click", handleItemClicks);
}

/**
 * Create an item card
 */
function createItemCard(item) {
  const merchant = findMerchant(item.attributes.merchant_id);
  const itemCard = document.createElement("div");
  itemCard.className = "item-card";
  itemCard.id = `item-${item.id}`;

  // Card HTML
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

/**
 * Handle clicks
 */
function handleItemClicks(event) {
  const target = event.target;

  // check for class
  const isOrHasParent = (element, className) =>
    element.classList.contains(className) ||
    (element.parentElement &&
      element.parentElement.classList.contains(className));

  // what do i gotta do?
  if (isOrHasParent(target, "delete-item")) {
    deleteItem(event);
  } else if (isOrHasParent(target, "edit-item")) {
    editItem(event);
  }
}

/**
 * Delete an item
 */
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
        // Remove from UI (main.js)
        card.remove();

        // Let user know it worked/failed
        showStatus("Item successfully deleted!", true);
      })
      .catch((error) => {
        console.error("Error deleting item:", error);
        showStatus("Failed to delete item. Please try again.", false);
      });
  }
}

/**
 * Edit an item
 */
function editItem(event) {
  const card = event.target.closest(".item-card");
  const id = card.id.split("-")[1];
  const titleElement = card.querySelector(".item-title");
  const descriptionElement = card.querySelector(".item-details p:first-child");
  const priceElement = card.querySelector(".item-price");

  // Get cur values
  const currentTitle = titleElement.textContent;
  const currentDescription = descriptionElement.textContent;
  const currentPrice = priceElement.textContent.replace("$", "");

  // Set up edit form
  setupItemEditForm(titleElement, descriptionElement, priceElement, {
    id,
    name: currentTitle,
    description: currentDescription,
    price: currentPrice,
  });
}

/**
 * Show the main items
 */
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

  // Update header
  elements.pageTitle.textContent = "Items";
  elements.showingText.textContent = "All Items";
  elements.addNewButton.dataset.state = "item";

  // Check price range for sliders
  const items = getItems();
  let minPrice = 0;
  let maxPrice = 10000; // Default val

  if (items && items.length > 0) {
    try {
      const prices = items.map((item) =>
        parseFloat(item.attributes.unit_price)
      );
      minPrice = Math.floor(Math.min(...prices));
      const calculatedMax = Math.ceil(Math.max(...prices));
      maxPrice = Math.max(calculatedMax, 10000);
    } catch (error) {
      console.error("Error with price range:", error);
    }
  }

  // filter/sort controls
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

  // Event listeners for filtering/sorting
  const minPriceSlider = document.querySelector("#min-price-slider");
  const maxPriceSlider = document.querySelector("#max-price-slider");
  const resetFiltersButton = document.querySelector("#reset-filters");

  minPriceSlider.addEventListener("input", updatePriceFilters);
  maxPriceSlider.addEventListener("input", updatePriceFilters);
  resetFiltersButton.addEventListener("click", resetFilters);
  document.querySelector("#name-sort").addEventListener("change", sortItems);
  document.querySelector("#price-sort").addEventListener("change", sortItems);

  // Show/hide elements
  show([elements.itemsView, elements.addNewButton, elements.sortControls]);
  hide([
    elements.merchantsView,
    elements.dashboardView,
    elements.formContainer,
  ]);

  // Update active nav
  removeActiveNavClass();
  document.querySelector("#items-nav").classList.add("active-nav");

  // Show loading spinner
  elements.itemsView.innerHTML =
    '<div class="empty-state"><i class="fas fa-spinner fa-spin"></i><p>Loading items...</p></div>';

  // Fetch all items
  fetchAllItems(elements.itemsView);
}

/**
 * Update price filters as sliders change
 */
function updatePriceFilters() {
  const minPriceSlider = document.querySelector("#min-price-slider");
  const maxPriceSlider = document.querySelector("#max-price-slider");
  const minPriceDisplay = document.querySelector("#min-price-display");
  const maxPriceDisplay = document.querySelector("#max-price-display");

  // Make sure min > max
  if (parseInt(minPriceSlider.value) > parseInt(maxPriceSlider.value)) {
    minPriceSlider.value = maxPriceSlider.value;
  }

  // Update display value
  minPriceDisplay.textContent = minPriceSlider.value;
  maxPriceDisplay.textContent = maxPriceSlider.value;

  // Apply filter
  filterItemsByPrice();
}

/**
 * Reset filters/sorting
 */
function resetFilters() {
  const minPriceSlider = document.querySelector("#min-price-slider");
  const maxPriceSlider = document.querySelector("#max-price-slider");

  // Reset sliders to min/max values
  minPriceSlider.value = minPriceSlider.min;
  maxPriceSlider.value = maxPriceSlider.max;

  // Update displays
  document.querySelector("#min-price-display").textContent = minPriceSlider.min;
  document.querySelector("#max-price-display").textContent = maxPriceSlider.max;

  // Reset sort dropdowns
  document.querySelector("#name-sort").value = "";
  document.querySelector("#price-sort").value = "";

  // Show all items
  displayItems(getItems());
}

/**
 * Filter items by price range
 */
function filterItemsByPrice() {
  const minPrice = parseInt(document.querySelector("#min-price-slider").value);
  const maxPrice = parseInt(document.querySelector("#max-price-slider").value);

  // Get current sort param
  const nameSort = document.querySelector("#name-sort").value;
  const priceSort = document.querySelector("#price-sort").value;

  // Filter by price
  let filteredItems = getItems().filter((item) => {
    const price = parseFloat(item.attributes.unit_price);
    return price >= minPrice && price <= maxPrice;
  });

  // Apply sorting GROSS
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

  // Display the filtered items
  displayItems(filteredItems);
}

/**
 * Sort items by name or price
 */
function sortItems() {
  // Get cur price filter
  const minPrice = parseInt(document.querySelector("#min-price-slider").value);
  const maxPrice = parseInt(document.querySelector("#max-price-slider").value);

  // Get sort options
  const nameSort = document.querySelector("#name-sort").value;
  const priceSort = document.querySelector("#price-sort").value;

  // Filter by price range
  let items = getItems().filter((item) => {
    const price = parseFloat(item.attributes.unit_price);
    return price >= minPrice && price <= maxPrice;
  });

  // One sort at a time
  if (this.id === "name-sort" && this.value !== "" && priceSort !== "") {
    document.querySelector("#price-sort").value = "";
  } else if (this.id === "price-sort" && this.value !== "" && nameSort !== "") {
    document.querySelector("#name-sort").value = "";
  }

  // Apply name sort
  if (nameSort === "asc") {
    items.sort((a, b) => a.attributes.name.localeCompare(b.attributes.name));
  } else if (nameSort === "desc") {
    items.sort((a, b) => b.attributes.name.localeCompare(a.attributes.name));
  }

  // Apply price sort
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

  // Display sorted items
  displayItems(items);
}

/**
 * Fetch all items from API
 */
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
