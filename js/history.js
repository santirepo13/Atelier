import * as orderView from './views/orderView.js';
import { showLoader, hideLoader } from './components/loader.js';

showLoader();
orderView.init().finally(() => hideLoader());

window.abrirGaleria = src => {
  document.getElementById('galeriaImg').src = src;
  document.getElementById('galeriaOverlay').style.display = 'flex';
};

window.cerrarGaleria = () =>
  (document.getElementById('galeriaOverlay').style.display = 'none');