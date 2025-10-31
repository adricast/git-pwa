// 📁 src/services/idb/countryCatalogService.ts (CORRECCIÓN PARA DocumentType)

// 🚨 Importamos la función centralizada
import { getLocalCatalogValue } from "./localCatalogServices"; 
import { type DocumentType } from "./../../models/idbencrypt/documenttypeModel"; // Modelo que creamos anteriormente
import { CATALOG_NAMES } from "./../../configurations/parameters/catalogParameters"; 

// ❌ ELIMINAR ESTA LÍNEA: Ya no dependemos de IDs estáticos
// const DOCUMENTTYPE_CATALOG_ID = CATALOG_NAME_TO_ID_MAP[CATALOG_NAMES.DOCUMENT_TYPES];

/**
 * Obtiene la lista de tipos de documento (DocumentType[]) utilizando el servicio centralizado.
 */
export function getLocalDocumentTypesList(): Promise<DocumentType[]> {
    
    // 🎯 CORRECCIÓN CLAVE: 
    // 1. Pasa solo el tipo del ELEMENTO INDIVIDUAL (DocumentType) como genérico.
    // 2. Pasa solo el NOMBRE del catálogo (CATALOG_NAMES.DOCUMENT_TYPES) como argumento.
    // La función centralizada 'getLocalCatalogValue' buscará el ID internamente.
    return getLocalCatalogValue<DocumentType>(CATALOG_NAMES.DOCUMENT_TYPES);
}