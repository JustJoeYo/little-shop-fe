import { showStatus } from "../../errorHandling.js";
import { deleteData, fetchData } from "../../apiCalls.js";
import { displayItems } from "./itemView.js";
import {
  getMerchants,
  findMerchant,
  setMerchants,
} from "../store/dataStore.js";
import { show, hide, removeActiveNavClass } from "../utils/domUtils.js";
import { setupMerchantEditForm } from "../components/merchantEditor.js";

/**
 * Display all the merchants
 */
export function displayMerchants(merchants = getMerchants()) {
  const merchantsView = document.querySelector("#merchants-view");
  merchantsView.innerHTML = "";

  // No merchants? Show empty state
  if (merchants.length === 0) {
    merchantsView.innerHTML =
      '<div class="empty-state"><i class="fas fa-store-alt-slash"></i><p>No merchants found</p></div>';
    return;
  }

  // Build all merchant cards at once
  const merchantsHtml = merchants
    .map((merchant) => createMerchantCard(merchant))
    .join("");

  merchantsView.innerHTML = merchantsHtml;

  // Set up event listener for all merchant actions
  merchantsView.addEventListener("click", handleMerchantClicks);
}

/**
 * Show a newly added merchant
 */
export function displayAddedMerchant(merchant) {
  const merchantsView = document.querySelector("#merchants-view");
  const newMerchantCard = document.createElement("div");
  newMerchantCard.className = "merchant-card";
  newMerchantCard.id = `merchant-${merchant.id}`;

  // gotta remove the div tag (applies duplicates without this)
  newMerchantCard.innerHTML = createMerchantCard(merchant).replace(
    /<div class="merchant-card"[^>]*>|<\/div>$/g,
    ""
  );

  merchantsView.appendChild(newMerchantCard);
}

/**
 * Handle clicks (edit, delete, view items)
 */
function handleMerchantClicks(event) {
  const target = event.target;

  // Find class
  const isOrHasParent = (element, className) =>
    element.classList.contains(className) ||
    (element.parentElement &&
      element.parentElement.classList.contains(className));

  // what to do?
  if (isOrHasParent(target, "delete-merchant")) {
    deleteMerchant(event);
  } else if (isOrHasParent(target, "edit-merchant")) {
    editMerchant(event);
  } else if (
    isOrHasParent(target, "view-merchant-items") ||
    isOrHasParent(target, "btn-view")
  ) {
    displayMerchantItems(event);
  }
}

/**
 * Create HTML
 */
function createMerchantCard(merchant) {
  // Only show item count if it exists
  const itemCountDisplay = merchant.attributes.item_count
    ? `<p>Items: ${merchant.attributes.item_count}</p>`
    : "";

  return `
    <div class="merchant-card" id="merchant-${merchant.id}">
      <div class="card-header">
        <h3 class="merchant-name">${merchant.attributes.name}</h3>
        <div class="card-actions">
          <button class="btn-icon edit-merchant" title="Edit Merchant"><i class="fas fa-edit"></i></button>
          <button class="btn-icon delete-merchant" title="Delete Merchant"><i class="fas fa-trash-alt"></i></button>
        </div>
      </div>
      <div class="card-body">
        <p>ID: ${merchant.id}</p>
        ${itemCountDisplay}
      </div>
      <div class="card-footer">
        <button class="btn-view view-merchant-items">
          View Items
        </button>
      </div>
    </div>
  `;
}

/**
 * Delete a merchant
 */
function deleteMerchant(event) {
  const card = event.target.closest(".merchant-card");
  const id = card.id.split("-")[1];

  if (confirm("Are you sure you want to delete this merchant?")) {
    deleteData(`merchants/${id}`)
      .then(() => {
        // Remove from UI (main.js again)
        card.remove();

        // Remove data from data store
        const updatedMerchants = getMerchants().filter((m) => m.id !== id);
        setMerchants(updatedMerchants);

        // Let user know it worked
        showStatus("Merchant successfully deleted!", true);
      })
      .catch((error) => {
        console.error("Error deleting merchant:", error);
        showStatus("Failed to delete. Try again later.", false);
      });
  }
}

/**
 * Edit a merchants name
 */
function editMerchant(event) {
  const card = event.target.closest(".merchant-card");
  const merchantNameElement = card.querySelector(".merchant-name");
  const currentName = merchantNameElement.textContent;
  const id = card.id.split("-")[1];

  // Let the edit form handle it
  setupMerchantEditForm(merchantNameElement, currentName, id);
}

