import { subscribe } from './scripts.js';
const showErrors = true;

const validationRegEx = [
  {
    type: 'tel',
    regex: /^\+7\s?\(\d{3}\)\s?\d{3}-\d{2}-\d{2}$/,
    error: 'Не верный формат телефона!',
  },
  {
    type: 'email',
    regex: /^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/,
    error: 'Не верный формат E-mail!',
  },
  {
    type: 'password',
    regex: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/,
    error: 'Пароль должен содержать минимум 6 символов, включая буквы и цифры',
  },
  {
    type: 'url',
    regex: /^(https?:\/\/)?([\w.-]+\.)+[a-zA-Z]{2,}(\/\S*)?$/,
    error: 'Не верный формат URL',
  },
  {
    type: 'checkbox',
    error: 'Это обязательное поле!',
  },
  {
    type: 'radio',
    error: 'Выберите вариант!',
  },
];

function validateForm(form) {
  if (!form) return;
  let errorsCount = 0;

  const inputs = form.querySelectorAll('[required]');
  if (inputs.length === 0) return;

  inputs.forEach(input => {
    const { name, value, checked, type } = input;
    let errorText = '';

    if ((type === 'checkbox' || type === 'radio') && !checked) {
      errorsCount += 1;
      errorText = validationRegEx.find(rule => rule.type === type).error;
    }

    if (type !== 'checkbox' && type !== 'radio') {
      if (!value || value === '') {
        errorsCount += 1;
        errorText = 'Это обязательное поле!';
      } else {
        const validation = validationRegEx.find(v => v.type === type);
        const regex = new RegExp(validation.regex);
        if (!regex.test(value.trim())) {
          errorsCount += 1;
          errorText = validation.error;
        }
      }
    }

    addErrorHTML(errorText, input);
  });

  return errorsCount <= 0;
}

function addErrorHTML(error, input) {
  if (!input) return;

  const label = input.closest('label');
  const existingError = label.querySelector('.inputError');

  if (error) {
    input.classList.add('invalid');

    if (existingError) {
      existingError.innerHtml = `<span>${error}</span>`;
      return;
    }

    if (showErrors) {
      label.insertAdjacentHTML('beforeend', `<p class="inputError"><span>${error}</span></p>`);
      const newError = label.querySelector('.inputError');
      newError.style.height = newError.scrollHeight + 'px';
    }
    return;
  }

  if (existingError) existingError.remove();
  input.classList.remove('invalid');
}

function handleSubmit(form) {
  if (!validateForm(form)) return;
  const data = Object.fromEntries(new FormData(form).entries());
  subscribe(data);
}

const onRequiredInputFocus = e => {
  const input = e.target;
  const error = input.closest('label').querySelector('.inputError');

  if (input.classList.contains('invalid')) {
    input.classList.remove('invalid');
  }
  if (error) {
    error.style.height = '0px';
    setTimeout(() => {
      error.remove();
    }, 300);
  }
};

document.addEventListener('submit', e => {
  const form = e.target.closest('[data-subscribe]');
  if (!form) return;

  e.preventDefault();
  handleSubmit(form);
});

document.addEventListener('focusin', e => {
  if (e.target.matches('[required]')) {
    onRequiredInputFocus(e);
  }
});

document.addEventListener('change', e => {
  if (e.target.matches('[required]')) {
    onRequiredInputFocus(e);
  }
});
