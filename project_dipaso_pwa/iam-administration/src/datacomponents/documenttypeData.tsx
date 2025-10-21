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
 * * @returns Un objeto que contiene las opciones, el estado de carga y cualquier error.
 */
export function useDocumentTypeOptionsLoader() {
    const [documentTypeOptions, setDocumentTypeOptions] = useState<DocumentTypeFormOption[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        async function fetchAndTransformDocumentTypes() {
            try {
                // 1. Llama al servicio adaptador (que usa el servicio centralizado y lo descifra).
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

        fetchAndTransformDocumentTypes();
    }, []);

    // Exporta el estado completo.
    return { documentTypeOptions, isLoading, error };
}