/**
 * Display all items for a specific merchant
 */
function displayMerchantItems(event) {
  const merchantId = event.target.closest(".merchant-card").id.split("-")[1];
  setupMerchantItemsView(merchantId);
  fetchMerchantItems(merchantId);
}

/**
 * Set up the items view
 */
function setupMerchantItemsView(merchantId) {
  const merchant = findMerchant(merchantId);
  const views = {
    itemsView: document.querySelector("#items-view"),
    merchantsView: document.querySelector("#merchants-view"),
    dashboardView: document.querySelector("#dashboard-view"),
    formContainer: document.querySelector("#form-container"),
  };

  const pageTitle = document.querySelector("#page-title");
  const showingText = document.querySelector("#showing-text");
  const addNewButton = document.querySelector("#add-new-button");

  // Update header
  pageTitle.textContent = "Items";
  showingText.textContent = `Items for ${
    merchant ? merchant.attributes.name : "Merchant"
  }`;
  addNewButton.dataset.state = "item";

  // Show/hide the Els
  show([views.itemsView, addNewButton]);
  hide([views.merchantsView, views.dashboardView, views.formContainer]);

  // Update active nav
  removeActiveNavClass();
  document.querySelector("#items-nav").classList.add("active-nav");

  // Show loading spinner
  views.itemsView.innerHTML =
    '<div class="empty-state"><i class="fas fa-spinner fa-spin"></i><p>Loading merchant items...</p></div>';
}

/**
 * Fetch items for a merchant
 */
function fetchMerchantItems(merchantId) {
  const itemsView = document.querySelector("#items-view");

  fetchData(`merchants/${merchantId}/items`)
    .then((response) => {
      if (response && response.data && response.data.length > 0) {
        displayItems(response.data);
      } else {
        itemsView.innerHTML =
          '<div class="empty-state"><i class="fas fa-box-open"></i><p>This merchant has no items</p></div>';
      }
    })
    .catch((error) => {
      console.error("Error fetching merchant items:", error);
      itemsView.innerHTML =
        '<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>Error loading merchant items</p></div>';
    });
}

/**
 * Show merchants view
 */
export function showMerchantsView() {
  const elements = {
    pageTitle: document.querySelector("#page-title"),
    showingText: document.querySelector("#showing-text"),
    addNewButton: document.querySelector("#add-new-button"),
    merchantsView: document.querySelector("#merchants-view"),
    itemsView: document.querySelector("#items-view"),
    dashboardView: document.querySelector("#dashboard-view"),
    formContainer: document.querySelector("#form-container"),
    merchantsNavButton: document.querySelector("#merchants-nav"),
    sortControls: document.querySelector("#sort-controls"),
  };

  // Update header
  elements.pageTitle.textContent = "Merchants";
  elements.showingText.textContent = "All Merchants";
  elements.addNewButton.dataset.state = "merchant";

  // Sortin controller
  elements.sortControls.innerHTML = `
    <div class="sort-container">
      <select id="merchant-name-sort" class="sort-select">
        <option value="">Sort by Name</option>
        <option value="asc">Name (A-Z)</option>
        <option value="desc">Name (Z-A)</option>
      </select>
    </div>
  `;

  // Event listeners
  document
    .querySelector("#merchant-name-sort")
    .addEventListener("change", sortMerchants);

  // Show/hide els
  show([elements.merchantsView, elements.addNewButton, elements.sortControls]);
  hide([elements.itemsView, elements.dashboardView, elements.formContainer]);

  // Update active nav
  removeActiveNavClass();
  elements.merchantsNavButton.classList.add("active-nav");

  // Display merchants
  displayMerchants(getMerchants());
}

/**
 * Sort merchants by name
 */
function sortMerchants() {
  const nameSort = document.querySelector("#merchant-name-sort").value;

  // check if sort active
  if (nameSort === "") {
    displayMerchants(getMerchants());
    return;
  }

  // clone so we dont ruin our data (sort mutilates rememba)
  let merchants = [...getMerchants()];

  // Sort by name
  if (nameSort === "asc") {
    merchants.sort((a, b) =>
      a.attributes.name.localeCompare(b.attributes.name)
    );
  } else if (nameSort === "desc") {
    merchants.sort((a, b) =>
      b.attributes.name.localeCompare(a.attributes.name)
    );
  }

  // Display sorted merchants
  displayMerchants(merchants);
}
