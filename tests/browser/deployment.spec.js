import { test, expect } from '@playwright/test';

const pages = [
  'index.html',
  'shop.html',
  'productcard.html?id=3',
  'about.html',
  'abaut.html',
  'contact.html',
];

test('GitHub Pages paths load all pages and assets without failed requests', async ({
  page,
  baseURL,
}) => {
  const root = new URL(baseURL);
  const failures = [];
  page.on('response', (response) => {
    if (new URL(response.url()).origin === root.origin && response.status() >= 400)
      failures.push(`${response.status()} ${response.url()}`);
  });
  await page.goto(baseURL);
  await expect(page.locator('.header')).toBeVisible();
  for (const path of pages) {
    await page.goto(path);
    await expect(page.locator('.header')).toBeVisible();
    await expect(page.locator('.footer')).toBeVisible();
    const images = await page.evaluate(async () => {
      const images = [...document.images].filter((image) => image.getAttribute('src'));
      images.forEach((image) => {
        image.loading = 'eager';
      });
      await Promise.all(images.map((image) => image.decode().catch(() => {})));
      return images.map((image) => ({ src: image.src, loaded: image.naturalWidth > 0 }));
    });
    expect(
      images.filter((image) => !image.loaded),
      `${path}: images decode`
    ).toEqual([]);
    const references = await page
      .locator('a[href], link[href], script[src], img[src], form[action]')
      .evaluateAll((elements) =>
        elements.map((element) => element.href || element.src || element.action)
      );
    for (const reference of references) {
      const url = new URL(reference);
      if (url.origin === root.origin)
        expect(url.pathname.startsWith(root.pathname), `${path}: ${reference}`).toBe(true);
    }
  }
  expect(failures).toEqual([]);
});

test('Home links, product breadcrumbs and search keep the repository prefix', async ({
  page,
  baseURL,
}) => {
  const root = new URL(baseURL);
  await page.goto('index.html');
  await page.locator('.products__button').click();
  await expect(page).toHaveURL(new URL('shop.html', root).href);
  await page.locator('.product-card__title a').first().click();
  await expect(page).toHaveURL(new URL('productcard.html?id=1', root).href);
  await page.locator('.product-breadcrumb__link').first().click();
  await expect(page).toHaveURL(new URL('index.html', root).href);
  await page.locator('[data-open-search]').click();
  await page.locator('#header-search').fill('Lolito');
  await page.locator('.store-search button').click();
  await expect(page).toHaveURL(new URL('shop.html?q=Lolito', root).href);
  await expect(page.locator('.product-card')).toHaveCount(1);
});
