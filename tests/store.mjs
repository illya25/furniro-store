import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';
import { createServer } from 'vite';

async function page(file, query, verify, savedCart, savedWishlist) {
  const dom = new JSDOM(await readFile(file, 'utf8'), { url: `http://localhost/${file}${query}` });
  for (const name of ['window', 'document', 'localStorage', 'Event', 'StorageEvent']) {
    Object.defineProperty(globalThis, name, { configurable: true, value: dom.window[name] });
  }
  dom.window.HTMLElement.prototype.scrollIntoView = function () {};
  // jsdom has no native dialog implementation; test its event wiring here.
  dom.window.HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute('open', '');
  };
  dom.window.HTMLDialogElement.prototype.close = function () {
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  };
  if (savedWishlist) localStorage.setItem('furniro-wishlist-v1', savedWishlist);
  if (savedCart) localStorage.setItem('furniro-cart-v1', savedCart);
  const server = await createServer({
    server: { middlewareMode: true, hmr: false, ws: false },
    optimizeDeps: { noDiscovery: true },
    appType: 'custom',
  });
  try {
    await server.ssrLoadModule('/src/main.js');
    const store = await server.ssrLoadModule('/src/js/cart-store.js');
    const data = await server.ssrLoadModule('/src/js/products.js');
    const wishlist = await server.ssrLoadModule('/src/js/wishlist-store.js');
    await verify(store, data, wishlist);
    return localStorage.getItem('furniro-cart-v1');
  } finally {
    await server.close();
    dom.window.close();
  }
}
const $ = (selector) => document.querySelector(selector);
const all = (selector) => [...document.querySelectorAll(selector)];
function change(selector, value, type = 'input') {
  $(selector).value = value;
  $(selector).dispatchEvent(new Event(type, { bubbles: true }));
}

const savedCart = await page('index.html', '', (store, data) => {
  assert.equal(all('.products__list .product-card').length, 8);
  assert.equal(all('.products__list [data-add-to-cart]').length, 8);
  assert.ok(all('.product-card img').every((img) => !img.src.includes('undefined')));
  assert.ok($('.header__logo img').src.includes('/src/img/icon/logo.png'));
  assert.equal($('.header__cart-count').hidden, true);
  $('[data-open-cart]').click();
  assert.equal($('#cart-dialog').open, true);
  assert.match($('.cart-items').textContent, /Your cart is waiting/);
  $('#cart-dialog [data-close-dialog]').click();
  const url = window.location.href;
  $('[data-add-to-cart="1"]').click();
  $('[data-add-to-cart="1"]').click();
  assert.equal(window.location.href, url, 'Add to cart must not navigate');
  assert.equal(store.getCartCount(), 2);
  assert.equal(store.getCartTotal(), 5000000);
  assert.equal($('.header__cart-count').textContent, '2');
  assert.match($('.store-toast').textContent, /Syltherine added/);
  $('[data-open-cart]').click();
  assert.equal(all('.cart-item').length, 1);
  $('[data-cart-decrease="1"]').click();
  assert.equal(store.getCartCount(), 1);
  assert.equal($('[data-cart-decrease="1"]').disabled, true);
  $('[data-cart-increase="1"]').click();
  assert.equal(store.getCartCount(), 2);
  assert.equal($('.cart-total').textContent, 'Rp 5.000.000');
  $('#cart-dialog [data-close-dialog]').click();
  $('[data-open-search]').click();
  assert.equal($('#search-dialog').open, true);
  change('#header-search', '  LoLiTo ');
  assert.equal(all('.search-result').length, 1);
  assert.match($('.search-result').href, /productcard.html\?id=3$/);
  change('#header-search', '<script>missing</script>');
  assert.equal(all('.search-result').length, 0);
  assert.match($('.search-results').textContent, /No products found/);
  assert.equal($('.search-results script'), null);
  assert.equal(data.getNumericPrice(data.products[2]), 7000000);
  assert.deepEqual(
    store.normalizeCart([
      { id: 999, quantity: 1 },
      { id: 1, quantity: -1 },
      null,
      { id: 1, quantity: 2 },
      { id: 1, quantity: 3 },
    ]),
    [{ id: 1, quantity: 5 }]
  );
});
console.log(
  'PASS home: shared cards, cart dialog, add/increase/decrease, totals, search, invalid stored rows'
);

