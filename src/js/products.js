const products = [
  {
    name: 'Syltherine',
    description: 'Stylish cafe chair',
    price: 'Rp 2.500.000',
    oldPrice: 'Rp 3.500.000',
    image: './src/img/product/image1.jpeg',
    badge: {
      type: 'discount',
      text: '-30%',
    },
  },

  {
    name: 'Leviosa',
    description: 'Stylish cafe chair',
    price: 'Rp 2.500.000',
    image: './src/img/product/images2.png',
    badge: null,
  },

  {
    name: 'Lolito',
    description: 'Luxury big sofa',
    price: 'Rp 7.000.000',
    oldPrice: 'Rp 14.000.000',
    image: './src/img/product/images3.jpeg',
    badge: {
      type: 'discount',
      text: '-50%',
    },
  },

  {
    name: 'Respira',
    description: 'Outdoor bar table and stool',
    price: 'Rp 500.000',
    image: './src/img/product/images4.png',
    badge: {
      type: 'new',
      text: 'New',
    },
  },

  {
    name: 'Grifo',
    description: 'Outdoor bar table and stool',
    price: 'Rp 500.000',
    image: './src/img/product/images4.png',
  },

  {
    name: 'Muggo',
    description: 'Small mug',
    price: 'Rp 150.000',
    image: './src/img/product/images5.jpeg',
    badge: {
      type: 'new',
      text: 'New',
    },
  },

  {
    name: 'Pingky',
    description: 'Cute bed set',
    price: 'Rp 7.000.000',
    oldPrice: 'Rp 14.000.000',
    image: './src/img/product/images6.png',
    badge: {
      type: 'discount',
      text: '-50%',
    },
  },

  {
    name: 'Potty',
    description: 'OMinimalist flower pot',
    price: 'Rp 500.000',
    image: './src/img/product/image7.jpeg',
    badge: {
      type: 'new',
      text: 'New',
    },
  },
];

const productsList = document.querySelector('.products__list');

if (productsList) {
  productsList.innerHTML = products
    .map(
      (product) => `
        <li class="products__item">
          <article class="product-card">

            <div class="product-card__image-wrapper">
              <img
                class="product-card__image"
                src="${product.image}"
                alt="${product.name}"
              >

              <div class="product-card__overlay">
                  <button class="product-card__cart" type="button">
                Add to cart
                </button>
            
                  <div class="product-card__actions">
                <button type="button">Share</button>
                <button type="button">Compare</button>
                <button type="button">Like</button>
              </div>
            </div>

              ${
                product.badge
                  ? `
                    <span class="product-card__badge product-card__badge--${product.badge.type}">
                      ${product.badge.text}
                    </span>
                  `
                  : ''
              }
            </div>

            <div class="product-card__content">
              <h3 class="product-card__title">
                ${product.name}
              </h3>

              <p class="product-card__description">
                ${product.description}
              </p>

              <div class="product-card__prices">
                <span class="product-card__price">
                  ${product.price}
                </span>

                ${
                  product.oldPrice
                    ? `
                      <span class="product-card__old-price">
                        ${product.oldPrice}
                      </span>
                    `
                    : ''
                }
              </div>

            </div>

          </article>
        </li>
      `
    )
    .join('');
}
