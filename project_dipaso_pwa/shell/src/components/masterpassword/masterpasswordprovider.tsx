// 📁 src/components/masterpassword/masterpasswordprovider.tsx

import React, { useState, useCallback, useMemo } from "react";
import { v4 as uuidv4 } from 'uuid'; 
import { MasterPasswordContext } from "./masterpasswordcontext";
import { type MasterAuthItem, type MasterPasswordContextProps } from "./interface";

export const MasterPasswordProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    
    const [authStack, setAuthStack] = useState<MasterAuthItem[]>([]);

    // 1. SOLICITAR AUTORIZACIÓN (Abre el diálogo)
    const requestAuthorization: MasterPasswordContextProps["requestAuthorization"] = useCallback(
        (title, expectedKey, onSuccess, onFailure) => {
            const newRequest: MasterAuthItem = {
                id: uuidv4(),
                expectedKey,
                title,
                onSuccess,
                onFailure,
            };

            // Agregamos la nueva petición al inicio de la pila (LIFO)
            setAuthStack(prevStack => [newRequest, ...prevStack]);
        },
        []
    );

    // 2. CERRAR AUTORIZACIÓN SUPERIOR
    const closeTopAuthorization: MasterPasswordContextProps["closeTopAuthorization"] = useCallback(() => {
        // Quitamos el elemento superior de la pila
        setAuthStack(prevStack => prevStack.slice(1));
    }, []);

    // 3. PROCESAR Y RESOLVER AUTORIZACIÓN SUPERIOR
    const processAuthorization: MasterPasswordContextProps["processAuthorization"] = useCallback(
        async (inputKey) => {
            const topRequest = authStack[0];
            if (!topRequest) return false;

            // Simulamos retraso de verificación (como si fuera a un backend)
            await new Promise(resolve => setTimeout(resolve, 500)); 
            
            const isCorrect = inputKey.trim() === topRequest.expectedKey;

            if (isCorrect) {
                try {
                    // 🟢 ÉXITO: Ejecuta la acción y luego cierra el diálogo
                    await topRequest.onSuccess(); 
                } catch (error) {
                    console.error("Error al ejecutar onSuccess:", error);
                    // Podrías manejar un error de ejecución aquí si es necesario
                }
                closeTopAuthorization();
            } else {
                // 🔴 FRACASO: Ejecuta la acción de fallo si existe
                topRequest.onFailure?.();
                // El prompt no se cierra en caso de fallo para permitir reintentar
            }

            return isCorrect;
        },
        [authStack, closeTopAuthorization]
    );

    const contextValue = useMemo(() => ({
        authStack, 
        requestAuthorization, 
        closeTopAuthorization,
        processAuthorization,
    }), [authStack, requestAuthorization, closeTopAuthorization, processAuthorization]);

    return (
        <MasterPasswordContext.Provider value={contextValue}>
            {children}
        </MasterPasswordContext.Provider>
    );
};