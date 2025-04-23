import { showStatus } from "../../errorHandling.js";
import { editData } from "../../apiCalls.js";
import { getMerchants, setMerchants } from "../store/dataStore.js";

/**
 * Edit merchantd name
 */
function setupMerchantEditForm(element, currentName, id) {
  element.dataset.originalName = currentName
  // Create edit form on el
  element.innerHTML = `
    <input type="text" class="edit-merchant-input-inline" value="${currentName}">
    <div class="edit-actions">
      <button class="btn-icon confirm-merchant-edit" title="Confirm"><i class="fas fa-check"></i></button>
      <button class="btn-icon cancel-merchant-edit" title="Cancel"><i class="fas fa-times"></i></button>
    </div>
  `;

  // starts them in the input box auto-magically!
  const inputField = element.querySelector(".edit-merchant-input-inline");
  inputField.focus();

  // Confirm button
  element
    .querySelector(".confirm-merchant-edit")
    .addEventListener("click", () => {
      saveEditedMerchant(inputField.value, element, id);
    });

  // Cancel button
  element
    .querySelector(".cancel-merchant-edit")
    .addEventListener("click", () => {
      // Put it back to before edits
      element.innerHTML = currentName;
    });
}

/**
 * Save edited merchant name
 */
function saveEditedMerchant(newName, element, id) {
  // If nothing happened dont do anything.
  if (newName.trim() === "" || newName === element.dataset.originalName) {
    element.innerHTML = element.dataset.originalName || newName;
    return;
  }

  // Create the model for merchant obj
  const merchantData = {
    name: newName,
  };

  // Send to API
  editData(`merchants/${id}`, { merchant: merchantData })
    .then(() => {
      // Update element with new name
      element.innerHTML = newName;

      // Update our local merchants data (the stops from constant requests to database)
      updateMerchantInStore(id, newName);

      // Let em know it worked! (once again, or if it didnt)
      showStatus("Merchant updated successfully!", true);
    })
    .catch((error) => {
      console.error("Error updating merchant:", error);

      // reset cause it didnt work
      element.innerHTML = element.dataset.originalName || "Unknown";

      showStatus("Error updating merchant. Please try again.", false);
    });
}

/**
 * Update merchant on our datastore
 */
function updateMerchantInStore(id, newName) {
  const merchants = getMerchants();

  // Update merchant with new name
  const updatedMerchants = merchants.map((merchant) => {
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

  // Save updated merchants collection
  setMerchants(updatedMerchants);
}

export { setupMerchantEditForm };
