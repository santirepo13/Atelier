const loader = document.getElementById('globalLoader');
let loaderMostrado = false;
let loaderTimeout = null;

export function showLoader() {
  if (loader && !loaderMostrado) {
    loader.style.opacity = '1';
    loader.style.display = 'flex';
    loaderMostrado = true;
    loaderTimeout = setTimeout(hideLoader, 3000);
  }
}

export function hideLoader() {
  if (loaderMostrado && loader) {
    loader.style.opacity = '0';
    setTimeout(() => loader.style.display = 'none', 500);
    loaderMostrado = false;
  }
  clearTimeout(loaderTimeout);
}