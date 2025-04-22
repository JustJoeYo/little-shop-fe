import { showStatus } from "../../errorHandling.js";
import { editData } from "../../apiCalls.js";
import { getItems, setItems } from "../store/dataStore.js";

/**
 * Form for editing an item
 */
function setupItemEditForm(titleEl, descEl, priceEl, item) {
  // Create name edit
  titleEl.innerHTML = `
    <input type="text" class="edit-item-input-inline" value="${item.name}">
  `;

  // Create description edit
  descEl.innerHTML = `
    <textarea class="edit-item-textarea-inline">${item.description}</textarea>
  `;

  // Create price edit (has confirm/cancel as well here)
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

  // Get refs
  const nameInput = titleEl.querySelector(".edit-item-input-inline");
  const descInput = descEl.querySelector(".edit-item-textarea-inline");
  const priceInput = priceEl.querySelector(".edit-item-price-inline");

  // magically focus it so they start in the edit box on click
  nameInput.focus();

  // Confirm Button
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

  // Cancel button
  cancelBtn.addEventListener("click", () => {
    cancelItemEdit(titleEl, descEl, priceEl, item);
  });
}

/**
 * Save edited item
 */
function saveEditedItem(updatedItem, titleEl, descEl, priceEl) {
  // Do you have the produce Mr White.
  if (
    !updatedItem.name ||
    !updatedItem.description ||
    !updatedItem.unit_price
  ) {
    showStatus("Please fill out all fields", false);
    return;
  }

  // Cleanup format
  const unit_price = parseFloat(updatedItem.unit_price).toFixed(2);

  // Create model for item obj
  const itemData = {
    name: updatedItem.name,
    description: updatedItem.description,
    unit_price,
  };

  // Send to API
  editData(`items/${updatedItem.id}`, { item: itemData })
    .then(() => {
      // Update datastore
      updateItemInStore({
        ...updatedItem,
        unit_price,
      });

      // Update UI
      titleEl.innerHTML = updatedItem.name;
      descEl.innerHTML = updatedItem.description;
      priceEl.innerHTML = `$${unit_price}`;

      // Let em know it worked! (or didnt)
      showStatus("Item updated successfully!", true);
    })
    .catch((error) => {
      console.error("Error updating item:", error);

      // Put it BACKKKK!
      cancelItemEdit(titleEl, descEl, priceEl, updatedItem);
      showStatus("Error updating item. Please try again.", false);
    });
}

/**
 * Restore original values
 */
function cancelItemEdit(titleEl, descEl, priceEl, item) {
  titleEl.innerHTML = item.name;
  descEl.innerHTML = item.description;
  priceEl.innerHTML = `$${parseFloat(item.price).toFixed(2)}`;
}

/**
 * Update local data (datastore)
 */
function updateItemInStore(updatedItem) {
  const items = getItems();

  // Update item with values
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

  // Save updated items collection
  setItems(updatedItems);
}

export { setupItemEditForm };
