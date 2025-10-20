
import { 
    getAllPeople, 
    softDeletePeopleMassive, 
    createPerson, 
    updatePerson,
    getActivePeople
} from "../../services/personService"; // ✅ Usamos el servicio de personas

import type { Person } from "../../models/api/personModel"; // ✅ Usamos el modelo de persona

// ----------------------------------------------------------------------
// TIPOS AUXILIARES: Definen la data que el frontend puede enviar
// ----------------------------------------------------------------------

// 1. Data de Creación: Excluye los campos que genera el backend o que son solo de auditoría
type PersonCreationPayload = Omit<Person, "personId" | "createdAt" | "updatedAt" | "createdByUserId" | "updatedByUserId">;

// 2. Data de Actualización: Los mismos campos, pero todos son opcionales (Partial)
type PersonUpdatePayload = Partial<PersonCreationPayload>;


/**
 * Interfaz que define la estructura de los servicios CRUD de Personas.
 * Se incluyen los IDs de auditoría (createdByUserId/updatedByUserId)
 * ya que son requeridos por el servicio para el Header de la petición.
 */
export interface PersonServiceConfig {
    /** Obtiene todas las personas. */
    getAllPeople: () => Promise<Person[]>;
    getActivePeople: () => Promise<Person[]>;
    
    
    /** * Realiza la eliminación lógica masiva (Soft Delete).
     * Requiere el ID del usuario que realiza la acción para el header 'X-Updater-User-Id'.
     */
    softDeletePeopleMassive: (personIds: string[], updatedByUserId: string) => Promise<{ message: string; count: number; }>; 
    
    /** * Crea una nueva persona.
     * Requiere el ID del usuario que crea el registro para el header 'X-Creator-User-Id'.
     */
    createPerson: (personData: PersonCreationPayload, createdByUserId: string) => Promise<Person>;
    
    /** * Actualiza una persona existente.
     * Requiere el ID de la persona, el ID del usuario que actualiza y los datos a cambiar.
     */
    updatePerson: (personId: string, updatedByUserId: string, personPatch: PersonUpdatePayload) => Promise<Person>;
}

/**
 * 🟢 Objeto de Configuración de Servicios para Personas
 * Implementa la interfaz PersonServiceConfig usando las funciones de peopleService.
 */
export const personServiceConfig: PersonServiceConfig = {
    getAllPeople: getAllPeople,
    softDeletePeopleMassive: softDeletePeopleMassive,
    getActivePeople: getActivePeople, // 🔑 NUEVO: Implementación
    createPerson: createPerson,
    updatePerson: updatePerson,
};