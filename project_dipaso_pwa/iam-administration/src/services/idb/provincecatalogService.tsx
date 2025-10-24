// 📁 src/services/idb/countryCatalogService.ts (CORRECCIÓN FINAL para Province)

// 🚨 Importamos la función centralizada
import { getLocalCatalogValue } from "./localCatalogServices"; 
import { type Province } from "./../../models/idbencrypt/provinceModel"; // Modelo que creamos anteriormente
import { CATALOG_NAMES } from "./../../configurations/parameters/catalogParameters"; 

// ❌ ELIMINAR ESTA LÍNEA: Ya no dependemos de IDs estáticos
// const PROVINCE_CATALOG_ID = CATALOG_NAME_TO_ID_MAP[CATALOG_NAMES.PROVINCES];

/**
 * Obtiene la lista de provincias (Province[]) utilizando el servicio centralizado.
 */
export function getLocalProvincesList(): Promise<Province[]> {
    
    // 🎯 CORRECCIÓN CLAVE: 
    // 1. Pasa solo el tipo del ELEMENTO INDIVIDUAL (Province) como genérico.
    // 2. Pasa solo el NOMBRE del catálogo (CATALOG_NAMES.PROVINCES) como argumento.
    // La función centralizada 'getLocalCatalogValue' buscará el ID internamente.
    
    return getLocalCatalogValue<Province>(CATALOG_NAMES.PROVINCES);
}