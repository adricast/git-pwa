// 📁 src/components/management/groupuser/groupServiceConfig.ts

import { 
    getActiveGroups, 
    softDeleteGroupsMassive, 
    createGroup, 
    updateGroup 
} from "./../../services/groupuserServices"; 

import type { Group } from "./../../models/api/groupModel";

/**
 * Interfaz que define la estructura de los servicios CRUD de Grupos.
 */
export interface GroupServiceConfig {
    getActiveGroups: () => Promise<Group[]>;
    
    // 🔑 CORRECCIÓN 1: Se usa 'any' para simplificar la compatibilidad del retorno (ya que no se usa el valor) 
    // y se usa (string | number)[] para ser compatible con la función importada.
    softDeleteGroupsMassive: (groupIds: (string | number)[]) => Promise<any>; 
    
    // 🔑 CORRECCIÓN 2: El tipo de payload de creación se ajusta a Omit<Group, "groupId">
    // ya que el componente manualmente añade 'users', 'lastModifiedAt', e 'isActive'.
    createGroup: (groupData: Omit<Group, "groupId">) => Promise<Group>;
    
    updateGroup: (group: Group) => Promise<Group>;
}

/**
 * 🟢 Objeto de Configuración de Servicios
 * Si el desarrollador necesita cambiar la fuente de datos, SOLO necesita modificar las funciones aquí.
 */
export const groupServiceConfig: GroupServiceConfig = {
    getActiveGroups: getActiveGroups,
    softDeleteGroupsMassive: softDeleteGroupsMassive,
    createGroup: createGroup,
    updateGroup: updateGroup,
};