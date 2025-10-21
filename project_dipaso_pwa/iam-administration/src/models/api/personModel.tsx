import type { AddressModel } from "./addressModel";
import type { DocumentModel } from "./documentModel";
import type { EmployeeDetailsModel } from "./employdetailsModel";

/**
 * Define la estructura completa de una Persona, incluyendo sus relaciones
 * anidadas (direcciones, documentos y detalles de empleado).
 */
export interface PersonModel {
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

    /** ID del usuario que creó el registro. Corresponde a 'created_by_user_id'. */
    createdByUserId: string; // Movido de Auditoría y hecho obligatorio basado en el JSON

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
    
    // --- Estructuras Anidadas ---
    
    /** Array de direcciones asociadas a la persona. Corresponde a 'addresses'. */
    addresses: AddressModel[];
    
    /** Array de documentos de la persona. Corresponde a 'documents'. */
    documents: DocumentModel[];
    
    /** Detalles específicos del empleado (opcional si `isEmployee` es false). Corresponde a 'employee'. */
    employee?: EmployeeDetailsModel; 
    createdAt: string; 
    updatedAt: string; 
    updatedByUserId?: string;
    
}