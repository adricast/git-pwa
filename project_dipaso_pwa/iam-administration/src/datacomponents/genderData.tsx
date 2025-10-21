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
export function useGenderOptionsLoader() {
    const [genderOptions, setGenderOptions] = useState<GenderFormOption[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        async function fetchAndTransformGenders() {
            try {
                // 1. Llama al servicio que accede y descifra los datos de IndexedDB.
                const genders: Gender[] = await getLocalGendersList();
                
                // 2. Transforma el resultado al formato de opciones del formulario.
                const options = transformGendersToOptions(genders);
                
                setGenderOptions(options);
            } catch (err: any) {
                console.error("Error al cargar y descifrar opciones de género:", err);
                setError(err);
                setGenderOptions([]); 
            } finally {
                setIsLoading(false);
            }
        }

        fetchAndTransformGenders();
    }, []);

    // Exporta el estado completo para que el componente de formulario (Wrapper) 
    // pueda manejar la carga y el error.
    return { genderOptions, isLoading, error };
}