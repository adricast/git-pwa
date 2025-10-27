import type { UserModel } from "./userModel";

/**
 * Representa un Grupo de Usuarios, alineado con la tabla iam_user_groups del backend
 * y la convención de nombres camelCase.
 */
export interface GroupModel {
    /** * ID oficial del grupo (user_group_id en la BD). 
     * Se mantiene como string (UUID) | number (aunque la BD usa UUID).
     */
    userGroupId: string; // Cambiado de groupId a userGroupId para coincidir con la BD

    /** Nombre del grupo (group_name en la BD) */
    groupName: string;

    /** Descripción opcional (description en la BD) */
    description?: string;

    /** Código de integración (integration_code en la BD) */
    integrationCode?: string; // Nuevo campo

    /** Nivel de criticidad (criticality en la BD) */
    criticality?: string; // Nuevo campo con valor por defecto 'MEDIUM' en BD

    /** Estado activo/inactivo (is_active en la BD) */
    isActive?: boolean;

    /**
     * Campos de Auditoría
     * Se utilizan para registrar quién y cuándo creó/actualizó el registro.
     */
    
    /** Fecha de creación (created_at en la BD) */
    createdAt?: string;
    
    /** Fecha de última modificación (updated_at en la BD) */
    updatedAt?: string;

    /** ID del usuario que creó el registro (created_by_user_id en la BD) */
    createdByUserId?: string;

    /** ID del usuario que modificó el registro (updated_by_user_id en la BD) */
    updatedByUserId?: string;

    /** Relación con usuarios (opcional, si se carga en el frontend) */
    users?: UserModel[];
}

// Para operaciones de creación (POST), donde el ID aún no existe.
export type GroupCreationPayload = Omit<GroupModel, 
    "userGroupId" | "createdAt" | "updatedAt" | "updatedByUserId"
>;