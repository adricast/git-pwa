// 📁 src/services/employeeService.tsx (VERSION FINAL COMPLETA Y CORREGIDA)

import type { PersonModel } from "../../models/api/personModel";
import { api } from "./../api/api"; // Asume que 'api' es tu instancia configurada de Axios
import { employeesRouteApi } from "../../configurations/routes/apiroutes"; // Asume { employee: '/employee' }
import type { EmployeeModel } from "../../models/api/employeeModel";
import type { AddressModel } from "../../models/api/addressModel";
import type { DocumentModel } from "../../models/api/documentModel";


// NOTA: Estos tipos deben coincidir con los definidos en tu archivo EmployManagement.tsx
export type PersonCreationPayload = Omit<PersonModel, "personId" | "createdAt" | "updatedAt" | "updatedByUserId">;
export type PersonUpdatePayload = Partial<PersonCreationPayload>;

// ----------------------------------------------------------------
// AUXILIARES DE MAPPING (Frontend -> Backend y Backend -> Frontend)
// ----------------------------------------------------------------

/** Auxiliar: Obtiene el ID de un objeto anidado (ej: address.country.countryId) */
const getIdFromNestedObject = (obj: any, idKey: string) => obj && obj[idKey] ? obj[idKey] : undefined;


/** Mapea el objeto PersonModel (camelCase) al payload de la API (snake_case). */
function mapPersonToApiPayload(personData: PersonCreationPayload | PersonUpdatePayload): any {
    const payload: any = {};

    // Mapear campos de nivel superior: camelCase -> snake_case
    for (const key in personData) {
        if (Object.prototype.hasOwnProperty.call(personData, key)) {
            // Inicia la conversión genérica: camelCase a snake_case (ej: givenName -> given_name)
            let snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

            // 🛑 MODIFICACIÓN: Manejo especial para la fecha de nacimiento.
            // Si la API espera 'birth' en lugar de 'date_of_birth', lo forzamos.
            if (key === 'dateOfBirth') {
                snakeKey = 'birth';
            }
            
            payload[snakeKey] = (personData as any)[key];
        }
    }
    
    // Mapeo de sub-objetos: addresses (Mapeo manual para asegurar snake_case correcto)
    if (personData.addresses) {
        payload.addresses = personData.addresses.map(a => ({
            address_id: a.addressId, street: a.street, city_id: a.cityId, state_id: a.stateId,
            postal_code: a.postalCode, country_id: a.countryId, type_address_id: a.typeAddressId,
            person_id: a.personId, is_active: a.isActive, created_by_user_id: a.createdByUserId,
        }));
    }
    
    // Mapeo de sub-objetos: employee (Mapeo manual para asegurar snake_case correcto)
    if (personData.employee) {
        payload.employee = {
            employee_id: personData.employee.employeeId, employee_code: personData.employee.employeeCode,
            person_id: personData.employee.personId, is_active: personData.employee.isActive,
            employee_status: personData.employee.employeeStatus, created_by_user_id: personData.employee.createdByUserId,
        };
    }
    
    // Mapeo de sub-objetos: documents (Mapeo manual para asegurar snake_case correcto)
    if (personData.documents) {
        payload.documents = personData.documents.map(d => ({
            person_document_id: d.personDocumentId, doc_type_id: d.docTypeId, doc_number: d.docNumber,
            person_id: d.personId, issuing_country: d.issuingCountry, expiration_date: d.expirationDate,
            is_active: d.isActive, created_by_user_id: d.createdByUserId,
        }));
    }
    
    return payload;
}
/** 🛑 FUNCIÓN CRÍTICA: Mapea los datos de la API (anidados y con errores) al modelo local (PersonModel). */
function mapPersonFromApi(apiPerson: any): PersonModel {
    
    return {
        // --- CAMPOS DE NIVEL SUPERIOR (Extraer y Normalizar) ---
        personId: apiPerson.personId,
        
        // 🛑 CORRECCIÓN CLAVE: Lee 'givenName' (si existe) o 'giveName' (el error tipográfico)
        givenName: apiPerson.givenName || apiPerson.giveName, 
        surName: apiPerson.surName,
        phoneNumber: apiPerson.phoneNumber,
        
        // 🛑 CRÍTICO: Extraer el ID del objeto 'gender'
        genderId: getIdFromNestedObject(apiPerson.gender, 'genderId'), 
        
        // 🛑 CRÍTICO: Normalizar el nombre del campo 'birth' a dateOfBirth
        dateOfBirth: apiPerson.birth, 
        
        // CRÍTICO: Normalizar isCustomes
        isCustomer: apiPerson.isCustomer || apiPerson.isCustomes || false, 
        isSupplier: apiPerson.isSupplier || false, 
        isEmployee: apiPerson.isEmployee || false,
        isActive: apiPerson.isActive || false, 
        integrationCode: apiPerson.integrationCode,

        // --- AUDITORIA ---
        createdByUserId: apiPerson.createdByUserId, 
        updatedByUserId: apiPerson.updatedByUserId, 
        createdAt: apiPerson.createdAt, 
        updatedAt: apiPerson.updatedAt, 
        
        // --- ESTRUCTURAS ANIDADAS ---
        
        // Mapeo de Addresses (Extraer IDs anidados de objetos de catálogo)
        addresses: apiPerson.addresses ? apiPerson.addresses.map((a: any) => ({
            addressId: a.addressId, street: a.street, postalCode: a.postalCode,
            
            // 🛑 CRÍTICO: Extracción de IDs anidados
            countryId: getIdFromNestedObject(a.country, 'countryId'),
            typeAddressId: getIdFromNestedObject(a.typeAddress, 'typeAddress'), // Asumiendo que la clave es 'typeAddress'
            cityId: getIdFromNestedObject(a.citie, 'cityId'), // Asumiendo error tipográfico 'citie'
            stateId: getIdFromNestedObject(a.state, 'stateId'),

            personId: a.personId, isActive: a.isActive, integrationCode: a.integrationCode,
        } as AddressModel)) : [],
        
        // Mapeo de Documents (Extraer IDs anidados de typeDoc y country)
        documents: apiPerson.documents ? apiPerson.documents.map((d: any) => ({
            personDocumentId: d.personDocumentId, docNumber: d.docNumber, expirationDate: d.expirationDate,

            // 🛑 CRÍTICO: Extracción de IDs anidados
            docTypeId: getIdFromNestedObject(d.typeDoc, 'typeDocId'),
            issuingCountry: getIdFromNestedObject(d.country, 'countryId'),
            
            personId: d.personId, isActive: d.isActive, integrationCode: d.integrationCode,
        } as DocumentModel)) : [],

        // El objeto employee
        employee: apiPerson.employee ? {
            employeeId: apiPerson.employee.employeeId, employeeCode: apiPerson.employee.employeeCode, 
            employeeStatus: apiPerson.employee.employeeStatus, personId: apiPerson.personId, isActive: apiPerson.isActive,
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
        
        const response = await api.post<any>(employeesRouteApi.employbuild, apiPayload, { 
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
        
        const response = await api.put<any>(`${employeesRouteApi.employbuild}${personId}`, apiPayload, { 
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
        const response = await api.get<any>(`${employeesRouteApi.employbuild}`);
    
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
        const response = await api.patch<any>(
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
        const response = await api.get<any>(`${employeesRouteApi.employbuild}${query}`); 
        
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
        
        // CRÍTICO: Llamada de detalle
        const response = await api.get<any>(`${apiRoute}${personId}`);
        
        // Asumimos que el objeto PersonModel completo viene en response.data o response.data.data
        let itemData = response.data.data || response.data; 

        if (Array.isArray(itemData) && itemData.length > 0) {
            itemData = itemData[0];
        }

        if (!itemData || Array.isArray(itemData)) {
            throw new Error("Respuesta de detalle de persona inválida o vacía.");
        }
        // 🛑 Usar el mapeo corregido para extraer IDs anidados
        return mapPersonFromApi(itemData);
    } catch (error) {
        console.error(`Error al obtener la persona ${personId} por UUID:`, error);
        throw error; 
    }
}