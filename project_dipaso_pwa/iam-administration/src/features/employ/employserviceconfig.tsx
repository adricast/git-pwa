// 📁 src/management/people/employserviceconfig.tsx

import type { PersonModel } from "../../models/api/personModel";
// Importamos tipos adicionales para la simulación
import type { EmployeeDetailsModel } from "../../models/api/employdetailsModel";
//import type { AddressModel } from "../../models/api/addressModel"; 
//import type { DocumentModel } from "../../models/api/documentModel";


// ----------------------------------------------------------------------
// TIPOS AUXILIARES: (Definidos por la interfaz PersonServiceConfig)
// ----------------------------------------------------------------------

// 1. Data de Creación (Payload que el frontend envía al crear)
export type PersonCreationPayload = Omit<PersonModel, "personId" | "createdAt" | "updatedAt" | "createdByUserId" | "updatedByUserId">;

// 2. Data de Actualización (Payload parcial que el frontend envía al actualizar)
export type PersonUpdatePayload = Partial<PersonCreationPayload>;


/**
 * Interfaz que define la estructura de los servicios CRUD de Personas/Empleados.
 */
export interface PersonServiceConfig {
    /** Obtiene todas las personas. */
    getAllPeople: () => Promise<PersonModel[]>;
    getActivePeople: () => Promise<PersonModel[]>;
    
    /** Realiza la eliminación lógica masiva (Soft Delete). */
    softDeletePeopleMassive: (personIds: string[], updatedByUserId: string) => Promise<{ message: string; count: number; }>; 
    
    /** Crea una nueva persona. (Retorna PersonModel, no solo 'Person' genérico) */
    createPerson: (personData: PersonCreationPayload, createdByUserId: string) => Promise<PersonModel>;
    
    /** Actualiza una persona existente. (Retorna PersonModel) */
    updatePerson: (personId: string, updatedByUserId: string, personPatch: PersonUpdatePayload) => Promise<PersonModel>;
}

// ----------------------------------------------------------------------
// 🟢 IMPLEMENTACIÓN MOCK (Simulación de Datos y API)
// ----------------------------------------------------------------------

// Datos internos del MOCK para simular la base de datos
let currentPersonIdIndex = 2; 
const MOCK_USER_ID = "00000000-0000-0000-0000-000000000001"; 

const MOCK_PEOPLE_DATA: PersonModel[] = [{
    personId: "09e865fd-d6a2-482f-bf6a-0ed2a8689b38",
    givenName: "Julio Manuel",
    surName: "Torres Roca",
    isCustomer: true, isSupplier: false, isEmployee: true, isActive: true,
    // (Incluye todos los demás campos obligatorios de PersonModel)
    addresses: [], documents: [], employee: {} as EmployeeDetailsModel,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    createdByUserId: MOCK_USER_ID,
},
];


/**
 * 🟢 Objeto de Configuración de Servicios para Personas (MOCK)
 * Implementa la interfaz PersonServiceConfig usando funciones asíncronas simuladas.
 */
export const personServiceConfig: PersonServiceConfig = {
    
    getActivePeople: () => {
        // Retorna solo personas activas después de un pequeño retraso
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(MOCK_PEOPLE_DATA.filter(p => p.isActive));
            }, 500); 
        });
    },

    getAllPeople: () => Promise.resolve(MOCK_PEOPLE_DATA),

    softDeletePeopleMassive: (personIds: string[], updatedByUserId: string) => {
        let count = 0;
        MOCK_PEOPLE_DATA.forEach(p => {
            if (personIds.includes(p.personId) && p.isActive) {
                p.isActive = false;
                p.updatedByUserId = updatedByUserId;
                p.updatedAt = new Date().toISOString();
                count++;
            }
        });
        return Promise.resolve({ message: "Eliminación MOCK exitosa", count: count });
    },

    createPerson: (personData: PersonCreationPayload, createdByUserId: string) => {
        const newPersonId = `mock-new-${currentPersonIdIndex++}-${Date.now()}`;
        
        const newPerson: PersonModel = {
            ...personData,
            personId: newPersonId,
            createdByUserId: createdByUserId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            addresses: personData.addresses || [],
            documents: personData.documents || [],
        } as PersonModel;

        // Asigna el personId al sub-objeto employee
        if (newPerson.employee) {
            newPerson.employee.personId = newPersonId;
        }

        MOCK_PEOPLE_DATA.push(newPerson);
        return Promise.resolve(newPerson);
    },

    updatePerson: (personId: string, updatedByUserId: string, personPatch: PersonUpdatePayload) => {
        const index = MOCK_PEOPLE_DATA.findIndex(p => p.personId === personId);
        
        if (index === -1) return Promise.reject(new Error("Persona MOCK no encontrada"));

        const existingPerson = MOCK_PEOPLE_DATA[index];
        
        const updatedPerson: PersonModel = { 
            ...existingPerson, 
            ...personPatch, 
            updatedByUserId: updatedByUserId,
            updatedAt: new Date().toISOString(),
        };

        MOCK_PEOPLE_DATA[index] = updatedPerson;
        return Promise.resolve(updatedPerson);
    }
};