const videoList = document.querySelector('.videoList');

fetch('/api')
  .then(res => res.json())
  .then(res => {
    res.forEach(file => {
      const row = document.createElement('tr');
      const name = createElement('td', { text: file.name });
      const encoding = createElement('td', { text: file.encoding });
      const mimetype = createElement('td', { text: file.mimetype });
      const size = createElement('td', { text: file.size + ' bytes' });
      const download = createElement('td', { text: '↓' });
      download.addEventListener('click', () => {
        const a = createElement('a');
        a.href = `http://192.168.1.3:3000/api/link/${file.id}`;
        a.click();
      });
      [name, encoding, mimetype, size, download].forEach(el => row.appendChild(el));
      // const link = document.createElement('a');
      // link.href = `http://192.168.1.3:3000/api/link/${file.id}`;
      // link.textContent = `${file.name}`;
      // li.appendChild(link);
      videoList.appendChild(row);
    })
  })

function createElement(tag, options = {}) {
  const el = document.createElement(tag);
  el.textContent = options.text;
  return el;
}
