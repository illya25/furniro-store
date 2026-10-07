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

## GitHub Pages

Для репозиторію `illya25/furniro-store` у `vite.config.js` встановлено `base: '/furniro-store/'`.

1. У GitHub відкрий **Settings → Pages → Build and deployment → Source → GitHub Actions**.
2. Закоміть зміни та відправ їх у гілку `main`, включно з `.github/workflows/deploy.yml`.
3. У вкладці **Actions** дочекайся успішного завершення **Deploy Furniro to GitHub Pages**. Також можна запустити його вручну через **Run workflow**.

Адреса сайту: <https://illya25.github.io/furniro-store/>.

Workflow встановлює залежності, перевіряє код, збирає сайт і публікує лише `dist`. GitHub Pages не збирає Vite при звичайній публікації кореня гілки: `src/main.js` містить імпорти, які потрібно спочатку обробити збіркою. HTML-компоненти імпортуються через `?raw`, тому окремих запитів до `src/components` на опублікованому сайті немає.

Для локальної перевірки відкрий `http://localhost:4173/furniro-store/` після `npm run build` і `npm run preview`. Браузерні тести теж використовують цей шлях.

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
