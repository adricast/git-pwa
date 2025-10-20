// src/services/idb/gendercatalogServices.ts

// 🚨 Importamos la función centralizada
import { getLocalCatalogValue } from "./localCatalogServices"; 
import { type Gender } from "../../models/idbencrypt/genderModel"; 
import { CATALOG_NAMES, CATALOG_NAME_TO_ID_MAP } from "./../../configurations/parameters/catalogParameters"; 

const GENDER_CATALOG_ID = CATALOG_NAME_TO_ID_MAP[CATALOG_NAMES.GENDERS];

/**
 * Obtiene la lista de géneros (Gender[]) utilizando el servicio centralizado.
 */
export function getLocalGendersList(): Promise<Gender[]> {
    // Llama a la función genérica, pasando el ID y el tipo esperado.
    return getLocalCatalogValue<Gender>(GENDER_CATALOG_ID, CATALOG_NAMES.GENDERS);
}