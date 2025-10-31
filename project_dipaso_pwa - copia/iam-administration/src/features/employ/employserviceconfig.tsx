// 📁 src/management/people/employserviceconfig.tsx

// ======================================================================
// 1. IMPORTACIONES
// ======================================================================

import type { PersonModel } from "../../models/api/personModel";

// 💡 CRÍTICO: Importamos todas las funciones y los tipos de payload desde el servicio real.
import { 
   getAllEmployees, 
   getActivePeople, 
   softDeletePeopleMassive, 
   // Renombramos las funciones para evitar conflicto con las claves del objeto exportado
   createPerson as createPersonApi, 
   updatePerson as updatePersonApi,
    // 🛑 IMPORTAR LA FUNCIÓN DE CONSULTA POR ID
    getPersonById, 
    // Usaremos getPersonByUuid si existe en el servicio
    getPersonByUuid,
   // Importamos los tipos de PAYLOAD usando 'type' para evitar conflictos de declaración
   type PersonCreationPayload,
   type PersonUpdatePayload,
} from "./../../services/api/employesServicesLocal"; 


// ----------------------------------------------------------------------
// 2. TIPOS AUXILIARES: (Reexportamos los tipos importados)
// ----------------------------------------------------------------------

// Exportamos los tipos de payload importados del servicio para que estén disponibles 
// para cualquier consumidor de employserviceconfig.tsx.
export type { PersonCreationPayload, PersonUpdatePayload }; 

/**
 * Interfaz que define la estructura de los servicios CRUD de Personas/Empleados.
 */
export interface PersonServiceConfig {
   /** Obtiene todas las personas (activas e inactivas). */
   getAllPeople: () => Promise<PersonModel[]>;
   /** Obtiene solo las personas activas. */
   getActivePeople: () => Promise<PersonModel[]>;
    
    // 🛑 AGREGAR LA FUNCIÓN DE LECTURA DE DETALLES
    /** Consulta los detalles de una persona por su ID. */
    getPersonById: (personId: string) => Promise<PersonModel>;
    /** Consulta los detalles de una persona por su UUID. */
    getPersonByUuid: (personId: string) => Promise<PersonModel>;
   
   /** Realiza la eliminación lógica masiva (Soft Delete). */
   softDeletePeopleMassive: (personIds: string[], updatedByUserId: string) => Promise<{ message: string; count: number; }>; 
   
   /** Crea una nueva persona. (Usa PersonCreationPayload) */
   createPerson: (personData: PersonCreationPayload, createdByUserId: string) => Promise<PersonModel>;
   
   /** Actualiza una persona existente. (Usa PersonUpdatePayload) */
   updatePerson: (personId: string, updatedByUserId: string, personPatch: PersonUpdatePayload) => Promise<PersonModel>;
}

// ----------------------------------------------------------------------
// 🟢 IMPLEMENTACIÓN REAL (Delegación al servicio API)
// ----------------------------------------------------------------------

/**
 * 🟢 Objeto de Configuración de Servicios para Personas
 * Implementa la interfaz PersonServiceConfig delegando la ejecución al servicio API.
 */
export const personServiceConfig: PersonServiceConfig = {
   
   // Lectura
   getActivePeople: getActivePeople,
   getAllPeople: () => getAllEmployees(false),

    // 🛑 DELEGACIÓN DE LAS FUNCIONES DE LECTURA DE DETALLES
    getPersonById: getPersonById,
    getPersonByUuid: getPersonByUuid,

   // Escritura
   softDeletePeopleMassive: softDeletePeopleMassive,
   createPerson: createPersonApi, // Función renombrada
   updatePerson: updatePersonApi, // Función renombrada
};