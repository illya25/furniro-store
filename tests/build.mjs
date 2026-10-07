import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { JSDOM } from 'jsdom';

for (const file of [
  'index.html',
  'shop.html',
  'productcard.html',
  'about.html',
  'abaut.html',
  'contact.html',
]) {
  const html = await readFile(`dist/${file}`, 'utf8');
  const dom = new JSDOM(html, { url: `http://localhost/${file}?id=3`, runScripts: 'outside-only' });
  dom.window.HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute('open', '');
  };
  const document = dom.window.document;
  const script = document.querySelector('script[type="module"]');
  assert.ok(script, `${file} has an entry point`);
  const code = await readFile(`dist${new URL(script.src).pathname}`, 'utf8');
  dom.window.eval(code);
  assert.ok(document.querySelector('[data-open-cart]'), `${file} has a cart button`);
  assert.ok(document.querySelector('[data-open-search]'), `${file} has a search button`);
  assert.ok(document.querySelector('[data-open-wishlist]'));
  const save = document.querySelector('[data-save-product]');
  if (save) {
    save.click();
    assert.equal(document.querySelector('.header__wishlist-count').textContent, '1');
  }
  const add = document.querySelector('[data-add-to-cart]');
  if (add) {
    add.click();
    assert.equal(document.querySelector('.header__cart-count').textContent, '1');
  }
  const photo = document.querySelector('.gallery__item');
  if (photo) {
    photo.click();
    assert.equal(document.querySelector('.gallery-lightbox').open, true);
  }
  for (const img of document.querySelectorAll('img')) {
    assert.ok(
      !img.src.includes('/src/') && !img.src.includes('undefined'),
      `${file}: image is bundled: ${img.src}`
    );
    if (img.src.startsWith('data:')) continue;
    await access(`dist${decodeURI(new URL(img.src).pathname)}`);
  }
  dom.window.close();
  console.log(`PASS production ${file}: runtime, shared header, add to cart, all image assets`);
}
