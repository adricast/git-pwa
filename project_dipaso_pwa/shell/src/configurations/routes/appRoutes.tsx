// src/routes/appRoutes.tsx
import { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../../pages/loginPage/loginPage";
import DashboardLayout from "../../components/dashboard/dashboardLayout";
import DashboardHome from "../../pages/dashboardPage/dashboardPage";

const IAMPage = lazy(() => import("../../pages/iamPage/iamPage"));

interface AppRoutesProps {
  isAuthenticated: boolean;
}

export const AppRoutes: React.FC<AppRoutesProps> = ({ isAuthenticated }) => {
  return (
    <Routes>
      {/* Ruta principal */}
      <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />

      {/* Login */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />}
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
      </Route>

      {/* Catch-all */}
      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />}
      />
    </Routes>
  );
};
