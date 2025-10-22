// 📁 src/services/idb/countryCatalogService.ts (CORRECCIÓN FINAL)

// 🚨 Importamos la función centralizada
import { getLocalCatalogValue } from "./localCatalogServices"; 
import { type Country } from "./../../models/idbencrypt/countryModel"; 
import { CATALOG_NAMES } from "./../../configurations/parameters/catalogParameters"; 

// ❌ ELIMINAR ESTA LÍNEA: Ya no dependemos de IDs estáticos
// const COUNTRY_CATALOG_ID = CATALOG_NAME_TO_ID_MAP[CATALOG_NAMES.COUNTRIES];

/**
 * Obtiene la lista de países (Country[]) utilizando el servicio centralizado.
 */
export function getLocalCountriesList(): Promise<Country[]> {
    
    // 🎯 CORRECCIÓN CLAVE: 
    // 1. Pasa solo el tipo del ELEMENTO INDIVIDUAL (Country).
    // 2. Pasa solo el NOMBRE del catálogo (CATALOG_NAMES.COUNTRIES).
    // La función centralizada encontrará el ID internamente.
    
    return getLocalCatalogValue<Country>(CATALOG_NAMES.COUNTRIES);
}