require('./index.css');

const navLinks = document.querySelectorAll('nav li a');
window.onload = () => [...navLinks].find(a => a.href === window.location.href).parentNode.classList.add('active');
