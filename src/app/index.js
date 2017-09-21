import './index.css';
import fileTemplate from './templates/file.pug';

const videoList = document.querySelector('.videoList');

fetch('/api')
  .then(res => res.json())
  .then(res => {
    res.forEach(file => {
      const row = document.createElement('tr');
      const num = createElement('th', { text: file.id });
      const name = createElement('td', { text: file.name });
      const mimetype = createElement('td', { text: file.mimetype });
      const size = createElement('td', { text: (parseInt(file.size) / (1000 * 1000)).toFixed(2) + ' MB' });
      const download = createElement('td', { text: '↓', classes: ['hoverable', 'clickable'] });
      const copyLink = createElement('td', { text: '✂', classes: ['hoverable', 'clickable'] });
      download.addEventListener('click', () => downloadPlayList(`http://192.168.1.3:3000/api/link/${file.id}`));
      copyLink.addEventListener('click', () => copyTextToClipboard(`http://192.168.1.3:3000/api/video/${file.id}`));
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
  const alertTemplate = require('./templates/alert.pug');
  const alertHtml = alertTemplate({ message: message });
  const div = createElement('div', { classes: ['alert-container', 'fade-in'] });
  div.innerHTML = alertHtml;
  document.body.appendChild(div);
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
