import { showStatus } from "../../errorHandling.js";
import { deleteData, editData } from "../../apiCalls.js";
import {
  getMerchants,
  findMerchant,
  filterByMerchant,
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

  merchants.forEach((merchant) => {
    merchantsView.innerHTML += `
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
          ${
            merchant.attributes.item_count
              ? `<p>Items: ${merchant.attributes.item_count}</p>`
              : ""
          }
        </div>
        <div class="card-footer">
          <button class="btn-secondary view-merchant-items">View Items</button>
        </div>
      </div>
    `;
  });

  merchantsView.addEventListener("click", handleMerchantClicks);
}

export function displayAddedMerchant(merchant) {
  const merchantsView = document.querySelector("#merchants-view");
  const newMerchantCard = document.createElement("div");
  newMerchantCard.className = "merchant-card";
  newMerchantCard.id = `merchant-${merchant.id}`;
  newMerchantCard.innerHTML = `
    <div class="card-header">
      <h3 class="merchant-name">${merchant.attributes.name}</h3>
      <div class="card-actions">
        <button class="btn-icon edit-merchant" title="Edit Merchant"><i class="fas fa-edit"></i></button>
        <button class="btn-icon delete-merchant" title="Delete Merchant"><i class="fas fa-trash-alt"></i></button>
      </div>
    </div>
    <div class="card-body">
      <p>ID: ${merchant.id}</p>
    </div>
    <div class="card-footer">
      <button class="btn-secondary view-merchant-items">View Items</button>
    </div>
  `;

  merchantsView.appendChild(newMerchantCard);
}

function handleMerchantClicks(event) {
  const target = event.target;

  if (
    target.classList.contains("delete-merchant") ||
    (target.parentElement &&
      target.parentElement.classList.contains("delete-merchant"))
  ) {
    deleteMerchant(event);
  } else if (
    target.classList.contains("edit-merchant") ||
    (target.parentElement &&
      target.parentElement.classList.contains("edit-merchant"))
  ) {
    editMerchant(event);
  } else if (target.classList.contains("view-merchant-items")) {
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

function editMerchant(event) {
  const card = event.target.closest(".merchant-card");
  const merchantNameElement = card.querySelector(".merchant-name");
  const currentName = merchantNameElement.textContent;
  const id = card.id.split("-")[1];

  merchantNameElement.innerHTML = `
    <input type="text" class="edit-merchant-input-inline" value="${currentName}">
    <div class="edit-actions">
      <button class="btn-icon confirm-merchant-edit" title="Confirm"><i class="fas fa-check"></i></button>
      <button class="btn-icon cancel-merchant-edit" title="Cancel"><i class="fas fa-times"></i></button>
    </div>
  `;

  card.querySelector(".edit-merchant-input-inline").focus();

  card.querySelector(".confirm-merchant-edit").addEventListener("click", () => {
    const newName = card.querySelector(".edit-merchant-input-inline").value;

    if (!newName.trim()) {
      showStatus("Merchant name cannot be empty", false);
      return;
    }

    const patchBody = { name: newName };
    editData(`merchants/${id}`, patchBody).then((patchResponse) => {
      merchantNameElement.innerHTML = newName;

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

      showStatus("Merchant successfully updated!", true);
    });
  });

  card.querySelector(".cancel-merchant-edit").addEventListener("click", () => {
    merchantNameElement.innerHTML = currentName;
  });
}

function displayMerchantItems(event) {
  const merchantId = event.target.closest(".merchant-card").id.split("-")[1];
  if (window.showMerchantItems) {
    window.showMerchantItems(merchantId);
  } else {
    console.error("showMerchantItems function not available");
  }
}

export function showMerchantsView() {
  const pageTitle = document.querySelector("#page-title");
  const showingText = document.querySelector("#showing-text");
  const addNewButton = document.querySelector("#add-new-button");
  const merchantsView = document.querySelector("#merchants-view");
  const itemsView = document.querySelector("#items-view");
  const dashboardView = document.querySelector("#dashboard-view");
  const formContainer = document.querySelector("#form-container");
  const merchantsNavButton = document.querySelector("#merchants-nav");

  pageTitle.textContent = "Merchants";
  showingText.textContent = "All Merchants";
  addNewButton.dataset.state = "merchant";

  show([merchantsView, addNewButton]);
  hide([itemsView, dashboardView, formContainer]);

  removeActiveNavClass();
  merchantsNavButton.classList.add("active-nav");

  displayMerchants(getMerchants());
}

export function displayItems(items) {
  console.log(items);
}
