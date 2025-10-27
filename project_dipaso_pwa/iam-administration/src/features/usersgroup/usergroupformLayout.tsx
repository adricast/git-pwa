// 📁 src/management/usergroups/usergroupLayout.tsx 

import { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from "react";
import { useScreenContainer, ReusableTableFilterLayout } from '@dipaso/design-system';
import { FaSyncAlt } from "react-icons/fa"; 
import DeleteConfirmationDialog from "@dipaso/design-system/dist/components/layout/deletedialogLayout";

import UserGroupFormWrapper from "./usergroupformwrapper";

// 🛑 CORRECCIÓN CRÍTICA: Eliminamos la interfaz local y la reemplazamos con la importación 
// de la fuente de verdad.
import type { UserGroupModel } from "../../models/api/userGroupModel"; 

// 💡 NOTA: Asumimos que el modelo real tiene 'description' e 'integrationCode' como opcionales
// o que la importación ahora los hace compatibles. Si el modelo real no está disponible,
// usamos una definición MOCK compatible, pero la mejor práctica es la importación.

const MOCK_USER_ID = "abe3af10-5663-4bd7-902d-b67bf5d1f2f4"; 

// Datos MOCK iniciales (Ajustados para compatibilidad con el modelo real, 
// usando el "!" si el modelo real hace el campo obligatorio, o "as UserGroupModel"
// para forzar el tipo si el MOCK lo requiere).
const MOCK_USER_GROUPS: UserGroupModel[] = [
    {
        userGroupId: "9c4e35b1-5e2f-4e4f-89ab-efc6b8902a79",
        groupName: "Gerentes",
        description: "Grupo de Gerentes", // Asumimos que el modelo real soporta string
        integrationCode: "122",
        criticality: "HIGH",
        isActive: true,
        createdByUserId: MOCK_USER_ID
    } as UserGroupModel, // Forzamos el tipo MOCK a ser el UserGroupModel importado
    {
        userGroupId: "a5d7f9c2-b1e4-4d2a-8c7e-2f3b4a5c6d7e",
        groupName: "Soporte Técnico",
        description: "Personal de mesa de ayuda",
        integrationCode: "331",
        criticality: "MEDIUM",
        isActive: true,
        createdByUserId: MOCK_USER_ID
    } as UserGroupModel,
];

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

    // Función para "recargar" la tabla con datos MOCK
    const loadGroups = useCallback(async () => {
        setLoading(true);
        // Simulamos una llamada API con un delay
        await new Promise(resolve => setTimeout(resolve, 500)); 
        try {
            setGroups(MOCK_USER_GROUPS.filter(g => g.isActive)); 
        } catch (error) {
            console.error("Error al cargar grupos (MOCK):", error);
            setGroups([]);
        } finally {
            setLoading(false);
            setSelectedRows([]);
        }
    }, []);

    useEffect(() => { loadGroups(); }, [loadGroups]);

    
    // Abre el formulario (no requiere llamada a getPersonById, ya que el payload es simple)
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
    
    // Función de edición directa (simulada)
    const handleOpenEditScreen = useCallback((group: UserGroupModel) => {
        handleOpenGroupScreen(group);
    }, [handleOpenGroupScreen]);


    // 🟢 Maneja tanto la creación como la actualización (MOCK)
    // 🛑 Corrección final de tipado: El segundo argumento es 'any' para compatibilidad con la prop 'onSave'
    const handleSaveGroup = async (
        group: UserGroupModel | null, 
        groupPatchRaw: any 
    ) => {
        const groupPatch = groupPatchRaw as Partial<UserGroupModel>; 
        const isEditing = group && group.userGroupId;
        
        try {
            if (isEditing) {
                // 1. ACTUALIZAR (MOCK)
                console.log("MOCK: Actualizando Grupo", group!.userGroupId, groupPatch);
                const updatedGroup = { ...group!, ...groupPatch } as UserGroupModel; // Forzar el cast para manejar el MOCK
                setGroups(prev => prev.map(g => g.userGroupId === updatedGroup.userGroupId ? updatedGroup : g));
                
            } else {
                // 2. CREAR (MOCK)
                const newGroupId = `new-${Math.random().toString(36).substring(2, 9)}`;
                const newGroup: UserGroupModel = {
                    userGroupId: newGroupId,
                    createdByUserId: MOCK_USER_ID,
                    isActive: true, // Asumimos activo por defecto en la creación
                    ...groupPatch,
                } as UserGroupModel; // Forzar el cast

                console.log("MOCK: Creando Nuevo Grupo", newGroup);
                setGroups(prev => [...prev, newGroup]);
            }
            
            closeTopScreen(); 
            loadGroups(); 

        } catch (error) {
            console.error("🛑 ERROR DE GUARDADO DETECTADO (MOCK).", error);
        }
    };
    
    // Simula la eliminación lógica masiva
    const handleSoftDeleteMassive = async () => {
        if (selectedRows.length === 0) return;
        
        try {
            console.log("MOCK: Eliminando lógicamente IDs:", selectedRows.map(g => g.userGroupId));
            // MOCK: Filtra los eliminados
            setGroups(prev => prev.filter(g => !selectedRows.some(s => s.userGroupId === g.userGroupId)));
            
            loadGroups(); 
            
            setIsDeleteDialogOpen(false);
            setItemToDelete(null);
            setSelectedRows([]);

        } catch (error) {
            console.error("Error en la eliminación lógica masiva (MOCK):", error);
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

    // DEFINICIÓN DE COLUMNAS 
    const columns = [
        { 
            field: "groupName", 
            header: "Nombre del Grupo",
            onCellClick: handleOpenEditScreen // Esto desencadena la edición MOCK
        },
        { field: "criticality", header: "Criticidad" },
        { field: "integrationCode", header: "Cód. Integración" },
        { field: "description", header: "Descripción" }, 
        { field: "isActive", header: "Activo", bodyTemplate: (g: UserGroupModel) => (g.isActive ? "Sí" : "No") }, 
    ];

    // Botones
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
                        : "No hay grupos registrados o falló la carga (MOCK)."
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
                actionType="eliminar lógicamente (MOCK)"
            />
        
        </div>
    );
});

export default UserGroupManagement;