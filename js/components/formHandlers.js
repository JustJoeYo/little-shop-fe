import { showStatus } from "../../errorHandling.js";
import { postData } from "../../apiCalls.js";
import { getItems, getMerchants, setItems } from "../store/dataStore.js";
import { displayItems } from "../views/itemView.js";
import { displayAddedMerchant } from "../views/merchantView.js";
import { hide } from "../utils/domUtils.js";

export function setupItemForm() {
  const form = document.querySelector("#new-item-form");
  const merchantSelect = document.querySelector("#item-merchant-select");

  merchantSelect.innerHTML = "";
  const merchants = getMerchants();

  merchants.forEach((merchant) => {
    const option = document.createElement("option");
    option.value = merchant.id;
    option.textContent = merchant.attributes.name;
    merchantSelect.appendChild(option);
  });

  form.reset();
}

export function resetItemForm() {
  const form = document.querySelector("#new-item-form");
  if (form) form.reset();
}

export function submitItem(event) {
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
    hide([document.querySelector("#form-container")]);
    showStatus("Item successfully added!", true);
  });
}

export function submitMerchant(event) {
  event.preventDefault();

  const name = document.getElementById("new-merchant-name").value;

  if (!name.trim()) {
    showStatus("Merchant name is required", false);
    return;
  }

  postData("merchants", { name }).then((response) => {
    const merchant = response.data;
    displayAddedMerchant(merchant);

    const form = document.querySelector("#new-merchant-form");
    form.reset();

    hide([document.querySelector("#form-container")]);
    showStatus("Merchant successfully added!", true);
  });
}
