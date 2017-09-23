require('./index.css');

const progressBar = document.querySelector('.progress-bar');
const uploadForm = document.querySelector('form#uploadForm');
const submitButton = document.querySelector('input#submit');
const fileInput = document.querySelector('input#fileInput');
const fileControl = document.querySelector('.file-control');
const speed = document.querySelector('.speed');
const elapsed = document.querySelector('.elapsed');
const uploaded = document.querySelector('.uploaded');
const videoSelect = document.querySelector('select.videoSelect');
const deleteSubmitButton = document.querySelector('input#deleteSubmitButton');
const uploadInfo = document.querySelector('.upload-info');

fileInput.addEventListener('change', (e) => fileControl.textContent = `${e.target.files.length} files`);

uploadForm.addEventListener('submit', handleFormSubmission);

const bytesToMb = (bytes) => (bytes * 1e-6).toFixed(2);

function resetUploadInfo() {
  uploadInfo.childNodes.forEach(child => child.childNodes.forEach(baby => baby.textContent = ''));
  progressBar.style.width = '0%';
}

function handleFormSubmission(e) {
  e.preventDefault();
  if (!fileInput.files.length) return;
  let startTime = Date.now();
  submitButton.disabled = true;
  const formData = new FormData(uploadForm);
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
  ['error', 'abort'].forEach(ev => xhr.upload.addEventListener(ev, handleFormSubmissionError));
  xhr.addEventListener('load', () => {
    const parentNode = videoSelect.parentNode;
    const videoSelectClone = videoSelect.cloneNode();
    fetchFiles().then(files => [createSelectOptionElement(), ...files].forEach(f => videoSelectClone.appendChild(f)));
    parentNode.replaceChild(videoSelectClone, videoSelect);
    resetUploadInfo();
    console.log(JSON.parse(xhr.responseText));
  });
  xhr.send(formData);
}

function handleFormSubmissionError(err) {
  console.log(err);
}

function fetchFiles() {
  return new Promise(async(resolve, reject) => {
    const files = await fetch('/api').then(res => res.json());
    const elements = files.map(file => {
      const el = document.createElement('option');
      el.value = file.id;
      el.label = file.name;
      return el;
    });
    resolve(elements);
  });
}
fetchFiles().then(files => files.forEach(f => videoSelect.appendChild(f)));

function createSelectOptionElement() {
  const opt = document.createElement('option');
  opt.disabled = true;
  opt.textContent = 'Select Media File...';
  return opt;
}
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
