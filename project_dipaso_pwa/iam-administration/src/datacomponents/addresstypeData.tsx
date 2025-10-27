// src/datacomponents/cityData.tsx

import { useState, useEffect } from 'react';
// 🚨 Importamos el servicio adaptador de Ciudades
import { getLocalAdressList } from "./../services/idb/addresscatalogServices"; 
// 🚨 Importamos el modelo City
import { type AddressType } from "./../models/idbencrypt/adresstypeModel"; 

/**
 * Define la interfaz de las opciones de formulario { value: id, label: name }.
 */
export interface CityFormOption {
    value: string;
    label: string;
}

/**
 * Transforma la lista de objetos City[] descifrada al formato de opciones de formulario.
 */
const transformCitiesToOptions = (addresses: AddressType[]): CityFormOption[] => {
    if (!addresses || addresses.length === 0) {
        return [];
    }

    // Mapeo: City.id -> value, City.name -> label
    return addresses.map(address => ({
        value: address.id,
        label: address.name,
    }));
};

/**
 * Hook para cargar las opciones de Ciudades desde la caché de IndexedDB,
 * transformarlas y gestionar su estado.
 * * ✅ CORRECCIÓN: Acepta 'isMapInitialized' para sincronizar la ejecución.
 */
export function useCityOptionsLoader(isMapInitialized: boolean) {
    const [cityOptions, setCityOptions] = useState<CityFormOption[]>([]);
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

        async function fetchAndTransformCities() {
            // Restablecer estados de carga y error antes de intentar la llamada
            setIsLoading(true);
            setError(null);
            
            try {
                // 1. Llama al servicio adaptador de Ciudades
                // Esta llamada ahora es SEGURA porque el GLOBAL_CATALOG_ID_MAP está lleno.
                const addresses: AddressType[] = await getLocalAdressList();
                
                // 2. Transforma el resultado.
                const options = transformCitiesToOptions(addresses);
                
                setCityOptions(options);
            } catch (err: any) {
                console.error("Error al cargar y descifrar opciones de ciudades:", err);
                setError(err);
                setCityOptions([]); 
            } finally {
                setIsLoading(false);
            }
        }

        // Se ejecuta la carga asíncrona SOLAMENTE cuando isMapInitialized es true.
        fetchAndTransformCities();
    // ✅ Dependencia crítica: Se ejecuta solo cuando isMapInitialized cambia a true.
    }, [isMapInitialized]); 

    // Exporta el estado completo.
    return { cityOptions, isLoading, error };
}