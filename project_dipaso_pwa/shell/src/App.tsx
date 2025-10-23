import { useEffect, useState } from "react";
import { AppRoutes } from "./configurations/routes/appRoutes";
import { authSensor, initAuthService } from "authorizer/authExports"; 
import { syncAndCacheAllCatalogs } from "./services/catalogServicesLocal";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isDataReady, setIsDataReady] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Iniciando aplicación...");

  useEffect(() => {
    // Función que se ejecuta tras una autenticación exitosa
    const handleAuthSuccess = async () => {
      try {
        setLoadingMessage("✅ Autenticación exitosa. Cargando catálogos...");
        console.log("Autenticación exitosa.");
        setIsAuthenticated(true);

        await syncAndCacheAllCatalogs();
        console.log("Catálogos sincronizados y listos.");
      } catch (error) {
        console.error("Error al cargar catálogos tras autenticación:", error);
        setIsAuthenticated(false);
      } finally {
        setIsDataReady(true);
      }
    };

    // Función que se ejecuta si la autenticación falla
    const handleAuthFailure = () => {
      console.log("Autenticación fallida o sesión eliminada.");
      setIsAuthenticated(false);
      setLoadingMessage("❌ Autenticación fallida.");
      setIsDataReady(true);
    };

    // Suscribimos a eventos de autenticación
    authSensor.on("item-synced", handleAuthSuccess);
    authSensor.on("item-failed", handleAuthFailure);
    authSensor.on("sync-failure", handleAuthFailure);
    authSensor.on("itemDeleted", handleAuthFailure);

    // Iniciamos autenticación
    setLoadingMessage("🔑 Autenticando...");
    initAuthService();

    // Cleanup
    return () => {
      authSensor.off("item-synced", handleAuthSuccess);
      authSensor.off("item-failed", handleAuthFailure);
      authSensor.off("sync-failure", handleAuthFailure);
      authSensor.off("itemDeleted", handleAuthFailure);
    };
  }, []);

  // -----------------------------------------------------------
  // Pantalla de carga mientras autenticación + catálogos
  // -----------------------------------------------------------
  if (!isDataReady) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-gray-700 font-semibold">
        <div className="mb-4 text-xl">{loadingMessage}</div>
        {isAuthenticated === true && (
          <div className="p-4 bg-green-100 text-green-800 rounded-lg shadow-md">
            Autenticación exitosa 🎉
          </div>
        )}
      </div>
    );
  }

  // Renderizamos rutas solo cuando autenticación + catálogos están listos
  return <AppRoutes isAuthenticated={isAuthenticated!} />;
}

export default App;
