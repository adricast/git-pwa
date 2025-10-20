// src/services/idb/countryCatalogService.ts

// 🚨 Importamos la función centralizada
import { getLocalCatalogValue } from "./localCatalogServices"; 
import { type Country } from "./../../models/idbencrypt/countryModel"; // Modelo que creamos anteriormente
import { CATALOG_NAMES, CATALOG_NAME_TO_ID_MAP } from "./../../configurations/parameters/catalogParameters"; 

const COUNTRY_CATALOG_ID = CATALOG_NAME_TO_ID_MAP[CATALOG_NAMES.COUNTRIES];

/**
 * Obtiene la lista de países (Country[]) utilizando el servicio centralizado.
 */
export function getLocalCountriesList(): Promise<Country[]> {
    // Llama a la función genérica, pasando el ID y el tipo esperado.
    return getLocalCatalogValue<Country>(COUNTRY_CATALOG_ID, CATALOG_NAMES.COUNTRIES);
}