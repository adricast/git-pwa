// 📁 src/components/masterpassword/usemasterpassword.tsx

import { useContext } from "react";
import { MasterPasswordContext } from "./masterpasswordcontext";

/**
 * Hook que permite a cualquier componente solicitar la autorización de clave maestra
 * y cerrar el diálogo de autorización.
 */
export const useMasterPassword = () => {
    const context = useContext(MasterPasswordContext);
    
    if (!context) {
        throw new Error("useMasterPassword debe usarse dentro de un MasterPasswordProvider");
    }
    
    // Devolvemos solo las funciones públicas necesarias para solicitar la acción
    const { requestAuthorization, closeTopAuthorization } = context;

    return { 
        requestAuthorization, 
        closeTopAuthorization
    };
};