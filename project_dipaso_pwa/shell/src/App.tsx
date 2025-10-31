import { useEffect, useState } from "react";
import { AppRoutes } from "./configurations/routes/appRoutes";
import { authSensor, initAuthService } from "authorizer/authExports"; 
import { syncAndCacheAllCatalogs } from "./services/catalogServicesLocal";

function App() {
       const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
       const [isDataReady, setIsDataReady] = useState(false);
       // El mensaje de carga debe ser mínimo o invisible si deseas una transición rápida.
       const [loadingMessage, setLoadingMessage] = useState("Iniciando aplicación...");

       useEffect(() => {
              // Función que se ejecuta tras una autenticación exitosa
              const handleAuthSuccess = async () => {
                     try {
                            // Mensaje de estado: Autenticación OK, iniciando carga de datos
                            setLoadingMessage("Cargando datos esenciales..."); 
                            setIsAuthenticated(true);

                            await syncAndCacheAllCatalogs();
                            setLoadingMessage("Listo."); // Mensaje final antes de la transición
                     } catch (error) {
                            setIsAuthenticated(false);
                            setLoadingMessage("Error: no se pudo cargar la configuración inicial.");
                     } finally {
                            setIsDataReady(true);
                     }
              };

              // Función que se ejecuta si la autenticación falla
              const handleAuthFailure = () => {
                     setIsAuthenticated(false);
                     setLoadingMessage("Autenticación fallida. Redirigiendo a inicio de sesión.");
                     setIsDataReady(true);
              };

              // Suscribimos a eventos de autenticación
              authSensor.on("item-synced", handleAuthSuccess);
              authSensor.on("item-failed", handleAuthFailure);
              authSensor.on("sync-failure", handleAuthFailure);
              authSensor.on("itemDeleted", handleAuthFailure);

              // Iniciamos autenticación
              setLoadingMessage("Autenticando...");
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
       // Pantalla de carga (Mínima)
       // -----------------------------------------------------------
       if (!isDataReady) {
              return (
                     // Estilos eliminados para el entorno de producción
                     <div className="app-loading-screen">
                            <p>{loadingMessage}</p>
                            {/* 🛑 ELIMINAMOS el bloque condicional de "Autenticación exitosa" */}
                     </div>
              );
       }

       // Renderizamos rutas solo cuando autenticación + catálogos están listos
       return <AppRoutes isAuthenticated={isAuthenticated!} />;
}

export default App;