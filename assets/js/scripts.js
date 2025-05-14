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
initCounterGoals();

function initCounterGoals() {
    var submitBtnsArray = document.getElementsByClassName('submit');
    var logo = document.getElementById('logo')
    var tgLink = document.getElementsByClassName('tgLink');
    var vkLink = document.getElementsByClassName('vkLink');

    if (submitBtnsArray.length > 0) {
        Array.from(submitBtnsArray).forEach((el) => {
            addListenerForCounter(el, 'SentForm');
        });
    }

    addListenerForCounter(logo, 'LogoClick');
    addListenerForCounter(tgLink, 'TgClick');
    addListenerForCounter(vkLink, 'VkClick');
}

function addListenerForCounter(element, eventName) {
    if (element) {
        element.onclick = ym(100828736, 'reachGoal', eventName);
    }
}