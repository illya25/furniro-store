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
    image: './src/img/product/Images2.png',
    badge: null,
  },

  {
    name: 'Lolito',
    description: 'Luxury big sofa',
    price: 'Rp 7.000.000',
    oldPrice: 'Rp 14.000.000',
    image: './src/img/product/Images3.jpeg',
    badge: {
      type: 'discount',
      text: '-50%',
    },
  },

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
    name: 'Respira',
    description: 'Outdoor bar table and stool',
    price: 'Rp 500.000',
    image: './src/img/product/Images4.png',
    badge: {
      type: 'new',
      text: 'New',
    },
  },

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
    name: 'Grifo',
    description: 'Outdoor bar table and stool',
    price: 'Rp 500.000',
    image: './src/img/product/Images4.png',
    badge: null,
  },

  {
    name: 'Muggo',
    description: 'Small mug',
    price: 'Rp 150.000',
    image: './src/img/product/Images5.jpeg',
    badge: {
      type: 'new',
      text: 'New',
    },
  },

  {
    name: 'Muggo',
    description: 'Small mug',
    price: 'Rp 150.000',
    image: './src/img/product/Images5.jpeg',
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
    image: './src/img/product/Images6.png',
    badge: {
      type: 'discount',
      text: '-50%',
    },
  },

  {
    name: 'Potty',
    description: 'Minimalist flower pot',
    price: 'Rp 500.000',
    image: './src/img/product/image7.jpeg',
    badge: {
      type: 'new',
      text: 'New',
    },
  },

  {
    name: 'Muggo',
    description: 'Small mug',
    price: 'Rp 150.000',
    image: './src/img/product/Images5.jpeg',
    badge: {
      type: 'new',
      text: 'New',
    },
  },

  {
    name: 'Muggo',
    description: 'Small mug',
    price: 'Rp 150.000',
    image: './src/img/product/Images5.jpeg',
    badge: {
      type: 'new',
      text: 'New',
    },
  },

  {
    name: 'Muggo',
    description: 'Small mug',
    price: 'Rp 150.000',
    image: './src/img/product/Images5.jpeg',
    badge: {
      type: 'new',
      text: 'New',
    },
  },

  {
    name: 'Muggo',
    description: 'Small mug',
    price: 'Rp 150.000',
    image: './src/img/product/Images5.jpeg',
    badge: {
      type: 'new',
      text: 'New',
    },
  },

  {
    name: 'Muggo',
    description: 'Small mug',
    price: 'Rp 150.000',
    image: './src/img/product/Images5.jpeg',
    badge: {
      type: 'new',
      text: 'New',
    },
  },

  {
    name: 'Muggo',
    description: 'Small mug',
    price: 'Rp 150.000',
    image: './src/img/product/Images5.jpeg',
    badge: {
      type: 'new',
      text: 'New',
    },
  },

  {
    name: 'Muggo',
    description: 'Small mug',
    price: 'Rp 150.000',
    image: './src/img/product/Images5.jpeg',
    badge: {
      type: 'new',
      text: 'New',
    },
  },

  {
    name: 'Muggo',
    description: 'Small mug',
    price: 'Rp 150.000',
    image: './src/img/product/Images5.jpeg',
    badge: {
      type: 'new',
      text: 'New',
    },
  },

  {
    name: 'Muggo',
    description: 'Small mug',
    price: 'Rp 150.000',
    image: './src/img/product/Images5.jpeg',
    badge: {
      type: 'new',
      text: 'New',
    },
  },

  {
    name: 'San bad',
    description: 'Small mug',
    price: 'Rp 200.000',
    image: './src/img/product/Images4.png',
    badge: {
      type: 'new',
      text: 'New',
    },
  },
];

const imageUrls = import.meta.glob('../img/product/*', {
  eager: true,
  query: '?url',
  import: 'default',
});
products.forEach((product, index) => {
  product.id = index + 1;
  product.image = imageUrls[`../img/product/${product.image.split('/').pop()}`];
});

export function getNumericPrice(product) {
  return Number(product.price.replace(/\D/g, ''));
}

export function formatPrice(amount) {
  return `Rp ${new Intl.NumberFormat('id-ID').format(amount)}`;
}

export function searchProducts(query) {
  const term = query.trim().toLowerCase();
  return products.filter((product) =>
    `${product.name} ${product.description}`.toLowerCase().includes(term)
  );
}

export { products };
