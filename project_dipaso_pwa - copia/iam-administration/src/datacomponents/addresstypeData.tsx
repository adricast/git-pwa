// src/datacomponents/AddrestypeData.tsx

import { useState, useEffect } from 'react';
// 🚨 Importamos el servicio adaptador de Ciudades
import { getLocalAdressList } from "./../services/idb/addresscatalogServices"; 
// 🚨 Importamos el modelo Address
import { type AddressType } from "./../models/idbencrypt/adresstypeModel"; 

/**
 * Define la interfaz de las opciones de formulario { value: id, label: name }.
 */
export interface AddressFormOption {
    value: string;
    label: string;
}

/**
 * Transforma la lista de objetos Address[] descifrada al formato de opciones de formulario.
 */
const transformAddressesToOptions = (addresses: AddressType[]): AddressFormOption[] => {
    if (!addresses || addresses.length === 0) {
        return [];
    }

    // Mapeo: Address.id -> value, Address.name -> label
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
export function useAdressOptionsLoader(isMapInitialized: boolean) {
    const [AddressOptions, setAddressOptions] = useState<AddressFormOption[]>([]);
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

        async function fetchAndTransformAddress() {
            // Restablecer estados de carga y error antes de intentar la llamada
            setIsLoading(true);
            setError(null);
            
            try {
                // 1. Llama al servicio adaptador de Ciudades
                // Esta llamada ahora es SEGURA porque el GLOBAL_CATALOG_ID_MAP está lleno.
                const addresses: AddressType[] = await getLocalAdressList();
                
                // 2. Transforma el resultado.
                const options = transformAddressesToOptions(addresses);
                
                setAddressOptions(options);
            } catch (err: any) {
                console.error("Error al cargar y descifrar opciones de Direcciones de Personas:", err);
                setError(err);
                setAddressOptions([]); 
            } finally {
                setIsLoading(false);
            }
        }

        // Se ejecuta la carga asíncrona SOLAMENTE cuando isMapInitialized es true.
        fetchAndTransformAddress();
    // ✅ Dependencia crítica: Se ejecuta solo cuando isMapInitialized cambia a true.
    }, [isMapInitialized]); 

    // Exporta el estado completo.
    return { AddressOptions, isLoading, error };
}