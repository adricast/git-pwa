

import { api } from "./api2"; 
import { catalogsRouteApi} from "./../configurations/routes/apiRoutes"; 
import { type Catalog } from "./../models/api/catalogsModel" 
// 🚨 CORRECCIÓN: Importamos el Repositorio de IndexedDB
import { CatalogRepository } from "./../db/catalogRepository"; 

// ----------------------------------------------------------------------
// 1. CONSTANTES, INTERFACES Y INSTANCIAS
// ----------------------------------------------------------------------

const BASE_ROUTE = `${catalogsRouteApi.catalog}`; 
const catalogRepo = new CatalogRepository(); 

/**
 * Define la estructura esperada de la respuesta estructurada del backend (paginada).
 */
interface CatalogApiResponse {
    total: number;
    skip: number;
    limit: number;
    items: Catalog[]; // <-- El array real de catálogos
}


// ----------------------------------------------------------------------
// 2. FUNCIONES DE CONSULTA GENERAL (API)
// ----------------------------------------------------------------------

/**
 * Obtiene todos los catálogos desde la API.
 * @param activeOnly Si es true, solo trae los activos (usa el query param `?active=true`).
 */
export async function getAllCatalogs(activeOnly: boolean = false): Promise<Catalog[]> {
    try {
        // La URL completa es BASE_URL/api/catalogs/ o BASE_URL/api/catalogs/?active=true
        const url = activeOnly ? `${BASE_ROUTE}?active=true` : BASE_ROUTE;
        
        // 1. Axios recibe la respuesta estructurada
        const response = await api.get<CatalogApiResponse>(url); 
        
        // 2. Extrae el array de la propiedad 'items'
        const catalogsArray = response.data.items;
        
        if (!Array.isArray(catalogsArray)) {
            // Este error ya no debería ocurrir si la API siempre envía 'items'
            throw new Error("API response unexpected: 'items' property is not an array.");
        }

        // 3. RETORNO: Se retorna el arreglo real
        return catalogsArray; 
        
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
        
        // 1. Trae los catálogos de la API (solo los activos, ya extraídos del campo 'items')
        const fetchedCatalogs = await getAllCatalogs(true); 

        // 2. Mapeo para asegurar la clave primaria.
        // El backend devuelve 'catalogId' (camelCase) y 'catalogName' (camelCase). 
        // IndexedDB necesita 'catalog_id' y 'catalog_name' (snake_case) como claves sin cifrar.
        const catalogsForRepo = fetchedCatalogs.map(catalog => {
            const apiCatalog = catalog as any; // Para acceder a claves en camelCase de la API
            
            return {
                ...catalog,
                // 🚨 CORRECCIÓN CLAVE: Mapeo de camelCase API a snake_case DB/Modelo
                catalog_id: apiCatalog.catalogId || catalog.catalog_id, // Garantiza PK
                catalog_name: apiCatalog.catalogName || catalog.catalog_name, // Garantiza Índice
            }
        });


        console.log(`Sync: 2. ${catalogsForRepo.length} catalogs fetched. Saving to IndexedDB...`);
        
        // 🚨 USO DEL REPOSITORIO: Llama al método de guardado masivo con los datos mapeados
        await catalogRepo.clearAndBulkPutCatalogs(catalogsForRepo);

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
export async function getAllOrderedByUpdate(): Promise<Catalog[]> {
    console.log("Cache: Fetching all catalogs ordered by update date from IndexedDB.");
    // Usa el índice 'by_updated_at' del repositorio, regresando data descifrada
    return catalogRepo.getAllOrderedByUpdate();
}