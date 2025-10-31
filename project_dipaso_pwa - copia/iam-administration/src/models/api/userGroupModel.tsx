
export interface UserGroupModel {
    userGroupId: string;
    groupName: string;
    // 🛑 CORRECCIÓN: Hace 'description' opcional para evitar el conflicto de tipos
    description?: string; 
    // 🛑 CORRECCIÓN: Hace 'integrationCode' opcional (por si el modelo real lo es)
    integrationCode?: string; 
    criticality: 'LOW' | 'MEDIUM' | 'HIGH';
    isActive: boolean;
    createdByUserId: string;
}