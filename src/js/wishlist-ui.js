import { products } from './products.js';
import { getWishlist, isSaved, toggleSaved } from './wishlist-store.js';

export function initWishlistUI() {
  document.body.insertAdjacentHTML(
    'beforeend',
    `<dialog class="store-dialog cart-drawer wishlist-drawer" id="wishlist-dialog" aria-labelledby="wishlist-title">
    <div class="store-dialog__heading"><div><p class="store-eyebrow">Saved products</p><h2 id="wishlist-title">Your favorites</h2></div><button class="store-close" type="button" data-close-dialog aria-label="Close favorites">×</button></div>
    <p class="wishlist-note">Products you’ve saved for later.</p><div class="wishlist-items"></div>
  </dialog>`
  );
  const dialog = document.querySelector('#wishlist-dialog');
  function updateButtons() {
    document.querySelectorAll('[data-save-product]').forEach((button) => {
      const id = Number(button.dataset.saveProduct);
      const active = isSaved(id);
      const name = products.find((product) => product.id === id)?.name || 'product';
      button.setAttribute('aria-pressed', String(active));
      button.setAttribute(
        'aria-label',
        `${active ? 'Remove' : 'Save'} ${name} ${active ? 'from' : 'to'} favorites`
      );
      button.classList.toggle('is-saved', active);
      button.querySelector('[data-save-label]').textContent = active ? 'Saved' : 'Save';
    });
  }
  function render() {
    const ids = getWishlist();
    const badge = document.querySelector('.header__wishlist-count');
    badge.textContent = ids.length;
    badge.hidden = ids.length === 0;
    document
      .querySelector('[data-open-wishlist]')
      .setAttribute('aria-label', `Favorites, ${ids.length} saved products`);
    document.querySelector('.wishlist-items').innerHTML = ids.length
      ? ids
          .map((id) => {
            const product = products.find((item) => item.id === id);
            return `<article class="wishlist-item"><a class="wishlist-item__image" href="./productcard.html?id=${id}"><img src="${product.image}" alt="${product.name}"></a><div class="wishlist-item__info"><a href="./productcard.html?id=${id}">${product.name}</a><p>${product.price}</p><button class="wishlist-item__cart" type="button" data-add-to-cart="${id}">Add to cart</button></div><button class="wishlist-item__remove" type="button" data-remove-saved="${id}" aria-label="Remove ${product.name} from favorites">×</button></article>`;
          })
          .join('')
      : '<div class="store-empty"><span aria-hidden="true">♡</span><h3>No saved products yet</h3><p>Tap Save on a product to keep it here.</p><a class="store-primary" href="./shop.html">Browse products</a></div>';
    updateButtons();
  }
  document.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.hasAttribute('data-open-wishlist')) dialog.showModal();
    const value =
      button.getAttribute('data-save-product') ?? button.getAttribute('data-remove-saved');
    if (value === null) return;
    const id = Number(value);
    toggleSaved(id);
    const product = products.find((item) => item.id === id);
    if (product)
      window.dispatchEvent(
        new window.CustomEvent('store:notify', {
          detail: `${product.name} ${isSaved(id) ? 'saved to' : 'removed from'} favorites`,
        })
      );
    if (button.hasAttribute('data-remove-saved'))
      (dialog.querySelector('[data-remove-saved]') || dialog.querySelector('.store-close')).focus();
  });
  dialog.addEventListener('click', (event) => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    )
      dialog.close();
  });
  window.addEventListener('wishlist:change', render);
  window.addEventListener('products:render', updateButtons);
  render();
}
