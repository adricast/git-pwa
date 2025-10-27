// 📁 src/configurations/catalogNames.ts (VERSIÓN FINAL)

/**
 * Define los nombres clave de los catálogos para evitar errores de escritura
 * al consultar la capa de servicios.
 * Se usa un objeto 'const' con 'as const' para asegurar la inmutabilidad.
 */
export const CATALOG_NAMES = {
    COUNTRIES: 'countries',
    DOCUMENT_TYPES: 'document_types',
    PROVINCES: 'provinces',
    CITIES: 'cities',
    GENDERS: 'genders',
    AUTH_PARAMETERS: 'auth_parameters',
    AUTH_METHODS: 'auth_methods',
    //MODULES: 'modules',
    KEYBOARD_SHORTCUTS: 'keyboard_shortcuts',
    //CURRENCIES: 'currencies',
    TAX_TYPES: 'tax_types',

    ADDRESSTYPE: 'address_types',
} as const;

// ----------------------------------------------------------------------
// TIPOS DE UTILIDAD
// ----------------------------------------------------------------------

// Creamos un tipo de utilidad basado en los valores del objeto
export type CatalogNameKey = (typeof CATALOG_NAMES)[keyof typeof CATALOG_NAMES];


// ----------------------------------------------------------------------
// 🚨 ELIMINACIÓN DE ID ESTÁTICOS
// Se eliminan CATALOG_ID_MAP y CATALOG_NAME_TO_ID_MAP.
// Ahora se usará un repositorio de IDs en el servicio para almacenar esto.

// ----------------------------------------------------------------------
// 🟢 NUEVA INTERFAZ: Repositorio de Mapeo
// ----------------------------------------------------------------------

// Interfaz para el objeto de mapeo que se llenará durante la inicialización.
export interface CatalogIdMapRepository {
    // Almacena el ID del catálogo (UUID) basado en su nombre
    [key: string]: string; 
}

// Repositorio de mapeo global que se llena dinámicamente.
// Los componentes y servicios usarán solo la clave.
// Los IDs son inaccesibles en este archivo.
export const GLOBAL_CATALOG_ID_MAP: CatalogIdMapRepository = {};