await page(
  'shop.html',
  '?q=chair',
  (store, data) => {
    assert.equal(store.getCartCount(), 2, 'Cart persists between pages');
    assert.equal($('#shop-search').value, 'chair');
    assert.equal(
      all('.shop-products__grid .product-card').length,
      data.searchProducts('chair').length
    );
    change('#shop-search', '');
    assert.equal(all('.shop-products__grid .product-card').length, 16);
    assert.equal(all('.shop-products__grid .product-card__overlay').length, 16);
    assert.match($('.shop-toolbar__results').textContent, /1–16 of 21/);
    all('.shop-pagination button')[1].click();
    assert.equal(all('.shop-products__grid .product-card').length, 5);
    assert.match($('.shop-toolbar__results').textContent, /17–21/);
    change('.shop-toolbar__show', '8', 'change');
    assert.equal(all('.shop-products__grid .product-card').length, 8);
    change('.shop-toolbar__sort', 'price-desc', 'change');
    assert.equal($('.shop-products__grid .product-card__title').textContent, 'Lolito');
    change('.shop-toolbar__sort', 'price-asc', 'change');
    assert.equal($('.shop-products__grid .product-card__title').textContent, 'Muggo');
    $('.shop-toolbar__filter').click();
    assert.equal($('#shop-filters').hidden, false);
    assert.equal($('.shop-toolbar__filter').getAttribute('aria-expanded'), 'true');
    change('#price-min', '1000000');
    change('#price-max', '3000000');
    assert.equal(all('.shop-products__grid .product-card').length, 4);
    change('.shop-toolbar__sort', 'default', 'change');
    assert.equal(
      all('.shop-products__grid .product-card').length,
      4,
      'Default sort must preserve filtering'
    );
    change('#shop-search', 'missing');
    assert.match($('.shop-products__grid').textContent, /No products found/);
    assert.equal(all('.shop-pagination button').length, 0);
    change('#shop-search', 'chair');
    $('#shop-filters').reset();
    assert.equal($('#price-min').value, '');
    assert.equal(all('.shop-products__grid .product-card').length, 4);
    $('[data-add-to-cart="2"]').click();
    assert.equal(store.getCartCount(), 3);
    $('[data-open-cart]').click();
    $('[data-cart-remove="1"]').click();
    $('[data-cart-remove="2"]').click();
    assert.equal(store.getCartCount(), 0);
    assert.equal($('.header__cart-count').hidden, true);
    localStorage.setItem('furniro-cart-v1', '[{"id":3,"quantity":2}]');
    window.dispatchEvent(new StorageEvent('storage', { key: 'furniro-cart-v1' }));
    assert.equal(store.getCartTotal(), 14000000);
    store.setQuantity(3, 1000);
    assert.equal(store.getCartCount(), 99);
    store.addToCart(3, -2);
    assert.equal(store.getCartCount(), 99);
    localStorage.setItem('furniro-cart-v1', 'bad json');
    window.dispatchEvent(new StorageEvent('storage', { key: 'furniro-cart-v1' }));
    assert.equal(store.getCartCount(), 0);
  },
  savedCart
);
console.log(
  'PASS shop: persistence, pagination, sorting, search with price filters, reset, removal, cross-tab sync, corrupted storage'
);

await page('productcard.html', '?id=3', (store) => {
  assert.equal($('.product__title').textContent, 'Lolito');
  assert.equal(document.title, 'Lolito | Furniro');
  assert.equal($('.product__main-image img').alt, 'Lolito');
  assert.equal($('[data-product-sku]').textContent, 'FNR-003');
  all('.product__quantity button')[1].click();
  all('.product__quantity button')[1].click();
  $('.product__cart').click();
  assert.equal(store.getCartCount(), 3);
  assert.equal(store.getCartTotal(), 21000000);
});
await page('productcard.html', '?id=999', () => {
  assert.match($('.product').textContent, /Product not found/);
});
await page('about.html', '', () => {
  assert.ok($('[data-open-search]'));
  assert.ok($('[data-open-cart]'));
});
console.log(
  'PASS product/about: correct details, quantity added to cart, missing product, shared header'
);

