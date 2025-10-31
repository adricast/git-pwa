//src/datacomponents/genderData.tsx

import { useState, useEffect } from 'react';
import { getLocalGendersList } from "./../services/idb/gendercatalogServices"; 
import { type Gender } from "../models/idbencrypt/genderModel"; // Importa el tipo Gender

/**
 * Define la interfaz de las opciones de formulario { value: id, label: name }.
 */
export interface GenderFormOption {
    value: string; // Corresponde a Gender.id
    label: string; // Corresponde a Gender.name
}

/**
 * Transforma la lista de objetos Gender[] descifrada al formato de opciones de formulario.
 * @param genders Lista de géneros descifrada.
 * @returns Array de opciones { value: id, label: name }.
 */
const transformGendersToOptions = (genders: Gender[]): GenderFormOption[] => {
    if (!genders || genders.length === 0) {
        return [];
    }

    // El ID se mapea a 'value' y el nombre a 'label'.
    return genders.map(gender => ({
        value: gender.id,
        label: gender.name,
    }));
};

/**
 * Hook para cargar las opciones de género desde la caché de IndexedDB,
 * transformarlas y gestionar su estado.
 * * @returns Un objeto que contiene las opciones, el estado de carga y cualquier error.
 */
export function useGenderOptionsLoader(isMapInitialized: boolean) { // <-- ACEPTA EL ESTADO
    const [genderOptions, setGenderOptions] = useState<GenderFormOption[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        // 🛑 CONDICIÓN CLAVE: Si el mapa de IDs no está listo, sal del efecto.
        if (!isMapInitialized) {
            setIsLoading(true); // Mantén el estado de carga activo mientras esperas
            return;
        }

        async function fetchAndTransformGenders() {
            try {
                // ... (Lógica de fetchAndTransformGenders idéntica a la tuya) ...
                const genders: Gender[] = await getLocalGendersList();
                const options = transformGendersToOptions(genders);
                setGenderOptions(options);
                setError(null);
            } catch (err: any) {
                console.error("Error al cargar y descifrar opciones de género:", err);
                setError(err);
                setGenderOptions([]); 
            } finally {
                setIsLoading(false);
            }
        }

        // Si isMapInitialized es TRUE, se ejecuta la carga.
        fetchAndTransformGenders();
    // ✅ Dependencia crítica: Ejecuta solo cuando isMapInitialized pasa de false a true
    }, [isMapInitialized]); 

    return { genderOptions, isLoading, error };
}