const rooms = [
  { image: 'room1.jpeg', category: 'Bedroom', title: 'Inner Peace' },
  { image: 'room2.jpeg', category: 'Living Room', title: 'Modern Living' },
  { image: 'room3.jpeg', category: 'Dining Room', title: 'Cozy Dining' },
];
const images = import.meta.glob('../img/room/*', { eager: true, query: '?url', import: 'default' });
const viewport = document.querySelector('.inspiration__viewport');
const track = document.querySelector('.inspiration__track');
const next = document.querySelector('.inspiration__next');
const previous = document.querySelector('.inspiration__previous');
const dotsContainer = document.querySelector('.inspiration__dots');

if (viewport && track && next && previous && dotsContainer) {
  let current = 0;
  let scrollTimer;
  const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  track.innerHTML = rooms
    .map(
      (
        room,
        index
      ) => `<article class="inspiration__slide" role="group" aria-roledescription="slide" aria-label="${index + 1} of ${rooms.length}: ${room.title}">
    <img class="inspiration__slide-image" src="${images[`../img/room/${room.image}`]}" alt="${room.category} with warm tones and thoughtful furniture" loading="lazy" draggable="false">
    <div class="inspiration__slide-content"><p class="inspiration__slide-category">${String(index + 1).padStart(2, '0')} — ${room.category}</p><h3 class="inspiration__slide-title">${room.title}</h3><a href="./shop.html" aria-label="Explore ${room.category} furniture">Explore the look <span aria-hidden="true">↗</span></a></div>
  </article>`
    )
    .join('');
  dotsContainer.innerHTML = rooms
    .map(
      (room, index) =>
        `<button class="inspiration__dot" type="button" aria-label="Show ${room.title}" data-slide="${index}"></button>`
    )
    .join('');
  const slides = [...track.children];
  const dots = [...dotsContainer.children];
  const position = (index) => slides[index].offsetLeft - slides[0].offsetLeft;
  const update = (index) => {
    current = index;
    slides.forEach((slide, value) => {
      slide.classList.toggle('inspiration__slide--active', value === current);
      slide.inert = value !== current;
    });
    dots.forEach((dot, value) => {
      dot.classList.toggle('inspiration__dot--active', value === current);
      if (value === current) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
    document.querySelector('.inspiration__count').textContent =
      `${String(current + 1).padStart(2, '0')} / ${String(rooms.length).padStart(2, '0')}`;
    document.querySelector('.inspiration__status').textContent =
      `${rooms[current].title}, slide ${current + 1} of ${rooms.length}`;
  };
  const goTo = (index, smooth = true) => {
    clearTimeout(scrollTimer);
    update((index + rooms.length) % rooms.length);
    viewport.scrollTo({
      left: position(current),
      behavior: smooth && !reducedMotion() ? 'smooth' : 'instant',
    });
  };
  next.addEventListener('click', () => goTo(current + 1));
  previous.addEventListener('click', () => goTo(current - 1));
  dots.forEach((dot, index) => dot.addEventListener('click', () => goTo(index)));
  viewport.addEventListener('keydown', (event) => {
    const destinations = {
      ArrowRight: current + 1,
      ArrowLeft: current - 1,
      Home: 0,
      End: rooms.length - 1,
    };
    if (!(event.key in destinations)) return;
    event.preventDefault();
    goTo(destinations[event.key]);
  });
  // Native scrolling gives touch devices swipe and momentum without blocking page scroll.
  viewport.addEventListener(
    'scroll',
    () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        const nearest = slides.reduce(
          (best, _, index) =>
            Math.abs(position(index) - viewport.scrollLeft) <
            Math.abs(position(best) - viewport.scrollLeft)
              ? index
              : best,
          0
        );
        update(nearest);
      }, 120);
    },
    { passive: true }
  );
  if (window.ResizeObserver) {
    new window.ResizeObserver(() => goTo(current, false)).observe(viewport);
  } else window.addEventListener('resize', () => goTo(current, false));
  update(0);
}
