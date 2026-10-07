import { test, expect } from '@playwright/test';

const pages = ['index.html', 'shop.html', 'productcard.html?id=3', 'about.html', 'contact.html'];
const widths = [320, 375, 480, 540, 768, 900, 1024, 1440];
for (const width of widths) {
  for (const path of pages) {
    test(`${path} fits ${width}px`, async ({ page }, testInfo) => {
      const errors = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.setViewportSize({ width, height: 900 });
      await page.goto(path);
      await expect(page.locator('.header')).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      const overflow = await page.evaluate(() => ({
        viewport: window.innerWidth,
        width: document.documentElement.scrollWidth,
        offenders: [...document.querySelectorAll('body *')]
          .filter((element) => {
            if (element.closest('.inspiration__viewport') || element.closest('dialog'))
              return false;
            const rect = element.getBoundingClientRect();
            const style = getComputedStyle(element);
            return (
              style.display !== 'none' &&
              rect.width > 0 &&
              (rect.right > innerWidth + 1 || rect.left < -1)
            );
          })
          .map((element) => element.className),
      }));
      expect(overflow.width, JSON.stringify(overflow)).toBeLessThanOrEqual(width + 1);
      expect(errors).toEqual([]);
      if (width === 375 || width === 768 || (width === 1440 && path === 'index.html')) {
        await page.evaluate(() =>
          document
            .querySelectorAll('.reveal-pending')
            .forEach((element) => element.classList.add('is-revealed'))
        );
        await page.evaluate(async () => {
          const images = [...document.images];
          images.forEach((image) => {
            image.loading = 'eager';
          });
          await Promise.all(
            images.filter((image) => image.src).map((image) => image.decode().catch(() => {}))
          );
        });
        await page.screenshot({
          path: testInfo.outputPath('page.png'),
          fullPage: true,
          animations: 'disabled',
        });
        if (path === 'index.html') {
          for (const selector of ['.hero', '.inspiration', '.gallery', '.footer'])
            await page.locator(selector).screenshot({
              path: testInfo.outputPath(selector.slice(1) + '.png'),
              animations: 'disabled',
            });
          await page
            .locator('.product-card')
            .first()
            .screenshot({ path: testInfo.outputPath('card.png'), animations: 'disabled' });
        }
      }
    });
  }
}

test('Home and Shop use the same product columns', async ({ page }) => {
  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('index.html');
    const home = await page
      .locator('.products__list')
      .evaluate((grid) => getComputedStyle(grid).gridTemplateColumns.split(' ').length);
    await page.goto('shop.html');
    const shop = await page
      .locator('.shop-products__grid')
      .evaluate((grid) => getComputedStyle(grid).gridTemplateColumns.split(' ').length);
    expect(shop, `columns at ${width}px`).toBe(home);
  }
});

test('desktop hover, cart and save controls', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('shop.html');
  const card = page.locator('.product-card').first();
  await card.hover();
  await expect(card.locator('.product-card__overlay')).toHaveCSS('opacity', '1');
  await card.locator('[data-save-product]').click();
  await expect(page.locator('.header__wishlist-count')).toHaveText('1');
  await card.locator('[data-add-to-cart]').click();
  await expect(page.locator('.header__cart-count')).toHaveText('1');
  await page.locator('.shop-search label').click();
  await expect(card.locator('.product-card__overlay')).toHaveCSS('opacity', '0');
});

test('phone controls are usable and do not cover the image', async ({ browser, baseURL }) => {
  const context = await browser.newContext({
    baseURL,
    viewport: { width: 375, height: 812 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  await page.goto('shop.html');
  const card = page.locator('.product-card').first();
  await card.scrollIntoViewIfNeeded();
  const image = await card.locator('.product-card__image').boundingBox();
  const controls = await card.locator('.product-card__overlay').boundingBox();
  expect(controls.y).toBeGreaterThanOrEqual(image.y + image.height - 1);
  for (const selector of ['[data-add-to-cart]', '[data-save-product]']) {
    const box = await card.locator(selector).boundingBox();
    expect(box.height, `${selector} tap target`).toBeGreaterThanOrEqual(44);
  }
  await card.locator('[data-save-product]').tap();
  await page.locator('[data-open-wishlist]').tap();
  await expect(page.locator('#wishlist-dialog')).toBeVisible();
  await page.locator('#wishlist-dialog [data-close-dialog]').tap();
  await card.locator('[data-add-to-cart]').tap();
  await page.locator('[data-open-cart]').tap();
  await expect(page.locator('.cart-item')).toHaveCount(1);
  await expect(page.locator('#cart-dialog')).toBeVisible();
  await context.close();
});
