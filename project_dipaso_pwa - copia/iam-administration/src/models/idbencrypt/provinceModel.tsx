// src/models/api/provinceModel.tsx

/**
 * Define la estructura de una Provincia (Province) obtenida del valor del catálogo.
 * Este ítem de catálogo se usa para la ubicación geográfica intermedia (entre País y Ciudad).
 */
export interface Province {
    /** ID único del ítem (no confundir con catalog_id). */
    id: string; 
    
    /** Nombre legible (ej: "Pichincha", "Guayas"). */
    name: string;
    
    /** Código de integración usado por otros sistemas (ej: "GUAYAS"). */
    integration_code: string;
    
    /** Código de referencia corto (ej: "G", "P"). */
    reference_code: string;
    
    /** Mnemónico corto (ej: "GUA"). */
    mnemonic: string;
    
    /** Descripción extendida. */
    description: string;
    
    /** Indica el orden de visualización. */
    order: number;
    
    /** Tipo de dato del valor (ej: "text"). */
    type: 'text'; 
    
    /** Indica si el usuario puede editar este ítem. */
    editable: boolean;
    
    // Campos de auditoría
    created_at: string;
    created_by_user_id: string | null;
    updated_at: string;
    updated_by_user_id: string | null;
}