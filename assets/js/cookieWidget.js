const CookieWidget = {
  // ИНИЦИАЛИЗАЦИЯ
  init(options) {
    this.settings = options;
    const savedConsent = localStorage.getItem('cookieConsent');

    if (savedConsent) {
      return;
    }

    this.filteredData = [...this.settings.cookieData];
    this.createInitialConsentState();
    this.render();
    this.applyStyles();
    this.applyUrls();
    this.bindEvents();
  },

  // ВЕШАЕМ ОБРАБОТЧИКИ СОБЫТИЙ
  bindEvents() {
    this.bindStaticElementsEvents();
    this.bindAccordeonEvents();
    this.bindFilterFormSubmitEvent();
    this.bindSearchField();
  },

  //ВЕШАЕМ ОБРАБОТЧИК НА ПОЛЕ ПОИСКА
  bindSearchField() {
    const searchField = document.querySelector('[data-widget-search-field]');
    if (!searchField) return;

    const debouncedSearch = this.debounce(e => {
      const term = e.target.value;
      this.searchCookies(term);
    }, 500);

    searchField.addEventListener('input', debouncedSearch);
  },

  // ВЕШАЕМ ОБРАБОТЧИК НА АККОРДЕОНЫ
  bindAccordeonEvents() {
    const accordeons = document.querySelectorAll('.accordion-toggle');
    accordeons.forEach(toggle => {
      toggle.addEventListener('click', e => {
        const content = e.target.closest('.cookie-widget-accordeons__item').querySelector('.cookie-widget-accordeons__content');
        content.style.display = content.style.display === 'flex' ? 'none' : 'flex';
      });
    });
  },

  // ВЕШАЕМ ОБРАБОТЧИКИ СОБЫТИЙ НА СТАТИЧЕСКИЕ ЕЛЕМЕНТЫ
  bindStaticElementsEvents() {
    const settingsButton = document.querySelector('[data-cookie-widget-btn="settings"]');
    const closeButtons = document.querySelectorAll('[data-cookie-widget-close]');
    const backdrop = document.querySelector('.cookie-widget-popup-backdrop');
    const fixPanel = document.querySelector('.cookie-widget-fix-block');
    const confirmButton = document.querySelector('[data-cookie-widget-btn="confirm"]');
    const acceptButtons = document.querySelectorAll('[data-cookie-widget-btn="accept"]');
    const tabButtons = document.querySelectorAll('[data-cookie-widget-nav]');
    const pageButtons = document.querySelectorAll('[data-cookie-widget-page-nav]');
    const denyButtons = document.querySelectorAll('[data-cookie-widget-btn="deny"]');
    const checkboxes = document.querySelectorAll('[data-cookie-widget-checkbox]');
    const filterButton = document.querySelector('[data-cookie-widget-filter]');

    if (confirmButton) {
      confirmButton.addEventListener('click', () => {
        this.saveConsentState();
      });
    }

    if (filterButton) {
      filterButton.addEventListener('click', e => {
        if (e.currentTarget === e.target) {
          filterButton.classList.toggle('active');
        }
      });
    }

    if (closeButtons.length > 0 && backdrop) {
      closeButtons.forEach(btn =>
        btn.addEventListener('click', () => {
          document.body.classList.remove('locked');
          backdrop.classList.remove('active');
          fixPanel.classList.remove('active');
        })
      );
    }

    if (settingsButton && backdrop) {
      settingsButton.addEventListener('click', () => {
        document.body.classList.add('locked');
        backdrop.classList.add('active');
      });
    }

    if (acceptButtons.length > 0) {
      acceptButtons.forEach(button => {
        button.addEventListener('click', () => {
          this.acceptAllCookies();
        });
      });
    }

    if (denyButtons.length > 0) {
      denyButtons.forEach(button => {
        button.addEventListener('click', () => {
          this.denyAllCookies();
        });
      });
    }

    if (tabButtons.length > 0) {
      tabButtons.forEach(btn => {
        btn.addEventListener('click', event => this.changeTab(event));
      });
    }

    if (pageButtons.length > 0) {
      pageButtons.forEach(btn => {
        btn.addEventListener('click', event => this.changePage(event));
      });
    }

    if (checkboxes.length > 0) {
      checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', event => this.handleCheckboxChange(event));
      });
    }

    setTimeout(() => {
      fixPanel.classList.add('active');
    }, 50);
  },

  // ФИЛЬТРАЦИЯ ПРИ SUBMIT В ФОРМЕ
  bindFilterFormSubmitEvent() {
    const filterForm = document.querySelector('[data-cookie-widget-filter-form]');
    if (!filterForm) return;

    filterForm.addEventListener('submit', event => {
      event.preventDefault();

      const selectedCategories = [];

      const filterButton = document.querySelector('[data-cookie-widget-filter]');
      const checkedInputs = filterForm.querySelectorAll('input[type="checkbox"]:checked');
      checkedInputs.forEach(input => {
        selectedCategories.push(input.name);
      });

      filterButton.classList.remove('active');
      this.filterByCategories(selectedCategories);
    });
  },

  // МЕНЯЕМ СТЕЙТ ПРИ ВЫБОРЕ ЧЕКБОКСА
  handleCheckboxChange(e) {
    const checkbox = e.currentTarget;
    const slug = checkbox.getAttribute('data-cookie-widget-checkbox');
    const isChecked = checkbox.checked;

    this.consentState[slug] = isChecked;
    this.updateAcceptAllButtonVisibility();
  },

  // УБИРАЕМ КНОПКУ "ОДОБРИТЬ ВСЁ" ЕСЛИ ПОЛЬЗОВАТЕЛЬ ВЫБРАЛ КУКИ САМОСТОЯТЕЛЬНО
  updateAcceptAllButtonVisibility() {
    const acceptAllButton = document.querySelector('[data-cookie-widget-accept-all]');
    if (!acceptAllButton) return;

    const selectableGroups = this.settings.cookieData.filter(group => group.selectable);

    const hasAnyAccepted = selectableGroups.some(group => this.consentState[group.slug]);

    if (hasAnyAccepted) {
      acceptAllButton.style.display = 'none';
    } else {
      acceptAllButton.style.display = 'block';
    }
  },

  //МЕНЯЕМ ТАБЫ КАТЕГОРИЙ
  changeTab(e) {
    e.preventDefault();
    const btn = e.currentTarget;
    const target = btn.dataset.cookieWidgetNav;
    const activeBtnEl = document.querySelector(`[data-cookie-widget-nav].active`);
    const activeTabEl = document.querySelector(`[data-cookie-widget-tab].active`);
    const targetTabEl = document.querySelector(`[data-cookie-widget-tab="${target}"]`);

    activeBtnEl.classList.remove('active');
    activeTabEl.classList.remove('active');

    targetTabEl.classList.add('active');
    btn.classList.add('active');
  },

  //ПЕРЕХОД МЕЖДУ РАЗДЕЛАМИ ВИДЖЕТА
  changePage(e) {
    e.preventDefault();
    const target = e.currentTarget.dataset.cookieWidgetPageNav;
    const activePageEl = document.querySelector(`[data-cookie-page].active`);
    const targetPageEl = document.querySelector(`[data-cookie-page="${target}"]`);

    activePageEl.classList.remove('active');
    targetPageEl.classList.add('active');
  },

  //ПРИНИМАЕМ ВСЕ КУКИ
  acceptAllCookies() {
    for (const slug in this.consentState) {
      this.consentState[slug] = true;
    }
    this.saveConsentState();
  },

  //ОТКЛОНЯЕМ ВСЕ КУКИ (КРОМЕ ОБЯЗАТЕЛЬНЫХ)
  denyAllCookies() {
    const data = this.settings.cookieData;
    for (const group of data) {
      this.consentState[group.slug] = group.selectable ? false : true;
    }
    this.saveConsentState();
  },

  //СОХРАНЯЕМ ВЫБОР ПОЛЬЗОВАТЕЛЯ В LOCAL STORAGE
  saveConsentState() {
    localStorage.setItem('cookieConsent', JSON.stringify(this.consentState));
  },

  // РЕНДЕРИМ РАЗМЕТКУ ПО ДАННЫМ
  render() {
    this.renderBasicMarkup();
    this.renderCategoryNavigation();
    this.renderCategoryTabs();
    this.renderFilterForm();
    this.renderAccordeons(this.settings.cookieData);
  },

  //СОЗДАЁМ БАЗОВУЮ СТАТИЧЕСКУЮ РАЗМЕТКУ
  renderBasicMarkup() {
    const settingsBlock = `
    <div class="cookie-widget-popup-backdrop" lang="ru">
      <div class="cookie-widget-popup">
        <div class="cookie-widget-popup-content">
          <header class="cookie-widget-header">
            <div class="cookie-widget-logo">
              <img src="https://milka.ru/themes/milka/assets/img/footer/logo-sec.png?v=3" alt="site logo" data-widget-logo/>
            </div>
            <h2>Центр настроек конфиденциальности</h2>
          </header>
          <div class="cookie-widget-settings active" data-cookie-page="main">
            <nav>
              <ul data-widget-category-navigation>
                <li data-cookie-widget-nav="tab1" class="cookie-widget-nav active">Ваша конфиденциальность</li>
              </ul>
            </nav>
            <div class="cookie-widget-tabs" data-cookie-widget-tabs>
              <div class="cookie-widget-tab active" data-cookie-widget-tab="tab1">
                <h3>Ваша конфиденциальность</h3>
                <p>
                  Когда вы посещаете какой-либо веб-сайт, он может сохранять информацию в вашем браузере или получать из него данные, в основном в виде
                  файлов cookie. Эта информация может относиться к вам, вашим предпочтениям, вашему устройству или будет использоваться для правильной
                  работы веб-сайта с вашей точки зрения. Такие данные обычно не идентифицируют вас непосредственно, но могут предоставлять вам
                  индивидуализированные возможности работы в интернете. Вы можете отказаться от использования некоторых типов файлов cookie. Нажимайте на
                  заголовки категорий, чтобы узнать подробности и изменить настройки, заданные по умолчанию. Однако вы должны понимать, что блокировка
                  некоторых типов cookie может повлиять на использование вами веб-сайта и ограничить предлагаемые нами услуги.
                </p>
                <a href="#" data-policy-link>Дополнительная информация</a>
              </div>
            </div>
          </div>

          <div class="cookie-widget-settings cookie-widget-settings--info " data-cookie-page="cookieInfo">
            <div class="cookie-witget-filters">
              <button type="button" class="cookie-witget-go-back" data-cookie-widget-page-nav="main">
                <svg width="8" height="14" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6.5 1C6.5 1 1 6.80919 1 7C1 7.19081 6.5 13 6.5 13" stroke="var(--cookie-widget-primary-color)" stroke-width="2" />
                </svg>
                Назад
              </button>
              <div class="cookie-widget-search">
                <input type="text" placeholder="Поиск..." data-widget-search-field/>
                <svg width="23" height="24" viewBox="0 0 23 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="10" cy="10" r="9" stroke="var(--cookie-widget-primary-color)" stroke-width="2" />
                  <path
                    d="M21.1561 23.3239C21.5484 23.7126 22.1816 23.7098 22.5703 23.3175C22.9591 22.9252 22.9562 22.292 22.5639 21.9033L21.1561 23.3239ZM16.1953 17L15.4914 17.7103L21.1561 23.3239L21.86 22.6136L22.5639 21.9033L16.8992 16.2897L16.1953 17Z"
                    fill="var(--cookie-widget-primary-color)"
                  />
                </svg>
              </div>
              <div class="cookie-widget-filter" data-cookie-widget-filter>
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M35.7685 0H0L14 18V36L22 30V18L35.7685 0Z" fill="var(--cookie-widget-primary-color)" />
                </svg>
                <div class="cookie-widget-filter-form-wrapper">
                  <form action="#" data-cookie-widget-filter-form>
                    <button type="reset" href="#" class="cookie-widget-filter-clear">Очистить фильтры</button>
                    <button type="submit" data-cookie-widget-btn="filter">Применить</button>
                  </form>
                </div>
              </div>
            </div>
            <div class="cookie-widget-accordeons">



            </div>
          </div>
          <footer data-cookie-widget="buttons">
            <button type="button" data-cookie-widget-btn="confirm" data-cookie-widget-close>Подтвердить выбор</button>
            <button type="button" data-cookie-widget-btn="deny" data-cookie-widget-close>Отклонить всё</button>
            <button type="button" data-cookie-widget-btn="accept" data-cookie-widget-accept-all data-cookie-widget-close>Одобрить всё</button>
          </footer>
        </div>
      </div>
    </div>
    `;
    const fixBlock = `
    <div class="cookie-widget-fix-block">
      <p>
        Мы и наши партнеры на этом веб-сайте используем файлы cookies для различных целей, в частности, для облегчения навигации, персонализации контента,
        оценки использования сайта, а также для адаптации рекламы и предоставления наилучшего цифрового опыта. Вы можете дать согласие на использование
        нами файлов cookies, отказаться от использования файлов cookie, кроме случаев, когда это строго необходимо, или управлять своими предпочтениями,
        нажав «Настройки файлов cookies». Узнайте больше в нашем Уведомлении об использовании файлов
        <a href="#" data-policy-link>cookies</a> .
      </p>
      <div data-cookie-widget="buttons">
        <button type="button" data-cookie-widget-btn="settings">Настройки файлов cookies</button>
        <button type="button" data-cookie-widget-btn="deny" data-cookie-widget-close>Отклонить файлы cookies</button>
        <button type="button" data-cookie-widget-btn="accept" data-cookie-widget-close>Принять файлы cookies</button>
      </div>
    </div>
  `;

    document.body.insertAdjacentHTML('beforeend', settingsBlock + fixBlock);
  },

  //СОЗДАЁМ РАЗМЕТКУ ТАБОВ КАТЕГОРИЙ
  renderCategoryTabs() {
    const tabsContainer = document.querySelector('[data-cookie-widget-tabs]');
    if (!tabsContainer) return;

    const tabs = this.settings.cookieData;

    tabs.forEach(({ slug, category, description, selectable }) => {
      const controlElement = selectable
        ? `
        <div class="cookie-widget-checkbox">
          <input type="checkbox" name="${slug}" id="${slug}" data-cookie-widget-checkbox="${slug}" />
          <label for="${slug}"></label>
        </div>
      `
        : `
        <span class="cookie-widget-absolute-text">Всегда активно</span>
      `;
      const html = `
        <div class="cookie-widget-tab" data-cookie-widget-tab="${slug}">
          <h3>${category}</h3>
          ${controlElement}
          <p>${description}</p>
          <a href="#" data-cookie-widget-page-nav="cookieInfo">Сведения о файлах cookie</a>
        </div>
      `;
      tabsContainer.insertAdjacentHTML('beforeend', html);
    });
  },

  //СОЗДАЁМ РАЗМЕТКУ НАВИКАЦИИ КАТЕГОРИЙ
  renderCategoryNavigation() {
    const navContainer = document.querySelector('[data-widget-category-navigation]');
    if (!navContainer) return;

    const categories = this.settings.cookieData;

    categories.forEach((group, index) => {
      const html = `
        <li data-cookie-widget-nav="${group.slug}" class="cookie-widget-nav">
          ${group.category}
        </li>
      `;
      navContainer.insertAdjacentHTML('beforeend', html);
    });
  },

  //СОЗДАЁМ РАЗМЕТКУ ФОРМЫ ФИЛЬТРА
  renderFilterForm() {
    const clearButton = document.querySelector('.cookie-widget-filter-clear');
    if (!clearButton) return;

    const filters = this.settings.cookieData;

    let filtersHTML = '';

    filters.forEach(({ slug, category }) => {
      filtersHTML += `
      <label>
        <input type="checkbox" name="${slug}"/>
        <span>${category}</span>
      </label>
    `;
    });

    clearButton.insertAdjacentHTML('afterend', filtersHTML);
  },

  //СОЗДАЁМ РАЗМЕТКУ АККОРДЕОНОВ С КУКИ СПИСКАМИ
  renderAccordeons(data) {
    const accordeonsContainer = document.querySelector('.cookie-widget-accordeons');
    if (!accordeonsContainer) return;
    accordeonsContainer.innerHTML = '';

    if (!data || data.length === 0) {
      accordeonsContainer.innerHTML = '<p>Ничего не найдено</p>';
      return;
    }

    const categories = data;

    categories.forEach(({ category, cookies }) => {
      if (!cookies || cookies.length === 0) return;

      cookies.forEach(hostGroup => {
        // Генерируем список файлов cookie для одного хоста
        let cookiesHTML = '';

        hostGroup.list.forEach(cookie => {
          cookiesHTML += `
          <div class="cookie-info">
            <p><strong>Имя:</strong> ${cookie.name}</p>
            <p><strong>Категория:</strong> ${category}</p>
            <p><strong>Описание:</strong> ${cookie.description}</p>
          </div>
        `;
        });

        // Генерируем сам аккордеон
        const html = `
        <div class="cookie-widget-accordeons__item">
          <div class="accordion-header accordion-toggle">
            <span>${hostGroup.host}</span>
            <svg width="14" height="8" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1C1 1 6.80919 6.5 7 6.5C7.19081 6.5 13 1 13 1" stroke="var(--cookie-widget-primary-color)" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="cookie-widget-accordeons__content">
            ${cookiesHTML}
          </div>
        </div>
      `;

        accordeonsContainer.insertAdjacentHTML('beforeend', html);
      });
    });
  },

  //ФИЛЬТР КУКИ ПО КАТЕГОРИЯМ
  filterByCategories(selectedCategories) {
    if (!Array.isArray(selectedCategories)) return;

    if (selectedCategories.length === 0) {
      this.filteredData = JSON.parse(JSON.stringify(this.settings.cookieData));
    } else {
      this.filteredData = this.settings.cookieData.filter(group => selectedCategories.includes(group.slug));
    }

    this.renderAccordeons(this.filteredData);
    this.bindAccordeonEvents();
  },

  //ПОИСК
  searchCookies(term) {
    const searchTerm = term.trim().toLowerCase();

    if (!searchTerm) {
      this.renderAccordeons(this.filteredData);
      this.bindAccordeonEvents();
      return;
    }

    const filteredResult = [];

    this.filteredData.forEach(group => {
      const matchedCookies = group.cookies.filter(hostGroup => hostGroup.host.toLowerCase().includes(searchTerm));

      if (matchedCookies.length > 0) {
        filteredResult.push({
          ...group,
          cookies: matchedCookies,
        });
      }
    });

    this.renderAccordeons(filteredResult);
    this.bindAccordeonEvents();
  },

  //СОЗДАЁМ СОСТОЯНИЕ ВСЕХ КУКИ НА ОСНОВЕ ВХОДНЫХ ДАННЫХ
  createInitialConsentState() {
    this.consentState = {};
    const data = this.settings.cookieData;
    data.forEach(group => {
      this.consentState[group.slug] = group.selectable ? false : true;
    });
  },

  //ПРИМЕНЯЕМ СТИЛИ ИЗ НАСТРОЕК
  applyStyles() {
    const root = document.documentElement;
    const { primaryColor, logoBackground } = this.settings;

    if (primaryColor) {
      root.style.setProperty('--cookie-widget-primary-color', primaryColor);
    }

    if (logoBackground) {
      root.style.setProperty('--cookie-widget-logo-bg', logoBackground);
    }
  },

  //ПРИМЕНЯЕМ ЛОГОТИП И ССЫЛКИ НА ПОЛИТИКУ ИЗ НАСТРОЕК
  applyUrls() {
    const { logoUrl, policyUrl } = this.settings;

    const logoElement = document.querySelector('[data-widget-logo]');
    if (logoElement && logoUrl) {
      logoElement.setAttribute('src', logoUrl);
    }

    const policyLinks = document.querySelectorAll('[data-policy-link]');
    if (policyLinks.length > 0 && policyUrl) {
      policyLinks.forEach(link => link.setAttribute('href', policyUrl));
    }
  },

  //DEBOUNCE
  debounce(func, delay) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        func.apply(this, args);
      }, delay);
    };
  },
};
