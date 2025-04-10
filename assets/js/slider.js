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
  if (document.body.classList.contains('in-processe')) return;
  const activeSlides = document.querySelectorAll('.swiper-slide-active');
  const targetSlide = document.querySelector(`[data-hash="${hash}"]`) || allSlides[0];
  document.body.classList.add('in-processe');
  document.body.classList.remove('show-slide');

  setTimeout(() => {
    if (activeSlides.length > 0) {
      activeSlides.forEach(slide => {
        slide.classList.remove('swiper-slide-active');
      });
    }
  }, 600);

  setTimeout(() => {
    changeTheme(targetSlide.dataset.theme);
    if (targetSlide) {
      document.body.classList.add('show-slide');
      targetSlide.classList.add('swiper-slide-active');
    }
    document.body.classList.remove('in-processe');
  }, 610);
};

const changeTheme = theme => {
  if (!theme) return;
  document.body.classList.remove('day', 'night', 'form');
  document.body.classList.add(theme);
};

const goToNextSlide = () => {
  if (document.body.classList.contains('in-processe')) return;
  if (!slideCollection.length) return;
  let duration = 0;

  if (window.scrollY > 0) {
    duration = 400;
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

document.addEventListener('DOMContentLoaded', onHashChange);
window.addEventListener('hashchange', onHashChange);
nextButtons.forEach(btn => btn.addEventListener('click', goToNextSlide));
switchers.forEach(switcher => switcher.addEventListener('click', goToNextSlide));
