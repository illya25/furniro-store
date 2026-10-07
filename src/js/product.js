import { products } from './products.js';

const productPage = document.querySelector('.product');

if (productPage) {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get('id') || String(products[0].id);

  const product = products.find((item) => String(item.id) === productId);

  if (!product) {
    document.title = 'Product not found | Furniro';
    productPage.innerHTML =
      '<div class="container store-empty"><h1>Product not found</h1><p>This item is not in our collection.</p><a class="store-primary" href="./shop.html">Browse the shop</a></div>';
    document.querySelector('.product-breadcrumb__current').textContent = 'Product not found';
  } else {
    renderProduct(product);
  }
}

function renderProduct(product) {
  document.title = `${product.name} | Furniro`;
  const saveButton = document.querySelector('.product__save');
  if (saveButton) saveButton.dataset.saveProduct = product.id;
  const cartButton = document.querySelector('.product__cart');
  if (cartButton) cartButton.dataset.addToCart = product.id;
  const quantity = document.querySelector('.product__quantity span');
  if (quantity) {
    quantity.dataset.productQuantity = '';
    const [decrease, increase] = document.querySelectorAll('.product__quantity button');
    decrease.setAttribute('aria-label', 'Decrease quantity');
    increase.setAttribute('aria-label', 'Increase quantity');
    decrease.disabled = true;
    const changeQuantity = (delta) => {
      const value = Math.max(1, Math.min(99, Number(quantity.textContent) + delta));
      quantity.textContent = value;
      decrease.disabled = value === 1;
      increase.disabled = value === 99;
    };
    decrease.addEventListener('click', () => changeQuantity(-1));
    increase.addEventListener('click', () => changeQuantity(1));
  }
  document.querySelector('[data-product-sku]').textContent =
    `FNR-${String(product.id).padStart(3, '0')}`;
  const title = document.querySelector('.product__title');
  const price = document.querySelector('.product__price');
  const description = document.querySelector('.product__description');
  const mainImage = document.querySelector('.product__main-image img');
  const breadcrumb = document.querySelector('.product-breadcrumb__current');

  if (title) {
    title.textContent = product.name;
  }

  if (price) {
    price.textContent = product.price;
  }

  if (description) {
    description.textContent = product.description;
  }

  if (mainImage) {
    mainImage.src = product.image;
    mainImage.alt = product.name;
  }

  if (breadcrumb) {
    breadcrumb.textContent = product.name;
  }
}
