// 📁 src/components/forms/usergroupformwrapper.tsx (VERSIÓN SIMPLIFICADA)

import React, { useCallback } from "react"; 
import AddEditUserGroupContent from "./addeditusergroupLocal"; 
// 🛑 ELIMINAMOS TODOS LOS IMPORTS RELACIONADOS CON EL PASO 2 (DynamicFormProvider, TreeNode, FormSection)
// 🛑 ELIMINAMOS LA DEFINICIÓN DE StepperHeader y groupSteps

interface UserGroupModel {
    userGroupId: string;
    groupName: string;
    description?: string; 
    integrationCode?: string; 
    criticality: 'LOW' | 'MEDIUM' | 'HIGH';
    isActive: boolean;
    createdByUserId: string;
}

// 🛑 ELIMINAMOS TODA LA LÓGICA DE iamPolicyTree Y policyAssignmentSection
// 🛑 ELIMINAMOS StepperHeader

export const UserGroupFormWrapper: React.FC<{
    userGroup: UserGroupModel | null; 
    // onSave ahora recibirá el payload COMPLETO con policies del paso 2 si es Creación
    onSave: (group: UserGroupModel | null, data: any) => Promise<any>; 
    onClose: () => void;
}> = ({ 
    userGroup, 
    onSave, 
    onClose 
}) => {
    
    // 🛑 ELIMINAMOS useState y estados de currentStep y step1Data

    const isLoading = false; // Se mantiene por si se necesita en el futuro
    const error = null;      // Se mantiene por si se necesita en el futuro

    // 🛑 NUEVO HANDLER: Lógica de guardado unificada
    // Esta función recibe el payload final (Paso 1 + Paso 2) del AddEditUserGroupContent
    const handleFormSubmit = useCallback(async (
        group: UserGroupModel | null, 
        data: any 
    ) => {
        // En este punto, 'data' ya contiene todos los campos, incluido 'selectedPolicies'
        
        try {
            await onSave(group, data); 
            // onClose() se manejará dentro de AddEditUserGroupContent después del éxito.
        } catch (err) {
            console.error("Error al guardar el formulario de grupo completo:", err);
            // Re-lanzar error para que el DynamicFormProvider mantenga el formulario abierto
            throw err; 
        }
    }, [onSave]);


    if (isLoading) {
        return <div>Cargando configuración...</div>;
    }
    if (error) {
        return <div>Error al cargar configuración: {error || String(error)}. No se puede mostrar el formulario.</div>;
    }
    
    const isEditingMode = !!userGroup; 

    // --------------------------------------------------------
    // RENDERIZADO SIMPLIFICADO: Delega la lógica de pasos a AddEditUserGroupContent
    // --------------------------------------------------------
    return (
        <div className="group-form-container">
            {/* 🛑 Eliminamos el StepperHeader */}
            
            <AddEditUserGroupContent 
                userGroup={userGroup} 
                onSave={handleFormSubmit} // Llama al handler que gestiona el guardado final
                onClose={onClose} 
                // isSinglePageMode es CLAVE: true en edición (omite pasos), false en creación (usa pasos)
                isSinglePageMode={isEditingMode} 
            />
        </div>
    );
};

export default UserGroupFormWrapper;