import { useEffect, useState } from "react";
import { AppRoutes } from "./configurations/routes/appRoutes";
import { authSensor, initAuthService } from "authorizer/authExports"; 

// 🚨 CLAVE: Importamos la función UNIFICADA y CORRECTA de sincronización.
import { syncAndCacheAllCatalogs } from "./services/catalogServices"; 

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  // isDataReady: Indica que tanto los catálogos como la autenticación han concluido su proceso.
  const [isDataReady, setIsDataReady] = useState(false); 

  useEffect(() => {
    // Definimos una función asíncrona para iniciar el proceso de carga
    const initializeApplication = async () => {
        try {
            // -----------------------------------------------------
            // 1. CARGA DE CATÁLOGOS (PREREQUISITO)
            // -----------------------------------------------------
            console.log("🔥 1. Iniciando sincronización de catálogos (PREREQUISITO)...");
            // Bloquea aquí hasta que los catálogos estén en IndexedDB.
            await syncAndCacheAllCatalogs();
            console.log("✅ Catálogos sincronizados y listos.");

            // -----------------------------------------------------
            // 2. INICIALIZACIÓN DE AUTENTICACIÓN
            // -----------------------------------------------------
            console.log("🔥 2. Inicializando servicio de autenticación...");
            // initAuthService ahora puede usar los datos del catálogo desde IDB.
            await initAuthService(); 
            
        } catch (error) {
            console.error("❌ Fallo crítico al iniciar la aplicación (Catálogos o Auth):", error);
            // Si falla la carga de catálogos o la inicialización de Auth:
            // 1. Forzamos a la app a no estar autenticada (para redirigir a login o pantalla de error).
            setIsAuthenticated(false); 
            // 2. Liberamos el bloqueo de carga.
            setIsDataReady(true); 
        }
    };
    
    // Función que se ejecuta tras una autenticación exitosa
    const handleSynced = () => {
        console.log("✅ 3. Autenticación finalizada con éxito.");
        setIsAuthenticated(true);
        setIsDataReady(true); // Se libera el bloqueo de carga
    };

    // Función que se ejecuta si la autenticación falla o la sesión se elimina
    const handleAuthFailure = () => {
        console.log("❌ 3. Autenticación fallida o sesión eliminada.");
        setIsAuthenticated(false);
        setIsDataReady(true); // Se libera el bloqueo de carga
    };

    // 3. Suscripción a Eventos (Observan el proceso de autenticación)
    authSensor.on("item-synced", handleSynced);
    authSensor.on("item-failed", handleAuthFailure);
    authSensor.on("sync-failure", handleAuthFailure);
    authSensor.on("itemDeleted", handleAuthFailure);

    // Inicia el proceso
    initializeApplication();

    // 4. Limpieza
    return () => {
        authSensor.off("item-synced", handleSynced);
        authSensor.off("item-failed", handleAuthFailure);
        authSensor.off("sync-failure", handleAuthFailure);
        authSensor.off("itemDeleted", handleAuthFailure);
    };
  }, []); // Se ejecuta solo al montar

  // -----------------------------------------------------------
  // Lógica de Bloqueo y Mensaje de Carga
  // -----------------------------------------------------------

  if (!isDataReady) {
    
    let loadingMessage = "Sincronizando datos iniciales (Catálogos)...";
    
    return (
      <div className="flex items-center justify-center h-screen text-gray-700 font-semibold">
        {loadingMessage}
      </div>
    );
  }
  
  // Una vez que la data (catálogos) y la autenticación están listas.
  // 🚨 SOLUCIÓN: Usamos el operador de aserción no-nulo (!) para indicar a TypeScript
  // que en este punto (isDataReady === true), isAuthenticated NUNCA es null.
  return <AppRoutes isAuthenticated={isAuthenticated!} />;
}

export default App;
