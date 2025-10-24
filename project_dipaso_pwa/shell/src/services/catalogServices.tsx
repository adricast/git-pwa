// 📁 src/services/catalogServices.tsx

import { api } from "./api2"; 
import { catalogsRouteApi} from "./../configurations/routes/apiRoutes"; 
import { type Catalog } from "./../models/api/catalogsModel" 
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
// 2. FUNCIÓN AUXILIAR DE LIMPIEZA DE ÍTEMS DE CATÁLOGO
// ----------------------------------------------------------------------

/**
 * Asegura que todos los ítems dentro de catalogValue tengan los campos
 * de auditoría y estado requeridos, proporcionando valores por defecto si faltan.
 */
function cleanCatalogValueItems(value: any): any {
    if (Array.isArray(value)) {
        return value.map(item => ({
            ...item,
            // Saneamiento de campos de auditoría internos
            isActive: item.isActive ?? true, 
            updatedAt: item.updatedAt || item.createdAt || new Date().toISOString(),
            createdByUserId: item.createdByUserId || 'SYSTEM',
            updatedByUserId: item.updatedByUserId || item.createdByUserId || 'SYSTEM',
        }));
    }
    // Saneamiento para catálogos 'single'
    if (typeof value === 'object' && value !== null) {
        return {
            ...value,
            isActive: value.isActive ?? true, 
            updatedAt: value.updatedAt || value.createdAt || new Date().toISOString(),
            createdByUserId: value.createdByUserId || 'SYSTEM',
            updatedByUserId: value.updatedByUserId || value.createdByUserId || 'SYSTEM',
        };
    }
    return value;
}


// ----------------------------------------------------------------------
// 3. FUNCIONES DE CONSULTA GENERAL (API)
// ----------------------------------------------------------------------

/**
 * Obtiene todos los catálogos desde la API.
 */
export async function getAllCatalogs(activeOnly: boolean = false): Promise<Catalog[]> {
    try {
        const url = activeOnly ? `${BASE_ROUTE}?active=true` : BASE_ROUTE;
        
        const response = await api.get<CatalogApiResponse>(url); 
        
        const catalogsArray = response.data.items;
        
        if (!Array.isArray(catalogsArray)) {
            throw new Error("API response unexpected: 'items' property is not an array.");
        }

        // 🚨 APLICA LIMPIEZA DE DATOS (Mapeo de la respuesta)
        return catalogsArray.map(catalog => ({
            ...catalog,
            // 1. Limpieza de metadatos del catálogo principal (camelCase)
            isActive: catalog.isActive ?? true, 
            updatedAt: catalog.updatedAt || catalog.createdAt || new Date().toISOString(),

            // 2. Limpieza de los ítems internos del catálogo (catalogValue)
            catalogValue: cleanCatalogValueItems(catalog.catalogValue)
        }));
        
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
// 4. FUNCIÓN DE SINCRONIZACIÓN Y CACHÉ (SIN INYECCIÓN DE MOCK)
// ----------------------------------------------------------------------

/**
 * Sincroniza todos los catálogos activos desde la API y los guarda en IndexedDB.
 */
export async function syncAndCacheAllCatalogs(): Promise<void> {
    try {
        console.log("Sync: 1. Fetching active catalogs from API (PREREQUISITE)...");
        
        // 1. Trae los catálogos de la API (ya están limpios)
        const fetchedCatalogs = await getAllCatalogs(true); 

        // 2. Mapeo para asegurar la clave primaria de IndexedDB (snake_case).
        // 🚨 NOTA: NO se inyecta el catálogo 'modules' aquí.
        const catalogsForRepo = fetchedCatalogs.map(catalog => {
            
            return {
                ...catalog,
                // Mapeo camelCase API a snake_case DB/Modelo (para PKs e índices)
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
// 5. FUNCIONES DE CONSULTA LOCAL (INDEXEDDB)
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