await page('index.html', '', (store, data, wishlist) => {
  const url = window.location.href;
  $('.header__burger').click();
  assert.equal($('.header__burger').getAttribute('aria-expanded'), 'true');
  document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  assert.equal($('.header__burger').getAttribute('aria-expanded'), 'false');
  const newsletter = $('.footer__form');
  newsletter.elements.email.value = 'alex@example.com';
  newsletter.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
  assert.equal(localStorage.getItem('furniro-newsletter-email'), 'alex@example.com');
  assert.match($('.footer-newsletter-note').textContent, /No subscription email/);
  assert.equal($('.header__wishlist-count').hidden, true);
  $('[data-save-product="1"]').click();
  assert.equal(window.location.href, url);
  assert.deepEqual(wishlist.getWishlist(), [1]);
  assert.equal($('[data-save-product="1"]').getAttribute('aria-pressed'), 'true');
  assert.equal($('.header__wishlist-count').textContent, '1');
  assert.equal(localStorage.getItem('furniro-wishlist-v1'), '[1]');
  $('[data-open-wishlist]').click();
  assert.equal($('#wishlist-dialog').open, true);
  assert.equal(all('.wishlist-item').length, 1);
  $('.wishlist-item [data-add-to-cart]').click();
  assert.equal(store.getCartCount(), 1);
  assert.deepEqual(wishlist.getWishlist(), [1], 'Adding to cart preserves the favorite');
  $('[data-remove-saved="1"]').click();
  assert.deepEqual(wishlist.getWishlist(), []);
  assert.equal($('.header__wishlist-count').hidden, true);
  assert.equal($('[data-save-product="1"]').getAttribute('aria-pressed'), 'false');
  assert.deepEqual(wishlist.normalizeWishlist([1, 1, 999, null, '2', 3]), [1, 3]);
  localStorage.setItem('furniro-wishlist-v1', 'bad json');
  window.dispatchEvent(new StorageEvent('storage', { key: 'furniro-wishlist-v1' }));
  assert.deepEqual(wishlist.getWishlist(), []);
});
await page(
  'shop.html',
  '',
  (store, data, wishlist) => {
    assert.equal($('.header__wishlist-count').textContent, '1');
    assert.equal($('[data-save-product="1"]').getAttribute('aria-pressed'), 'true');
    change('.shop-toolbar__sort', 'price-desc', 'change');
    assert.equal($('[data-save-product="1"]').getAttribute('aria-pressed'), 'true');
    change('#shop-search', 'Syltherine');
    $('[data-save-product="1"]').click();
    assert.deepEqual(wishlist.getWishlist(), []);
    localStorage.setItem('furniro-wishlist-v1', '[2,3]');
    window.dispatchEvent(new StorageEvent('storage', { key: 'furniro-wishlist-v1' }));
    assert.equal($('.header__wishlist-count').textContent, '2');
  },
  undefined,
  '[1]'
);
await page(
  'productcard.html',
  '?id=3',
  (store, data, wishlist) => {
    assert.equal($('.product__save').getAttribute('aria-pressed'), 'true');
    $('.product__save').click();
    assert.deepEqual(wishlist.getWishlist(), []);
    $('.product__save').click();
    assert.deepEqual(wishlist.getWishlist(), [3]);
  },
  undefined,
  '[3]'
);
console.log(
  'PASS favorites: home/shop/product buttons, persistence, removal, cart, dynamic cards, cross-tab sync'
);

