// 📁 src/components/masterpassword/interface.ts

// ❌ Eliminamos: import React from "react"; 

// 🟢 Estructura del Item de Autorización (si queremos una pila de peticiones)
export interface MasterAuthItem {
    id: string;
    expectedKey: string;
    title: string;
    onSuccess: () => Promise<void>;
    onFailure?: () => void;
}

/**
 * 🟢 ESTADO GLOBAL DEL CONTEXTO
 */
export interface MasterPasswordContextProps {
    /** La pila de peticiones de autorización pendientes. */
    authStack: MasterAuthItem[];
    
    /** * Abre el diálogo de clave maestra con una acción específica.
     * @param title Título del diálogo.
     * @param expectedKey Clave a verificar.
     * @param onSuccess Función a ejecutar si la clave es correcta.
     * @param onFailure Función opcional a ejecutar si la clave es incorrecta.
     */
    requestAuthorization: (
        title: string, 
        expectedKey: string, 
        onSuccess: () => Promise<void>,
        onFailure?: () => void
    ) => void;
    
    /** Cierra el diálogo superior de autorización, independientemente del éxito o fracaso. */
    closeTopAuthorization: () => void;
    
    /** * Verifica y resuelve la petición de autorización superior.
     * @param key Clave ingresada por el usuario.
     */
    processAuthorization: (key: string) => Promise<boolean>;
}