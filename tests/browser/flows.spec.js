import { test, expect } from '@playwright/test';

test('mobile navigation opens, closes and follows links', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('index.html');
  const menu = page.locator('.header__burger');
  const navigation = page.locator('.header__nav');
  await expect(navigation).toBeHidden();
  await menu.click();
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  await expect(navigation).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(navigation).toBeHidden();
  await menu.click();
  await navigation.getByRole('link', { name: 'Contact' }).click();
  await expect(page).toHaveURL(/contact.html$/);
  await expect(page.locator('.header__nav [aria-current="page"]')).toHaveText('Contact');
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
});

test('header search leads to filtered Shop, with sorting, pagination and reset', async ({
  page,
}) => {
  await page.goto('index.html');
  await page.locator('[data-open-search]').click();
  await expect(page.locator('#header-search')).toBeFocused();
  await page.locator('#header-search').fill('Lolito');
  await expect(page.locator('.search-result')).toHaveCount(1);
  await page.locator('.store-search button').click();
  await expect(page).toHaveURL(/shop.html\?q=Lolito$/);
  await expect(page.locator('.product-card')).toHaveCount(1);
  await expect(page.locator('.product-card__title')).toHaveText('Lolito');
  await page.locator('#shop-search').fill('no-such-furniture');
  await expect(page.locator('.shop-empty')).toBeVisible();
  await expect(page.locator('.shop-toolbar__results')).toHaveText('Showing 0 of 0 results');
  await page.locator('#shop-search').fill('');
  await page.getByRole('button', { name: 'Page 2', exact: true }).click();
  await expect(page.locator('.shop-toolbar__results')).toHaveText('Showing 17–21 of 21 results');
  await page.locator('.shop-toolbar__sort').selectOption('price-desc');
  await expect(page.locator('.product-card__price').first()).toHaveText('Rp 7.000.000');
  await page.locator('.shop-toolbar__filter').click();
  await page.locator('#price-min').fill('7000000');
  await expect(page.locator('.product-card')).toHaveCount(2);
  await page.locator('#price-max').fill('8000000');
  await expect(page.locator('.product-card')).toHaveCount(2);
  await page.locator('#shop-filters button[type="reset"]').click();
  await expect(page.locator('.product-card')).toHaveCount(16);
  await expect(page.locator('#price-min')).toHaveValue('');
  await expect(page.locator('#price-max')).toHaveValue('');
});