await page('contact.html', '', () => {
  assert.ok($('#header .header'));
  assert.ok($('#footer .footer'));
  assert.equal($('.header__nav a[aria-current]').textContent, 'Contact');
  assert.equal($('#contact-form').checkValidity(), false);
  $('#contact-form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  assert.equal(localStorage.getItem('furniro-contact-draft'), null);
  change('#contact-name', 'Alex');
  change('#contact-email', 'alex@example.com');
  change('#contact-message', 'I would like help choosing a chair.');
  assert.equal($('#contact-form').checkValidity(), true);
  $('#contact-form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  assert.match($('#contact-status').textContent, /does not send emails/);
  assert.equal(JSON.parse(localStorage.getItem('furniro-contact-draft')).name, 'Alex');
});
await page('abaut.html', '', () => {
  assert.ok($('.brand-story'));
  assert.equal(all('.value-card').length, 3);
  assert.equal(all('.faq-list details').length, 3);
  assert.ok($('#header .header'));
});
console.log(
  'PASS contact/about: content, navigation, required fields, local form draft, abaut alias'
);

await page('about.html', '', async () => {
  const { initReveal } = await import('../src/js/reveal.js');
  const target = $('.brand-story');
  target.getBoundingClientRect = () => ({ top: 2000 });
  let callback;
  const observed = new Set();
  window.IntersectionObserver = class {
    constructor(fn) {
      callback = fn;
    }
    observe(node) {
      observed.add(node);
    }
    unobserve(node) {
      observed.delete(node);
    }
    disconnect() {
      observed.clear();
    }
  };
  window.matchMedia = () => ({ matches: false, addEventListener() {} });
  initReveal();
  assert.ok(target.classList.contains('reveal-pending'));
  assert.ok(observed.has(target));
  callback([{ target, isIntersecting: true }]);
  assert.ok(target.classList.contains('is-revealed'));
  assert.ok(!observed.has(target));
  target.className = 'brand-story';
  window.matchMedia = () => ({ matches: true });
  initReveal();
  assert.ok(!target.classList.contains('reveal-pending'));
});
console.log('PASS scroll effects: offscreen observation, one-time reveal, reduced-motion fallback');

await page('index.html', '', async () => {
  const viewport = $('.inspiration__viewport');
  const slides = all('.inspiration__slide');
  const dots = all('.inspiration__dot');
  let step = 340;
  let lastScroll;
  slides.forEach((slide, index) =>
    Object.defineProperty(slide, 'offsetLeft', { configurable: true, get: () => index * step })
  );
  viewport.scrollTo = (options) => {
    lastScroll = options;
    viewport.scrollLeft = options.left;
  };
  assert.equal(slides.length, 3);
  assert.equal($('.inspiration__count').textContent, '01 / 03');
  $('.inspiration__next').click();
  assert.equal(lastScroll.left, 340);
  assert.equal(dots[1].getAttribute('aria-current'), 'true');
  assert.equal(slides[0].inert, true);
  assert.equal(slides[1].inert, false);
  $('.inspiration__previous').click();
  $('.inspiration__previous').click();
  assert.equal($('.inspiration__count').textContent, '03 / 03');
  assert.equal(lastScroll.left, 680);
  viewport.dispatchEvent(
    new window.KeyboardEvent('keydown', { key: 'Home', bubbles: true, cancelable: true })
  );
  assert.equal($('.inspiration__count').textContent, '01 / 03');
  viewport.dispatchEvent(
    new window.KeyboardEvent('keydown', { key: 'End', bubbles: true, cancelable: true })
  );
  assert.equal(lastScroll.left, 680);
  step = 200;
  window.dispatchEvent(new Event('resize'));
  assert.equal(lastScroll.left, 400, 'Resize keeps the current slide aligned');
  assert.equal(lastScroll.behavior, 'instant');
  viewport.scrollLeft = 200;
  viewport.dispatchEvent(new Event('scroll'));
  await new Promise((resolve) => setTimeout(resolve, 160));
  assert.equal(
    $('.inspiration__count').textContent,
    '02 / 03',
    'Touch scroll updates the active dot and status'
  );
  window.matchMedia = () => ({ matches: true });
  dots[0].click();
  assert.equal(lastScroll.behavior, 'instant', 'Reduced motion disables smooth scrolling');

  const photos = all('.gallery__item');
  assert.equal(photos.length, 7);
  photos[2].click();
  const dialog = $('.gallery-lightbox');
  assert.equal(dialog.open, true);
  assert.equal($('.gallery-lightbox__image').src, photos[2].querySelector('img').src);
  $('[data-gallery-next]').click();
  assert.match($('#gallery-caption').textContent, /^4 \/ 7/);
  dialog.dispatchEvent(
    new window.KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true, cancelable: true })
  );
  assert.match($('#gallery-caption').textContent, /^3 \/ 7/);
  $('[data-gallery-close]').click();
  assert.equal(dialog.open, false);
  assert.equal(document.activeElement, photos[2], 'Closing restores focus to the clicked photo');
  photos[0].click();
  $('[data-gallery-previous]').click();
  assert.match($('#gallery-caption').textContent, /^7 \/ 7/);
});
console.log(
  'PASS home media: carousel arrows, wrapping, keyboard, responsive alignment, swipe sync, reduced motion, gallery viewer and focus'
);
