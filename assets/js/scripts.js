import { Popup } from './popup-manager.js';
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

    Popup.open('ok');
  } catch (error) {
    Popup.open('error');
  } finally {
    btn.classList.remove('loading');
  }
};

initConnect().then(() => {
  initSprites('./assets/img/svg/sprite.svg');
  Popup.init('./components/popups.html', ['subscribe']);
});
