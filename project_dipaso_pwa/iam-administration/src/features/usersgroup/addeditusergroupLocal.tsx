// 📁 src/management/usergroups/addeditusergroup.tsx

import React, { useCallback, useMemo } from "react";
import { DynamicFormProviderSections } from '@dipaso/design-system';
import type { DynamicButtonProps } from '@dipaso/design-system';
// 🛑 IMPORTACIÓN CRÍTICA: Importa el tipo FormSection desde la ruta esperada por DynamicFormProviderSections
import type { FormSection } from '@dipaso/design-system/dist/components/multisectiondinamicform/interface'; 

import type { UserGroupModel } from "../../models/api/userGroupModel"; 

import { userGroupFormSections } from "./usergroupformconfig";

// Tipo de datos PLANA del formulario
interface UserGroupFormData {
    groupName: string;
    description: string;
    integrationCode?: string;
    criticality: string;
    isActive: boolean;
}

/**
 * Formulario de creación / edición de Grupos de Usuarios.
 */
const AddEditUserGroupContent: React.FC<{
    userGroup: UserGroupModel | null; 
    // Usamos 'any' para simular el guardado ya que los servicios no están definidos
    onSave: (group: UserGroupModel | null, data: Partial<UserGroupModel>) => Promise<void>; 
    onClose: () => void;
    // 🔥 CORRECCIÓN 1: Añadir la propiedad a las props
    isSinglePageMode?: boolean;
}> = ({ 
    userGroup, 
    onSave, 
    onClose,
    // 🔥 CORRECCIÓN 2: Desestructurar la propiedad y darle un valor por defecto
    isSinglePageMode = false,
}) => {
            
    // 1. Preparamos los datos iniciales para el formulario dinamico
    const initialData: Partial<UserGroupFormData> = useMemo(() => {
        // --- BASE DE DATOS INICIAL (Edicion y Creacion) ---
        const baseData: Partial<UserGroupFormData> = {
            groupName: userGroup?.groupName || "",
            description: userGroup?.description || "",
            integrationCode: userGroup?.integrationCode || "",
            criticality: userGroup?.criticality || 'MEDIUM', // Valor por defecto
            isActive: userGroup?.isActive ?? true, // Por defecto a true
        };
        return baseData;
    }, [userGroup]);
            
    // 2. Definimos el handler onSubmit
    const handleDynamicSubmit = useCallback(async (data: Record<string, any>) => {
        const formData = data as unknown as UserGroupFormData;
                
        // LÓGICA DE DETECCIÓN DE CAMBIOS (Simplificada)
        if (userGroup) {
            const initialString = JSON.stringify(initialData);
            const currentString = JSON.stringify(formData);
            
            if (initialString === currentString) {
                console.log("Modificar: No se detectaron cambios en los datos. Cerrando formulario.");
                return onClose(); 
            }
        }
        
        // Mapeo de FormData plana al Payload de la API (simulado)
        const finalPayload: Partial<UserGroupModel> = {
            groupName: formData.groupName,
            description: formData.description,
            integrationCode: formData.integrationCode,
            criticality: formData.criticality as UserGroupModel['criticality'],
            isActive: formData.isActive,
        };
                    
        await onSave(userGroup, finalPayload);
    }, [userGroup, onSave, onClose, initialData]);


    // 3. Definimos el boton "Cancelar"
    const formActions: DynamicButtonProps[] = useMemo(() => ([
        {
            label: 'Cancelar',
            color: '#6c757d', 
            textColor: '#fff',
            type: 'button',
            onClick: onClose,
        }
    ]), [onClose]);


    return (
        <div className="usergroup-form-wrapper">
            <DynamicFormProviderSections
                // 🛑 FORZAMOS EL TIPO A LA DEFINICIÓN COMPATIBLE
                sections={userGroupFormSections as FormSection[]} 
                initialData={initialData}
                onSubmit={handleDynamicSubmit}
                buttonText={userGroup ? "Actualizar Grupo" : "Crear Grupo"}
                className="usergroup-form" 
                actions={formActions} 
                // 🔥 CORRECCIÓN 3: Pasamos la variable desestructurada (ahora definida)
                singlePage={isSinglePageMode} 
            />
        </div>
    );
};

export default AddEditUserGroupContent;