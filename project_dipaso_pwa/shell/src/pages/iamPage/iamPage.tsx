import React, { Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

// Lazy load desde el MFE remoto con catch para debug
const AdminPage = React.lazy(() =>
  import("iamAdmin/AdminPage").catch(err => {
    console.error("Error cargando el remoto:", err);
    // fallback temporal para que la app no se quede en blanco
    return { default: () => <div>Error cargando Admin</div> };
  })
);


const IAMPage: React.FC = () => {
  const location = useLocation();
  console.log("IAMPage renderizado. Ruta actual:", location.pathname);

  // Cuando IAMPage se monta en la ruta /dashboard/admin/*, solo necesitamos la ruta '*'
  // o '/' para que el Micro-Frontend se haga cargo del resto de las subrutas.
  return (
    <Suspense fallback={<div>Cargando Admin...</div>}>
      <Routes>
        {/* Usamos path="*" para capturar todas las rutas bajo /dashboard/admin/ */}
        <Route path="*" element={<AdminPage />} /> 
      </Routes>
    </Suspense>
  );
};

export default IAMPage;
