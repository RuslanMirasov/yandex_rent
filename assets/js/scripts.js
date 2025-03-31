import { initPopups, PopupManager } from './popup-manager.js';
import { initConnect, initSprites } from './connect.js';

export const subscribe = async (data, btn) => {
  if (!data || !btn) return;
  const { email } = data;

  try {
    btn.classList.add('loading');
    const response = await fetch('https://arenda.yandex.ru/external-forms/arendophobia/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      throw new Error(`Ошибка: ${response.status}`);
    }

    PopupManager.open('ok');
  } catch (error) {
    console.log('Ошибка при отправке формы подписки: ', error);
    PopupManager.open('error');
  } finally {
    btn.classList.remove('loading');
  }
};

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

document.addEventListener('DOMContentLoaded', () => {
  initSprites('./assets/img/svg/sprite.svg');
  initPopups('./components/popups.html', ['subscribe']);
  initConnect();
});
