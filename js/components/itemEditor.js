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
  // Do you have the product Mr White.
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

  // Create model for item obj - dont nest it.. figured that out the hard way.
  const itemData = {
    name: updatedItem.name,
    description: updatedItem.description,
    unit_price,
  };

  // Show loading spinny
  titleEl.innerHTML = `<span><i class="fas fa-spinner fa-spin"></i> Saving...</span>`;

  // Send to API - dont wrap in {item: itemData}
  editData(`items/${updatedItem.id}`, itemData)
    .then((response) => {
      // did we actually update it?
      if (response && response.data) {
        // Update datastore
        const serverUpdatedItem = response.data;
        updateItemInStore(serverUpdatedItem);

        // Update UI with data
        titleEl.innerHTML = serverUpdatedItem.attributes.name;
        descEl.innerHTML = serverUpdatedItem.attributes.description;
        priceEl.innerHTML = `$${parseFloat(
          serverUpdatedItem.attributes.unit_price
        ).toFixed(2)}`;

        // Let em know it worked!
        showStatus("Item updated successfully!", true);
      } else {
        throw new Error("Invalid server response");
      }
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

  // check item format
  const itemId = updatedItem.id;

  // Update itrem
  const updatedItems = items.map((item) => {
    if (item.id === itemId) {
      // check attributes
      if (updatedItem.attributes) {
        return {
          ...item,
          attributes: {
            ...item.attributes,
            name: updatedItem.attributes.name,
            description: updatedItem.attributes.description,
            unit_price: updatedItem.attributes.unit_price,
          },
        };
      } else {
        // check our attributes to see if it matches
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
    }
    return item;
  });

  // Save updated items collection
  setItems(updatedItems);
}

export { setupItemEditForm };
