// Redirect between city page
const redirectCity = document.querySelector('#redirectCity');
redirectCity.addEventListener('change', (event) => {
  window.open('/city/'+event.target.value, '_self');
});

const redirectOrder = document.querySelector('#redirectOrder');
redirectOrder.addEventListener('change', (event) => {
  redirectOrder.submit();
});

const btnOrder = document.querySelector('#ascOrDesc');
const changeState = document.querySelector('#ordering')
btnOrder.addEventListener('click', (event) => {
  let temp = changeState.value;
  changeState.value = changeState.dataset.value;
  changeState.dataset.value = temp;
  console.log(changeState.value)
});