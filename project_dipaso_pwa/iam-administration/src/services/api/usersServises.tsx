// 📁 src/services/userService.tsx (COMPLETO con CRUD)

import type { UserModel} from "../../models/api/userModel";
import type { UserCreationPayload} from "../../models/payload/UserCreationPayload";
import type { UserUpdatePayload} from "../../models/payload/UserUpdatePayload";
import { api } from "./../api/api2"; // Usamos 'api2' que apunta al servidor local
import { usersRouteApi } from "../../configurations/routes/apiroutes"; // Asume { user: '/user' }

// Reexportamos los tipos para usarlos en otros módulos
export type { UserCreationPayload, UserUpdatePayload };

// ----------------------------------------------------------------
// AUXILIARES DE MAPPING (Backend -> Frontend)
// ----------------------------------------------------------------

/**
 * Mapea el objeto User (API) al modelo local (UserModel),
 * corrigiendo errores tipográficos y extrayendo detalles anidados.
 */
function mapUserFromApi(apiUser: any): UserModel {

    // Leer el objeto 'people' si vino en la respuesta (no forzamos un objeto vacío)
    const apiPeople = apiUser.people;

    // Determinar employeeId robustamente (variantes camelCase / snake_case / nested)
    const employeeIdFromUser = apiUser.employeeId || apiUser.employee?.employeeId || apiUser.employee?.personId || apiUser.employee_id || apiUser.employee?.employee_id || apiUser.people?.personId || apiUser.people?.person_id || null;

    // Mapeo del objeto principal
    const mapped: UserModel = {
        // --- CAMPOS DE NIVEL SUPERIOR (USER) ---
        userId: apiUser.userId,
        userName: apiUser.userName,
        email: apiUser.email,
        isActive: apiUser.isActive,
        isLocked: apiUser.isLocked,
        integrationCode: apiUser.integrationCode,

        // --- ARRAYS ANIDADOS (ASUMIMOS QUE YA ESTÁN EN CAMELCASE) ---
        groups: apiUser.groups || [],
        branchs: apiUser.branchs || [],
        authMethods: apiUser.authMethods || [],
        userPolicies: apiUser.userPolicies || [],
    } as UserModel;

    // Agregar employeeId si fue encontrado
    if (employeeIdFromUser) {
        (mapped as any).employeeId = employeeIdFromUser;
    }

    // Mapear 'people' solo si existe en la respuesta
    if (apiPeople) {
        mapped.people = {
            personId: apiPeople.personId,

            // Robusto ante errores tipográficos
            givenName: apiPeople.givenName || apiPeople.giveName || '',
            surName: apiPeople.surName || '',

            // Normalizaciones
            dateOfBirth: apiPeople.birth || apiPeople.dateOfBirth || '',
            isCustomer: apiPeople.isCustomer || apiPeople.isCustomes || false,
            isSupplier: apiPeople.isSupplier || false,
            isEmployee: apiPeople.isEmployee || false,
            isActive: apiPeople.isActive || false,
            genderId: apiPeople.gender?.genderId || apiPeople.genderId || '',
            integrationCode: apiPeople.integrationCode,
        } as any;
    }

    return mapped;
}

// ----------------------------------------------------------------
// Funciones de Acceso a Datos (CRUD)
// ----------------------------------------------------------------

/** Obtiene todos los usuarios (GET /user) - SIN CIFRADO (como employee) */
export async function getAllUsers(activeOnly: boolean = false): Promise<UserModel[]> {
    try {
        const query = activeOnly ? '?active=true' : '';
        const url = `${usersRouteApi.user}${query}`;

        // Obtener respuesta directa del backend (sin cifrado)
        const response = await api.get<unknown[]>(url);
        const rawData = response.data;

        // El backend devuelve un array directamente
        if (!Array.isArray(rawData)) {
            console.error("Estructura de respuesta inesperada:", rawData);
            throw new Error("Respuesta de lista de usuarios inválida: Array de usuarios no encontrado.");
        }

        // Mapear los datos
        return rawData.map(mapUserFromApi);
    } catch (error) {
        console.error("Error al obtener la lista de usuarios:", error);
        throw error;
    }
}

/** Consulta los detalles de un usuario por UUID (GET /user/{uuid}) - SIN CIFRADO */
export async function getUserByUuid(userId: string): Promise<UserModel> {
    try {
        const url = `${usersRouteApi.user}${userId}`;

        // Obtener respuesta directa del backend
        const response = await api.get<unknown>(url);
        const rawData = response.data;

        if (!rawData || Array.isArray(rawData)) {
            throw new Error("Respuesta de detalle de usuario inválida o vacía.");
        }

        // Mapear los datos
        return mapUserFromApi(rawData);
    } catch (error) {
        console.error(`Error al obtener el usuario ${userId} por UUID:`, error);
        throw error;
    }
}

/** Crea un nuevo Usuario (POST /user) */
export async function createUser(
    userData: UserCreationPayload, 
    createdByUserId: string
): Promise<UserModel> {
    // Asumimos que el backend acepta camelCase para la creación.
    try {
        const payloadToSend = { ...userData, createdByUserId: createdByUserId };
        
        const response = await api.post<any>(usersRouteApi.user, payloadToSend, { 
            headers: { "X-Creator-User-Id": createdByUserId, "Content-Type": "application/json" } 
        });
        
        return mapUserFromApi(response.data);
    } catch (error: any) {
        console.error("Error al crear el usuario:", error);
        throw error;
    }
}

/** Actualiza un Usuario existente (PUT /user/{id}) */
export async function updateUser(
    userId: string, 
    updatedByUserId: string, 
    userPatch: UserUpdatePayload
): Promise<UserModel> {
    // Asumimos que el backend acepta camelCase para la actualización.
    try {
        const payloadToSend = { ...userPatch, updatedByUserId: updatedByUserId };
        
        const response = await api.put<any>(`${usersRouteApi.user}${userId}`, payloadToSend, { 
            headers: { "X-Updater-User-Id": updatedByUserId, "Content-Type": "application/json" }
        });
        
        return mapUserFromApi(response.data);
    } catch (error: any) {
        console.error(`Error al actualizar el usuario ${userId}:`, error);
        throw error;
    }
}


/** Eliminación lógica masiva de Usuarios (PATCH /user/massive-soft) - SIN CIFRADO */
export async function softDeleteUserMassive(
    userIds: string[],
    updatedByUserId: string
): Promise<{ message: string; count: number; }> {
    try {
        // Enviar payload directo
        const response = await api.patch<{ message: string; count: number }>(
            `${usersRouteApi.user}massive-soft`,
            { user_ids: userIds, updated_by_user_id: updatedByUserId },
            { headers: { "X-Updater-User-Id": updatedByUserId, "Content-Type": "application/json" }}
        );

        return response.data;
    } catch (error) {
        console.error("Error en la eliminación lógica masiva de usuarios:", error);
        throw error;
    }
}