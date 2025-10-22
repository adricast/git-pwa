// 📁 src/services/idb/localCatalogService.ts (VERSIÓN FINAL Y LIMPIA)

//************************************** */
//* SERVICIO DE APLICACIÓN (LÓGICA DE NEGOCIO)
//************************************** */

// 🚨 IMPORTACIÓN DEL REPOSITORY Y MODELOS NECESARIOS
import { IamCatalogRepository } from "./../../db/iamCatalogRepository"; // La clase que maneja la DB
import type { Catalog } from "./../../models/idb/catalogsModel"; // Modelo completo del catálogo

// IMPORTACIONES GLOBALES
import { 
    GLOBAL_CATALOG_ID_MAP, 
    type CatalogNameKey
} from "./../../configurations/parameters/catalogParameters";

// Instanciar el Repository para usar sus métodos de lectura
const iamCatalogRepo = new IamCatalogRepository(); 


export async function getLocalCatalogValue<T>(
    catalogName: CatalogNameKey
): Promise<T[]> {
    
    // 🎯 1. OBTENER ID: Usar el mapa global
    const catalogId = GLOBAL_CATALOG_ID_MAP[catalogName]; 
    
    if (!catalogId) {
        console.warn(`WARN: Catalog name '${catalogName}' ID not found in map. Waiting for initialization...`);
        return Promise.resolve([] as T[]);
    }
    
    console.log(`IAM-Administration: Reading local cache for ${catalogName} (ID: ${catalogId}).`);

    // 🚨 2. DELEGAR AL REPOSITORY: Obtener el objeto Catalog COMPLETO y DESCIFRADO
    const catalog: Catalog | undefined = await iamCatalogRepo.getCatalogById(catalogId);

    if (!catalog) {
        console.error(`Error: ${catalogName} Catalog ID ${catalogId} not found in local IndexedDB.`);
        throw new Error(`${catalogName} catalog not available locally for consumption.`);
    }

    // 3. EXTRAER EL VALOR: 
    // ✅ CORRECCIÓN CLAVE: La lista de ítems está en la propiedad catalog.catalog_value.
    const catalogValues = (catalog as any).catalog_value; 

    // 4. Validar y retornar.
    if (!Array.isArray(catalogValues)) {
        // El mensaje de error ahora es más informativo
        const message = `Expected an array at catalog.catalog_value, but found type: ${typeof catalogValues}.`;

        console.error(`Error: Decrypted data for ${catalogName} is not an array.`, message);
        throw new Error(`Decrypted data for ${catalogName} is not an array. (Internal structure incorrect)`);
    }
    
    // El valor final se retorna con el tipo genérico T[]
    return catalogValues as T[];
}