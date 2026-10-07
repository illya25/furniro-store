import { products, getNumericPrice } from './products.js';

const key = 'furniro-cart-v1';
export function normalizeCart(value) {
  if (!Array.isArray(value)) return [];
  const rows = new Map();
  for (const item of value) {
    if (
      !item ||
      !products.some((product) => product.id === item.id) ||
      !Number.isInteger(item.quantity) ||
      item.quantity < 1
    )
      continue;
    rows.set(item.id, {
      id: item.id,
      quantity: Math.min(99, (rows.get(item.id)?.quantity || 0) + item.quantity),
    });
  }
  return [...rows.values()];
}
function readCart() {
  try {
    return normalizeCart(JSON.parse(localStorage.getItem(key) || '[]'));
  } catch {
    return [];
  }
}
let cart = readCart();
export const getCart = () => cart.map((item) => ({ ...item }));
export const getCartCount = () => cart.reduce((sum, item) => sum + item.quantity, 0);
export const getCartTotal = () =>
  cart.reduce(
    (sum, item) =>
      sum + getNumericPrice(products.find((product) => product.id === item.id)) * item.quantity,
    0
  );
function save() {
  try {
    localStorage.setItem(key, JSON.stringify(cart));
  } catch {
    /* The cart stays usable when browser storage is unavailable. */
  }
  window.dispatchEvent(new Event('cart:change'));
}
export function addToCart(id, quantity = 1) {
  if (!products.some((product) => product.id === id) || !Number.isInteger(quantity) || quantity < 1)
    return;
  const row = cart.find((item) => item.id === id);
  if (row) row.quantity = Math.min(99, row.quantity + quantity);
  else cart.push({ id, quantity: Math.min(99, quantity) });
  save();
}
export function setQuantity(id, quantity) {
  if (!Number.isInteger(quantity) || quantity < 1) return;
  const row = cart.find((item) => item.id === id);
  if (row) {
    row.quantity = Math.min(99, quantity);
    save();
  }
}
export function removeFromCart(id) {
  cart = cart.filter((item) => item.id !== id);
  save();
}
window.addEventListener('storage', (event) => {
  if (event.key === key || event.key === null) {
    cart = readCart();
    window.dispatchEvent(new Event('cart:change'));
  }
});
