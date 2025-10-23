// 📁 src/services/employeeService.tsx

import type { PersonModel } from "../../models/api/personModel";
import { apiEmpleados } from "./../api/api"; // Asume que 'api' es tu instancia configurada de Axios
import { employeesRouteApi } from "../../configurations/routes/apiroutes"; // Asume { employee: '/employee' }
import type { EmployeeDetailsModel } from "../../models/api/employdetailsModel";
import type { AddressModel } from "../../models/api/addressModel";
import type { DocumentModel } from "../../models/api/documentModel";


// NOTA: Estos tipos deben coincidir con los definidos en tu archivo EmployManagement.tsx
export type PersonCreationPayload = Omit<PersonModel, "personId" | "createdAt" | "updatedAt" | "updatedByUserId">;
export type PersonUpdatePayload = Partial<PersonCreationPayload>;


// ----------------------------------------------------------------
// AUXILIARES DE MAPPING (snake_case -> camelCase)
// ----------------------------------------------------------------

/** Mapea el objeto PersonModel (camelCase) al payload de la API (snake_case). 
 * Se mantiene la logica de mapeo de envio de camelCase a snake_case.
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
            state_id: a.stateId, // Asegurar que es stateId
            postal_code: a.postalCode, // Asegurar que es postalCode
            country_id: a.countryId, // Asegurar que es countryId
            type_address_id: a.typeAddressId, // Asegurar que es typeAddressId
            person_id: a.personId, // Asegurar que es personId
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

/** Mapea los datos de la API al frontend (PersonModel) de snake_case a camelCase. */
function mapPersonFromApi(apiPerson: any): PersonModel {
    // Leemos desde snake_case para mapear
    return {
        // --- CAMPOS DE NIVEL SUPERIOR ---
        personId: apiPerson.person_id, 
        givenName: apiPerson.given_name, 
        surName: apiPerson.sur_name, 
        phoneNumber: apiPerson.phone_number, 
        genderId: apiPerson.gender_id, 
        dateOfBirth: apiPerson.date_of_birth, 
        isEmployee: apiPerson.is_employee, 
        isCustomer: apiPerson.is_customer, 
        isSupplier: apiPerson.is_supplier, 
        isActive: apiPerson.is_active, 
        integrationCode: apiPerson.integration_code, 

        // --- AUDITORIA ---
        createdByUserId: apiPerson.created_by_user_id, 
        updatedByUserId: apiPerson.updated_by_user_id, 
        createdAt: apiPerson.created_at, 
        updatedAt: apiPerson.updated_at, 
        
        // --- ESTRUCTURAS ANIDADAS (Mapeo detallado de snake_case) ---
        
        // Mapeo de Addresses (Asumiendo que internamente ya usan camelCase o son mapeados despues)
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
        employee: apiPerson.employee ? {
            employeeId: apiPerson.employee.employee_id, 
            employeeCode: apiPerson.employee.employee_code, 
            personId: apiPerson.employee.person_id, 
            isActive: apiPerson.employee.is_active,
            employeeStatus: apiPerson.employee.employee_status, 
            createdByUserId: apiPerson.employee.created_by_user_id,
        } as EmployeeDetailsModel : undefined,
        
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
        
        const response = await apiEmpleados.post<any>(employeesRouteApi.employbuild, apiPayload, { 
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
        
        const response = await apiEmpleados.put<any>(`${employeesRouteApi.employbuild}${personId}`, apiPayload, { 
            headers: { "X-Updater-User-Id": updatedByUserId, "Content-Type": "application/json" }
        });
        
        return mapPersonFromApi(response.data);
    } catch (error: any) {
        console.error(`Error al actualizar el empleado ${personId}:`, error);
        throw error;
    }
}


/** Obtiene todos los empleados activos (GET /employee) */
export async function getActivePeople(): Promise<PersonModel[]> {
    try {
        const response = await apiEmpleados.get<any>(`${employeesRouteApi.employbuild}`);
    
        // Se usa response.data.item basado en la ultima estructura del API
        const employeesArray = response.data.item; 
    
        if (!Array.isArray(employeesArray)) {
            console.error("Estructura de respuesta inesperada:", response.data);
            throw new Error("Respuesta de lista de empleados invalida: Array de personas no encontrado.");
        }
        
        return employeesArray.map(mapPersonFromApi);
    } catch (error) {
        console.error("Error al obtener empleados activos:", error);
        throw error;
    }
}

/** Eliminacion logica masiva (PATCH /employee/massive-soft) */
export async function softDeletePeopleMassive(
    personIds: string[], 
    updatedByUserId: string
): Promise<{ message: string; count: number; }> {
    try {
        const response = await apiEmpleados.patch<any>(
            `${employeesRouteApi.employbuild}massive-soft`,
            { person_ids: personIds, updated_by_user_id: updatedByUserId }, 
            { headers: { "X-Updater-User-Id": updatedByUserId, "Content-Type": "application/json" }}
        );
        return response.data;
    } catch (error) {
        console.error("Error en la eliminacion logica masiva de empleados:", error);
        throw error;
    }
}

export async function getAllEmployees(activeOnly: boolean = false): Promise<PersonModel[]> {
    try {
        const query = activeOnly ? '?active=true' : '';
        const response = await apiEmpleados.get<any>(`${employeesRouteApi.employbuild}${query}`); 
        
        // Usa response.data.item si la API es consistente, sino usa la logica de anidamiento
        const employeesArray = response.data.data?.item || response.data.item; 

        if (!Array.isArray(employeesArray)) {
            console.error("Estructura de respuesta inesperada:", response.data);
            throw new Error("Respuesta de lista de empleados invalida: Array de personas no encontrado.");
        }
        return employeesArray.map(mapPersonFromApi);
    } catch (error) {
        console.error("Error al obtener la lista de empleados:", error);
        throw error;
    }
}

/** Consulta los detalles de una persona por ID (GET /employee/{id}). */
export async function getPersonById(personId: string): Promise<PersonModel> {
    return getPersonByUuid(personId); // Delega al UUID
}

/** 🚀 NUEVA FUNCION: Consulta los detalles de una persona especifica por UUID (GET /people/{uuid}). */
export async function getPersonByUuid(personId: string): Promise<PersonModel> {
    try {
        // La URL de ejemplo usa /api/people/{uuid}
        const apiRoute = employeesRouteApi.employbuild.replace('/employee', '/people');
        
        const response = await apiEmpleados.get<any>(`${apiRoute}${personId}`);
        
        // Intenta desencapsular de response.data.data si existe, o usa la raiz de response.data
        const itemData = response.data.data || response.data; 

        if (!itemData || Array.isArray(itemData)) {
            throw new Error("Respuesta de detalle de persona invalida o vacia.");
        }
        return mapPersonFromApi(itemData);
    } catch (error) {
        console.error(`Error al obtener la persona ${personId} por UUID:`, error);
        throw error; 
    }
}