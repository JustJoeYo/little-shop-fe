import { showStatus } from "../../errorHandling.js";
import { editData } from "../../apiCalls.js";
import { getItems, setItems } from "../store/dataStore.js";

export function setupItemEditForm(titleEl, descEl, priceEl, item) {
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
