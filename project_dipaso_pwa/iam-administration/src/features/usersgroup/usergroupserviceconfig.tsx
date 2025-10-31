// 📁 src/management/groups/groupServiceConfig.tsx

// ======================================================================
// 1. IMPORTACIONES
// ======================================================================

import type { GroupModel } from "../../models/api/groupModel";

// 🛑 SOLUCIÓN: Importar los tipos de PAYLOAD DIRECTAMENTE DE SUS ARCHIVOS DE DEFINICIÓN
import type { UserGroupCreatePayload } from "../../models/payload/UsergroupCreationPayload";
import type { UserGroupUpdatePayload } from "../../models/payload/UsergroupUpdatePayload"; // Corregida la referencia

// Importamos las funciones del servicio
import { 
    getAllGroups, 
    getGroupById, 
    softDeleteGroupsMassive, 
    changeGroupStatus,
    createGroup as createGroupApi, 
    updateGroup as updateGroupApi,
} from "./../../services/api/groupuserServices"; // 🚨 Asegúrate de que este archivo SÓLO exporta FUNCIONES


// ----------------------------------------------------------------------
// 2. TIPOS AUXILIARES: (Reexportamos los tipos importados)
// ----------------------------------------------------------------------

// Exportamos los tipos de payload importados directamente de los archivos de modelos.
export type { UserGroupCreatePayload, UserGroupUpdatePayload }; 

/**
 * Interfaz que define la estructura de los servicios CRUD de Grupos de Usuarios.
 */
export interface GroupServiceConfig {
    // ... (El resto de la interfaz GroupServiceConfig permanece sin cambios)
    getAllGroups: () => Promise<GroupModel[]>; 
    getGroupById: (userGroupId: string) => Promise<GroupModel>;
    softDeleteGroupsMassive: (userGroupIds: string[], updatedByUserId: string) => Promise<{ message: string; success: boolean; }>; 
    changeGroupStatus: (userGroupId: string, isActive: boolean, updatedByUserId: string) => Promise<GroupModel>;
    createGroup: (groupData: UserGroupCreatePayload, createdByUserId: string) => Promise<GroupModel>;
    updateGroup: (userGroupId: string, updatedByUserId: string, groupPatch: UserGroupUpdatePayload) => Promise<GroupModel>;
}

// ----------------------------------------------------------------------
// 🟢 IMPLEMENTACIÓN REAL (Delegación al servicio API)
// ----------------------------------------------------------------------

export const groupServiceConfig: GroupServiceConfig = {
    // Lectura
    getAllGroups: async () => {
        const result = await getAllGroups(); 
        return result; 
    },
    getGroupById: getGroupById,

    // Escritura
    softDeleteGroupsMassive: softDeleteGroupsMassive,
    changeGroupStatus: changeGroupStatus,
    createGroup: createGroupApi, 
    updateGroup: updateGroupApi,
};