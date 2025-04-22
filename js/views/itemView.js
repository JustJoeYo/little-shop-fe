import { showStatus } from "../../errorHandling.js";
import { deleteData, editData, fetchData } from "../../apiCalls.js";
import {
  getItems,
  getMerchants,
  findMerchant,
  setItems,
} from "../store/dataStore.js";
import { show, hide, removeActiveNavClass } from "../utils/domUtils.js";

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

// will name dom elements for manipulation with El (for element)

function setupItemEditForm(titleEl, descEl, priceEl, item) {
  titleEl.innerHTML = `
    <input type="text" class="edit-item-input-inline" value="${item.name}">
  `;

  descEl.innerHTML = `
    <textarea class="edit-item-textarea-inline">${item.description}</textarea>
  `;

  priceEl.innerHTML = `
    <div class="price-edit-container">
      <span>$</span>
      <input type="number" step="0.01" min="0" class="edit-item-price-inline" value="${item.price}">
      <div class="edit-actions">
        <button class="btn-icon confirm-item-edit" title="Confirm"><i class="fas fa-check"></i></button>
        <button class="btn-icon cancel-item-edit" title="Cancel"><i class="fas fa-times"></i></button>
      </div>
    </div>
  `;

  const nameInput = titleEl.querySelector(".edit-item-input-inline");
  const descInput = descEl.querySelector(".edit-item-textarea-inline");
  const priceInput = priceEl.querySelector(".edit-item-price-inline");

  nameInput.focus();

  const confirmBtn = priceEl.querySelector(".confirm-item-edit");
  const cancelBtn = priceEl.querySelector(".cancel-item-edit");

  confirmBtn.addEventListener("click", () => {
    saveEditedItem(
      {
        id: item.id,
        name: nameInput.value,
        description: descInput.value,
        unit_price: priceInput.value,
      },
      titleEl,
      descEl,
      priceEl
    );
  });

  cancelBtn.addEventListener("click", () => {
    cancelItemEdit(titleEl, descEl, priceEl, item);
  });
}

function saveEditedItem(updatedItem, titleEl, descEl, priceEl) {
  if (!updatedItem.name.trim()) {
    showStatus("Item name cannot be empty", false);
    return;
  }

  if (parseFloat(updatedItem.unit_price) <= 0) {
    showStatus("Price must be greater than zero", false);
    return;
  }

  const itemData = {
    name: updatedItem.name,
    description: updatedItem.description,
    unit_price: parseFloat(updatedItem.unit_price),
  };

  editData(`items/${updatedItem.id}`, itemData)
    .then((response) => {
      titleEl.textContent = updatedItem.name;
      descEl.textContent = updatedItem.description;
      priceEl.innerHTML = `$${parseFloat(updatedItem.unit_price).toFixed(2)}`;

      updateItemInStore(updatedItem);
      showStatus("Item successfully updated!", true);
    })
    .catch((error) => {
      console.error("Error updating item:", error);
      showStatus("Failed to update item. Please try again.", false);
      cancelItemEdit(titleEl, descEl, priceEl, updatedItem);
    });
}

function cancelItemEdit(titleEl, descEl, priceEl, item) {
  titleEl.textContent = item.name;
  descEl.textContent = item.description;
  priceEl.innerHTML = `$${parseFloat(item.price).toFixed(2)}`;
}

function updateItemInStore(updatedItem) {
  const items = getItems();
  const updatedItems = items.map((item) => {
    if (item.id === updatedItem.id) {
      return {
        ...item,
        attributes: {
          ...item.attributes,
          name: updatedItem.name,
          description: updatedItem.description,
          unit_price: updatedItem.unit_price,
        },
      };
    }
    return item;
  });

  setItems(updatedItems);
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
  };

  elements.pageTitle.textContent = "Items";
  elements.showingText.textContent = "All Items";
  elements.addNewButton.dataset.state = "item";

  show([elements.itemsView, elements.addNewButton]);
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
