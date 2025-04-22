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
  // stackoverflow said better performance so i believe them
  const fragment = document.createDocumentFragment();

  itemsView.innerHTML = "";

  if (items.length === 0) {
    itemsView.innerHTML =
      '<div class="empty-state"><i class="fas fa-box-open"></i><p>No items found</p></div>';
    return;
  }

  items.forEach((item) => {
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
          <p class="item-price">$${parseFloat(
            item.attributes.unit_price
          ).toFixed(2)}</p>
          <p class="item-merchant">Merchant: ${
            merchant ? merchant.attributes.name : "Unknown"
          }</p>
        </div>
      </div>
    `;

    fragment.appendChild(itemCard);
  });

  itemsView.appendChild(fragment);

  const newItemsView = itemsView.cloneNode(true);
  itemsView.parentNode.replaceChild(newItemsView, itemsView);

  newItemsView.addEventListener("click", handleItemClicks);
}

function handleItemClicks(event) {
  const target = event.target;

  if (
    target.classList.contains("delete-item") ||
    (target.parentElement &&
      target.parentElement.classList.contains("delete-item"))
  ) {
    deleteItem(event);
  } else if (
    target.classList.contains("edit-item") ||
    (target.parentElement &&
      target.parentElement.classList.contains("edit-item"))
  ) {
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
    deleteData(`items/${id}`).then(() => {
      card.remove();
      showStatus("Item successfully deleted!", true);
    });
  }
}

export function showItemsView() {
  const itemsView = document.querySelector("#items-view");
  const merchantsView = document.querySelector("#merchants-view");
  const dashboardView = document.querySelector("#dashboard-view");
  const pageTitle = document.querySelector("#page-title");
  const showingText = document.querySelector("#showing-text");
  const addNewButton = document.querySelector("#add-new-button");
  const formContainer = document.querySelector("#form-container");

  pageTitle.textContent = "Items";
  showingText.textContent = "All Items";
  addNewButton.dataset.state = "item";

  show([itemsView, addNewButton]);
  hide([merchantsView, dashboardView, formContainer]);

  removeActiveNavClass();
  document.querySelector("#items-nav").classList.add("active-nav");

  itemsView.innerHTML = // pretty spwinnnaaa
    '<div class="empty-state"><i class="fas fa-spinner fa-spin"></i><p>Loading items...</p></div>';

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
