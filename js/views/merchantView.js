import { showStatus } from "../../errorHandling.js";
import { deleteData, editData, fetchData } from "../../apiCalls.js";
import { displayItems } from "./itemView.js";
import {
  getMerchants,
  findMerchant,
  setMerchants,
} from "../store/dataStore.js";
import { show, hide, removeActiveNavClass } from "../utils/domUtils.js";

export function displayMerchants(merchants = getMerchants()) {
  const merchantsView = document.querySelector("#merchants-view");
  merchantsView.innerHTML = "";

  if (merchants.length === 0) {
    merchantsView.innerHTML =
      '<div class="empty-state"><i class="fas fa-store-alt-slash"></i><p>No merchants found</p></div>';
    return;
  }

  const merchantsHtml = merchants
    .map((merchant) => createMerchantCard(merchant))
    .join("");

  merchantsView.innerHTML = merchantsHtml;
  merchantsView.addEventListener("click", handleMerchantClicks);
}

export function displayAddedMerchant(merchant) {
  const merchantsView = document.querySelector("#merchants-view");
  const newMerchantCard = document.createElement("div");
  newMerchantCard.className = "merchant-card";
  newMerchantCard.id = `merchant-${merchant.id}`;
  newMerchantCard.innerHTML = createMerchantCard(merchant).replace(
    /<div class="merchant-card"[^>]*>|<\/div>$/g,
    ""
  );

  merchantsView.appendChild(newMerchantCard);
}

function handleMerchantClicks(event) {
  const target = event.target;
  const isOrHasParent = (element, className) =>
    element.classList.contains(className) ||
    (element.parentElement &&
      element.parentElement.classList.contains(className));

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

function deleteMerchant(event) {
  const card = event.target.closest(".merchant-card");
  const id = card.id.split("-")[1];

  if (confirm("Are you sure you want to delete this merchant?")) {
    deleteData(`merchants/${id}`)
      .then(() => {
        card.remove();
        const updatedMerchants = getMerchants().filter((m) => m.id !== id);
        setMerchants(updatedMerchants);
        showStatus("Merchant successfully deleted!", true);
      })
      .catch((error) => {
        console.error("Error deleting merchant:", error);
        showStatus("Failed to delete. Try again later.", false);
      });
  }
}

function createMerchantCard(merchant) {
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

function editMerchant(event) {
  const card = event.target.closest(".merchant-card");
  const merchantNameElement = card.querySelector(".merchant-name");
  const currentName = merchantNameElement.textContent;
  const id = card.id.split("-")[1];

  setupEditForm(merchantNameElement, currentName, id);
}

function setupEditForm(element, currentName, id) {
  element.innerHTML = `
    <input type="text" class="edit-merchant-input-inline" value="${currentName}">
    <div class="edit-actions">
      <button class="btn-icon confirm-merchant-edit" title="Confirm"><i class="fas fa-check"></i></button>
      <button class="btn-icon cancel-merchant-edit" title="Cancel"><i class="fas fa-times"></i></button>
    </div>
  `;

  const inputField = element.querySelector(".edit-merchant-input-inline");
  inputField.focus();

  element
    .querySelector(".confirm-merchant-edit")
    .addEventListener("click", () => {
      saveEditedMerchant(inputField.value, element, id);
    });

  element
    .querySelector(".cancel-merchant-edit")
    .addEventListener("click", () => {
      element.innerHTML = currentName;
    });
}

function saveEditedMerchant(newName, element, id) {
  if (!newName.trim()) {
    showStatus("Merchant name cannot be empty", false);
    return;
  }

  editData(`merchants/${id}`, { name: newName }).then(() => {
    element.innerHTML = newName;
    updateMerchantInStore(id, newName);
    showStatus("Merchant successfully updated!", true);
  });
}

function updateMerchantInStore(id, newName) {
  const updatedMerchants = getMerchants().map((merchant) => {
    if (merchant.id === id) {
      return {
        ...merchant,
        attributes: {
          ...merchant.attributes,
          name: newName,
        },
      };
    }
    return merchant;
  });

  updatedMerchants.sort((a, b) => parseInt(a.id) - parseInt(b.id));
  setMerchants(updatedMerchants);
}

function displayMerchantItems(event) {
  const merchantId = event.target.closest(".merchant-card").id.split("-")[1];
  setupMerchantItemsView(merchantId);
  fetchMerchantItems(merchantId);
}

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

  pageTitle.textContent = "Items";
  showingText.textContent = `Items for ${
    merchant ? merchant.attributes.name : "Merchant"
  }`;
  addNewButton.dataset.state = "item";

  show([views.itemsView, addNewButton]);
  hide([views.merchantsView, views.dashboardView, views.formContainer]);

  removeActiveNavClass();
  document.querySelector("#items-nav").classList.add("active-nav");

  views.itemsView.innerHTML =
    '<div class="empty-state"><i class="fas fa-spinner fa-spin"></i><p>Loading merchant items...</p></div>';
}

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
  };

  elements.pageTitle.textContent = "Merchants";
  elements.showingText.textContent = "All Merchants";
  elements.addNewButton.dataset.state = "merchant";

  show([elements.merchantsView, elements.addNewButton]);
  hide([elements.itemsView, elements.dashboardView, elements.formContainer]);

  removeActiveNavClass();
  elements.merchantsNavButton.classList.add("active-nav");

  displayMerchants(getMerchants());
}
