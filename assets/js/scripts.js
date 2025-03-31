import { initPopups, PopupManager } from './popup-manager.js';
import { initConnect, initSprites } from './connect.js';

document.addEventListener('click', e => {
  const trigger = e.target.closest('[data-popup-open]');
  if (trigger) {
    e.preventDefault();
    const popupId = trigger.getAttribute('data-popup-open');
    if (popupId) PopupManager.open(popupId);
    return;
  }

  const closer = e.target.closest('[data-popup-close]');
  if (closer) {
    e.preventDefault();
    PopupManager.close();
  }
});

export const subscribe = async data => {
  await console.log('ОТПРАВЛЯЕМ ЗАПРОС В YANDEX...');
  await console.log(data);
  PopupManager.open('ok');
};

document.addEventListener('DOMContentLoaded', () => {
  initSprites('./assets/img/svg/sprite.svg');
  initPopups('./components/popups.html', ['ok', 'error']);
  initConnect();
});
