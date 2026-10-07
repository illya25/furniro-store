import { searchProducts, getNumericPrice } from './products.js';
import { createProductCard } from './cards.js';

const grid = document.querySelector('.shop-products__grid');
if (grid) {
  const pagination = document.querySelector('.shop-pagination');
  const show = document.querySelector('.shop-toolbar__show');
  const sort = document.querySelector('.shop-toolbar__sort');
  const results = document.querySelector('.shop-toolbar__results');
  const filterButton = document.querySelector('.shop-toolbar__filter');
  const filters = document.querySelector('#shop-filters');
  const search = document.querySelector('#shop-search');
  const minimum = document.querySelector('#price-min');
  const maximum = document.querySelector('#price-max');
  let currentPage = 1;
  search.value = new URLSearchParams(window.location.search).get('q') || '';
  function render() {
    let matches = searchProducts(search.value).filter((product) => {
      const price = getNumericPrice(product);
      return (
        (!minimum.value || price >= Number(minimum.value)) &&
        (!maximum.value || price <= Number(maximum.value))
      );
    });
    if (sort.value === 'price-asc') matches.sort((a, b) => getNumericPrice(a) - getNumericPrice(b));
    if (sort.value === 'price-desc')
      matches.sort((a, b) => getNumericPrice(b) - getNumericPrice(a));
    if (sort.value === 'name-asc') matches.sort((a, b) => a.name.localeCompare(b.name));
    const perPage = Number(show.value);
    const totalPages = Math.ceil(matches.length / perPage);
    currentPage = Math.max(1, Math.min(currentPage, totalPages));
    const start = (currentPage - 1) * perPage;
    const visible = matches.slice(start, start + perPage);
    grid.innerHTML = visible.length
      ? visible.map(createProductCard).join('')
      : '<div class="store-empty shop-empty"><h3>No products found</h3><p>Try another search or adjust your price range.</p></div>';
    window.dispatchEvent(new Event('products:render'));
    results.textContent = matches.length
      ? `Showing ${start + 1}–${start + visible.length} of ${matches.length} results`
      : 'Showing 0 of 0 results';
    pagination.innerHTML = '';
    for (let page = 1; page <= totalPages && totalPages > 1; page++) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `shop-pagination__button${page === currentPage ? ' is-active' : ''}`;
      button.textContent = page;
      button.setAttribute('aria-label', `Page ${page}`);
      if (page === currentPage) button.setAttribute('aria-current', 'page');
      button.addEventListener('click', () => {
        currentPage = page;
        render();
        pagination.querySelector('[aria-current]').focus({ preventScroll: true });
        grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      pagination.append(button);
    }
  }
  for (const control of [search, minimum, maximum, show, sort]) {
    control.addEventListener(control.tagName === 'SELECT' ? 'change' : 'input', () => {
      currentPage = 1;
      render();
    });
  }
  filterButton.addEventListener('click', () => {
    filters.hidden = !filters.hidden;
    filterButton.setAttribute('aria-expanded', String(!filters.hidden));
  });
  filters.addEventListener('reset', () => {
    minimum.value = '';
    maximum.value = '';
    currentPage = 1;
    render();
  });
  filters.addEventListener('submit', (event) => event.preventDefault());
  render();
}
