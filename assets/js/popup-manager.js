export const Popup = {
  cache: new Map(),
  url: '',
  htmlRaw: '',
  isLoaded: false,
  _backdrop: null,
  _popup: null,
  _isOpening: false,
  _isAnimating: false,

  async init(url, preloadIds = []) {
    this.url = url;
    await this._ensureHtmlLoaded();
    preloadIds.forEach(id => this._cachePopupById(id));
    if (!this._backdrop || !this._popup) {
      this._backdrop = document.querySelector('[data-backdrop]');
      this._popup = this._backdrop?.querySelector('[data-popup]');
    }

    this._bindCloseEvents();
  },

  async loadPopup(id) {
    if (this.cache.has(id)) return this._clonePopup(id);
    await this._ensureHtmlLoaded();
    const success = this._cachePopupById(id);
    if (!success) {
      console.warn(`Popup "${id}" не найден`);
      return null;
    }
    return this._clonePopup(id);
  },

  async open(id) {
    if (this._isOpening || this._isAnimating) return;
    this._isOpening = true;

    if (!this._backdrop || !this._popup) {
      this._backdrop = document.querySelector('[data-backdrop]');
      this._popup = this._backdrop?.querySelector('[data-popup]');
    }

    if (!this._backdrop || !this._popup) {
      console.warn('Контейнеры для попапа не найдены');
      this._isOpening = false;

      return;
    }

    const newContent = await this.loadPopup(id);
    if (!newContent) {
      this._isOpening = false;

      return;
    }

    const isVisible = this._popup.classList.contains('visible');

    if (isVisible) {
      this._backdrop.classList.add('loading');
      this._popup.classList.remove('visible');

      await this._waitForTransition(this._backdrop, 'opacity');
      await this._insertContent(newContent);

      this._backdrop.classList.remove('loading');
      this._popup.classList.add('visible');
    } else {
      await this._insertContent(newContent);

      const scrollbarWidth = this._getScrollbarWidth();
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      document.body.classList.add('locked');

      this._adjustFixedElements(scrollbarWidth);

      this._backdrop.classList.add('active');
      this._popup.classList.add('visible');

      await this._waitForTransition(this._backdrop, 'opacity'); // ждём только backdrop
    }

    this._isOpening = false;
  },

  async close() {
    if (!this._popup || !this._backdrop || this._isAnimating) return;

    this._popup.classList.remove('visible');
    this._backdrop.classList.remove('active');
    this._backdrop.classList.remove('loading');

    await this._waitForTransition(this._backdrop, 'opacity');

    this._popup.innerHTML = '';
    document.body.classList.remove('locked');
    document.body.style.paddingRight = '';

    this._adjustFixedElements(0);
  },

  async _insertContent(newContent) {
    this._popup.innerHTML = '';
    this._popup.appendChild(newContent);

    if (newContent.querySelector?.('connect[src]')) {
      const { initConnect } = await import('./connect.js');
      initConnect(newContent);
    }
  },

  async _ensureHtmlLoaded() {
    if (this.isLoaded) return;

    try {
      const res = await fetch(this.url);
      this.htmlRaw = await res.text();
      this.isLoaded = true;
    } catch (err) {
      console.error('Ошибка загрузки popups:', err);
    }
  },

  _cachePopupById(id) {
    if (!this.htmlRaw) return false;

    const template = document.createElement('template');
    template.innerHTML = this.htmlRaw;

    const el = template.content.querySelector(`.popup-content#${id}`);
    if (!el) return false;

    this.cache.set(id, el.cloneNode(true));
    return true;
  },

  _clonePopup(id) {
    const el = this.cache.get(id);
    return el ? el.cloneNode(true) : null;
  },

  async _waitForTransition(element, propertyName = 'opacity') {
    // начинаем анимацию
    this._isAnimating = true;

    return new Promise(resolve => {
      const computed = getComputedStyle(element);
      const duration = parseFloat(computed.transitionDuration) * 1000;

      if (duration === 0) {
        this._isAnimating = false;
        resolve();
        return;
      }

      let finished = false;

      const handler = e => {
        e.stopPropagation();
        if (e.propertyName !== propertyName) return;
        finished = true;
        element.removeEventListener('transitionend', handler);
        this._isAnimating = false;
        resolve();
      };

      element.addEventListener('transitionend', handler, { once: true });

      // fallback если браузер "проглотил" событие
      setTimeout(() => {
        if (!finished) {
          element.removeEventListener('transitionend', handler);
          this._isAnimating = false;
          resolve();
        }
      }, duration + 50);
    });
  },

  _bindCloseEvents() {
    document.addEventListener('click', e => {
      e.stopPropagation();
      const openBtn = e.target.closest('[data-popup-open]');
      if (!openBtn || this._isAnimating) return;

      const popupId = openBtn.dataset.popupOpen;
      if (popupId) {
        e.preventDefault();
        e.stopPropagation();
        this.open(popupId);
      }
    });

    document.addEventListener('keydown', e => {
      if (this._isAnimating) return;
      if (e.key === 'Escape') {
        this.close();
      }
    });

    if (this._backdrop) {
      this._backdrop.addEventListener('click', e => {
        e.stopPropagation();
        if (this._isAnimating) return;
        if (e.target === this._backdrop || e.target.hasAttribute('data-popup-close')) {
          this.close();
        }
      });
    }
  },

  _getScrollbarWidth() {
    return window.innerWidth - document.documentElement.clientWidth;
  },

  _adjustFixedElements(scrollbarWidth) {
    document.querySelectorAll('[data-fixed]').forEach(el => {
      const style = getComputedStyle(el);
      if (scrollbarWidth === 0) {
        el.style.paddingRight = '';
        if (el.dataset.popupRestoreRight !== undefined) {
          el.style.right = el.dataset.popupRestoreRight;
          delete el.dataset.popupRestoreRight;
        }
        return;
      }

      if (style.position === 'fixed' && style.right) {
        const currentRight = parseFloat(style.right);
        console.log(style.right);
        el.dataset.popupRestoreRight = style.right;
        el.style.right = `${currentRight + scrollbarWidth}px`;
        return;
      }

      if (el.offsetWidth === document.documentElement.clientWidth) {
        el.style.paddingRight = `${scrollbarWidth}px`;
        return;
      }
    });
  },
};
