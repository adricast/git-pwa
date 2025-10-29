// src/models/api/documentTypeModel.tsx

/**
 * Define la estructura de un Tipo de Documento (DocumentType) obtenida del valor del catálogo.
 */
export interface DocumentType {
    /** ID único del ítem (no confundir con catalog_id). */
    id: string; 
    
    /** Nombre legible (ej: "Cédula", "Pasaporte"). */
    name: string;
    
    /** Código de integración usado por otros sistemas (ej: "CEDULA", "PAS"). */
    integration_code: string;
    
    /** Código de referencia corto (ej: "CI", "PA"). */
    reference_code: string;
    
    /** Mnemónico corto (ej: "CED", "PASS"). */
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