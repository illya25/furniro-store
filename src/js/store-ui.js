import { products, searchProducts, formatPrice, getNumericPrice } from './products.js';
import {
  getCart,
  getCartCount,
  getCartTotal,
  addToCart,
  setQuantity,
  removeFromCart,
} from './cart-store.js';

export function initStoreUI() {
  document.body.insertAdjacentHTML(
    'beforeend',
    `
    <dialog class="store-dialog cart-drawer" id="cart-dialog" aria-labelledby="cart-title">
      <div class="store-dialog__heading"><div><p class="store-eyebrow">Your cart</p><h2 id="cart-title">Shopping cart</h2></div><button class="store-close" type="button" data-close-dialog aria-label="Close cart">×</button></div>
      <div class="cart-items"></div>
      <div class="cart-summary"><div><span>Subtotal</span><strong class="cart-total"></strong></div><p>Shipping and taxes calculated when ordering.</p><button class="store-primary" type="button" data-close-dialog>Continue shopping</button></div>
    </dialog>
    <dialog class="store-dialog search-dialog" id="search-dialog" aria-labelledby="search-title">
      <div class="store-dialog__heading"><div><p class="store-eyebrow">Product search</p><h2 id="search-title">Search furniture</h2></div><button class="store-close" type="button" data-close-dialog aria-label="Close search">×</button></div>
      <form class="store-search" action="./shop.html"><label class="visually-hidden" for="header-search">Search products</label><input id="header-search" name="q" type="search" placeholder="Try a chair, sofa or mug…" autocomplete="off"><button class="store-primary" type="submit">Search</button></form>
      <p class="search-count" role="status"></p><div class="search-results"></div>
    </dialog>
    <div class="store-toast" role="status" aria-live="polite"></div>`
  );
  const cartDialog = document.querySelector('#cart-dialog');
  const searchDialog = document.querySelector('#search-dialog');
  let toastTimer;
  function notify(message) {
    const toast = document.querySelector('.store-toast');
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2800);
  }
  function renderCart() {
    const count = getCartCount();
    const cartButton = document.querySelector('[data-open-cart]');
    cartButton.setAttribute('aria-label', `Shopping cart, ${count} items`);
    const badge = document.querySelector('.header__cart-count');
    badge.textContent = count;
    badge.hidden = count === 0;
    const rows = getCart();
    document.querySelector('.cart-items').innerHTML = rows.length
      ? rows
          .map((row) => {
            const product = products.find((item) => item.id === row.id);
            return `<article class="cart-item">
        <a href="./productcard.html?id=${product.id}"><img src="${product.image}" alt="${product.name}"></a>
        <div class="cart-item__info"><a href="./productcard.html?id=${product.id}">${product.name}</a><p>${product.price}</p>
          <div class="cart-item__quantity"><button type="button" data-cart-decrease="${product.id}" aria-label="Decrease ${product.name} quantity" ${row.quantity === 1 ? 'disabled' : ''}>−</button><span>${row.quantity}</span><button type="button" data-cart-increase="${product.id}" aria-label="Increase ${product.name} quantity" ${row.quantity === 99 ? 'disabled' : ''}>+</button></div>
        </div><div class="cart-item__end"><button type="button" data-cart-remove="${product.id}" aria-label="Remove ${product.name}">×</button><strong>${formatPrice(getNumericPrice(product) * row.quantity)}</strong></div>
      </article>`;
          })
          .join('')
      : '<div class="store-empty"><span aria-hidden="true">♡</span><h3>Your cart is waiting</h3><p>Discover something beautiful for your home.</p><a href="./shop.html" class="store-primary">Explore the shop</a></div>';
    document.querySelector('.cart-total').textContent = formatPrice(getCartTotal());
    document.querySelector('.cart-summary').hidden = !rows.length;
  }
  function renderSearch() {
    const query = document.querySelector('#header-search').value;
    const matches = searchProducts(query);
    document.querySelector('.search-count').textContent = query.trim()
      ? `${matches.length} products found`
      : 'Explore our collection';
    document.querySelector('.search-results').innerHTML = matches.length
      ? matches
          .slice(0, 8)
          .map(
            (product) =>
              `<a class="search-result" href="./productcard.html?id=${product.id}"><img src="${product.image}" alt="${product.name}"><span><strong>${product.name}</strong><small>${product.description}</small></span><b>${product.price}</b></a>`
          )
          .join('')
      : '<div class="store-empty"><h3>No products found</h3><p>Try another name or description.</p></div>';
  }
  for (const dialog of [cartDialog, searchDialog]) {
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) {
        const bounds = dialog.getBoundingClientRect();
        if (
          event.clientX < bounds.left ||
          event.clientX > bounds.right ||
          event.clientY < bounds.top ||
          event.clientY > bounds.bottom
        )
          dialog.close();
      }
    });
  }
  document.querySelector('#header-search').addEventListener('input', renderSearch);
  document.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.hasAttribute('data-open-cart')) cartDialog.showModal();
    if (button.hasAttribute('data-open-search')) {
      renderSearch();
      searchDialog.showModal();
      document.querySelector('#header-search').focus();
    }
    if (button.hasAttribute('data-close-dialog')) button.closest('dialog').close();
    if (button.hasAttribute('data-add-to-cart')) {
      const id = Number(button.dataset.addToCart);
      const quantity = button.closest('.product')
        ? Number(document.querySelector('[data-product-quantity]').textContent)
        : 1;
      addToCart(id, quantity);
      const product = products.find((item) => item.id === id);
      if (product) notify(`${product.name} added to your cart`);
    }
    for (const action of ['increase', 'decrease', 'remove']) {
      const value = button.getAttribute(`data-cart-${action}`);
      if (value === null) continue;
      const id = Number(value);
      const row = getCart().find((item) => item.id === id);
      if (!row) continue;
      if (action === 'remove') removeFromCart(id);
      else setQuantity(id, row.quantity + (action === 'increase' ? 1 : -1));
      const next =
        cartDialog.querySelector(`[data-cart-${action}="${id}"]:not(:disabled)`) ||
        cartDialog.querySelector('.store-close');
      next.focus();
    }
  });
  window.addEventListener('store:notify', (event) => notify(event.detail));
  window.addEventListener('cart:change', renderCart);
  renderCart();
}
