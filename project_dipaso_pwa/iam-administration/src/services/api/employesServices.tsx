// 📁 src/services/employeeService.tsx

import type { PersonModel } from "../../models/api/personModel";
import { api } from "./../api/api"; // Asume que 'api' es tu instancia configurada de Axios
import { employeesRouteApi  } from "../../configurations/routes/apiroutes"; // Asume { employee: '/employee' }

// NOTA: Estos tipos deben coincidir con los definidos en tu archivo EmployManagement.tsx
export type PersonCreationPayload = Omit<PersonModel, "personId" | "createdAt" | "updatedAt" | "updatedByUserId">;
export type PersonUpdatePayload = Partial<PersonCreationPayload>;


// ----------------------------------------------------------------
// AUXILIARES DE MAPPING (snake_case <-> camelCase)
// ----------------------------------------------------------------

/** Mapea el objeto PersonModel (camelCase) al payload de la API (snake_case). */
function mapPersonToApiPayload(personData: PersonCreationPayload | PersonUpdatePayload): any {
    // Esta función es esencial para transformar el payload del frontend al formato de la API.
    // Usamos el 'integrationCode' como ejemplo de campo de nivel superior.

    const payload: any = {};
    
    // Mapear campos de nivel superior (usando un bucle para simplificar la lista)
    for (const key in personData) {
        if (Object.prototype.hasOwnProperty.call(personData, key)) {
            // Ejemplo de transformación camelCase a snake_case simple
            const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
            payload[snakeKey] = (personData as any)[key];
        }
    }

    // El mapeo de sub-objetos (addresses, documents, employee) debe ser explícito
    // para asegurar la estructura y los IDs correctos.
    
    if (personData.addresses) {
        payload.addresses = personData.addresses.map(a => ({
            // Mapeo snake_case completo para AddressModel
            address_id: (a as any).addressId,
            street: a.street,
            city_id: a.cityId,
            // ... (otros campos de Address)
            is_active: a.isActive,
            created_by_user_id: (a as any).createdByUserId,
        }));
    }
    
    if (personData.employee) {
        payload.employee = {
            employee_id: personData.employee.employeeId,
            employee_code: personData.employee.employeeCode,
            person_id: personData.employee.personId,
            is_active: personData.employee.isActive,
            employee_status: personData.employee.employeeStatus,
            created_by_user_id: (personData.employee as any).createdByUserId,
        };
    }
    
    // Retornamos el payload listo para la API
    return payload;
}

/** Mapea los datos de la API (snake_case) a la interfaz PersonModel (camelCase). */
// NOTA: Esta función DEBE ser implementada completamente para manejar la respuesta del servidor.
function mapPersonFromApi(apiPerson: any): PersonModel {
    // Por simplicidad, aquí solo devolvemos un mapeo directo de algunos campos,
    // pero DEBE ser exhaustivo en la aplicación real.
    return {
        personId: apiPerson.person_id,
        givenName: apiPerson.given_name,
        surName: apiPerson.sur_name,
        isEmployee: apiPerson.is_employee,
        isActive: apiPerson.is_active,
        // ... (otros campos mapeados)
        addresses: apiPerson.addresses ? apiPerson.addresses.map((a: any) => ({
            addressId: a.address_id,
            street: a.street,
            // ... (mapeo completo de address)
        })) : [],
        // ... (otros sub-objetos)
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
        // 1. Prepara el payload con el ID de auditoría
        const payloadToSend = {
            ...personData,
            // Añade el ID de creación al payload para la serialización
            createdByUserId: createdByUserId, 
        };
        
        // 2. Serializa a snake_case
        const apiPayload = mapPersonToApiPayload(payloadToSend);
        
        // 3. Llamada a la API (POST)
        const response = await api.post<any>( // Espera una respuesta JSON directa (sin encriptar)
            employeesRouteApi.employ, 
            apiPayload,
            { 
                headers: { 
                    "X-Creator-User-Id": createdByUserId, 
                    "Content-Type": "application/json",
                    // Asegúrate de añadir X-Idempotency-Key si es necesario
                } 
            } 
        );
        
        // 4. Mapear la respuesta de la API a PersonModel
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
        // 1. Prepara el payload con el ID de auditoría
        const payloadToSend = {
            ...personPatch,
            // Añade el ID de actualización al payload para la serialización
            updatedByUserId: updatedByUserId, 
        };
        
        // 2. Serializa a snake_case
        const apiPayload = mapPersonToApiPayload(payloadToSend);
        
        // 3. Llamada a la API (PUT)
        const response = await api.put<any>( // Espera una respuesta JSON directa (sin encriptar)
            `${employeesRouteApi.employ}${personId}`, 
            apiPayload,
            { 
                headers: { 
                    "X-Updater-User-Id": updatedByUserId, 
                    "Content-Type": "application/json",
                    // Asegúrate de añadir X-Idempotency-Key si es necesario
                }
            }
        );
        
        // 4. Mapear la respuesta de la API a PersonModel
        return mapPersonFromApi(response.data);
    } catch (error: any) {
        console.error(`Error al actualizar el empleado ${personId}:`, error);
        throw error;
    }
}


// Esqueletos para métodos de lectura y eliminación
// ----------------------------------------------------------------

// Esqueleto para obtener todos los empleados activos (GET /employee/active)
export async function getActivePeople(): Promise<PersonModel[]> {
    try {
        const response = await api.get<any>(`${employeesRouteApi.employ}active`);
        if (!Array.isArray(response.data)) throw new Error("Respuesta de lista de empleados inválida.");
        return response.data.map(mapPersonFromApi);
    } catch (error) {
        console.error("Error al obtener empleados activos:", error);
        throw error;
    }
}

// Esqueleto para la eliminación lógica masiva (PATCH/DELETE /employee/massive-soft)
export async function softDeletePeopleMassive(
    personIds: string[], 
    updatedByUserId: string
): Promise<{ message: string; count: number; }> {
    try {
        const response = await api.patch<any>(
            `${employeesRouteApi.employ}massive-soft`,
            { person_ids: personIds }, // El cuerpo del PATCH/DELETE
            { headers: { 
                "X-Updater-User-Id": updatedByUserId, 
                "Content-Type": "application/json"
            }}
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
        
        // URL: /api/employee o /api/employee?active=true
        const response = await api.get<any>(`${employeesRouteApi.employ}${query}`); 
        
        if (!Array.isArray(response.data)) {
            // El backend DEBE devolver un array para la consulta general
            throw new Error("Respuesta de lista de empleados inválida.");
        }

        // Se asume que mapPersonFromApi está disponible y mapea snake_case a PersonModel[]
        return response.data.map(mapPersonFromApi);
    } catch (error) {
        console.error("Error al obtener la lista de empleados:", error);
        throw error;
    }
}

/**
 * Consulta los detalles de un empleado específico por ID (GET /employee/{id}).
 * 🎯 Llama a la ruta con el ID.
 * @param personId El UUID del empleado.
 */
export async function getEmployeeById(personId: string): Promise<PersonModel> {
    try {
        // URL: /api/employee/{personId}
        const response = await api.get<any>(`${employeesRouteApi.employ}/${personId}`);
        
        // El backend devuelve un único objeto.
        if (!response.data || Array.isArray(response.data)) {
            throw new Error("Respuesta de detalle de empleado inválida o vacía.");
        }
        
        return mapPersonFromApi(response.data);
    } catch (error) {
        console.error(`Error al obtener el empleado ${personId}:`, error);
        // El backend devuelve 404 si no existe, lo cual debe ser manejado por el consumidor
        throw error; 
    }
}