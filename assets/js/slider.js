import { scrollToBlock } from './scrollToBlock.js';

const switchers = document.querySelectorAll('[data-switcher]');
const nextButtons = document.querySelectorAll('[data-next]');
const allSlides = document.querySelectorAll('.swiper-slide');
const slideCollection = Array.from(allSlides).map((slide, index) => ({ index, theme: slide.dataset.theme, hash: slide.dataset.hash }));

let activeSlideTimer = null;
let slideViewTimer = null; // Таймер для просмотра слайда

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

  // Сбрасываем предыдущий таймер просмотра слайда
  clearTimeout(slideViewTimer);

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

    // Запускаем новый таймер просмотра слайда
    slideViewTimer = setTimeout(() => {
      handleSlideViewed(targetSlide);
    }, 3000);
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

const handleSlideViewed = (slide) => {
  const hash = slide.dataset.hash;
  console.log(`Слайд с hash "${hash}" просмотрен 3 секунды`);

  switch (hash) {
    case 'welcome':
      // Здесь можно добавить дополнительную логику
      // Например, зарегистрировать событие или выполнить другое действие
      registerEvent(`StartPageViewed`);
        break;
    case 'fobia-price':
        registerEvent(`1FearPageViewed`);
        break;
    case 'fobia-price-is-done':
        registerEvent(`1SolutionPageViewed`);
        break;
    case 'fobia-pets':
        registerEvent(`2FearPageViewed`);
        break;
    case 'fobia-pets-is-done':
        registerEvent(`2SolutionPageViewed`);
        break;
    case 'fobia-party':
        registerEvent(`3FearPageViewed`);
        break;
    case 'fobia-party-is-done':
        registerEvent(`3SolutionPageViewed`);
        registerEvent(`PopUpWithContestViewed`);
        break;
    case 'fobia-letter':
        registerEvent(`4FearPageViewed`);
        break;
    case 'fobia-letter-is-done':
        registerEvent(`4SolutionPageViewed`);
        break;
    case 'fobia-person':
        registerEvent(`5FearPageViewed`);
        break;
    case 'fobia-person-is-done':
        registerEvent(`5SolutionPageViewed`);
        break;
    case 'fobia-key':
        registerEvent(`6FearPageViewed`);
        break;
    case 'fobia-key-is-done':
        registerEvent(`6SolutionPageViewed`);
        break;
    case 'fobia-neighbours':
        registerEvent(`7FearPageViewed`);
        break;
    case 'fobia-neighbours-is-done':
        registerEvent(`7SolutionPageViewed`);
        break;
    case 'subscribe':
        registerEvent(`FinalPageViewed`);
        break;
    default:
        throw new Error(`Неизвестный data-hash=${hash}`)
  }

};

document.addEventListener('DOMContentLoaded', onHashChange);
window.addEventListener('hashchange', onHashChange);
nextButtons.forEach(btn => btn.addEventListener('click', goToNextSlide));
switchers.forEach(switcher => switcher.addEventListener('click', goToNextSlide));
