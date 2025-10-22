// src/datacomponents/provinceData.tsx

import { useState, useEffect } from 'react';
// 🚨 Importamos el servicio adaptador de Provincias
import { getLocalProvincesList } from "./../services/idb/provincecatalogService"; 
// 🚨 Importamos el modelo Province
import { type Province } from "./../models/idbencrypt/provinceModel"; 

/**
 * Define la interfaz de las opciones de formulario { value: id, label: name }.
 */
export interface ProvinceFormOption {
    value: string; // Corresponde a Province.id
    label: string; // Corresponde a Province.name
}

/**
 * Transforma la lista de objetos Province[] descifrada al formato de opciones de formulario.
 */
const transformProvincesToOptions = (provinces: Province[]): ProvinceFormOption[] => {
    if (!provinces || provinces.length === 0) {
        return [];
    }

    // Mapeo: Province.id -> value, Province.name -> label
    return provinces.map(province => ({
        value: province.id,
        label: province.name,
    }));
};

/**
 * Hook para cargar las opciones de Provincias desde la caché de IndexedDB,
 * transformarlas y gestionar su estado.
 * * ✅ CORRECCIÓN: Acepta 'isMapInitialized' para sincronizar la ejecución.
 */
export function useProvinceOptionsLoader(isMapInitialized: boolean) {
    const [provinceOptions, setProvinceOptions] = useState<ProvinceFormOption[]>([]);
    // ✅ Estado inicial que refleja la espera del mapa.
    const [isLoading, setIsLoading] = useState(!isMapInitialized); 
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        // 🛑 CONDICIÓN CLAVE: Si el mapa de IDs no está listo, sal del efecto.
        if (!isMapInitialized) {
            // Mantiene el estado de carga activo mientras espera.
            setIsLoading(true); 
            return;
        }

        // Si ya cargó y no tiene error, no cargamos de nuevo (optimización).
        if (!isLoading && !error) {
             return;
        }

        async function fetchAndTransformProvinces() {
            // Restablecer estados de carga y error antes de intentar la llamada
            setIsLoading(true);
            setError(null);
            
            try {
                // 1. Llama al servicio adaptador (Esta llamada es ahora SEGURA).
                const provinces: Province[] = await getLocalProvincesList();
                
                // 2. Transforma el resultado
                const options = transformProvincesToOptions(provinces);
                
                setProvinceOptions(options);
            } catch (err: any) {
                console.error("Error al cargar y descifrar opciones de provincias:", err);
                setError(err);
                setProvinceOptions([]); 
            } finally {
                setIsLoading(false);
            }
        }

        // Se ejecuta la carga asíncrona SOLAMENTE cuando isMapInitialized es true.
        fetchAndTransformProvinces();
    // ✅ Dependencia crítica: Se ejecuta solo cuando isMapInitialized cambia a true.
    }, [isMapInitialized]); 

    // Exporta el estado completo.
    return { provinceOptions, isLoading, error };
}