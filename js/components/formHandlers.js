import { showStatus } from "../../errorHandling.js";
import { postData } from "../../apiCalls.js";
import { getItems, getMerchants, setItems } from "../store/dataStore.js";
import { displayItems } from "../views/itemView.js";
import { displayAddedMerchant } from "../views/merchantView.js";
import { hide } from "../utils/domUtils.js";

/**
 * Item form
 */
function setupItemForm() {
  const form = document.querySelector("#new-item-form");
  const merchantSelect = document.querySelector("#item-merchant-select");

  merchantSelect.innerHTML = "";

  // Get all merchants
  const merchants = getMerchants();

  // Indiv. merchants button
  merchants.forEach((merchant) => {
    const option = document.createElement("option");
    option.value = merchant.id;
    option.textContent = merchant.attributes.name;
    merchantSelect.appendChild(option);
  });

  // Reset form
  form.reset();
}

/**
 * Clear inputs
 */
function resetItemForm() {
  const form = document.querySelector("#new-item-form");
  if (form) form.reset();
}

/**
 * Submit a new item
 */
function submitItem(event) {
  event.preventDefault();

  // Grab all the item details
  const name = document.querySelector("#new-item-name").value;
  const description = document.querySelector("#new-item-description").value;
  const price = document.querySelector("#new-item-price").value;
  const merchantId = document.querySelector("#item-merchant-select").value;
  const formContainer = document.querySelector("#form-container");

  // Make sure we got everything we need
  if (!name || !description || !price || !merchantId) {
    showStatus("Please fill out all fields", false);
    return;
  }

  const itemData = {
    name,
    description,
    unit_price: price,
    merchant_id: merchantId,
  };

  postData("items", itemData)
    .then((response) => {
      // Get new items
      const newItem = response.data;

      // Add to datastore
      const currentItems = getItems();
      setItems([...currentItems, newItem]);

      // Show items
      displayItems();
      hide([formContainer]);

      // Reset form
      document.querySelector("#new-item-form").reset();

      // Let em know it worked!
      showStatus("Item added successfully!", true);
    })
    .catch((error) => {
      console.error("Error adding item:", error);
      showStatus("Error adding item. Please try again.", false);
    });
}

/**
 * New merchant
 */
function submitMerchant(event) {
  event.preventDefault();

  // Grab merchant name from form
  const name = document.querySelector("#merchant-name").value;
  const formContainer = document.querySelector("#form-container");

  // sanity checker
  if (!name) {
    showStatus("Please enter a merchant name", false);
    return;
  }

  // Build the merchant data
  const merchantData = {
    name,
  };

  // Send to api
  postData("merchants", { merchant: merchantData })
    .then((response) => {
      // Show merchant
      displayAddedMerchant(response.data);

      // reset/hide form
      hide([formContainer]);
      document.querySelector("#merchant-name").value = "";

      // Let em know it worked! (or didnt)
      showStatus("Merchant added successfully!", true);
    })
    .catch((error) => {
      console.error("Error adding merchant:", error);
      showStatus("Error adding merchant. Please try again.", false);
    });
}

export { setupItemForm, resetItemForm, submitItem, submitMerchant };
