import 'modern-normalize';
import './scss/main.scss';
import './js/products';
import './js/roms';

const headerContainer = document.querySelector('#header');
const footerContainer = document.querySelector('#footer');

// HEADER
if (headerContainer) {
  fetch('/src/components/header.html')
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Header error: ${response.status}`);
      }

      return response.text();
    })
    .then((html) => {
      headerContainer.innerHTML = html;

      // burger
      const burger = document.querySelector('.header__burger');
      const header = document.querySelector('.header');

      if (burger && header) {
        burger.addEventListener('click', () => {
          header.classList.toggle('header--menu-open');

          const isOpen = header.classList.contains('header--menu-open');

          burger.setAttribute('aria-expanded', isOpen);
        });
      }
    })
    .catch((error) => {
      console.error(error);
    });
}

// FOOTER
if (footerContainer) {
  fetch('/src/components/footer.html')
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Footer error: ${response.status}`);
      }

      return response.text();
    })
    .then((html) => {
      footerContainer.innerHTML = html;
    })
    .catch((error) => {
      console.error(error);
    });
}
