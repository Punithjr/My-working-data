import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import './lib/firebase';
import App from './App.tsx';
import './index.css';

// vite-plugin-pwa injects the production service worker registration.
// Avoid registering a second service worker manually.

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
