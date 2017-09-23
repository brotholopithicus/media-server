import './index.css';

const videoList = document.querySelector('.videoList');

fetch('/api')
  .then(res => res.json())
  .then(res => {
    res.forEach((file, index) => {
      const row = document.createElement('tr');
      row.dataset.file = JSON.stringify(Object.assign({}, file, { num: index + 1 }));
      const num = createElement('th', { text: index + 1 });
      const name = createElement('td', { text: file.name, classe: ['name'] });
      const mimetype = createElement('td', { text: file.mimetype });
      const size = createElement('td', { text: (parseInt(file.size) / (1000 * 1000)).toFixed(2) + ' MB' });
      const download = createElement('td', { text: '↓', classes: ['watch'] });
      const copyLink = createElement('td', { text: '✂', classes: ['copy'] });
      download.addEventListener('click', () => downloadPlayList(`https://${file.addr}/api/link/${file.id}`));
      copyLink.addEventListener('click', () => copyTextToClipboard(`https://${file.addr}/api/video/${file.id}`));
      [num, name, mimetype, size, download, copyLink].forEach(el => row.appendChild(el));
      videoList.appendChild(row);
    })
  });

function downloadPlayList(url) {
  const a = createElement('a');
  a.href = url;
  a.click();
  createAlert('Downloading Playlist');
}

function createAlert(message) {
  const div = createElement('div', { classes: ['alert-container'] });
  const alertDiv = createElement('div', { classes: ['alert'] });
  const alertHeading = createElement('h4', { text: message });
  alertDiv.append(alertHeading);
  div.append(alertDiv);
  document.body.append(div);
  div.animate([
    { opacity: 0 },
    { opacity: 1 },
    { opacity: 1 },
    { opacity: 0 }
  ], { duration: 4000, iterations: 1 });
  setTimeout(() => {
    document.body.removeChild(div);
  }, 4000)
}

function copyTextToClipboard(text) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.select();
  try {
    const successful = document.execCommand('copy');
    const msg = successful ? 'successful' : 'unsuccessful';
    console.log('Copying of link was ' + msg);
    createAlert(`Copied Link To Clipboard`)
  } catch (err) {
    console.log('Copying of link failed.');
    createAlert('Link Copy Failed');
  }
  document.body.removeChild(textArea);
}

function createElement(tag, options = {}) {
  const el = document.createElement(tag);
  el.textContent = options.text ? options.text : '';
  if (options.classes) {
    options.classes.forEach(className => el.classList.add(className));
  }
  return el;
}

const columns = document.querySelectorAll('th[data-sort]');
columns.forEach(col => col.addEventListener('click', handleColumnHeaderClick));

function handleColumnHeaderClick(e) {
  const key = this.dataset.sort;
  if (this.classList.contains('sort')) {
    const bodyRows = [...document.querySelectorAll('tbody tr')].reverse();
    const clonedVideoList = document.querySelector('.videoList').cloneNode();
    bodyRows.forEach(row => clonedVideoList.append(row));
    document.querySelector('table').replaceChild(clonedVideoList, document.querySelector('.videoList'));
    this.textContent = this.textContent.slice(0, -1) + (this.textContent.slice(-2) === ' ↓' ? ' ↑' : ' ↓');
  } else {
    columns.forEach(col => {
      if (col.textContent.slice(-1) === '↓' || col.textContent.slice(-1) === '↑') {
        col.textContent = col.textContent.slice(0, -2);
      }
      col.classList.remove('sort');
    });
    this.classList.add('sort');
    const bodyRows = [...document.querySelectorAll('tbody tr')].sort((a, b) => {
      [a, b] = [JSON.parse(a.dataset.file), JSON.parse(b.dataset.file)];
      console.log(typeof a[key])
      return typeof a[key] === 'number' ?
        a[key] - b[key] : (() => {
          if (a[key].toLowerCase() < b[key].toLowerCase()) {
            return -1;
          } else if (a[key].toLowerCase() > b[key].toLowerCase()) {
            return 1;
          } else {
            return 0;
          }
        })();
    });
    const clonedVideoList = document.querySelector('.videoList').cloneNode();
    bodyRows.forEach(row => clonedVideoList.append(row));
    document.querySelector('table').replaceChild(clonedVideoList, document.querySelector('.videoList'));
    this.textContent = this.textContent + ' ↑';
  }
}
