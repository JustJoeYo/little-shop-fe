import { showStatus } from "../../errorHandling.js";
import { editData } from "../../apiCalls.js";
import { getMerchants, setMerchants } from "../store/dataStore.js";

export function setupMerchantEditForm(element, currentName, id) {
  element.innerHTML = `
    <input type="text" class="edit-merchant-input-inline" value="${currentName}">
    <div class="edit-actions">
      <button class="btn-icon confirm-merchant-edit" title="Confirm"><i class="fas fa-check"></i></button>
      <button class="btn-icon cancel-merchant-edit" title="Cancel"><i class="fas fa-times"></i></button>
    </div>
  `;

  const inputField = element.querySelector(".edit-merchant-input-inline");
  inputField.focus();

  element
    .querySelector(".confirm-merchant-edit")
    .addEventListener("click", () => {
      saveEditedMerchant(inputField.value, element, id);
    });

  element
    .querySelector(".cancel-merchant-edit")
    .addEventListener("click", () => {
      element.innerHTML = currentName;
    });
}

function saveEditedMerchant(newName, element, id) {
  if (!newName.trim()) {
    showStatus("Merchant name cannot be empty", false);
    return;
  }

  editData(`merchants/${id}`, { name: newName }).then(() => {
    element.innerHTML = newName;
    updateMerchantInStore(id, newName);
    showStatus("Merchant successfully updated!", true);
  });
}

function updateMerchantInStore(id, newName) {
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
}
