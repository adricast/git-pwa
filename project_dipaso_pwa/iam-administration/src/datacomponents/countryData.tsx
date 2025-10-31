// src/datacomponents/countryData.tsx

import { useState, useEffect } from 'react';
// 🚨 Importamos el servicio adaptador que creamos (asumiendo esta ruta)
import { getLocalCountriesList } from "./../services/idb/countrycatalogServices"; 
// 🚨 Importamos el nuevo modelo Country
import { type Country } from "./../models/idbencrypt/countryModel"; 

/**
 * Define la interfaz de las opciones de formulario { value: id, label: name }.
 */
export interface CountryFormOption {
    value: string; // Corresponde a Country.id
    label: string; // Corresponde a Country.name
}

/**
 * Transforma la lista de objetos Country[] descifrada al formato de opciones de formulario.
 * @param countries Lista de países descifrada.
 * @returns Array de opciones { value: id, label: name }.
 */
const transformCountriesToOptions = (countries: Country[]): CountryFormOption[] => {
    if (!countries || countries.length === 0) {
        return [];
    }

    // Mapeo: Country.id -> value, Country.name -> label
    return countries.map(country => ({
        value: country.id,
        label: country.name,
    }));
};

/**
 * Hook para cargar las opciones de países desde la caché de IndexedDB,
 * transformarlas y gestionar su estado.
 * * ✅ CORRECCIÓN: Acepta 'isMapInitialized' para sincronizar la ejecución.
 * * @returns Un objeto que contiene las opciones, el estado de carga y cualquier error.
 */
export function useCountryOptionsLoader(isMapInitialized: boolean) {
    // Usamos el tipo específico para las opciones de país
    const [countryOptions, setCountryOptions] = useState<CountryFormOption[]>([]);
    // ✅ Empezamos en 'false' si el mapa no está listo
    const [isLoading, setIsLoading] = useState(!isMapInitialized); 
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        // 🛑 CONDICIÓN CLAVE: Si el mapa de IDs no está listo, sal del efecto.
        if (!isMapInitialized) {
            // Mantiene el estado de carga activo mientras espera, sin intentar la búsqueda.
            setIsLoading(true); 
            return;
        }

        // Si ya cargó y no tiene error, no cargamos de nuevo (optimización).
        if (!isLoading && !error) {
             return;
        }

        async function fetchAndTransformCountries() {
            // Restablecer estados de carga y error antes de intentar la llamada
            setIsLoading(true);
            setError(null);

            try {
                // 1. Llama al servicio adaptador (Esta llamada ahora es SEGURA).
                const countries: Country[] = await getLocalCountriesList();
                
                // 2. Transforma el resultado.
                const options = transformCountriesToOptions(countries);
                
                setCountryOptions(options);
            } catch (err: any) {
                console.error("Error al cargar y descifrar opciones de países:", err);
                setError(err);
                setCountryOptions([]); 
            } finally {
                setIsLoading(false);
            }
        }

        // Se ejecuta la carga asíncrona SOLAMENTE cuando isMapInitialized es true.
        fetchAndTransformCountries();
    // ✅ Dependencia crítica: Se ejecuta solo cuando isMapInitialized cambia a true.
    }, [isMapInitialized]); 

    // Exporta el estado completo.
    return { countryOptions, isLoading, error };
}