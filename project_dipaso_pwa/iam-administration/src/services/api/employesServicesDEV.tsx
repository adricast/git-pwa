// 📁 src/services/employeeService.tsx

import type { PersonModel } from "../../models/api/personModel";
import { apiEmpleados } from "./api"; // Asume que 'api' es tu instancia configurada de Axios
import { employeesRouteApi  } from "../../configurations/routes/apiroutes"; // Asume { employee: '/employee' }
import type { EmployeeDetailsModel } from "../../models/api/employdetailsModel";
import type { AddressModel } from "../../models/api/addressModel";
import type { DocumentModel } from "../../models/api/documentModel";


// NOTA: Estos tipos deben coincidir con los definidos en tu archivo EmployManagement.tsx
export type PersonCreationPayload = Omit<PersonModel, "personId" | "createdAt" | "updatedAt" | "updatedByUserId">;
export type PersonUpdatePayload = Partial<PersonCreationPayload>;


// ----------------------------------------------------------------
// AUXILIARES DE MAPPING (snake_case <-> camelCase)
// ----------------------------------------------------------------

/** Mapea el objeto PersonModel (camelCase) al payload de la API (snake_case). 
 * Se mantiene la lógica de mapeo de envío de camelCase a snake_case.
*/
function mapPersonToApiPayload(personData: PersonCreationPayload | PersonUpdatePayload): any {
    const payload: any = {};
    
    // Mapear campos de nivel superior: camelCase -> snake_case
    for (const key in personData) {
        if (Object.prototype.hasOwnProperty.call(personData, key)) {
            const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
            payload[snakeKey] = (personData as any)[key];
        }
    }

    // Mapeo de sub-objetos: addresses
    if (personData.addresses) {
        payload.addresses = personData.addresses.map(a => ({
            // Los IDs y campos deben ser mapeados a snake_case para el backend
            address_id: a.addressId,
            street: a.street,
            city_id: a.cityId,
            state_id: a.stateId, // Asegurarse de incluir stateId
            postal_code: a.postalCode, // Asegurarse de incluir postalCode
            country_id: a.countryId, // Asegurarse de incluir countryId
            type_address_id: a.typeAddressId, // Asegurarse de incluir typeAddressId
            person_id: a.personId, // Asegurarse de incluir personId
            is_active: a.isActive,
            created_by_user_id: a.createdByUserId,
        }));
    }
    
    // Mapeo de sub-objetos: employee
    if (personData.employee) {
        payload.employee = {
            employee_id: personData.employee.employeeId,
            employee_code: personData.employee.employeeCode,
            person_id: personData.employee.personId,
            is_active: personData.employee.isActive,
            employee_status: personData.employee.employeeStatus,
            created_by_user_id: personData.employee.createdByUserId,
        };
    }
    
    // Mapeo de sub-objetos: documents
    if (personData.documents) {
        payload.documents = personData.documents.map(d => ({
            person_document_id: d.personDocumentId,
            doc_type_id: d.docTypeId,
            doc_number: d.docNumber,
            person_id: d.personId,
            issuing_country: d.issuingCountry,
            expiration_date: d.expirationDate,
            is_active: d.isActive,
            created_by_user_id: d.createdByUserId,
        }));
    }
    
    return payload;
}

/** * Mapea los datos de la API al frontend (PersonModel). 
 * 💡 CORRECCIÓN CRÍTICA: La respuesta de la API ya viene en camelCase para los campos de nivel superior.
 */
function mapPersonFromApi(apiPerson: any): PersonModel {
    // 💡 AHORA LEE DIRECTAMENTE DE LAS PROPIEDADES EN CAMELCASE
    return {
        // --- CAMPOS DE NIVEL SUPERIOR (Leídos directamente en camelCase) ---
        personId: apiPerson.personId, 
        givenName: apiPerson.givenName, 
        surName: apiPerson.surName,     
        phoneNumber: apiPerson.phoneNumber, 
        genderId: apiPerson.genderId,
        dateOfBirth: apiPerson.dateOfBirth,
        isEmployee: apiPerson.isEmployee, 
        isCustomer: apiPerson.isCustomer, 
        isSupplier: apiPerson.isSupplier, 
        isActive: apiPerson.isActive,
        integrationCode: apiPerson.integrationCode,

        // --- AUDITORÍA (Leídos directamente en camelCase) ---
        createdByUserId: apiPerson.createdByUserId,
        updatedByUserId: apiPerson.updatedByUserId,
        createdAt: apiPerson.createdAt, 
        updatedAt: apiPerson.updatedAt, 
        
        // --- ESTRUCTURAS ANIDADAS (Mapeo detallado de camelCase a PersonModel) ---
        
        // Mapeo de Addresses
        addresses: apiPerson.addresses ? apiPerson.addresses.map((a: any) => ({
             addressId: a.addressId,
             street: a.street,
             cityId: a.cityId,
             stateId: a.stateId,
             postalCode: a.postalCode,
             countryId: a.countryId,
             integrationCode: a.integrationCode,
             typeAddressId: a.typeAddressId,
             personId: a.personId,
             isActive: a.isActive,
             createdByUserId: a.createdByUserId,
        } as AddressModel)) : [],
        
        // Mapeo de Documents
        documents: apiPerson.documents ? apiPerson.documents.map((d: any) => ({
             personDocumentId: d.personDocumentId,
             docTypeId: d.docTypeId,
             docNumber: d.docNumber,
             personId: d.personId,
             issuingCountry: d.issuingCountry,
             expirationDate: d.expirationDate,
             integrationCode: d.integrationCode,
             isActive: d.isActive,
             createdByUserId: d.createdByUserId,
        } as DocumentModel)) : [],

        // El objeto employee
        employee: apiPerson.employee ? (apiPerson.employee as EmployeeDetailsModel) : undefined,
        
    } as PersonModel;
}

