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
 */
export function useProvinceOptionsLoader() {
    const [provinceOptions, setProvinceOptions] = useState<ProvinceFormOption[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        async function fetchAndTransformProvinces() {
            try {
                // 1. Llama al servicio adaptador de Provincias
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

        fetchAndTransformProvinces();
    }, []);

    // Exporta el estado completo.
    return { provinceOptions, isLoading, error };
}