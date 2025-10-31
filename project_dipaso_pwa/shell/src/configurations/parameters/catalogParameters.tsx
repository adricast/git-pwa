/**
 * Define los nombres clave de los catálogos para evitar errores de escritura
 * al consultar la capa de servicios.
 * * Se usa un objeto 'const' con 'as const' para asegurar la inmutabilidad 
 * y un mejor soporte de tree-shaking y módulos, evitando el error de enum.
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
} as const;

// ----------------------------------------------------------------------
// TIPOS DE UTILIDAD
// ----------------------------------------------------------------------

// Creamos un tipo de utilidad basado en los valores del objeto
export type CatalogNameKey = (typeof CATALOG_NAMES)[keyof typeof CATALOG_NAMES];


/**
 * Mapeo de IDs únicos de catálogo a sus nombres clave.
 * Usamos Object.freeze para asegurar que este mapeo sea inmutable en tiempo de ejecución.
 */
export const CATALOG_ID_MAP = Object.freeze({
         // ID (ACTUALIZADO)           : CATALOG_NAME
         'bcb18598-8ba0-48e7-a1fb-7015efd47b3a': CATALOG_NAMES.COUNTRIES,       // ⬅️ ACTUALIZADO
         '5b536bde-28a2-4238-8129-a4ae1808f1f8': CATALOG_NAMES.DOCUMENT_TYPES,  // ⬅️ ACTUALIZADO
         '0b542456-d373-4fae-8671-8cbb3235dc2d': CATALOG_NAMES.PROVINCES,       // ⬅️ ACTUALIZADO
         'f412d001-0af3-4895-902f-07ae7e5142a8': CATALOG_NAMES.CITIES,          // ⬅️ ACTUALIZADO
         'acd82bcb-cb2d-47f8-8e2e-b559f75fbf7c': CATALOG_NAMES.GENDERS,         // ⬅️ ACTUALIZADO
         '508e666c-7dec-4b1b-8aef-7385d107519c': CATALOG_NAMES.AUTH_PARAMETERS, // ⬅️ ACTUALIZADO
         '666e74ba-466f-4a0d-93f7-b6582f617e42': CATALOG_NAMES.AUTH_METHODS,    // ⬅️ ACTUALIZADO
         //'66547be9-cece-4239-953d-52e89deea846': CATALOG_NAMES.MODULES,
         '6d173e18-326d-4875-a574-635cffdbbe97': CATALOG_NAMES.KEYBOARD_SHORTCUTS, // ⬅️ ACTUALIZADO
         //'f5fb62bf-21a7-428e-95dd-093a0ef8ee4a': CATALOG_NAMES.CURRENCIES,
         '5275c291-c7f0-430d-b8c7-38e95c55d4e4': CATALOG_NAMES.TAX_TYPES,       // ⬅️ ACTUALIZADO
});

/**
 * Un mapeo inverso para obtener el ID si solo tienes el nombre del catálogo.
 * Se genera dinámicamente a partir de CATALOG_ID_MAP.
 */
export const CATALOG_NAME_TO_ID_MAP: Readonly<Record<CatalogNameKey, string>> = Object.freeze(
         Object.entries(CATALOG_ID_MAP).reduce((acc, [id, name]) => {
                  // Aseguramos que 'name' es una clave válida para la asignación
                  acc[name as CatalogNameKey] = id;
                  return acc;
         }, {} as Record<CatalogNameKey, string>)
);