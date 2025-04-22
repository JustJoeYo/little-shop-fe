import { showStatus } from "../../errorHandling.js";
import { deleteData, editData } from "../../apiCalls.js";
import {
  getItems,
  getMerchants,
  findMerchant,
  setItems,
} from "../store/dataStore.js";
import { show, hide, removeActiveNavClass } from "../utils/domUtils.js";

export function displayItems(items = getItems()) {
  const itemsView = document.querySelector("#items-view");
  itemsView.innerHTML = "";
  let firstHundredItems = items.slice(0, 99);

  if (firstHundredItems.length === 0) {
    itemsView.innerHTML =
      '<div class="empty-state"><i class="fas fa-box-open"></i><p>No items found</p></div>';
    return;
  }

  firstHundredItems.forEach((item) => {
    let merchant = findMerchant(item.attributes.merchant_id);
    let merchantName = merchant ? merchant.attributes.name : "Unknown Merchant";

    itemsView.innerHTML += `
      <div class="item-card" id="item-${item.id}">
        <div class="card-header">
          <h3>${item.attributes.name}</h3>
          <div class="card-actions">
            <button class="btn-icon edit-item" title="Edit Item"><i class="fas fa-edit"></i></button>
            <button class="btn-icon delete-item" title="Delete Item"><i class="fas fa-trash-alt"></i></button>
          </div>
        </div>
        <div class="card-body">
          <div class="item-image">
            <i class="fas fa-cube"></i>
          </div>
          <div class="item-details">
            <p>${item.attributes.description}</p>
            <p class="item-price">$${item.attributes.unit_price}</p>
            <p class="item-merchant">Merchant: ${merchantName}</p>
          </div>
        </div>
      </div>
    `;
  });

  document.querySelectorAll(".edit-item").forEach((button) => {
    button.addEventListener("click", editItem);
  });

  document.querySelectorAll(".delete-item").forEach((button) => {
    button.addEventListener("click", deleteItem);
  });
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

export function editItem(event) {
  const card = event.target.closest(".item-card");
  const id = card.id.split("-")[1];
  const item = getItems().find((i) => i.id === id);

  if (!item) return;

  const formContainer = document.querySelector("#form-container");
  const itemForm = document.querySelector("#new-item-form");
  const merchantForm = document.querySelector("#new-merchant-form");
  const formTitle = document.querySelector("#form-title");
  const submitItemButton = document.querySelector("#submit-item");

  document.getElementById("new-item-name").value = item.attributes.name;
  document.getElementById("new-item-description").value =
    item.attributes.description;
  document.getElementById("new-item-price").value = item.attributes.unit_price;

  populateMerchantSelect();
  document.getElementById("item-merchant-select").value =
    item.attributes.merchant_id;

  formTitle.textContent = "Edit Item";
  submitItemButton.textContent = "Update Item";
  submitItemButton.dataset.itemId = id;

  show([formContainer, itemForm]);
  hide([merchantForm]);

  const newSubmitButton = submitItemButton.cloneNode(true);
  submitItemButton.parentNode.replaceChild(newSubmitButton, submitItemButton);

  newSubmitButton.addEventListener("click", function (event) {
    updateItem(event);
  });
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
    const formContainer = document.querySelector("#form-container");
    hide([formContainer]);
    showStatus("Item successfully updated!", true);

    const merchantsView = document.querySelector("#merchants-view");
    if (merchantsView.classList.contains("hidden")) {
      displayItems(getItems());
    } else {
      const pageTitle = document.querySelector("#page-title");
      const showingText = document.querySelector("#showing-text");

      pageTitle.textContent = "Merchants";
      showingText.textContent = "All Merchants";

      show([merchantsView]);
      hide([
        document.querySelector("#items-view"),
        document.querySelector("#dashboard-view"),
      ]);

      document.querySelector("#merchants-nav").click();
    }

    const submitItemButton = document.querySelector("#submit-item");
    submitItemButton.textContent = "Save Item";
    delete submitItemButton.dataset.itemId;
  });
}

function resetItemForm() {
  document.getElementById("new-item-name").value = "";
  document.getElementById("new-item-description").value = "";
  document.getElementById("new-item-price").value = "";
  document.getElementById("item-merchant-select").value = "";
}

export function showItemsView() {
  const pageTitle = document.querySelector("#page-title");
  const showingText = document.querySelector("#showing-text");
  const addNewButton = document.querySelector("#add-new-button");
  const merchantsView = document.querySelector("#merchants-view");
  const itemsView = document.querySelector("#items-view");
  const dashboardView = document.querySelector("#dashboard-view");
  const formContainer = document.querySelector("#form-container");
  const itemsNavButton = document.querySelector("#items-nav");

  pageTitle.textContent = "Items";
  showingText.textContent = "All Items";
  addNewButton.dataset.state = "item";

  show([itemsView, addNewButton]);
  hide([merchantsView, dashboardView, formContainer]);

  removeActiveNavClass();
  itemsNavButton.classList.add("active-nav");

  displayItems();
}
