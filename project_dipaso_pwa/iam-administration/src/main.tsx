import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // ← Importa BrowserRouter
import './index.css';
import '@dipaso/design-system/dist/styles/index.css';
// Overrides locales para corregir pseudo-elementos conflictivos que producen parpadeo
import './design-overrides.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>  {/* ← Envuelve App */}
    
      <App />
    </BrowserRouter>
  </StrictMode>,
);
