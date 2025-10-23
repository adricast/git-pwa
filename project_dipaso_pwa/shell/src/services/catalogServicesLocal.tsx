// 📁 src/services/catalogServices.tsx

import { api } from "./api2"; 
import { catalogsRouteApi} from "../configurations/routes/apiRoutes"; 
import { type Catalog } from "../models/api/catalogsModel" 
import { CatalogRepository } from "../db/catalogRepositoryLocal"; 

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
    items: any[]; // Usamos 'any[]' porque los campos son snake_case y serán mapeados
}

// ----------------------------------------------------------------------
// 2. FUNCIÓN AUXILIAR DE LIMPIEZA Y MAPEO DE ÍTEMS DE CATÁLOGO (snake_case -> camelCase)
// ----------------------------------------------------------------------

/**
 * Mapea los campos de snake_case a camelCase para los ítems internos
 * y asegura que los campos de auditoría y estado requeridos tengan valores por defecto.
 */
function cleanAndMapCatalogValueItems(value: any): any {
    if (Array.isArray(value)) {
        return value.map(item => ({
            // Mapeo snake_case a camelCase para ítems internos
            id: item.id,
            name: item.name,
            description: item.description,
            editable: item.editable,
            order: item.order,
            type: item.type,
            mnemonic: item.mnemonic,
            integrationCode: item.integration_code, // LEE snake_case
            referenceCode: item.reference_code,     // LEE snake_case
            // Campos específicos (e.g., currencies, auth)
            decimalPlaces: item.decimal_places,     // LEE snake_case
            symbol: item.symbol,
            actions: item.actions, 
            screens: item.screens, 

            // Saneamiento de campos de auditoría internos (mapeo y limpieza)
            isActive: item.is_active ?? true, // LEE snake_case
            createdAt: item.created_at, // LEE snake_case
            updatedAt: item.updated_at || item.created_at || new Date().toISOString(), // LEE snake_case
            createdByUserId: item.created_by_user_id || 'SYSTEM', // LEE snake_case
            updatedByUserId: item.updated_by_user_id || item.created_by_user_id || 'SYSTEM', // LEE snake_case
        }));
    }
    
    // Mapeo y saneamiento para catálogos 'single'
    if (typeof value === 'object' && value !== null) {
        return {
            ...value, 
            
            // Mapeo snake_case a camelCase para campos de 'single'
            defaultAuthMethod: value.default_auth_method, // LEE snake_case
            maxFailedAttempts: value.max_failed_attempts, // LEE snake_case

            // Saneamiento de campos de auditoría internos (mapeo y limpieza)
            isActive: value.is_active ?? true, // LEE snake_case
            createdAt: value.created_at, // LEE snake_case
            updatedAt: value.updated_at || value.created_at || new Date().toISOString(), // LEE snake_case
            createdByUserId: value.created_by_user_id || 'SYSTEM', // LEE snake_case
            updatedByUserId: value.updated_by_user_id || value.created_by_user_id || 'SYSTEM', // LEE snake_case
        };
    }
    return value;
}


// ----------------------------------------------------------------------
// 3. FUNCIÓN DE MAPEO PRINCIPAL (API snake_case -> Catalog camelCase)
// ----------------------------------------------------------------------

/**
 * Mapea el objeto Catalog (snake_case) de la API al modelo de frontend (camelCase).
 */
function mapCatalogFromApi(apiCatalog: any): Catalog {
    const cleanedValue = cleanAndMapCatalogValueItems(apiCatalog.catalog_value); // LEE snake_case: catalog_value

    return {
        // Mapeo de campos de nivel superior: snake_case -> camelCase
        catalogId: apiCatalog.catalog_id, // LEE snake_case
        catalogName: apiCatalog.catalog_name, // LEE snake_case
        catalogtype: apiCatalog.catalog_type, // LEE snake_case
        catalogValue: cleanedValue,
        description: apiCatalog.description,

        // Mapeo y saneamiento de auditoría de nivel superior
        isActive: apiCatalog.is_active ?? true, // LEE snake_case
        createdByUserId: apiCatalog.created_by_user_id, // LEE snake_case
        updatedByUserId: apiCatalog.updated_by_user_id, // LEE snake_case
        createdAt: apiCatalog.created_at, // LEE snake_case
        updatedAt: apiCatalog.updated_at || apiCatalog.created_at || new Date().toISOString(), // LEE snake_case
    } as Catalog;
}


