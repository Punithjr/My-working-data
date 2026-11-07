import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import './lib/firebase';
import App from './App.tsx';
import './index.css';

// Clean browser service worker registration for PWA
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
