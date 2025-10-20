import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // ← Importa BrowserRouter
import './index.css';
import App from './App.tsx';


import '@dipaso/design-system/dist/styles/index.css'; // Asegúrate de importar los estilos del design-system
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>  {/* ← Envuelve App */}
    
      <App />
    </BrowserRouter>
  </StrictMode>,
);
