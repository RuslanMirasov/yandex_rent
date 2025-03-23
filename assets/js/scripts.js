const slider = document.querySelector('.fobias');

const swiper = new Swiper(slider, {
  effect: 'fade',
  autoHeight: true,
  lazy: {
    loadOnTransitionStart: true,
    loadPrevNext: true,
    loadPrevNextAmount: 1,
  },
  allowTouchMove: false,
  on: {
    slideChange: () => {
      const currentSlide = swiper.slides[swiper.activeIndex];
      const fobia = currentSlide.dataset.fobia;

      if (fobia) {
        const newHash = `#fobia-${fobia}`;
        if (window.location.hash !== newHash) {
          history.replaceState(null, '', newHash);
        }
      }
    },
  },
});

const slideNext = e => {
  if (e.target.dataset.js !== 'next' && e.target.dataset.js !== 'on') return;
  if (e.target.dataset.js === 'on') {
    e.target.classList.add('on');
    const lamp = e.target.closest('.swiper-slide').querySelector('.lamp');
    lamp.classList.add('on');
    console.log(lamp);
    setTimeout(() => {
      swiper.slideNext();
    }, 300);
    return;
  }
  swiper.slideNext();
};

const changeHash = () => {
  const hash = window.location.hash;

  if (hash.startsWith('#fobia-')) {
    const targetFobia = hash.split('-')[1];
    const allSlides = slider.querySelectorAll('.swiper-slide');

    allSlides.forEach((slide, index) => {
      if (slide.dataset.fobia === targetFobia) {
        swiper.slideTo(index, 0);
      }
    });
  }
};

slider.addEventListener('click', slideNext);
document.addEventListener('DOMContentLoaded', changeHash);
window.addEventListener('hashchange', changeHash);
