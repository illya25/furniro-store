import { products } from './products.js';

const key = 'furniro-wishlist-v1';
export function normalizeWishlist(value) {
  return Array.isArray(value)
    ? [...new Set(value.filter((id) => products.some((product) => product.id === id)))]
    : [];
}
function read() {
  try {
    return normalizeWishlist(JSON.parse(localStorage.getItem(key) || '[]'));
  } catch {
    return [];
  }
}
let saved = read();
export const getWishlist = () => [...saved];
export const isSaved = (id) => saved.includes(id);
export function toggleSaved(id) {
  if (!products.some((product) => product.id === id)) return;
  saved = isSaved(id) ? saved.filter((value) => value !== id) : [...saved, id];
  try {
    localStorage.setItem(key, JSON.stringify(saved));
  } catch {
    /* Keep the list usable if browser storage is unavailable. */
  }
  window.dispatchEvent(new Event('wishlist:change'));
}
window.addEventListener('storage', (event) => {
  if (event.key === key || event.key === null) {
    saved = read();
    window.dispatchEvent(new Event('wishlist:change'));
  }
});
