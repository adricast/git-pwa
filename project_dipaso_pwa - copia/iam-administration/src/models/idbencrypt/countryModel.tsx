// src/models/api/countryModel.tsx

/**
 * Define la estructura de un País (Country) obtenida del valor del catálogo.
 */
export interface Country {
    /** ID único del ítem (no confundir con catalog_id). */
    id: string; 
    
    /** Nombre legible (ej: "Ecuador", "Colombia"). */
    name: string;
    
    /** Código de integración usado por otros sistemas (ej: "ECU", "COL"). */
    integration_code: string;
    
    /** Código de referencia corto (ej: "EC", "CO"). */
    reference_code: string;
    
    /** Mnemónico corto (ej: "ECU", "COL"). */
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