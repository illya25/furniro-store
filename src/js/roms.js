const rooms = [
  {
    image: './src/img/room/room1.jpeg',
    category: 'Bed Room',
    title: 'Inner Peace',
  },
  {
    image: './src/img/room/room2.jpeg',
    category: 'Living Room',
    title: 'Modern Living',
  },
  {
    image: './src/img/room/room3.jpeg',
    category: 'Dining Room',
    title: 'Cozy Dining',
  },
  {
    image: './src/img/room/room1.jpeg',
    category: 'Swim Room',
    title: 'Dring',
  },
];

const track = document.querySelector('.inspiration__track');
const nextButton = document.querySelector('.inspiration__next');
const dotsContainer = document.querySelector('.inspiration__dots');

if (track && nextButton && dotsContainer) {
  let currentSlide = 0;

  track.innerHTML = rooms
    .map(
      (room) => `
        <article class="inspiration__slide">
          <img
            class="inspiration__slide-image"
            src="${room.image}"
            alt="${room.title}"
          >

          <div class="inspiration__slide-content">
            <p class="inspiration__slide-category">
              ${room.category}
            </p>

            <h3 class="inspiration__slide-title">
              ${room.title}
            </h3>
          </div>
        </article>
      `
    )
    .join('');

  dotsContainer.innerHTML = rooms
    .map(
      (_, index) => `
        <button
          class="inspiration__dot ${index === 0 ? 'inspiration__dot--active' : ''}"
          type="button"
          aria-label="Go to slide ${index + 1}"
        ></button>
      `
    )
    .join('');

  const slides = document.querySelectorAll('.inspiration__slide');
  const dots = document.querySelectorAll('.inspiration__dot');

  const updateSlider = () => {
    const slideWidth = slides[0].offsetWidth;
    const gap = 24;

    track.style.transform = `translateX(-${currentSlide * (slideWidth + gap)}px)`;

    slides.forEach((slide, index) => {
      slide.classList.toggle('inspiration__slide--active', index === currentSlide);
    });

    dots.forEach((dot, index) => {
      dot.classList.toggle('inspiration__dot--active', index === currentSlide);
    });
  };

  updateSlider();

  nextButton.addEventListener('click', () => {
    currentSlide += 1;

    if (currentSlide >= slides.length) {
      currentSlide = 0;
    }

    updateSlider();
  });

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      currentSlide = index;

      updateSlider();
    });
  });
}
