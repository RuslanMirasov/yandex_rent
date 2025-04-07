import { scrollToBlock } from './scrollToBlock.js';

const switchers = document.querySelectorAll('[data-switcher]');
const nextButtons = document.querySelectorAll('[data-next]');
const allSlides = document.querySelectorAll('.swiper-slide');
const slideCollection = Array.from(allSlides).map((slide, index) => ({ index, theme: slide.dataset.theme, hash: slide.dataset.hash }));

const onHashChange = () => {
  const hash = window.location.hash.split('#')[1];
  if (hash) {
    openSlide(hash);
    return;
  }
  openSlide('welcome');
};

const openSlide = hash => {
  if (!hash || !allSlides.length) return;
  const activeSlide = document.querySelector('.swiper-slide-active');
  const targetSlide = document.querySelector(`[data-hash="${hash}"]`);
  if (activeSlide) {
    activeSlide.classList.remove('swiper-slide-active');
  }
  if (targetSlide) {
    targetSlide.classList.add('swiper-slide-active');
    changeTheme(targetSlide.dataset.theme);
    return;
  }
  const mainSlide = allSlides[0];
  mainSlide.classList.add('swiper-slide-active');
  changeTheme(mainSlide.dataset.theme);
};

const changeTheme = theme => {
  if (!theme) return;
  document.body.classList.remove('day', 'night', 'form');
  document.body.classList.add(theme);
};

const goToNextSlide = () => {
  if (!slideCollection.length) return;
  let duration = 0;

  if (window.scrollY > 0) {
    duration = 300;
    scrollToBlock('body', duration);
  }

  setTimeout(() => {
    const currentHash = window.location.hash.split('#')[1] || slideCollection[0].hash;
    const currentIndex = slideCollection.find(slide => slide.hash === currentHash).index;

    if (currentIndex === slideCollection.length - 1) return;
    const nextHash = slideCollection[currentIndex + 1].hash;
    window.location.hash = nextHash;
  }, duration);
};

const turnOnTheLight = () => {
  const isMobil = window.outerWidth < 768;
  const duration = isMobil ? 0 : 300;
  !isMobil && document.body.classList.add('on');
  setTimeout(() => {
    !isMobil && document.body.classList.remove('on');
    goToNextSlide();
  }, duration);
};

document.addEventListener('DOMContentLoaded', onHashChange);
window.addEventListener('hashchange', onHashChange);
nextButtons.forEach(btn => btn.addEventListener('click', goToNextSlide));
switchers.forEach(switcher => switcher.addEventListener('click', turnOnTheLight));
