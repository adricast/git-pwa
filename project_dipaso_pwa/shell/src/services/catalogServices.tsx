// src/services/api/catalogService.ts (CORREGIDO)

import { api } from "./../services/api"; 
import { catalogsRouteApi } from "./../configurations/routes/apiRoutes"; 
import { type Catalog } from "./../models/api/catalogsModel" 
// 🚨 CORRECCIÓN: Importamos el Repositorio de IndexedDB
import { CatalogRepository } from "./../db/catalogRepository"; 

// ----------------------------------------------------------------------
// 1. CONSTANTES E INSTANCIAS
// ----------------------------------------------------------------------

const BASE_ROUTE = `${catalogsRouteApi.catalog}`; 
const catalogRepo = new CatalogRepository(); // ⬅️ Instancia del repositorio


// ----------------------------------------------------------------------
// 2. FUNCIONES DE CONSULTA GENERAL (API)
// ----------------------------------------------------------------------

/**
 * Obtiene todos los catálogos desde la API.
 * @param activeOnly Si es true, solo trae los activos (usa el query param `?active=true`).
 */
export async function getAllCatalogs(activeOnly: boolean = false): Promise<Catalog[]> {
    try {
        const url = activeOnly ? `${BASE_ROUTE}?active=true` : BASE_ROUTE;
        
        const response = await api.get<Catalog[]>(url); 
        
        if (!Array.isArray(response.data)) {
            throw new Error("API response unexpected: Array of catalogs expected.");
        }

        return response.data; 
    } catch (error: any) {
        console.error("Error fetching all catalogs from API:", error);
        throw error;
    }
}

/**
 * Obtiene un catálogo por ID desde la API.
 */
export async function getCatalogById(catalogId: string | number): Promise<Catalog | null> {
    try {
        const response = await api.get<Catalog>(`${BASE_ROUTE}${catalogId}`);
        return response.data; 
    } catch (error: any) {
        if (error.response && error.response.status === 404) {
            return null;
        }
        console.error(`Error fetching catalog ${catalogId} from API:`, error);
        throw error;
    }
}

// ----------------------------------------------------------------------
// 3. FUNCIÓN DE SINCRONIZACIÓN Y CACHÉ (UNIFICADA)
// ----------------------------------------------------------------------

/**
 * Sincroniza todos los catálogos activos desde la API y los guarda en IndexedDB.
 */
export async function syncAndCacheAllCatalogs(): Promise<void> {
    try {
        console.log("Sync: 1. Fetching active catalogs from API (PREREQUISITE)...");
        // Trae los catálogos de la API
        const allCatalogs = await getAllCatalogs(true); 

        console.log(`Sync: 2. ${allCatalogs.length} catalogs fetched. Saving to IndexedDB...`);
        
        // 🚨 USO DEL REPOSITORIO: Llama al método de guardado masivo, el cual
        // se encarga de CIFRAR cada registro antes de insertarlo en IndexedDB.
        await catalogRepo.clearAndBulkPutCatalogs(allCatalogs);

        console.log("Sync: 3. Catalogs successfully saved/updated in IndexedDB.");
        
    } catch (error) {
        console.error("❌ Critical failure in catalog synchronization.", error);
        throw error; 
    }
}

// ----------------------------------------------------------------------
// 4. FUNCIONES DE CONSULTA LOCAL (INDEXEDDB - ACCEDE A DATOS CIFRADOS)
// ----------------------------------------------------------------------

/**
 * Obtiene un catálogo por ID desde el caché (IndexedDB).
 * La data regresada ya está DESCIFRADA.
 */
export async function getLocalCatalogById(catalogId: string): Promise<Catalog | undefined> {
    console.log(`Cache: Fetching catalog ${catalogId} from IndexedDB.`);
    // El repositorio se encarga de obtener el registro cifrado y descifrarlo
    return catalogRepo.getCatalog(catalogId); 
}

/**
 * Obtiene todos los catálogos que están activos desde el caché.
 * La data regresada ya está DESCIFRADA.
 */
export async function getLocalActiveCatalogs(): Promise<Catalog[]> {
    console.log("Cache: Fetching active catalogs from IndexedDB.");
    // Usa el índice 'by_is_active' del repositorio, regresando data descifrada
    return catalogRepo.getActiveCatalogs(true);
}

/**
 * Obtiene catálogos por el nombre desde el caché.
 * La data regresada ya está DESCIFRADA.
 */
export async function getLocalCatalogsByName(name: string): Promise<Catalog[]> {
    console.log(`Cache: Fetching catalogs by name "${name}" from IndexedDB.`);
    // Usa el índice 'by_catalog_name' del repositorio, regresando data descifrada
    return catalogRepo.getCatalogsByName(name);
}

/**
 * Obtiene todos los catálogos del caché, ordenados por fecha de actualización.
 * La data regresada ya está DESCIFRADA.
 */
export async function getLocalAllCatalogsOrdered(): Promise<Catalog[]> {
    console.log("Cache: Fetching all catalogs ordered by update date from IndexedDB.");
    // Usa el índice 'by_updated_at' del repositorio, regresando data descifrada
    return catalogRepo.getAllOrderedByUpdate();
}
