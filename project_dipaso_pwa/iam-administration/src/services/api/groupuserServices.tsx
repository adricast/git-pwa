// 📁 src/services/groupService.tsx

import type { GroupModel } from "../../models/api/groupModel";

// 🚨 IMPORTAMOS LOS TIPOS DE PAYLOAD ESPECÍFICOS
import type { UserGroupCreatePayload } from "../../models/payload/UsergroupCreationPayload";
import type { UserGroupUpdatePayload } from "../../models/payload/UsergroupUpdatePayload"; // Asumo que corregiste el nombre
import { api } from "./../api/api2"; // Asume que 'api' es tu instancia configurada de Axios
import { groupRouteApi } from "../../configurations/routes/apiroutes"; // Asume { group: '/groups' }
import { v4 as uuidv4 } from 'uuid'; 

// ----------------------------------------------------------------
// AUXILIAR DE MAPPING
// ----------------------------------------------------------------

/** Mapea el objeto GroupModel de la API (camelCase) al tipo de Frontend. */
function mapGroupFromApi(apiGroup: any): GroupModel {
    return {
        userGroupId: apiGroup.userGroupId,
        groupName: apiGroup.groupName,
        description: apiGroup.description,
        isActive: apiGroup.isActive,
        integrationCode: apiGroup.integrationCode,
        criticality: apiGroup.criticality, 
        // Campos de Auditoría
        createdAt: apiGroup.createdAt,
        updatedAt: apiGroup.updatedAt,
        createdByUserId: apiGroup.createdByUserId,
        updatedByUserId: apiGroup.updatedByUserId,
    } as GroupModel;
}

// ----------------------------------------------------------------
// Funciones de Acceso a Datos (CRUD)
// ----------------------------------------------------------------

// -------------------
// 1. CONSULTA MASIVA (GET /groups)
// -------------------

/** Obtiene todos los grupos y retorna el array de GroupModel[]. */
export async function getAllGroups(): Promise<GroupModel[]> {
    try {
        const response = await api.get<{ item: any[]; total: number }>(groupRouteApi.group);
        const rawData = response.data.item; 
        
        if (!Array.isArray(rawData)) {
            console.error("Estructura de respuesta inesperada:", response.data);
            throw new Error("Respuesta de lista de grupos inválida.");
        }
        
        return rawData.map(mapGroupFromApi);
    } catch (error) {
        console.error("Error al obtener la lista de grupos:", error);
        throw error;
    }
}

// -------------------
// 2. CONSULTA POR ID (GET /groups/{id})
// -------------------

/** Consulta los detalles de un grupo por ID. */
export async function getGroupById(userGroupId: string): Promise<GroupModel> {
    try {
        const response = await api.get<any>(`${groupRouteApi.group}/${userGroupId}`);
        
        if (!response.data || Array.isArray(response.data)) {
            throw new Error("Respuesta de detalle de grupo inválida o vacía.");
        }
        
        return mapGroupFromApi(response.data);
    } catch (error) {
        console.error(`Error al obtener el grupo ${userGroupId}:`, error);
        throw error; 
    }
}

// -------------------
// 3. CREAR GRUPO (POST /groups)
// -------------------

/** Crea un nuevo Grupo (POST /groups) */
export async function createGroup(
    // 🚨 Usa el payload de creación específico
    groupData: UserGroupCreatePayload, 
    createdByUserId: string // El ID de auditoría se pasa por separado si no está en el payload
): Promise<GroupModel> {
    try {
        // NOTA: groupData ya contiene los campos necesarios.
        const payloadToSend = { 
            ...groupData, 
            createdByUserId: createdByUserId // Sobrescribir o asegurar el ID de auditoría
        };
        
        const idempotencyKey = uuidv4(); 

        const response = await api.post<any>(groupRouteApi.group, payloadToSend, { 
            headers: { 
                "X-Creator-User-Id": createdByUserId, 
                "Content-Type": "application/json",
                "X-Idempotency-Key": idempotencyKey,
            } 
        });
        
        return mapGroupFromApi(response.data);
    } catch (error: any) {
        console.error("Error al crear el grupo:", error);
        throw error;
    }
}

// -------------------
// 4. ACTUALIZAR GRUPO (PUT /groups/{id})
// -------------------

/** Actualiza un Grupo existente (PUT /groups/{id}) */
export async function updateGroup(
    userGroupId: string, 
    updatedByUserId: string, 
    // 🚨 Usa el payload de actualización específico
    groupPatch: UserGroupUpdatePayload
): Promise<GroupModel> {
    try {
        // El payload de actualización ya incluye todos los campos modificables (opcionales)
        const payloadToSend = { 
            ...groupPatch, 
            updatedByUserId: updatedByUserId // Sobrescribir o asegurar el ID de auditoría
        };
        
        const idempotencyKey = uuidv4();

        const response = await api.put<any>(`${groupRouteApi.group}${userGroupId}`, payloadToSend, { 
            headers: { 
                "X-Updater-User-Id": updatedByUserId, 
                "Content-Type": "application/json",
                "X-Idempotency-Key": idempotencyKey,
            }
        });
        
        return mapGroupFromApi(response.data);
    } catch (error: any) {
        console.error(`Error al actualizar el grupo ${userGroupId}:`, error);
        throw error;
    }
}

// -------------------
// 5. CAMBIAR ESTADO (PATCH /groups/{id}/status)
// -------------------

/** Cambia el estado activo/inactivo de un grupo. */
export async function changeGroupStatus(
    userGroupId: string, 
    isActive: boolean,
    updatedByUserId: string
): Promise<GroupModel> {
    try {
        const payloadToSend = { isActive, updatedByUserId };
        
        const response = await api.patch<any>(
            `${groupRouteApi.group}${userGroupId}/status`, 
            payloadToSend,
            { headers: { "X-Updater-User-Id": updatedByUserId } }
        );
        
        return mapGroupFromApi(response.data);
    } catch (error: any) {
        console.error(`Error al cambiar estado del grupo ${userGroupId}:`, error);
        throw error;
    }
}

// -------------------
// 6. ELIMINACIÓN LÓGICA MASIVA (PATCH /groups/massive-soft)
// -------------------

/** Eliminación logica masiva de grupos. */
export async function softDeleteGroupsMassive(
    userGroupIds: string[], 
    updatedByUserId: string
): Promise<{ message: string; success: boolean; }> {
    try {
        // Backend espera camelCase: userGroupIds
        const payloadToSend = { userGroupIds, updatedByUserId };

        const response = await api.patch<any>(
            `${groupRouteApi.group}/massive-soft`,
            payloadToSend, 
            { headers: { "X-Updater-User-Id": updatedByUserId, "Content-Type": "application/json" }}
        );
        return response.data;
    } catch (error) {
        console.error("Error en la eliminacion logica masiva de grupos:", error);
        throw error;
    }
}