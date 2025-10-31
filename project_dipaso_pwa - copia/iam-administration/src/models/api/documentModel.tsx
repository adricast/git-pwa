/**
 * Define la estructura de un documento asociado a una persona,
 * reflejando un objeto dentro del array 'documents' del JSON.
 */
export interface DocumentModel {
    /** Clave principal del documento. Corresponde a 'person_document_id' (UUID). */
    personDocumentId: string;

    /** ID del tipo de documento. Corresponde a 'doc_type_id' (UUID). */
    docTypeId: string;
    
    /** Número del documento. Corresponde a 'doc_number'. */
    docNumber: string;
    
    /** ID de la persona a la que pertenece este documento. Corresponde a 'person_id' (UUID). */
    personId: string;
    
    /** ID del país emisor. Corresponde a 'issuing_country' (UUID). */
    issuingCountry: string;
    
    /** Fecha de expiración. Corresponde a 'expiration_date' (ISO 8601 string). */
    expirationDate?: string;
    
    /** Código de integración con sistemas externos. Corresponde a 'integration_code'. */
    integrationCode?: string;

    /** Estado de actividad. Corresponde a 'is_active'. */
    isActive: boolean;
    
    /** ID del usuario que creó el registro. Corresponde a 'created_by_user_id'. */
    createdByUserId: string;
}