const burgerMenu = document.querySelector('#burgerMenu');
const closeMenu = document.querySelector('#closeMenu');
const nav = document.querySelector('#nav');

burgerMenu.addEventListener('click', () => {
  nav.classList.toggle('nav__sidebar--active');
});

closeMenu.addEventListener('click', () => {
  nav.classList.toggle('nav__sidebar--active');
});
