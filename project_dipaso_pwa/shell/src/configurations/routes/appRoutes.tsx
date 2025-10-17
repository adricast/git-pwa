import { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import DashboardLayout from "../../components/dashboard/dashboardLayout";
import DashboardHome from "../../pages/dashboardPage/dashboardPage";
import PosBillingPage from "../../pages/posbillingPage/posbillingPage";
import PosCashPage from "../../pages/poscashPage/poscashPage";
import PosClientsPage from "../../pages/posclientePage/posclientsPage";
import PosInventoryPage from "../../pages/posinventoryPage/posinventoryPage";
import PosAuditPage from "../../pages/posauditPage/posauditPage";

// Componentes remotos
const IAMPage = lazy(() => import("../../pages/iamPage/iamPage"));
// Nuevo: Importación dinámica del LoginPage desde el Microservicio Authorizer
const RemoteLoginPage = lazy(() => import("authorizer/LoginPage"));

interface AppRoutesProps {
  isAuthenticated: boolean;
}

export const AppRoutes: React.FC<AppRoutesProps> = ({ isAuthenticated }) => {
  return (
    <Routes>
      {/* Ruta principal */}
      <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />

      {/* Login (Usa RemoteLoginPage dentro de Suspense) */}
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" />
          ) : (
            <Suspense fallback={<div>Cargando Login...</div>}>
              <RemoteLoginPage />
            </Suspense>
          )
        }
      />

      {/* Dashboard */}
      <Route
        path="/dashboard"
        element={
          isAuthenticated ? <DashboardLayout menuItems={[]} /> : <Navigate to="/login" />
        }
      >
        <Route index element={<DashboardHome />} />

        {/* Ruta para Admin remoto */}
        <Route
          path="admin/*"
          element={
            <Suspense fallback={<div>Cargando Admin...</div>}>
              <IAMPage />
            </Suspense>
          }
        />
        {/* Ruta para Billing remoto */}
        <Route
          path="billing/*"
          element={
            <Suspense fallback={<div>Cargando Billing...</div>}>
              <PosBillingPage />
            </Suspense>
          }
        />
        <Route
          path="cash/*"
          element={
            <Suspense fallback={<div>Cargando Cash...</div>}>
              <PosCashPage />
            </Suspense>
          }
        />
        <Route
          path="client/*"
          element={
            <Suspense fallback={<div>Cargando Clients...</div>}>
              <PosClientsPage />
            </Suspense>
          }
        />
        <Route
          path="inventory/*"
          element={
            <Suspense fallback={<div>Cargando Inventory...</div>}>
              <PosInventoryPage />
            </Suspense>
          }
        />
        <Route
          path="audit/*"
          element={
            <Suspense fallback={<div>Cargando Audit...</div>}>
              <PosAuditPage />
            </Suspense>
          }
        />
      </Route>

      {/* Catch-all */}
      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />}
      />
    </Routes>
  );
};