// ----------------------------------------------------------------------
// 4. FUNCIONES DE CONSULTA GENERAL (API)
// ----------------------------------------------------------------------

/**
 * Obtiene todos los catálogos desde la API.
 */
export async function getAllCatalogs(activeOnly: boolean = false): Promise<Catalog[]> {
    try {
        const url = activeOnly ? `${BASE_ROUTE}?active=true` : BASE_ROUTE;
        
        // La respuesta es CatalogApiResponse<any> porque 'items' viene en snake_case
        const response = await api.get<CatalogApiResponse>(url); 
        
        const catalogsArray = response.data.items;
        
        if (!Array.isArray(catalogsArray)) {
            throw new Error("API response unexpected: 'items' property is not an array.");
        }

        // 🚨 APLICA MAPEO Y LIMPIEZA DE DATOS
        return catalogsArray.map(mapCatalogFromApi);
        
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
        // Esperamos 'any' de la API debido al snake_case
        const response = await api.get<any>(`${BASE_ROUTE}${catalogId}`); 
        
        // 🚨 APLICA MAPEO
        return mapCatalogFromApi(response.data); 
    } catch (error: any) {
        if (error.response && error.response.status === 404) {
            return null;
        }
        console.error(`Error fetching catalog ${catalogId} from API:`, error);
        throw error;
    }
}

// ----------------------------------------------------------------------
// 5. FUNCIÓN DE SINCRONIZACIÓN Y CACHÉ (SIN INYECCIÓN DE MOCK)
// ----------------------------------------------------------------------

/**
 * Sincroniza todos los catálogos activos desde la API y los guarda en IndexedDB.
 */
export async function syncAndCacheAllCatalogs(): Promise<void> {
    try {
        console.log("Sync: 1. Fetching active catalogs from API (PREREQUISITE)...");
        
        // 1. Trae los catálogos de la API (ya están en camelCase después de mapCatalogFromApi)
        const fetchedCatalogs = await getAllCatalogs(true); 

        // 2. Mapeo para asegurar la clave primaria de IndexedDB.
        // Se mantiene el mapeo de camelCase (Modelo) a snake_case (Repo Local) justo antes de guardar.
        const catalogsForRepo = fetchedCatalogs.map(catalog => {
            
            return {
                ...catalog,
                // Mapeo camelCase (Catalog Model) a snake_case (DB/Modelo Local)
                catalog_id: catalog.catalogId, 
                catalog_name: catalog.catalogName, 
                is_active: catalog.isActive, 
                updated_at: catalog.updatedAt, 
            } as any; 
        });


        console.log(`Sync: 2. ${catalogsForRepo.length} catalogs fetched. Saving to IndexedDB...`);
        
        // USO DEL REPOSITORIO
        await catalogRepo.clearAndBulkPutCatalogs(catalogsForRepo);

        console.log("Sync: 3. Catalogs successfully saved/updated in IndexedDB.");
        
    } catch (error) {
        console.error("❌ Critical failure in catalog synchronization.", error);
        throw error; 
    }
}

// ----------------------------------------------------------------------
// 6. FUNCIONES DE CONSULTA LOCAL (INDEXEDDB)
// ... (Se mantienen sin cambios)

export async function getLocalCatalogById(catalogId: string): Promise<Catalog | undefined> {
    console.log(`Cache: Fetching catalog ${catalogId} from IndexedDB.`);
    return catalogRepo.getCatalog(catalogId); 
}

export async function getLocalActiveCatalogs(): Promise<Catalog[]> {
    console.log("Cache: Fetching active catalogs from IndexedDB.");
    return catalogRepo.getActiveCatalogs(true);
}

export async function getLocalCatalogsByName(name: string): Promise<Catalog[]> {
    console.log(`Cache: Fetching catalogs by name "${name}" from IndexedDB.`);
    return catalogRepo.getCatalogsByName(name);
}

export async function getAllOrderedByUpdate(): Promise<Catalog[]> {
    console.log("Cache: Fetching all catalogs ordered by update date from IndexedDB.");
    return catalogRepo.getAllOrderedByUpdate();
}