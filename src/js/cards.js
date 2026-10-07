import { isSaved } from './wishlist-store.js';
import { products } from './products.js';

export function createProductCard(product) {
  return `<article class="product-card">
    <div class="product-card__image-wrapper">
      <a href="./productcard.html?id=${product.id}" aria-label="View ${product.name}">
        <img class="product-card__image" src="${product.image}" alt="${product.name}" loading="lazy">
      </a>
      ${product.badge ? `<span class="product-card__badge product-card__badge--${product.badge.type}">${product.badge.text}</span>` : ''}
      <div class="product-card__overlay">
        <button class="product-card__cart" type="button" data-add-to-cart="${product.id}" aria-label="Add ${product.name} to cart">Add to cart</button>
        <button class="product-card__save" type="button" data-save-product="${product.id}" aria-pressed="${isSaved(product.id)}"><span aria-hidden="true">♡</span> <span data-save-label>${isSaved(product.id) ? 'Saved' : 'Save'}</span></button>
        <a class="product-card__details" href="./productcard.html?id=${product.id}">View details ↗</a>
      </div>
    </div>
    <div class="product-card__content">
      <h3 class="product-card__title"><a href="./productcard.html?id=${product.id}">${product.name}</a></h3>
      <p class="product-card__description">${product.description}</p>
      <div class="product-card__prices">
        <span class="product-card__price">${product.price}</span>
        ${product.oldPrice ? `<span class="product-card__old-price">${product.oldPrice}</span>` : ''}
      </div>
    </div>
  </article>`;
}

const list = document.querySelector('.products__list');
if (list) {
  list.innerHTML = products
    .slice(0, 8)
    .map((product) => `<li class="products__item">${createProductCard(product)}</li>`)
    .join('');
}
