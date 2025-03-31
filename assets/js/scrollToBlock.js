export const scrollToBlock = (selector, duration = 800, offset = 0) => {
  const element = document.querySelector(selector);
  if (!element) return;

  const targetY = element.getBoundingClientRect().top + window.scrollY + offset;
  const startY = window.scrollY;
  const startTime = performance.now();

  function scroll(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3); // easeOutCubic

    window.scrollTo(0, startY + (targetY - startY) * ease);

    if (progress < 1) {
      requestAnimationFrame(scroll);
    }
  }

  requestAnimationFrame(scroll);
};
