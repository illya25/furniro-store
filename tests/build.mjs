import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { JSDOM } from 'jsdom';
import viteConfig from '../vite.config.js';

const deploymentRoot = new URL(viteConfig.base, 'http://localhost');
function builtFile(url) {
  const resource = new URL(url, deploymentRoot);
  assert.equal(resource.origin, deploymentRoot.origin, `Local resource: ${url}`);
  assert.ok(
    resource.pathname.startsWith(deploymentRoot.pathname),
    `Resource stays inside ${deploymentRoot.pathname}: ${url}`
  );
  return `dist/${decodeURIComponent(resource.pathname.slice(deploymentRoot.pathname.length))}`;
}

for (const file of [
  'index.html',
  'shop.html',
  'productcard.html',
  'about.html',
  'abaut.html',
  'contact.html',
]) {
  const html = await readFile(`dist/${file}`, 'utf8');
  const dom = new JSDOM(html, {
    url: new URL(`${file}?id=3`, deploymentRoot).href,
    runScripts: 'outside-only',
  });
  dom.window.HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute('open', '');
  };
  const document = dom.window.document;
  const script = document.querySelector('script[type="module"]');
  assert.ok(script, `${file} has an entry point`);
  const code = await readFile(builtFile(script.src), 'utf8');
  assert.ok(
    !code.includes('src/components/'),
    'Components are bundled instead of fetched from source'
  );
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
    await access(builtFile(img.src));
  }
  for (const link of document.querySelectorAll('a[href], link[href]')) {
    const url = new URL(link.href);
    if (url.origin !== deploymentRoot.origin) continue;
    await access(builtFile(url));
  }
  dom.window.close();
  console.log(`PASS production ${file}: runtime, shared header, add to cart, all image assets`);
}
