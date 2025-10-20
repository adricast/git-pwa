// src/datacomponents/cityData.tsx

import { useState, useEffect } from 'react';
// 🚨 Importamos el servicio adaptador de Ciudades
import { getLocalCitiesList } from "./../services/idb/citycatalogServices"; 
// 🚨 Importamos el modelo City
import { type City } from "./../models/idbencrypt/cityModel"; 

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
const transformCitiesToOptions = (cities: City[]): CityFormOption[] => {
    if (!cities || cities.length === 0) {
        return [];
    }

    // Mapeo: City.id -> value, City.name -> label
    return cities.map(city => ({
        value: city.id,
        label: city.name,
    }));
};

/**
 * Hook para cargar las opciones de Ciudades desde la caché de IndexedDB,
 * transformarlas y gestionar su estado.
 */
export function useCityOptionsLoader() {
    const [cityOptions, setCityOptions] = useState<CityFormOption[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        async function fetchAndTransformCities() {
            try {
                // 1. Llama al servicio adaptador de Ciudades
                const cities: City[] = await getLocalCitiesList();
                
                // 2. Transforma el resultado.
                const options = transformCitiesToOptions(cities);
                
                setCityOptions(options);
            } catch (err: any) {
                console.error("Error al cargar y descifrar opciones de ciudades:", err);
                setError(err);
                setCityOptions([]); 
            } finally {
                setIsLoading(false);
            }
        }

        fetchAndTransformCities();
    }, []);

    // Exporta el estado completo.
    return { cityOptions, isLoading, error };
}