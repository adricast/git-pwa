// src/datacomponents/documentTypeData.tsx

import { useState, useEffect } from 'react';
// 🚨 Importamos el servicio adaptador de Tipos de Documento
import { getLocalDocumentTypesList } from "./../services/idb/documenttypecatalogServices"; 
// 🚨 Importamos el modelo DocumentType
import { type DocumentType } from "./../models/idbencrypt/documenttypeModel"; 

/**
 * Define la interfaz de las opciones de formulario { value: id, label: name }.
 */
export interface DocumentTypeFormOption {
    value: string; // Corresponde a DocumentType.id
    label: string; // Corresponde a DocumentType.name
}

/**
 * Transforma la lista de objetos DocumentType[] descifrada al formato de opciones de formulario.
 * @param documentTypes Lista de tipos de documento descifrada.
 * @returns Array de opciones { value: id, label: name }.
 */
const transformDocumentTypesToOptions = (documentTypes: DocumentType[]): DocumentTypeFormOption[] => {
    if (!documentTypes || documentTypes.length === 0) {
        return [];
    }

    // Mapeo: DocumentType.id -> value, DocumentType.name -> label
    return documentTypes.map(docType => ({
        value: docType.id,
        label: docType.name,
    }));
};

/**
 * Hook para cargar las opciones de Tipos de Documento desde la caché de IndexedDB,
 * transformarlas y gestionar su estado.
 * * ✅ CORRECCIÓN: Acepta 'isMapInitialized' para sincronizar la ejecución.
 * * @returns Un objeto que contiene las opciones, el estado de carga y cualquier error.
 */
export function useDocumentTypeOptionsLoader(isMapInitialized: boolean) {
    const [documentTypeOptions, setDocumentTypeOptions] = useState<DocumentTypeFormOption[]>([]);
    // ✅ Empezamos en 'false' si el mapa no está listo
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

        async function fetchAndTransformDocumentTypes() {
            // Restablecer estados de carga y error antes de intentar la llamada
            setIsLoading(true);
            setError(null);
            
            try {
                // 1. Llama al servicio adaptador (Esta llamada ahora es SEGURA).
                const documentTypes: DocumentType[] = await getLocalDocumentTypesList();
                
                // 2. Transforma el resultado.
                const options = transformDocumentTypesToOptions(documentTypes);
                
                setDocumentTypeOptions(options);
            } catch (err: any) {
                console.error("Error al cargar y descifrar opciones de Tipos de Documento:", err);
                setError(err);
                setDocumentTypeOptions([]); 
            } finally {
                setIsLoading(false);
            }
        }

        // Se ejecuta la carga asíncrona SOLAMENTE cuando isMapInitialized es true.
        fetchAndTransformDocumentTypes();
    // ✅ Dependencia crítica: Se ejecuta solo cuando isMapInitialized cambia a true.
    }, [isMapInitialized]); 

    // Exporta el estado completo.
    return { documentTypeOptions, isLoading, error };
}