export interface UserGroupUpdatePayload {
    /** Nombre del grupo. Opcional. */
    groupName?: string;

    /** Descripción opcional. */
    description?: string;

    /** Código de integración opcional. */
    integrationCode?: string;

    /** Nivel de criticidad. Opcional. */
    criticality?: string; // "LOW" | "MEDIUM" | "HIGH"

    /** Estado activo/inactivo. Opcional. */
    isActive?: boolean;

    /** * ID del usuario que modifica el registro. Opcional en el payload si se envía 
     * por header o si se usa el MOCK_AUDIT_USER_ID en el controlador. 
     */
    updatedByUserId?: string; 
}