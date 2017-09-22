require('./index.css');

const progressBar = document.querySelector('.progress-bar');
const uploadForm = document.querySelector('form#uploadForm');
const submitButton = document.querySelector('input#submit');
const fileInput = document.querySelector('input#fileInput');
const fileControl = document.querySelector('.file-control');
const speed = document.querySelector('.speed');
const elapsed = document.querySelector('.elapsed');
const uploaded = document.querySelector('.uploaded');

fileInput.addEventListener('change', (e) => fileControl.textContent = `${e.target.files.length} files`);

uploadForm.addEventListener('submit', handleFormSubmission);

const bytesToMb = (bytes) => (bytes * 1e-6).toFixed(2);

function handleFormSubmission(e) {
  e.preventDefault();
  let startTime = Date.now();
  submitButton.disabled = true;
  const formData = new FormData(e.target);
  const xhr = new XMLHttpRequest();
  xhr.open('POST', '/api', true);
  xhr.upload.addEventListener('progress', (e) => {
    if (e.lengthComputable) {
      const { loaded, total } = e;
      const progress = Math.round((loaded * 100) / total);
      progressBar.style.width = `${progress}%`;
      progressBar.textContent = `${progress}%`;
      const time = (Date.now() - startTime) / 1000;
      const uploadSpeed = (bytesToMb(loaded) / time).toFixed(2);
      speed.textContent = `${uploadSpeed} MB/s`;
      elapsed.textContent = `${time.toFixed(2)} s`;
      const mbLoaded = bytesToMb(loaded).slice(0, -3);
      const mbTotal = bytesToMb(total).slice(0, -3);
      uploaded.textContent = `${mbLoaded} MB of ${mbTotal} MB`;
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

async function handleDeleteSubmitButton() {
  try {
    await Promise.all(
      [...videoSelect.options]
      .filter(option => option.selected)
      .map(async(selected) => {
        await fetch(`/api/video/${selected.value}`, { method: 'DELETE' }).then(res => res.json());
        videoSelect.removeChild(selected);
      })
    );
  } catch (err) {
    console.log(err);
  }
}
