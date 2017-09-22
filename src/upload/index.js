require('./index.css');

const progressBar = document.querySelector('.progress-bar');
const uploadForm = document.querySelector('form#uploadForm');
const submitButton = document.querySelector('input#submit');
const fileInput = document.querySelector('input#fileInput');
const fileControl = document.querySelector('.file-control');
const speed = document.querySelector('.speed');
const elapsed = document.querySelector('.elapsed');
fileInput.addEventListener('change', (e) => fileControl.textContent = `${e.target.files.length} files`);

uploadForm.addEventListener('submit', handleFormSubmission);

function handleFormSubmission(e) {
  e.preventDefault();
  let startTime = Date.now();
  submitButton.disabled = true;
  const formData = new FormData(e.target);
  const xhr = new XMLHttpRequest();
  xhr.open('POST', '/api', true);
  xhr.upload.addEventListener('progress', (e) => {
    if (e.lengthComputable) {
      const progress = Math.round((e.loaded * 100) / e.total);
      progressBar.style.width = `${progress}%`;
      progressBar.textContent = `${progress}%`;
      const time = (Date.now() - startTime) / 1000;
      const uploadSpeed = e.loaded / time;
      speed.textContent = `${(uploadSpeed / (1000 * 1000)).toFixed(2)} MB/s`;
      elapsed.textContent = `${time.toFixed(1)} s`;
    }
  });
  xhr.upload.addEventListener('load', () => {
    window.location.pathname = '/';
  });
  xhr.send(formData);
}

const videoSelect = document.querySelector('select.videoSelect');
const deleteSubmitButton = document.querySelector('input#deleteSubmitButton');

fetch('/api')
  .then(res => res.json())
  .then(res => {
    const elements = res.map(file => {
      const el = document.createElement('option');
      el.value = file.id;
      el.label = file.name;
      return el;
    });
    elements.forEach(el => videoSelect.appendChild(el));
  });

deleteSubmitButton.addEventListener('click', handleDeleteSubmitButton)

function handleDeleteSubmitButton() {
  const selectedIndex = videoSelect.selectedIndex;
  const id = videoSelect.options[selectedIndex].value;
  fetch(`/api/video/${id}`, { method: 'DELETE' })
    .then(res => res.json())
    .then(res => {
      videoSelect.removeChild(videoSelect.options[selectedIndex]);
    });
}
