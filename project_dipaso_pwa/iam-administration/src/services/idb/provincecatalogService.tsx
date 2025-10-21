// src/services/idb/countryCatalogService.ts

// 🚨 Importamos la función centralizada
import { getLocalCatalogValue } from "./localCatalogServices"; 
import { type Province } from "./../../models/idbencrypt/provinceModel"; // Modelo que creamos anteriormente
import { CATALOG_NAMES, CATALOG_NAME_TO_ID_MAP } from "./../../configurations/parameters/catalogParameters"; 

const PROVINCE_CATALOG_ID = CATALOG_NAME_TO_ID_MAP[CATALOG_NAMES.PROVINCES];

/**
 * Obtiene la lista de países (Country[]) utilizando el servicio centralizado.
 */
export function getLocalProvincesList(): Promise<Province[]> {
    // Llama a la función genérica, pasando el ID y el tipo esperado.
    return getLocalCatalogValue<Province>(PROVINCE_CATALOG_ID, CATALOG_NAMES.PROVINCES);
}