// 📁 src/services/idb/gendercatalogServices.ts (CORREGIDO)

// 🚨 Importamos la función centralizada
import { getLocalCatalogValue } from "./localCatalogServices"; 
import { type Gender } from "../../models/idbencrypt/genderModel"; 
import { CATALOG_NAMES } from "./../../configurations/parameters/catalogParameters"; 

// ❌ ELIMINAR ESTA LÍNEA: Ya no dependemos de IDs estáticos
// const GENDER_CATALOG_ID = CATALOG_NAME_TO_ID_MAP[CATALOG_NAMES.GENDERS];

/**
 * Obtiene la lista de géneros (Gender[]) utilizando el servicio centralizado.
 */
export function getLocalGendersList(): Promise<Gender[]> {
    
    // 🎯 CORRECCIÓN CLAVE: 
    // 1. Pasa solo el tipo del ELEMENTO INDIVIDUAL (Gender) como genérico.
    // 2. Pasa solo el NOMBRE del catálogo (CATALOG_NAMES.GENDERS) como argumento.
    // La función centralizada 'getLocalCatalogValue' buscará el ID internamente en el mapeo.
    return getLocalCatalogValue<Gender>(CATALOG_NAMES.GENDERS);
}