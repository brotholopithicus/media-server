const progressBar = document.querySelector('#progressBar');
const uploadForm = document.querySelector('form#uploadForm');

uploadForm.addEventListener('submit', handleFormSubmission);

function handleFormSubmission(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const xhr = new XMLHttpRequest();
  xhr.open('POST', '/api', true);
  xhr.upload.addEventListener('progress', (e) => {
    if (e.lengthComputable) {
      const progress = Math.round((e.loaded * 100) / e.total);
      progressBar.value = progress;
    }
  });
  xhr.addEventListener('load', () => {
    window.location.pathname = '/';
  });
  xhr.send(formData);
}
