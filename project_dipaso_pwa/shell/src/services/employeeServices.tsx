// 📁 src/services/api/employeeService.ts

// ======================================================================
// 1. IMPORTACIONES
// ======================================================================

import { api } from "./api2"; // Tu instancia de Axios configurada
import { employeesRouteApi } from "./../configurations/routes/apiRoutes"; // ASUME: Objeto de rutas

// Importa los modelos (Interfaces) definidos en /models/api/
import { 
    type IPerson, // Modelo base
    
} from "./../models/api/peopleModel"; 
import { 
    type IEmployee, // Modelo base  
} from "./../models/api/employeesModel";
 
import { 
    type IPersonAddress, 
} from "./../models/api/peopleaddress";


import { 
    type IPersonDocument, // Modelo base
} from "./../models/api/peopledocumentsModel";


// ======================================================================
// 2. CONSTANTES Y TIPOS
// ======================================================================

// La ruta base es, por ejemplo, "/api/employees/"
const BASE_ROUTE = `${employeesRouteApi.employ}`; 

/**
 * Tipo que representa la estructura completa del empleado (Persona + anidados).
 */
export type IEmployeeFullDetails = IPerson & {
    addresses: IPersonAddress[];
    documents: IPersonDocument[];
    employee: IEmployee;
};

// ----------------------------------------------------------------------
// 3. FUNCIONES DE CONSULTA (API)
// ----------------------------------------------------------------------

/**
 * Obtiene la lista de todos los empleados.
 */
export async function getAllEmployees(activeOnly: boolean = false): Promise<IEmployeeFullDetails[]> {
    try {
        const url = activeOnly ? `${BASE_ROUTE}?active=true` : BASE_ROUTE;
        
        const response = await api.get<IEmployeeFullDetails[]>(url); 
        
        if (!Array.isArray(response.data)) {
            throw new Error("API response unexpected: Array of employees expected.");
        }

        return response.data; 
    } catch (error: any) {
        console.error("Error fetching all employees from API:", error);
        throw error;
    }
}

/**
 * Obtiene los detalles completos de un empleado por su ID de Persona.
 */
export async function getEmployeeById(personId: string): Promise<IEmployeeFullDetails | null> {
    try {
        // Llama a BASE_URL/api/employees/{personId}
        const response = await api.get<IEmployeeFullDetails>(`${BASE_ROUTE}${personId}`);
        return response.data; 
    } catch (error: any) {
        if (error.response && error.response.status === 404) {
            return null;
        }
        console.error(`Error fetching employee ${personId} from API:`, error);
        throw error;
    }
}

// ----------------------------------------------------------------------
// 4. FUNCIONES DE MUTACIÓN (API)
// ----------------------------------------------------------------------

/**
 * Crea un nuevo empleado con todos los detalles anidados.
 * @param data Objeto completo del empleado que será enviado.
 */
export async function createEmployee(
    data: IEmployeeFullDetails, // Usa el tipo completo tipado
    createdByUserId: string
): Promise<IEmployeeFullDetails> { // Devuelve el tipo completo tipado
    try {
        // Se asegura que el ID del creador se incluye en el payload (si la API lo requiere en el body)
        const payload = { ...data, created_by_user_id: createdByUserId };
        
        // Ejecuta la petición POST con el tipo de respuesta esperado
        const response = await api.post<IEmployeeFullDetails>(BASE_ROUTE, payload);
        return response.data;
    } catch (error) {
        console.error("Error creating employee:", error);
        throw error;
    }
}

/**
 * Actualiza los detalles de un empleado existente.
 */
export async function updateEmployee(
    personId: string, 
    data: Partial<IEmployeeFullDetails>, // Permite un payload parcial
    updatedByUserId: string
): Promise<IEmployeeFullDetails> {
    try {
        const payload = { ...data, updated_by_user_id: updatedByUserId };
        const response = await api.put<IEmployeeFullDetails>(`${BASE_ROUTE}${personId}`, payload);
        return response.data;
    } catch (error) {
        console.error(`Error updating employee ${personId}:`, error);
        throw error;
    }
}

/**
 * Realiza la eliminación lógica (soft delete) masiva de empleados.
 */
export async function softDeleteEmployeesMassive(
    personIds: string[], 
    updatedByUserId: string
): Promise<{ message: string; count: number }> {
    try {
        const payload = { person_ids: personIds, updated_by_user_id: updatedByUserId };
        const response = await api.patch<{ message: string; count: number }>(
            `${BASE_ROUTE}deactivate-massive`, 
            payload
        );
        return response.data;
    } catch (error) {
        console.error("Error performing massive soft delete:", error);
        throw error;
    
    }
}