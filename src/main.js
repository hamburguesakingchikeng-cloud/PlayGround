import './styles.css';
import { App } from './game/game.js';

const boot = () => {
  try {
    window.__laEspadaCelestial = new App();
  } catch (err) {
    console.error('No se pudo abrir el Velo:', err);
    const loading = document.getElementById('loading-screen');
    if (loading) loading.classList.remove('is-active');
    const unsupported = document.getElementById('unsupported');
    if (unsupported) unsupported.style.display = 'grid';
  }
};

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