// ----------------------------------------------------------------
// Funciones de Acceso a Datos (CRUD)
// ----------------------------------------------------------------

/** Crea un nuevo Empleado (POST /employee) */
export async function createPerson(
    personData: PersonCreationPayload, 
    createdByUserId: string
): Promise<PersonModel> {
    try {
        const payloadToSend = { ...personData, createdByUserId: createdByUserId };
        const apiPayload = mapPersonToApiPayload(payloadToSend);
        
        const response = await apiEmpleados.post<any>(employeesRouteApi.employ, apiPayload, { 
            headers: { "X-Creator-User-Id": createdByUserId, "Content-Type": "application/json" } 
        });
        
        return mapPersonFromApi(response.data);
    } catch (error: any) {
        console.error("Error al crear el empleado:", error);
        throw error;
    }
}


/** Actualiza un Empleado existente (PUT /employee/{id}) */
export async function updatePerson(
    personId: string, 
    updatedByUserId: string, 
    personPatch: PersonUpdatePayload
): Promise<PersonModel> {
    try {
        const payloadToSend = { ...personPatch, updatedByUserId: updatedByUserId };
        const apiPayload = mapPersonToApiPayload(payloadToSend);
        
        const response = await apiEmpleados.put<any>(`${employeesRouteApi.employ}${personId}`, apiPayload, { 
            headers: { "X-Updater-User-Id": updatedByUserId, "Content-Type": "application/json" }
        });
        
        return mapPersonFromApi(response.data);
    } catch (error: any) {
        console.error(`Error al actualizar el empleado ${personId}:`, error);
        throw error;
    }
}


/** Obtiene todos los empleados activos (GET /employee) - Usado por getActivePeople */
export async function getActivePeople(): Promise<PersonModel[]> {
    try {
        // Asumiendo que esta ruta base ya retorna solo activos o maneja el filtrado en la capa superior
        const response = await apiEmpleados.get<any>(`${employeesRouteApi.employ}`);
        if (!Array.isArray(response.data)) throw new Error("Respuesta de lista de empleados inválida.");
        return response.data.map(mapPersonFromApi);
    } catch (error) {
        console.error("Error al obtener empleados activos:", error);
        throw error;
    }
}

/** Eliminación lógica masiva (PATCH /employee/massive-soft) */
export async function softDeletePeopleMassive(
    personIds: string[], 
    updatedByUserId: string
): Promise<{ message: string; count: number; }> {
    try {
        const response = await apiEmpleados.patch<any>(
            `${employeesRouteApi.employ}massive-soft`,
            { person_ids: personIds, updated_by_user_id: updatedByUserId }, 
            { headers: { "X-Updater-User-Id": updatedByUserId, "Content-Type": "application/json" }}
        );
        return response.data;
    } catch (error) {
        console.error("Error en la eliminación lógica masiva de empleados:", error);
        throw error;
    }
}

export async function getAllEmployees(activeOnly: boolean = false): Promise<PersonModel[]> {
    try {
        const query = activeOnly ? '?active=true' : '';
        const response = await apiEmpleados.get<any>(`${employeesRouteApi.employ}${query}`); 
        
        if (!Array.isArray(response.data)) {
            throw new Error("Respuesta de lista de empleados inválida.");
        }
        return response.data.map(mapPersonFromApi);
    } catch (error) {
        console.error("Error al obtener la lista de empleados:", error);
        throw error;
    }
}

/** Consulta los detalles de un empleado específico por ID (GET /employee/{id}). */
export async function getEmployeeById(personId: string): Promise<PersonModel> {
    try {
        const response = await apiEmpleados.get<any>(`${employeesRouteApi.employ}/${personId}`);
        
        if (!response.data || Array.isArray(response.data)) {
            throw new Error("Respuesta de detalle de empleado inválida o vacía.");
        }
        return mapPersonFromApi(response.data);
    } catch (error) {
        console.error(`Error al obtener el empleado ${personId}:`, error);
        throw error; 
    }
}