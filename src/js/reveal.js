// Progressive enhancement: content stays visible when this API is unavailable.
export function initReveal() {
  const targets = document.querySelectorAll(
    '[data-reveal], .categories .container, .products .section-heading, .inspiration__content, .gallery__title, .benefits__item'
  );
  const motion = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  if (!window.IntersectionObserver || motion?.matches) return;
  const observer = new window.IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -24px 0px' }
  );
  targets.forEach((target) => {
    // The first viewport should never wait for a scroll event.
    if (target.getBoundingClientRect().top <= window.innerHeight) return;
    target.classList.add('reveal-pending');
    observer.observe(target);
  });
  document.addEventListener('focusin', (event) => {
    const target = event.target.closest('.reveal-pending');
    if (target) {
      target.classList.add('is-revealed');
      observer.unobserve(target);
    }
  });
  motion?.addEventListener('change', (event) => {
    if (event.matches) {
      targets.forEach((target) => target.classList.add('is-revealed'));
      observer.disconnect();
    }
  });
}
