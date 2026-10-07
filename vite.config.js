import { defineConfig } from 'vite';

export default defineConfig({
  base: '/furniro-store/',

  build: {
    rollupOptions: {
      input: {
        home: 'index.html',
        shop: 'shop.html',
        product: 'productcard.html',
        about: 'about.html',
        contact: 'contact.html',
        abaut: 'abaut.html',
      },
    },
  },
});
