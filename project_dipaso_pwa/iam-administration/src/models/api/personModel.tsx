// 📁 src/models/Person.ts (VERSION FINAL)

/**
 * Define la estructura de una persona (Cliente, Proveedor, Empleado, o Contacto general)
 * en el sistema, basada en la tabla 'iam_people'.
 */
export interface Person {
    /** Clave principal. Corresponde a 'person_id' (UUID). */
    personId: string;

    /** Corresponde a 'given_name' (Nombre de pila). */
    givenName: string;

    /** Corresponde a 'sur_name' (Apellido). */
    surName: string;

    /** Corresponde a 'date_of_birth' (Fecha de nacimiento). Formato ISO 8601 string. */
    dateOfBirth?: string; 

    /** Corresponde a 'phone_number'. Puede ser opcional. */
    phoneNumber?: string; 

    /** ID del género. Corresponde a 'gender_id' (UUID). */
    genderId?: string;

    // --- Roles (Flags Booleanos) ---

    /** Indica si esta persona es un cliente ('is_customer'). */
    isCustomer: boolean;

    /** Indica si esta persona es un proveedor ('is_supplier'). */
    isSupplier: boolean;

    /** Indica si esta persona es un empleado ('is_employee'). */
    isEmployee: boolean;

    /** Estado de actividad ('is_active'). */
    isActive: boolean;

    /** Código de integración con sistemas externos ('integration_code'). */
    integrationCode?: string;
    
    // --- Metadatos de Auditoría (Aseguramos que coincidan con to_dict()) ---
    
    /** Fecha de creación ('created_at'). Generada por la tabla. */
    createdAt: string; 

    /** Fecha de última actualización ('updated_at'). Generada por la tabla. */
    updatedAt: string; 

    /** ID del usuario que creó el registro ('created_by_user_id'). */
    createdByUserId?: string;

    /** ID del usuario que actualizó el registro ('updated_by_user_id'). */
    updatedByUserId?: string;
}