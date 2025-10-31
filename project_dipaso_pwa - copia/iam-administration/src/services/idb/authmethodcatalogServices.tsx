// 📁 src/services/idb/cityCatalogService.ts (CORREGIDO)

// 🚨 Importamos la función centralizada
import { getLocalCatalogValue } from "./localCatalogServices"; 
import { type AuthMethodModel } from "../../models/idbencrypt/authmethodModel"; 
import { CATALOG_NAMES } from "../../configurations/parameters/catalogParameters"; 

// ❌ ELIMINAR ESTA LÍNEA: 
// const CITY_CATALOG_ID = CATALOG_NAME_TO_ID_MAP[CATALOG_NAMES.CITIES]; 

/**
 * Obtiene la lista de ciudades (City[]) utilizando el servicio centralizado.
 */
export function getLocalAuthMethodList(): Promise<AuthMethodModel[]> {
    
    // 🎯 CORRECCIÓN: Pasa SOLO el tipo del ELEMENTO INDIVIDUAL (City).
    // La función getLocalCatalogValue (que retorna Promise<T[]>) le agrega el array.
    // T = City  => Retorno es Promise<City[]>
    return getLocalCatalogValue<AuthMethodModel>(CATALOG_NAMES.AUTHMETHOD); 
}