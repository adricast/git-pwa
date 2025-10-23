// 📁 src/services/employeeService.tsx (VERSIÓN FINAL Y FUNCIONAL)

import type { PersonModel } from "../../models/api/personModel";
import { apiEmpleados } from "./../api/api"; 
import { employeesRouteApi  } from "../../configurations/routes/apiroutes"; 
import type { EmployeeDetailsModel } from "../../models/api/employdetailsModel";
import type { AddressModel } from "../../models/api/addressModel";
import type { DocumentModel } from "../../models/api/documentModel";


// NOTA: Tipos de Payload (Se mantienen igual)
export type PersonCreationPayload = Omit<PersonModel, "personId" | "createdAt" | "updatedAt" | "updatedByUserId">;
export type PersonUpdatePayload = Partial<PersonCreationPayload>;


// ----------------------------------------------------------------
// AUXILIARES DE MAPPING (snake_case <-> camelCase)
// ----------------------------------------------------------------

/** Mapea el objeto PersonModel (camelCase) al payload de la API (snake_case). 
 * (Esta función se mantiene igual, se usa para ENVIAR datos)
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
    
    // ... (El mapeo de sub-objetos a snake_case se mantiene igual)
    if (personData.addresses) {
        payload.addresses = personData.addresses.map(a => ({
            address_id: a.addressId, street: a.street, city_id: a.cityId, state_id: a.stateId, 
            postal_code: a.postalCode, country_id: a.countryId, type_address_id: a.typeAddressId, 
            person_id: a.personId, is_active: a.isActive, created_by_user_id: a.createdByUserId,
        }));
    }
    
    if (personData.employee) {
        payload.employee = {
            employee_id: personData.employee.employeeId, employee_code: personData.employee.employeeCode,
            person_id: personData.employee.personId, is_active: personData.employee.isActive,
            employee_status: personData.employee.employeeStatus, created_by_user_id: personData.employee.createdByUserId,
        };
    }
    
    if (personData.documents) {
        payload.documents = personData.documents.map(d => ({
            person_document_id: d.personDocumentId, doc_type_id: d.docTypeId, doc_number: d.docNumber,
            person_id: d.personId, issuing_country: d.issuingCountry, expiration_date: d.expirationDate,
            is_active: d.isActive, created_by_user_id: d.createdByUserId,
        }));
    }
    
    return payload;
}

/** * Mapea los datos de la API (snake_case) al frontend (PersonModel - camelCase). 
 * 🛑 CRÍTICO: Se corrigen TODAS las lecturas de propiedades para usar snake_case.
*/
function mapPersonFromApi(apiPerson: any): PersonModel {
    return {
        // --- CAMPOS DE NIVEL SUPERIOR (Leídos de snake_case) ---
        personId: apiPerson.person_id, 
        givenName: apiPerson.given_name, // ⬅️ CORREGIDO
        surName: apiPerson.sur_name,     // ⬅️ CORREGIDO
        phoneNumber: apiPerson.phone_number || undefined, // ⬅️ CORREGIDO (asumiendo que phone_number es el campo)
        genderId: apiPerson.gender_id || undefined,
        dateOfBirth: apiPerson.date_of_birth || undefined,
        
        // --- ROLES/FLAGS (Leídos de snake_case) ---
        isEmployee: apiPerson.is_employee, // ⬅️ CORREGIDO
        isCustomer: apiPerson.is_customer, // ⬅️ CORREGIDO
        isSupplier: apiPerson.is_supplier, // ⬅️ CORREGIDO
        isActive: apiPerson.is_active ?? true,
        integrationCode: apiPerson.integration_code,

        // --- AUDITORÍA (Leídos de snake_case) ---
        createdByUserId: apiPerson.created_by_user_id || apiPerson.user_id || 'UNKNOWN', 
        updatedByUserId: apiPerson.updated_by_user_id || undefined,
        createdAt: apiPerson.created_at || new Date().toISOString(), 
        updatedAt: apiPerson.updated_at || new Date().toISOString(), 
        
        // --- ESTRUCTURAS ANIDADAS (Inicializadas o mapeadas) ---
        // Se inicializan con arrays vacíos ya que la respuesta de lista no los trae completos.
        addresses: apiPerson.addresses ? apiPerson.addresses.map((a: any) => a as AddressModel) : [],
        documents: apiPerson.documents ? apiPerson.documents.map((d: any) => d as DocumentModel) : [],

        // El objeto employee (parcial en la lista)
        employee: apiPerson.employee_id ? {
            employeeId: apiPerson.employee_id,
            employeeCode: apiPerson.employee_code,
            employeeStatus: apiPerson.employee_status,
            personId: apiPerson.person_id,
            isActive: apiPerson.is_employee, 
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
        
        // El POST asume que devuelve el objeto creado directamente (no encapsulado)
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
        
        // El PUT asume que devuelve el objeto actualizado directamente (no encapsulado)
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
        
        // 🛑 Desencapsular: response.data.data.item
        const employeesArray = response.data.data?.item;

        if (!Array.isArray(employeesArray)) {
            console.error("Estructura de respuesta inesperada:", response.data);
            throw new Error("Respuesta de lista de empleados inválida: Array de personas no encontrado.");
        }
        
        return employeesArray.map(mapPersonFromApi);
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
            `${employeesRouteApi.employbuild}massive-soft`,
            // El backend espera snake_case en el payload
            { person_ids: personIds, updated_by_user_id: updatedByUserId }, 
            { headers: { "X-Updater-User-Id": updatedByUserId, "Content-Type": "application/json" }}
        );
        // Asume que la respuesta del PATCH no está encapsulada o es un objeto simple.
        return response.data;
    } catch (error) {
        console.error("Error en la eliminación lógica masiva de empleados:", error);
        throw error;
    }
}

export async function getAllEmployees(activeOnly: boolean = false): Promise<PersonModel[]> {
    try {
        const query = activeOnly ? '?active=true' : '';
        const response = await apiEmpleados.get<any>(`${employeesRouteApi.employbuild}${query}`); 
        
        // 🛑 Desencapsular: response.data.data.item
        const employeesArray = response.data.data?.item;
        
        if (!Array.isArray(employeesArray)) {
            console.error("Estructura de respuesta inesperada:", response.data);
            throw new Error("Respuesta de lista de empleados inválida: Array de personas no encontrado.");
        }
        return employeesArray.map(mapPersonFromApi);
    } catch (error) {
        console.error("Error al obtener la lista de empleados:", error);
        throw error;
    }
}

/** Consulta los detalles de un empleado específico por ID (GET /employee/{id}). */
export async function getEmployeeById(personId: string): Promise<PersonModel> {
    try {
        const response = await apiEmpleados.get<any>(`${employeesRouteApi.employbuild}/${personId}`);
        
        // 💡 Ajuste para GET by ID: intenta desencapsular el objeto único, si no existe usa la raíz.
        const itemData = response.data.data?.item || response.data; 

        if (!itemData || Array.isArray(itemData)) {
            throw new Error("Respuesta de detalle de empleado inválida o vacía.");
        }
        return mapPersonFromApi(itemData);
    } catch (error) {
        console.error(`Error al obtener el empleado ${personId}:`, error);
        throw error; 
    }
}