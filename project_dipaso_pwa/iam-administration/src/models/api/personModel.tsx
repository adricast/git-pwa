// 📁 src/models/api/personModel.tsx (REVISADO)

import type { AddressModel } from "./addressModel";
import type { DocumentModel } from "./documentModel";
import type { EmployeeModel } from "./employeeModel";

export interface PersonModel {
    // --- Campos de Identificación Básica (CRÍTICO) ---
    personId: string;
    givenName: string; // Obligatorio para la identidad
    surName: string;   // Obligatorio para la identidad

    // --- Campos de Detalle y Catálogo (OPCIONALES en la DB/API) ---
    dateOfBirth?: string; // 🛑 Opcional: Una persona puede no tener fecha de nacimiento registrada.
    phoneNumber?: string; // 🛑 Opcional: El contacto telefónico no es siempre obligatorio.
    genderId?: string;    // 🛑 Opcional: Puede ser nulo si no se registra el género.
    integrationCode?: string; // Opcional: Código de integración del sistema externo.

    // --- Campos de Roles y Estado (Generalmente Obligatorios/Defecto, pero se deja 'isActive' simple) ---
    isCustomer: boolean;
    isSupplier: boolean;
    isEmployee: boolean;
    isActive: boolean;

    // --- Relaciones Anidadas ---
    addresses: AddressModel[]; // Aunque el array debe estar siempre presente, puede ser un array vacío.
    documents: DocumentModel[]; // Aunque el array debe estar siempre presente, puede ser un array vacío.

    // 🛑 CRÍTICO: Relación de Detalle de Empleado (Opcional)
    // El objeto completo puede faltar si la persona no es (o ya no es) empleada.
    employee?: EmployeeModel; 

    // --- Campos de Auditoría (Generalmente Obligatorios) ---
    createdAt: string; 
    updatedAt: string; 
    updatedByUserId?: string; // 🛑 Opcional: El usuario actualizador podría no estar siempre disponible.
    createdByUserId: string; // Se mantiene como obligatorio.
}