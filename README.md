# Furniro

Адаптивний фронтенд магазину меблів на HTML, SCSS і JavaScript із Vite.

## Запуск

```sh
npm ci
npm run dev
```

Для статичного хостингу:

```sh
npm run build
npm run preview
```

Публікуй вміст `dist/`. Збірка включає Home, Shop, сторінку товару, About, Contact і сумісну адресу `abaut.html`.

## Можливості

- Спільні картки товарів із ховером на комп'ютері та постійними кнопками на сенсорних пристроях.
- Пошук із хедера й каталогу, фільтр за ціною, сортування та пагінація.
- Кошик із кількістю, сумою та видаленням товарів; обране через серце у хедері.
- Збереження стану між сторінками й перезавантаженнями через `localStorage`.
- Слайдер кімнат, галерея з переглядом фото та керуванням клавіатурою.
- Мобільне меню, плавна поява блоків і підтримка `prefers-reduced-motion`.

Це портфоліо-демо: каталог і контакти демонстраційні. Оплати та сервера замовлень немає. Контактна форма й поле підписки зберігають дані на пристрої та не надсилають листів.

## Перевірки

```sh
npm run lint
npm run lint:styles
npm test
npm run test:build
npm run test:browser
```

Playwright перевіряє готову збірку у Chromium на ширинах 320–1440 px. На macOS використовує встановлений Google Chrome; для іншої системи встанови Chromium командою `npx playwright install chromium` або задай `PLAYWRIGHT_CHROME_PATH`.

Звіт браузерних тестів: `playwright-report/index.html`. Скриншоти: `test-results/`. Навчальні пояснення та структура стилів — у [LEARNING.md](./LEARNING.md).

## Опис для портфоліо

**Furniro — responsive furniture storefront.** A multi-page front-end project built with HTML, SCSS, and vanilla JavaScript. Features include searchable and sortable product listings, a persistent shopping cart and favorites, a room carousel, and a keyboard-accessible photo gallery. Responsive layouts and key user flows are covered by automated browser tests.
