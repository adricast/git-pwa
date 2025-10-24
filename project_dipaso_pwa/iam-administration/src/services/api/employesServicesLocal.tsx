// 📁 src/services/employeeService.tsx

import type { PersonModel } from "../../models/api/personModel";
import { api } from "./../api/api2"; // Asume que 'api' es tu instancia configurada de Axios
import { employeesRouteApi } from "../../configurations/routes/apiroutes"; // Asume { employee: '/employee' }
import type { EmployeeModel } from "../../models/api/employeeModel";
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

/** 🛑 Mapea los datos de la API al frontend (PersonModel). 
 * CRÍTICO: Los campos de nivel superior y los sub-arrays vienen en camelCase, solo sub-objetos usan snake_case.
 */
function mapPersonFromApi(apiPerson: any): PersonModel {
    // Leemos desde camelCase para los campos de nivel superior (según tu nuevo JSON)
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

        // --- AUDITORIA ---
        createdByUserId: apiPerson.createdByUserId, 
        updatedByUserId: apiPerson.updatedByUserId, 
        createdAt: apiPerson.createdAt, 
        updatedAt: apiPerson.updatedAt, 
        
        // --- ESTRUCTURAS ANIDADAS (Vienen en camelCase en la API) ---
        
        // Mapeo de Addresses (Mantener el mapeo a camelCase)
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
        
        // Mapeo de Documents (Mantener el mapeo a camelCase)
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

        // El objeto employee (CRÍTICO: Mapeo manual de snake_case/camelCase interno a EmployeeDetailsModel)
        employee: apiPerson.employee ? {
            // Intentamos leer ambas convenciones para ser robustos (camelCase API || snake_case API)
            employeeId: apiPerson.employee.employeeId || apiPerson.employee.employee_id, 
            employeeCode: apiPerson.employee.employeeCode || apiPerson.employee.employee_code,
            personId: apiPerson.employee.personId || apiPerson.employee.person_id,
            isActive: apiPerson.employee.isActive || apiPerson.employee.is_active,
            employeeStatus: apiPerson.employee.employeeStatus || apiPerson.employee.employee_status, 
            createdByUserId: apiPerson.employee.createdByUserId || apiPerson.employee.created_by_user_id,
            updatedAt: apiPerson.employee.updatedAt || apiPerson.employee.updated_at,
            updatedByUserId: apiPerson.employee.updatedByUserId || apiPerson.employee.updated_by_user_id,
        } as EmployeeModel : undefined,
        
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
    
    const response = await api.post<any>(employeesRouteApi.employ, apiPayload, { 
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
    
    const response = await api.put<any>(`${employeesRouteApi.employ}${personId}`, apiPayload, { 
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
    const response = await api.get<any>(`${employeesRouteApi.employ}`);
    
        // 🛑 CRÍTICO: El listado general viene como array en response.data, no encapsulado.
        // Se usa response.data si es un array (como el JSON de ejemplo), o response.data.item si es el objeto de paginación.
    const rawData = Array.isArray(response.data) ? response.data : response.data.item; 
    
    if (!Array.isArray(rawData)) {
        console.error("Estructura de respuesta inesperada:", response.data);
        throw new Error("Respuesta de lista de empleados invalida: Array de personas no encontrado.");
    }
    
    return rawData.map(mapPersonFromApi);
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
    const response = await api.patch<any>(
        `${employeesRouteApi.employ}massive-soft`,
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
    const response = await api.get<any>(`${employeesRouteApi.employ}${query}`); 
    
    // Usa response.data si es un array, o intenta desencapsular
    const rawData = Array.isArray(response.data) ? response.data : response.data.data?.item || response.data.item;
    
    if (!Array.isArray(rawData)) {
        console.error("Estructura de respuesta inesperada:", response.data);
        throw new Error("Respuesta de lista de empleados invalida: Array de personas no encontrado.");
    }
    return rawData.map(mapPersonFromApi);
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
    const apiRoute = employeesRouteApi.employ;
    
    const response = await api.get<any>(`${apiRoute}${personId}`);
    
    // Intenta desencapsular de response.data.data si existe, o usa la raiz de response.data
    let itemData = response.data.data || response.data; 

  // Si la respuesta individual es un array de un solo elemento (como tu JSON de ejemplo en la lista) lo extrae.
  if (Array.isArray(itemData) && itemData.length > 0) {
   itemData = itemData[0];
  }

 if (!itemData || Array.isArray(itemData)) {
  throw new Error("Respuesta de detalle de persona invalida o vacia.");
    }
    return mapPersonFromApi(itemData);
    } catch (error) {
    console.error(`Error al obtener la persona ${personId} por UUID:`, error);
    throw error; 
    }
}