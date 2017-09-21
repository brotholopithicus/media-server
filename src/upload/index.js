require('./index.css');

const progressBar = document.querySelector('.progress-bar');
const uploadForm = document.querySelector('form#uploadForm');
const submitButton = document.querySelector('input#submit');

uploadForm.addEventListener('submit', handleFormSubmission);

function handleFormSubmission(e) {
  e.preventDefault();
  submitButton.disabled = true;
  const formData = new FormData(e.target);
  const xhr = new XMLHttpRequest();
  xhr.open('POST', '/api', true);
  xhr.upload.addEventListener('progress', (e) => {
    if (e.lengthComputable) {
      const progress = Math.round((e.loaded * 100) / e.total);
      progressBar.style.width = `${progress}%`;
      progressBar.textContent = `${progress}%`;
    }
  });
  xhr.upload.addEventListener('load', () => {
    window.location.pathname = '/';
  });
  xhr.send(formData);
}

const videoSelect = document.querySelector('select.videoSelect');
const deleteSubmitButton = document.querySelector('button#deleteSubmitButton');

function populateVideoSelectOptions() {
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
}

function removeVideoSelectOptions() {
  while (videoSelect.firstChild) {
    videoSelect.remove(videoSelect.firstChild);
  }
}

function resetVideoSelectOptions() {
  removeVideoSelectOptions();
  populateVideoSelectOptions();
}

deleteSubmitButton.addEventListener('click', handleDeleteSubmitButton)

function handleDeleteSubmitButton() {
  const id = videoSelect.options[videoSelect.selectedIndex].value;
  fetch(`/api/video/${id}`, { method: 'DELETE' })
    .then(res => res.json())
    .then(res => {
      console.log(res);
      resetVideoSelectOptions();
    });
}

populateVideoSelectOptions();
