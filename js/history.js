import * as orderCtrl from './controllers/orderController.js';

const loader = document.getElementById('globalLoader');
let loaderMostrado = false;
let loaderTimeout = null;

function mostrarLoader() {
    if (loader && !loaderMostrado) {
        loader.style.opacity = '1';
        loader.style.display = 'flex';
        loaderMostrado = true;
        loaderTimeout = setTimeout(ocultarLoader, 3000);
    }
}
function ocultarLoader() {
    if (loaderMostrado && loader) {
        loader.style.opacity = '0';
        setTimeout(() => loader.style.display = 'none', 500);
        loaderMostrado = false;
    }
    clearTimeout(loaderTimeout);
}
mostrarLoader();

orderCtrl.init().finally(() => ocultarLoader());

window.abrirGaleria = src => {
    document.getElementById('galeriaImg').src = src;
    document.getElementById('galeriaOverlay').style.display = 'flex';
};
window.cerrarGaleria = () =>
    (document.getElementById('galeriaOverlay').style.display = 'none');