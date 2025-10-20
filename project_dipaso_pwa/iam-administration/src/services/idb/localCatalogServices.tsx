// src/services/idb/localCatalogService.ts

//************************************** */
//* PATRON DE DISEÑO FABRICA (REPOSITORY)
//************************************** */

import { decryptAndVerifyData } from "./../../hooks/encrypterIdb/useMac"; 
import { getLocalDB } from "./../../db/localIDBdatabase"; 
import { type LocalEncryptedCatalogRecordValue } from "./../../db/LocalCatalogsDB"; 

// Definición local de la interfaz para el fragmento cifrado (si no se importó)
interface LocalEncryptedFragment {
    payload: string;
    signature: string;
}

const STORE_NAME = "catalogs";

/**
 * 🚨 FUNCIÓN CENTRALIZADA
 * Lee un catálogo cifrado de IndexedDB, lo desencripta y devuelve su valor tipificado.
 * * @param catalogId El ID del catálogo a buscar (ej: GENDER_CATALOG_ID).
 * @param catalogName Nombre legible del catálogo para mensajes de error.
 * @returns Una promesa que resuelve con el valor del catálogo descifrado, tipificado como T[].
 */
export async function getLocalCatalogValue<T>(
    catalogId: string, 
    catalogName: string
): Promise<T[]> {
    
    console.log(`IAM-Administration: Direct read and decrypt for ${catalogName} catalog.`);

    const db = await getLocalDB();

    // 1. Obtener el registro CIFRADO por su clave primaria (catalog_id)
    const encryptedRecord: LocalEncryptedCatalogRecordValue | undefined = 
        await db.get(STORE_NAME, catalogId);

    if (!encryptedRecord) {
        console.error(`Error: ${catalogName} Catalog ID ${catalogId} not found in local IndexedDB.`);
        throw new Error(`${catalogName} catalog not available locally for consumption.`);
    }

    // 2. Extraer el campo CIFRADO
    const encryptedFragment: LocalEncryptedFragment = encryptedRecord.encrypted_catalog_value; 

    let catalogValue: any;
    try {
        // 3. Descifrar el fragmento para obtener el valor en texto plano.
        catalogValue = decryptAndVerifyData(encryptedFragment);
    } catch (error) {
        console.error(`Error: Falló el descifrado o verificación del catálogo ${catalogName} (ID: ${catalogId}).`, error);
        throw new Error(`Security Error: Failed to decrypt or verify ${catalogName} data.`);
    }
    
    // 4. Validar y retornar.
    if (!Array.isArray(catalogValue)) {
        console.error(`Error: Decrypted data for ${catalogName} is not an array.`);
        return [] as T[];
    }
    
    return catalogValue as T[];
}