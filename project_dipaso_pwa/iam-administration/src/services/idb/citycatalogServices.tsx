// src/services/idb/countryCatalogService.ts

// 🚨 Importamos la función centralizada
import { getLocalCatalogValue } from "./localCatalogServices"; 
import { type City } from "./../../models/idbencrypt/cityModel"; // Modelo que creamos anteriormente
import { CATALOG_NAMES, CATALOG_NAME_TO_ID_MAP } from "./../../configurations/parameters/catalogParameters"; 

const CITY_CATALOG_ID = CATALOG_NAME_TO_ID_MAP[CATALOG_NAMES.CITIES];

/**
 * Obtiene la lista de países (Country[]) utilizando el servicio centralizado.
 */
export function getLocalCitiesList(): Promise<City[]> {
    // Llama a la función genérica, pasando el ID y el tipo esperado.
    return getLocalCatalogValue<City>(CITY_CATALOG_ID, CATALOG_NAMES.CITIES);
}