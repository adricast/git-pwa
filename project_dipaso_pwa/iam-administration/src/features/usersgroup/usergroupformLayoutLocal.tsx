// 📁 src/management/usergroups/usergroupLayout.tsx 
// (Adaptado para consumir groupServiceConfig)

import { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from "react";
import { useScreenContainer, ReusableTableFilterLayout } from '@dipaso/design-system';
import { FaSyncAlt } from "react-icons/fa"; 
import DeleteConfirmationDialog from "@dipaso/design-system/dist/components/layout/deletedialogLayout";

import UserGroupFormWrapper from "./usergroupformwrapper";

// 🛑 IMPORTACIONES DE SERVICIOS Y TIPOS
import { 
    groupServiceConfig, // Importa el objeto de configuración (fachada)
    type UserGroupCreatePayload, 
    type UserGroupUpdatePayload
} from "./usergroupserviceconfig"; // 🚨 Debe existir en la ruta './groupServiceConfig'

import type { UserGroupModel } from "../../models/api/userGroupModel"; 

// 🟢 Desestructuración de las funciones de servicio
const { 
    getAllGroups, 
    softDeleteGroupsMassive, 
    createGroup, 
    updateGroup,
} = groupServiceConfig; 


const MOCK_USER_ID = "abe3af10-5663-4bd7-902d-b67bf5d1f2f4"; 

// Nota: Los datos MOCK y la lógica de carga MOCK serán reemplazados por la lógica de servicio real.


// Referencia renombrada a UserGroupManagementRef
export type UserGroupManagementRef = { 
    handleOpenGroupModal: () => void;
    handleEditFromShortcut: () => void;
    handleDeleteFromShortcut: () => void;
};

// Componente renombrado a UserGroupManagement
const UserGroupManagement = forwardRef<UserGroupManagementRef>((_, ref) => { 
    const { openScreen, closeTopScreen } = useScreenContainer();

    // Estados
    const [groups, setGroups] = useState<UserGroupModel[]>([]); 
    const [selectedRows, setSelectedRows] = useState<UserGroupModel[]>([]);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<UserGroupModel | null>(null); 
    const [loading, setLoading] = useState(true); 

    // 🟢 FUNCIÓN DE CARGA REAL (GET /groups)
    const loadGroups = useCallback(async () => {
        setLoading(true);
        try {
            // 🛑 CORRECCIÓN 1: Forzar el cast a UserGroupModel[] para resolver el error de 'criticality'
            const dataFromService = await getAllGroups(); 
            setGroups(dataFromService as UserGroupModel[]); 
        } catch (error) {
            console.error("Error al cargar grupos desde la API:", error);
            setGroups([]);
        } finally {
            setLoading(false);
            setSelectedRows([]);
        }
    }, []);

    useEffect(() => { loadGroups(); }, [loadGroups]);

    
    // Abre el formulario (simple, sin carga de detalle extra)
    const handleOpenGroupScreen = (groupToEdit: UserGroupModel | null = null) => {
        const title = groupToEdit 
            ? `Editar Grupo: ${groupToEdit.groupName}` 
            : "Crear Nuevo Grupo de Usuario";
        
        const content = (
            <UserGroupFormWrapper 
                userGroup={groupToEdit} 
                onSave={handleSaveGroup} 
                onClose={closeTopScreen} 
            />
        );
        
        openScreen(title, content); 
    };
    
    // Función de edición directa (usa el objeto del listado)
    const handleOpenEditScreen = useCallback((group: UserGroupModel) => {
        handleOpenGroupScreen(group);
    }, [handleOpenGroupScreen]);


    // 🟢 Maneja la creación y la actualización (Integración de Servicios)
    const handleSaveGroup = async (
        group: UserGroupModel | null, 
        // 🚨 El segundo argumento son los datos planos del formulario (UserGroupFormData)
        groupPatchRaw: any 
    ) => {
        // La data plana del formulario contiene todos los campos necesarios.
        const formData = groupPatchRaw as UserGroupCreatePayload & UserGroupUpdatePayload; 
        const isEditing = group && group.userGroupId;
        
        try {
            let resultGroup: UserGroupModel;

            // 🛑 CORRECCIÓN 2: Declarar la variable 'payload' fuera de los bloques if/else
            const payload = {
                groupName: formData.groupName,
                description: formData.description,
                integrationCode: formData.integrationCode,
                criticality: formData.criticality,
                isActive: formData.isActive,
            };


            if (isEditing) {
                // 1. ACTUALIZAR (API REAL)
                // 🛑 Aplicar el casting solo al servicio.
                resultGroup = await updateGroup(group!.userGroupId, MOCK_USER_ID,payload as UserGroupUpdatePayload ) as UserGroupModel; // 🛑 Forzar el cast de la respuesta
                
            } else {
                // 2. CREAR (API REAL)
                // 🛑 Aplicar el casting solo al servicio.
                resultGroup = await createGroup(payload as UserGroupCreatePayload, MOCK_USER_ID) as UserGroupModel; // 🛑 Forzar el cast de la respuesta
            }
            
            // Éxito: Reemplaza o añade el ítem en la lista
           
            //if (isEditing) {
            //    setGroups(prev => prev.map(g => g.userGroupId === resultGroup.userGroupId ? resultGroup : g));
            //} else {
            //    setGroups(prev => [...prev, resultGroup]);
            //}
            if (isEditing) {
                closeTopScreen(); 
            }

           return resultGroup;
            // loadGroups(); // Llamar a loadGroups solo si se requiere un refresh total

        } catch (error) {
            console.error("🛑 ERROR DE GUARDADO DETECTADO (API).", error);
            // Re-lanzar error para que el formulario permanezca abierto si el DynamicFormProvider lo espera
            throw error; 
        }
    };
    
    // 🟢 Lógica de Eliminación Lógica Masiva (Soft Delete)
    const handleSoftDeleteMassive = async () => {
        if (selectedRows.length === 0) return;
        
        try {
            const groupIds: string[] = selectedRows.map(g => g.userGroupId); 
            
            // 🚨 Llamada al servicio real de soft delete masivo
            await softDeleteGroupsMassive(groupIds, MOCK_USER_ID); 
            
            loadGroups(); // Recargar la lista para reflejar los cambios
            
            setIsDeleteDialogOpen(false);
            setItemToDelete(null);
            setSelectedRows([]);

        } catch (error) {
            console.error("Error en la eliminación lógica masiva (API):", error);
            // Mostrar notificación de error al usuario
        }
    };

    useImperativeHandle(ref, () => ({
        handleOpenGroupModal: () => handleOpenGroupScreen(), 
        handleEditFromShortcut: () => { 
            if (selectedRows.length === 1) handleOpenEditScreen(selectedRows[0]);
        },
        handleDeleteFromShortcut: () => {
            if (selectedRows.length > 0) {
                setItemToDelete(selectedRows[0]); 
                setIsDeleteDialogOpen(true);
            }
        },
    }));

    // DEFINICIÓN DE COLUMNAS (Se mantiene igual)
    const columns = [
        { 
            field: "groupName", 
            header: "Nombre del Grupo",
            onCellClick: handleOpenEditScreen 
        },
        { field: "criticality", header: "Criticidad" },
        { field: "integrationCode", header: "Cód. Integración" },
        { field: "description", header: "Descripción" }, 
        { field: "isActive", header: "Activo", bodyTemplate: (g: UserGroupModel) => (g.isActive ? "Sí" : "No") }, 
    ];

    // Botones (Se mantienen igual)
    const buttons = [
        {
            label: "",
            color: "btn-primary", 
            textColor: "text-light", 
            icon: <FaSyncAlt className={loading ? "spin-icon" : ""} />, 
            onClick: () => loadGroups(), 
            disabled: loading 
        },
        {
            label: "Agregar Grupo", 
            color: "btn-primary", 
            textColor: "text-light",
            onClick: () => handleOpenGroupScreen(), 
        },
        {
            label: "Editar",
            color: "btn-edit", 
            textColor: "text-light",
            onClick: (selectedRows?: UserGroupModel[]) => {
                if (selectedRows && selectedRows.length === 1) {
                    handleOpenEditScreen(selectedRows[0]);
                }
            },
            isVisible: (selectedRows: UserGroupModel[]) => selectedRows.length === 1,
        },
        {
            label: "Eliminar",
            color: "btn-delete", 
            textColor: "text-light",
            onClick: (selectedRows?: UserGroupModel[]) => {
                if (!selectedRows || selectedRows.length === 0) return;
                setItemToDelete(selectedRows[0]); 
                setIsDeleteDialogOpen(true);
            },
        },
    ];
    

    return (
        <div className="layout-container"> 
            <div className="table-wrapper-container"> 
                <ReusableTableFilterLayout
                    moduleName="Gestión de Grupos de Usuarios" 
                    data={groups} 
                    rowKey="userGroupId" 
                    columns={columns}
                    buttons={buttons}
                    selectableField="userGroupId"
                    selectedRows={selectedRows}
                    setSelectedRows={setSelectedRows}
                    loading={loading}
                    emptyMessage={
                        loading 
                        ? "Cargando grupos..." 
                        : "No hay grupos registrados."
                    }
                />
            </div>
            
            <DeleteConfirmationDialog
                open={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={handleSoftDeleteMassive} 
                item={itemToDelete} 
                itemsCount={selectedRows.length} 
                entityName="grupo de usuario" 
                itemNameKey="groupName" 
                actionType="eliminar lógicamente"
            />
        
        </div>
    );
});

export default UserGroupManagement;