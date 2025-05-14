import { Popup } from './popup-manager.js';

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

Popup.init('./components/popups.html', ['subscribe']);