test('product quantity, cart totals and favorites survive navigation and reload', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 812 });
  await page.goto('productcard.html?id=3');
  await expect(page.locator('.product__title')).toHaveText('Lolito');
  await expect(page.getByRole('button', { name: 'Decrease quantity', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Increase quantity', exact: true }).click();
  await page.locator('.product__cart').click();
  await page.locator('.product__save').click();
  await page.reload();
  await expect(page.locator('.header__cart-count')).toHaveText('2');
  await expect(page.locator('.product__save')).toHaveAttribute('aria-pressed', 'true');
  await page.locator('[data-open-cart]').click();
  await expect(page.locator('.cart-total')).toHaveText('Rp 14.000.000');
  for (const selector of ['.store-close', '[data-cart-increase]', '[data-cart-remove]']) {
    const size = await page.locator(`#cart-dialog ${selector}`).boundingBox();
    expect(size.height).toBeGreaterThanOrEqual(44);
    expect(size.width).toBeGreaterThanOrEqual(44);
  }
  await page.locator('[data-cart-increase]').click();
  await expect(page.locator('.cart-total')).toHaveText('Rp 21.000.000');
  await page.locator('[data-cart-decrease]').click();
  await expect(page.locator('.cart-total')).toHaveText('Rp 14.000.000');
  expect(
    await page
      .locator('#cart-dialog')
      .evaluate((dialog) => dialog.scrollWidth <= dialog.clientWidth)
  ).toBe(true);
  await page.keyboard.press('Escape');
  await page.goto('shop.html');
  await page.locator('[data-open-wishlist]').click();
  await expect(page.locator('.wishlist-item')).toHaveCount(1);
  for (const selector of ['.wishlist-item__cart', '.wishlist-item__remove']) {
    const size = await page.locator(selector).boundingBox();
    expect(size.height).toBeGreaterThanOrEqual(44);
  }
  await page.locator('[data-remove-saved]').click();
  await expect(page.locator('.wishlist-item')).toHaveCount(0);
  await page.keyboard.press('Escape');
  await page.locator('[data-open-cart]').click();
  await page.locator('[data-cart-remove]').click();
  await expect(page.locator('.cart-item')).toHaveCount(0);
  await expect(page.locator('.cart-summary')).toBeHidden();
  await page.keyboard.press('Escape');
  await page.reload();
  await expect(page.locator('.header__cart-count')).toBeHidden();
  await expect(page.locator('.header__wishlist-count')).toBeHidden();
});

for (const width of [375, 768, 1440]) {
  test(`room slider aligns, loops and stays on the current slide after resize at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('index.html');
    const viewport = page.locator('.inspiration__viewport');
    const assertAligned = async (index) => {
      await expect(page.locator('.inspiration__count')).toHaveText(`0${index + 1} / 03`);
      await expect
        .poll(() =>
          viewport.evaluate((element, selected) => {
            const slides = element.querySelectorAll('.inspiration__slide');
            return Math.abs(
              element.scrollLeft - (slides[selected].offsetLeft - slides[0].offsetLeft)
            );
          }, index)
        )
        .toBeLessThan(2);
    };
    await page.locator('.inspiration__next').click();
    await assertAligned(1);
    await page.setViewportSize({ width: width === 1440 ? 375 : 1440, height: 900 });
    await assertAligned(1);
    await viewport.focus();
    await page.keyboard.press('End');
    await assertAligned(2);
    await page.locator('.inspiration__next').click();
    await assertAligned(0);
    // Exercise native scroll events as well as the explicit buttons.
    await viewport.evaluate((element) => {
      const slides = element.querySelectorAll('.inspiration__slide');
      element.scrollTo({ left: slides[1].offsetLeft - slides[0].offsetLeft, behavior: 'instant' });
    });
    await assertAligned(1);
    await expect(page.locator('.inspiration__dot[aria-current]')).toHaveAttribute(
      'data-slide',
      '1'
    );
  });
}

test('all gallery photos open, keyboard controls work and focus returns on Escape', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('index.html');
  const photos = page.locator('.gallery__item');
  await expect(photos).toHaveCount(7);
  for (let index = 0; index < 7; index++) {
    await photos.nth(index).click();
    await expect(page.locator('.gallery-lightbox')).toBeVisible();
    await expect(page.locator('#gallery-caption')).toContainText(`${index + 1} / 7`);
    await expect
      .poll(() =>
        page
          .locator('.gallery-lightbox__image')
          .evaluate((image) => image.complete && image.naturalWidth > 0)
      )
      .toBe(true);
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('#gallery-caption')).toContainText(`${((index + 1) % 7) + 1} / 7`);
    await page.keyboard.press('ArrowLeft');
    await expect(page.locator('#gallery-caption')).toContainText(`${index + 1} / 7`);
    await page.keyboard.press('Escape');
    await expect(page.locator('.gallery-lightbox')).toBeHidden();
    await expect(photos.nth(index)).toBeFocused();
  }
});

test('contact validation blocks invalid input and valid demo message is saved locally', async ({
  page,
}) => {
  await page.goto('contact.html');
  await page.locator('#contact-form button[type="submit"]').click();
  await expect(page.locator('#contact-status')).toBeHidden();
  expect(await page.evaluate(() => localStorage.getItem('furniro-contact-draft'))).toBeNull();
  await page.locator('#contact-name').fill('Alex');
  await page.locator('#contact-email').fill('invalid');
  await page.locator('#contact-message').fill('Could you help me choose furniture for my room?');
  await page.locator('#contact-form button[type="submit"]').click();
  await expect(page.locator('#contact-status')).toBeHidden();
  await page.locator('#contact-email').fill('alex@example.com');
  await page.locator('#contact-form button[type="submit"]').click();
  await expect(page.locator('#contact-status')).toContainText('does not send emails');
  await expect(page.locator('#contact-status')).toBeFocused();
  const draft = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('furniro-contact-draft'))
  );
  expect(draft.email).toBe('alex@example.com');
  expect(draft.message).toContain('choose furniture');
});

test('scroll reveals content and reduced motion keeps all content visible', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('about.html');
  const target = page.locator('.reveal-pending').last();
  await expect(target).toHaveCSS('opacity', '0');
  await target.scrollIntoViewIfNeeded();
  await expect(target).toHaveCSS('opacity', '1');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  await expect(page.locator('.reveal-pending')).toHaveCount(0);
  await expect(page.locator('[data-reveal]').last()).toHaveCSS('opacity', '1');
});

test('unknown product has a usable path back to the shop', async ({ page }) => {
  await page.goto('productcard.html?id=999');
  await expect(page.getByRole('heading', { name: 'Product not found' })).toBeVisible();
  await page.getByRole('link', { name: 'Browse the shop' }).click();
  await expect(page.locator('.product-card').first()).toBeVisible();
});

test('a native touch swipe changes the room and synchronizes its indicator', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
    viewport: { width: 375, height: 812 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  await page.goto('index.html');
  const viewport = page.locator('.inspiration__viewport');
  await viewport.scrollIntoViewIfNeeded();
  const box = await viewport.boundingBox();
  const session = await context.newCDPSession(page);
  await session.send('Input.synthesizeScrollGesture', {
    x: Math.round(box.x + box.width * 0.85),
    y: Math.round(box.y + box.height * 0.5),
    xDistance: -Math.round(box.width * 0.85),
    yDistance: 0,
    speed: 400,
    gestureSourceType: 'touch',
  });
  await expect(page.locator('.inspiration__count')).toHaveText('02 / 03');
  await expect(page.locator('.inspiration__dot[aria-current]')).toHaveAttribute('data-slide', '1');
  await context.close();
});
