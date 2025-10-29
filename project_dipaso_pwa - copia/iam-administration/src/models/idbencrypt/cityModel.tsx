// src/models/api/cityModel.tsx

/**
 * Define la estructura de una Ciudad (City) obtenida del valor del catálogo.
 */
export interface City {
    /** ID único del ítem (no confundir con catalog_id). */
    id: string; 
    
    /** Nombre legible (ej: "Quito", "Guayaquil"). */
    name: string;
    
    /** Código de integración usado por otros sistemas (ej: "GUAYAQUIL"). */
    integration_code: string;
    
    /** Código de referencia corto (ej: "GYE"). */
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