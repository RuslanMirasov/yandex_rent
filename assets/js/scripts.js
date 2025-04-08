import { Popup } from './popup-manager.js';

const initSprites = url => {
  fetch(url)
    .then(response => response.text())
    .then(svg => {
      const div = document.createElement('div');
      div.style.display = 'none';
      div.innerHTML = svg;
      document.body.insertBefore(div, document.body.firstChild);
    });
};

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

initSprites('./assets/img/svg/sprite.svg');
Popup.init('./components/popups.html', ['subscribe']);
