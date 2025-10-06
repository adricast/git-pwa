import React, { Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

// Lazy load desde el MFE remoto con catch para debug
const AuditPosPage = React.lazy(() =>
  import("posAudit/AuditApp").catch(err => {
    console.error("Error cargando el remoto:", err);
    // fallback temporal para que la app no se quede en blanco
    return { default: () => <div>Error cargando Billing</div> };
  })
);

const PosAuditPage: React.FC = () => {
  const location = useLocation();
  console.log("PosClient renderizado. Ruta actual:", location.pathname);

  // Cuando PosBillingPage se monta en la ruta /dashboard/pos-billing/*,
  // usamos path="*" para que el microfrontend maneje sus propias subrutas
  return (
    <Suspense fallback={<div>Cargando Clients...</div>}>
      <Routes>
        <Route path="*" element={<AuditPosPage />} />
      </Routes>
    </Suspense>
  );
};

export default PosAuditPage;
