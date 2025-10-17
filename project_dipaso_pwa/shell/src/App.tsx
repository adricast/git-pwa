// src/App.tsx
import { useEffect, useState } from "react";
import { AppRoutes } from "./configurations/routes/appRoutes"; // 👈 importamos las rutas
import { authSensor, initAuthService } from "authorizer/authExports"; 

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    initAuthService();

    const handleSynced = () => setIsAuthenticated(true);
    const handleFailed = () => setIsAuthenticated(false);
    const handleFailure = () => setIsAuthenticated(false);
    const handleDeleted = () => setIsAuthenticated(false);

    authSensor.on("item-synced", handleSynced);
    authSensor.on("item-failed", handleFailed);
    authSensor.on("sync-failure", handleFailure);
    authSensor.on("itemDeleted", handleDeleted);

    return () => {
      authSensor.off("item-synced", handleSynced);
      authSensor.off("item-failed", handleFailed);
      authSensor.off("sync-failure", handleFailure);
      authSensor.off("itemDeleted", handleDeleted);
    };
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-700 font-semibold">
        Cargando...
      </div>
    );
  }

  return <AppRoutes isAuthenticated={isAuthenticated} />;
}

export default App;
