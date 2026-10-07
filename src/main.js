import 'modern-normalize';
import './scss/main.scss';
import './js/cards.js';
import './js/roms.js';
import './js/shop.js';
import './js/product.js';
import { initWishlistUI } from './js/wishlist-ui.js';
import { initReveal } from './js/reveal.js';
import './js/contact.js';
import './js/gallery.js';
import { initStoreUI } from './js/store-ui.js';
import headerHtml from './components/header.html?raw';
import footerHtml from './components/footer.html?raw';
import benefitsHtml from './components/benefits.html?raw';

// Bundle component images as well as markup for production builds.
const componentAssets = import.meta.glob(['./img/icon/*.{svg,png}', './img/benefits/*'], {
  eager: true,
  query: '?url',
  import: 'default',
});
function renderComponent(selector, html) {
  const container = document.querySelector(selector);
  if (!container) return;
  container.innerHTML = html.replace(
    /(?:\/|\.\/)?src\/img\/[^"']+/g,
    (path) => componentAssets[path.replace(/^(?:\/|\.\/)?src\//, './')] || path
  );
}
renderComponent('#header', headerHtml);
renderComponent('#footer', footerHtml);
renderComponent('#benefits', benefitsHtml);
if (document.querySelector('.header')) {
  initStoreUI();
  initWishlistUI();
}
initReveal();
const pageName = window.location.pathname.split('/').pop() || 'index.html';
const currentPage = pageName === 'abaut.html' ? 'about.html' : pageName;
document.querySelectorAll('.header__nav a').forEach((link) => {
  if (link.getAttribute('href').replace('./', '') === currentPage)
    link.setAttribute('aria-current', 'page');
});
const burger = document.querySelector('.header__burger');
const header = document.querySelector('.header');
if (burger && header) {
  burger.addEventListener('click', () => {
    const open = header.classList.toggle('header--menu-open');
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
}

const newsletter = document.querySelector('.footer__form');
newsletter?.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!newsletter.reportValidity()) return;
  const note = document.querySelector('.footer-newsletter-note');
  try {
    localStorage.setItem('furniro-newsletter-email', newsletter.elements.email.value);
    note.textContent =
      'Preference saved on this device. No subscription email is sent in this demo.';
  } catch {
    note.textContent = 'Your browser could not save this preference.';
  }
});
// Close the mobile menu with Escape and keep its accessible state in sync.
const closeMenu = () => {
  header?.classList.remove('header--menu-open');
  burger?.setAttribute('aria-expanded', 'false');
  burger?.setAttribute('aria-label', 'Open menu');
};
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeMenu();
});
document.addEventListener('click', (event) => {
  if (header?.classList.contains('header--menu-open') && !header.contains(event.target))
    closeMenu();
});
