export const initConnect = (root = document) => {
  const connectors = root.querySelectorAll('connect[src]');

  const promises = Array.from(connectors).map(el => {
    const href = el.getAttribute('src');

    return fetch(href)
      .then(res => res.text())
      .then(html => {
        el.outerHTML = html;
      })
      .catch(err => {
        console.error(`Ошибка загрузки ${href}:`, err);
      });
  });

  return Promise.all(promises);
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
