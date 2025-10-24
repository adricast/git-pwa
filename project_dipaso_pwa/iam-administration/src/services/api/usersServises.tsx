// 📁 src/services/userService.tsx (COMPLETO con CRUD)

import type { UserModel} from "../../models/api/userModel";
import type { UserCreationPayload} from "../../models/payload/UserCreationPayload";
import type { UserUpdatePayload} from "../../models/payload/UserUpdatePayload";
import { api } from "./../api/api"; // Usamos 'api' genérico, ajusta si tienes 'apiUsuarios'
import { usersRouteApi } from "../../configurations/routes/apiroutes"; // Asume { user: '/user' }

// ----------------------------------------------------------------
// AUXILIARES DE MAPPING (Backend -> Frontend)
// ----------------------------------------------------------------

/**
 * Mapea el objeto User (API) al modelo local (UserModel),
 * corrigiendo errores tipográficos y extrayendo detalles anidados.
 */
function mapUserFromApi(apiUser: any): UserModel {
    
    // Extraer y mapear el objeto 'people'
    const apiPeople = apiUser.people || {};
    
    // Mapeo del objeto principal y corrección de 'people' anidado
    return {
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
        
        // --- DETALLES DE LA PERSONA ASOCIADA (PEOPLE) ---
        people: {
            personId: apiPeople.personId,

            // 🛑 CORRECCIÓN: Lee 'givenName' (si existe) o 'giveName' (el error tipográfico)
            givenName: apiPeople.givenName || apiPeople.giveName || '', 
            surName: apiPeople.surName || '',

            // 🛑 CRÍTICO: Normalizar el nombre del campo 'birth' a dateOfBirth
            dateOfBirth: apiPeople.birth || '', 
            
            // CRÍTICO: Normalizar isCustomer (API usa 'isCustomes')
            isCustomer: apiPeople.isCustomer || apiPeople.isCustomes || false,
            isSupplier: apiPeople.isSupplier || false,
            isEmployee: apiPeople.isEmployee || false,
            isActive: apiPeople.isActive || false,

            // 🛑 CRÍTICO: Extraer el ID del objeto 'gender'
            genderId: apiPeople.gender?.genderId || '', 
            
            integrationCode: apiPeople.integrationCode,
            // Otros campos de people (phoneNumber, addresses, documents, etc.) se perderán 
        },

        // createdByUserId, etc.
    } as UserModel;
}

// ----------------------------------------------------------------
// Funciones de Acceso a Datos (CRUD)
// ----------------------------------------------------------------

/** Obtiene todos los usuarios activos (GET /user) */
export async function getAllUsers(activeOnly: boolean = false): Promise<UserModel[]> {
    try {
        const query = activeOnly ? '?active=true' : '';
        const url = `${usersRouteApi.user}${query}`;
        
        const response = await api.get<any>(url); 
        
        const usersArray = response.data.item; 

        if (!Array.isArray(usersArray)) {
            console.error("Estructura de respuesta inesperada:", response.data);
            throw new Error("Respuesta de lista de usuarios inválida: Array de usuarios no encontrado.");
        }
        return usersArray.map(mapUserFromApi);
    } catch (error) {
        console.error("Error al obtener la lista de usuarios:", error);
        throw error;
    }
}

/** Consulta los detalles de un usuario por UUID (GET /user/{uuid}). */
export async function getUserByUuid(userId: string): Promise<UserModel> {
    try {
        const url = `${usersRouteApi.user}${userId}`; 
        
        const response = await api.get<any>(url);
        
        let itemData = response.data.data || response.data; 

        if (Array.isArray(itemData) && itemData.length > 0) {
            itemData = itemData[0];
        }

        if (!itemData || Array.isArray(itemData)) {
            throw new Error("Respuesta de detalle de usuario inválida o vacía.");
        }
        // Usar el mapeo corregido
        return mapUserFromApi(itemData);
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


/** Eliminación lógica masiva de Usuarios (PATCH /user/massive-soft) */
export async function softDeleteUserMassive(
    userIds: string[], 
    updatedByUserId: string
): Promise<{ message: string; count: number; }> {
    try {
        // En tu caso de empleado, se usaba massive-soft. Adaptamos la ruta.
        const response = await api.patch<any>(
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