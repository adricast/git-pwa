// src/App.tsx (CÓDIGO CORREGIDO Y CON DEBUG)

import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminPage from './features/principal/adminPage';
//import GroupCardManagerWrapper from './features/usersgroup/groupcardmanagerwrapper';
import { ErrorBoundary } from './hooks/ErrorBoundary';

import './input.css';
import './output.css';
import GroupManagement from './features/usersgroup/groupuserLayout';
import UserManagement from './features/users/userLayout';
import PeopleManagement from './features/person/peopleLayout';


export interface AppProps {
  standalone?: boolean; // true si se ejecuta independiente
}

export const App: React.FC<AppProps> = ({ standalone = false }) => {
  useEffect(() => {
    if (standalone) {
      console.log("🟢 MFE: Modo Standalone ACTIVO. Esperando h-screen en el contenedor.");
    } else {
      console.log("🔵 MFE: Modo Host ACTIVO. El Host debe proporcionar la altura.");
    }
  }, [standalone]);

  const appRoutes = (
    <Routes>
      <Route path="/" element={<AdminPage />}>
        {/* ⬅️ ESTE ERA EL USO DIRECTO DEL COMPONENTE */}
        <Route path="usergroup" element={<GroupManagement />} />
        <Route path="user" element={<UserManagement />} />
         <Route path="person" element={< PeopleManagement/>} />
        {/* Otras subrutas irían aquí */}
      </Route>
      <Route path="*" element={<div>Página no encontrada en el MFE</div>} />
    </Routes>
  );

  // Modo Standalone: Requiere BrowserRouter
  if (standalone) {
    return (
      <ErrorBoundary fallback={<div>¡Oops! Algo salió mal 😢</div>}>
        {/* 🎯 CORRECCIÓN 1: RESTAURADO h-screen w-full */}
        <div className="h-screen w-full">
          <BrowserRouter>
            {appRoutes}
          </BrowserRouter>
        </div>
      </ErrorBoundary>
    );
  }

  // Modo Host: Retorna solo las rutas
  return appRoutes;
};

export default App;
