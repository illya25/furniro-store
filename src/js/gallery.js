const items = [...document.querySelectorAll('.gallery__item')];
if (items.length) {
  document.body.insertAdjacentHTML(
    'beforeend',
    `<dialog class="gallery-lightbox" aria-labelledby="gallery-caption">
    <div class="gallery-lightbox__heading"><p class="store-eyebrow">#FUNIROFURNITURE</p><button class="store-close" type="button" data-gallery-close aria-label="Close photo viewer">×</button></div>
    <img class="gallery-lightbox__image" alt="">
    <div class="gallery-lightbox__controls"><button type="button" data-gallery-previous aria-label="Previous photo">←</button><p id="gallery-caption" role="status" aria-live="polite"></p><button type="button" data-gallery-next aria-label="Next photo">→</button></div>
  </dialog>`
  );
  const dialog = document.querySelector('.gallery-lightbox');
  const image = dialog.querySelector('.gallery-lightbox__image');
  let current = 0;
  let opener;
  const show = (index) => {
    current = (index + items.length) % items.length;
    const source = items[current].querySelector('img');
    image.src = source.currentSrc || source.src;
    image.alt = source.alt;
    document.querySelector('#gallery-caption').textContent =
      `${current + 1} / ${items.length} · ${source.alt}`;
  };
  items.forEach((item, index) =>
    item.addEventListener('click', () => {
      opener = item;
      show(index);
      dialog.showModal();
    })
  );
  dialog.querySelector('[data-gallery-close]').addEventListener('click', () => dialog.close());
  dialog
    .querySelector('[data-gallery-previous]')
    .addEventListener('click', () => show(current - 1));
  dialog.querySelector('[data-gallery-next]').addEventListener('click', () => show(current + 1));
  dialog.addEventListener('close', () => opener?.focus({ preventScroll: true }));
  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      show(current + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  dialog.addEventListener('click', (event) => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    )
      dialog.close();
  });
}
