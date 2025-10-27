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
    MODULES: 'modules',
    KEYBOARD_SHORTCUTS: 'keyboard_shortcuts',
    CURRENCIES: 'currencies',
    TAX_TYPES: 'tax_types',
    ADDRESSES: 'address_types',
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
    // ID: CATALOG_NAME
    'ebc24002-bc0a-4d6b-b7e3-7809950fd100': CATALOG_NAMES.COUNTRIES,
    '725e031c-cb7b-4aaf-ae11-04e4b3f4e6d1': CATALOG_NAMES.DOCUMENT_TYPES,
    '6661c54a-06c3-4379-a2df-cda05ce5f46c': CATALOG_NAMES.PROVINCES,
    '44fa9707-3667-4658-b39e-e884fcbc4d7e': CATALOG_NAMES.CITIES,
    '02ce8a3c-ab27-444b-8b93-1b5d73506eb9': CATALOG_NAMES.GENDERS,
    'a846c7a1-35c4-43b8-8409-d2a8d6fe95a7': CATALOG_NAMES.AUTH_PARAMETERS,
    '8a17b2c4-c69e-4c53-b24a-a58bfacbabf0': CATALOG_NAMES.AUTH_METHODS,
    '66547be9-cece-4239-953d-52e89deea846': CATALOG_NAMES.MODULES,
    '28a6104b-92fa-4f5d-afdd-56bbf7b50fd5': CATALOG_NAMES.KEYBOARD_SHORTCUTS,
    'f5fb62bf-21a7-428e-95dd-093a0ef8ee4a': CATALOG_NAMES.CURRENCIES,
    '1af11df3-c24c-46c9-8c69-186c16b1c3ce': CATALOG_NAMES.TAX_TYPES,
    'b1234567-89ab-cdef-0123-456789abcdef': CATALOG_NAMES.ADDRESSES,
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
