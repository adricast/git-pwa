// 📁 src/components/forms/usergroupformwrapper.tsx (AJUSTADO PARA SINGLEPAGE)

import React from "react"; 
import AddEditUserGroupContent from "./addeditusergroup"; 

// 💡 Dejamos la definición del tipo aquí para que el Wrapper sepa qué está pasando.
// NOTA: En un caso real, el tipo UserGroupModel se importaría desde la misma fuente en todos los archivos.
interface UserGroupModel {
    userGroupId: string;
    groupName: string;
    description?: string; // Debe ser opcional para compatibilidad
    integrationCode?: string; // Debe ser opcional para compatibilidad
    criticality: 'LOW' | 'MEDIUM' | 'HIGH';
    isActive: boolean;
    createdByUserId: string;
}


export const UserGroupFormWrapper: React.FC<{
    // Usamos el tipo localmente definido (que debe ser compatible con el Layout)
    userGroup: UserGroupModel | null; 
    onSave: (group: UserGroupModel | null, data: any) => Promise<void>; 

    onClose: () => void;
}> = ({ 
    userGroup, 
    onSave, 
    onClose 
}) => {
    
    // ... (Lógica de loading/error permanece igual)
    const isLoading = false;
    const error = null;

    if (isLoading) {
        return <div>Cargando configuración...</div>;
    }
    if (error) {
        // CORRECCIÓN: el error puede ser null
        return <div>Error al cargar configuración: {error || String(error)}. No se puede mostrar el formulario.</div>;
    }

    // Renderiza el formulario de contenido. 
    return (
        <AddEditUserGroupContent 
            userGroup={userGroup} 
            onSave={onSave} 
            onClose={onClose} 
            // 🔥 ACTIVACIÓN CLAVE: Pasamos la propiedad para renderizar todas las secciones.
            isSinglePageMode={true}
        />
    );
};

export default UserGroupFormWrapper;