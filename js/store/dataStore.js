let merchants = [];
let items = [];

export function getMerchants() {
  return merchants;
}

export function getItems() {
  return items;
}

export function setMerchants(data) {
  merchants = data;
}

export function setItems(data) {
  items = data;
}

export function findMerchant(id) {
  return merchants.find((merchant) => parseInt(merchant.id) === parseInt(id));
}

export function filterByMerchant(merchantId) {
  return items.filter(
    (item) => item.attributes.merchant_id === parseInt(merchantId)
  );
}

export function calculateAveragePrice() {
  if (items.length === 0) return "0.00";

  const total = items.reduce(
    (sum, item) => sum + parseFloat(item.attributes.unit_price),
    0
  );
  return (total / items.length).toFixed(2);
}
