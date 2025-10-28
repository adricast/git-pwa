// src/datacomponents/authmethodData.tsx

import { useState, useEffect } from 'react';
// 🚨 Importamos el servicio adaptador de Ciudades
import { getLocalAuthMethodList } from "../services/idb/authmethodcatalogServices"; 
// 🚨 Importamos el modelo AuthMethod
import { type AuthMethodModel  } from "../models/idbencrypt/authmethodModel"; 

/**
 * Define la interfaz de las opciones de formulario { value: id, label: name }.
 */
export interface AuthMethodFormOption {
    value: string;
    label: string;
}

/**
 * Transforma la lista de objetos AuthMethodModel[] descifrada al formato de opciones de formulario.
 */
const transformAddressesToOptions = (authmethod: AuthMethodModel[]): AuthMethodFormOption[] => {
    if (!authmethod || authmethod.length === 0) {
        return [];
    }

    // Mapeo: authmethod.id -> value, authmethod.name -> label
    return authmethod.map(authmethod => ({
        value: authmethod.id,
        label: authmethod.name,
    }));
};

/**
 * Hook para cargar las opciones de Ciudades desde la caché de IndexedDB,
 * transformarlas y gestionar su estado.
 * * ✅ CORRECCIÓN: Acepta 'isMapInitialized' para sincronizar la ejecución.
 */
export function useAdressOptionsLoader(isMapInitialized: boolean) {
    const [AuthMethodOptions, setAuthMethodOptions] = useState<AuthMethodFormOption[]>([]);
    // ✅ Empezamos en 'false' si el mapa no está listo, reflejando que estamos esperando.
    const [isLoading, setIsLoading] = useState(!isMapInitialized); 
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        // 🛑 CONDICIÓN CLAVE: Si el mapa de IDs no está listo, sal del efecto.
        if (!isMapInitialized) {
            // Si el mapa aún no está listo, el hook no ha fallado, solo está esperando.
            setIsLoading(true); 
            return;
        }
        
        // Si ya cargó y no tiene error, no cargamos de nuevo.
        if (!isLoading && !error) {
             return;
        }

        async function fetchAndTransformAuthMetods() {
            // Restablecer estados de carga y error antes de intentar la llamada
            setIsLoading(true);
            setError(null);
            
            try {
                // 1. Llama al servicio adaptador de Ciudades
                // Esta llamada ahora es SEGURA porque el GLOBAL_CATALOG_ID_MAP está lleno.
                const authmethod: AuthMethodModel[] = await getLocalAuthMethodList();
                
                // 2. Transforma el resultado.
                const options = transformAddressesToOptions(authmethod);
                
                setAuthMethodOptions(options);
            } catch (err: any) {
                console.error("Error al cargar y descifrar opciones de Metodos de Authenticacion:", err);
                setError(err);
                setAuthMethodOptions([]); 
            } finally {
                setIsLoading(false);
            }
        }

        // Se ejecuta la carga asíncrona SOLAMENTE cuando isMapInitialized es true.
        fetchAndTransformAuthMetods();
    // ✅ Dependencia crítica: Se ejecuta solo cuando isMapInitialized cambia a true.
    }, [isMapInitialized]); 

    // Exporta el estado completo.
    return { AuthMethodOptions, isLoading, error };
}