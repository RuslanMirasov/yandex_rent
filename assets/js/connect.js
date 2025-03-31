export const initConnect = (root = document) => {
  const connectors = root.querySelectorAll('connect[src]');

  connectors.forEach(el => {
    const href = el.getAttribute('src');

    fetch(href)
      .then(res => res.text())
      .then(html => {
        el.outerHTML = html; // заменяем сам <connect> его содержимым
      })
      .catch(err => {
        console.error(`Ошибка загрузки ${href}:`, err);
      });
  });
};

export const initSprites = url => {
  fetch(url)
    .then(response => response.text())
    .then(svg => {
      const div = document.createElement('div');
      div.style.display = 'none';
      div.innerHTML = svg;
      document.body.insertBefore(div, document.body.firstChild);
    });
};
