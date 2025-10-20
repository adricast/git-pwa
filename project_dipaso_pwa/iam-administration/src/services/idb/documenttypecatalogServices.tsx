// src/services/idb/countryCatalogService.ts

// 🚨 Importamos la función centralizada
import { getLocalCatalogValue } from "./localCatalogServices"; 
import { type DocumentType } from "./../../models/idbencrypt/documenttypeModel"; // Modelo que creamos anteriormente
import { CATALOG_NAMES, CATALOG_NAME_TO_ID_MAP } from "./../../configurations/parameters/catalogParameters"; 

const DOCUMENTTYPE_CATALOG_ID = CATALOG_NAME_TO_ID_MAP[CATALOG_NAMES.DOCUMENT_TYPES];

/**
 * Obtiene la lista de países (Country[]) utilizando el servicio centralizado.
 */
export function getLocalDocumentTypesList(): Promise<DocumentType[]> {
    // Llama a la función genérica, pasando el ID y el tipo esperado.
    return getLocalCatalogValue<DocumentType>(DOCUMENTTYPE_CATALOG_ID, CATALOG_NAMES.DOCUMENT_TYPES);
}