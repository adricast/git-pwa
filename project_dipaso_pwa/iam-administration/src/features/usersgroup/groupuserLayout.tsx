// 📁 GroupManagement.tsx (FINAL CON PARAMETRIZACIÓN)

import { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from "react";
// 🟢 Solo necesitamos el hook para interactuar con el contexto
import { useScreenContainer } from "./../../components/screencontainer/usescreencontainer"; 

import type { Group } from "./../../models/api/groupModel";
// ❌ Eliminada la importación directa de services
// 🟢 NUEVO: Importamos la configuración parametrizada
import { groupServiceConfig } from "./groupserviceconfig"; 

import DeleteConfirmationDialog from "./../../components/layout/deletedialogLayout";
import AddEditGroupContent from "./addeditgroup";
import ReusableTable from "./../../components/layout/reusabletablefilterLayout"; 
import { v4 as uuidv4 } from "uuid";

import "./../styles/generalLayout.scss"; 
import { FaSyncAlt } from "react-icons/fa"; 
// 🟢 Desestructuramos las funciones del objeto de configuración
const { 
    getActiveGroups, 
    softDeleteGroupsMassive, 
    createGroup, 
    updateGroup 
} = groupServiceConfig; 


export type GroupManagementRef = {
    handleOpenGroupModal: () => void;
    handleEditFromShortcut: () => void;
    handleDeleteFromShortcut: () => void;
};

const GroupManagement = forwardRef<GroupManagementRef>((_, ref) => {
    // 🟢 CAMBIO CRÍTICO: Obtenemos openScreen y closeTopScreen
    const { openScreen, closeTopScreen } = useScreenContainer();

    const [groups, setGroups] = useState<Group[]>([]);
   
    const [selectedRows, setSelectedRows] = useState<Group[]>([]);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<Group | null>(null);
    const [loading, setLoading] = useState(true); 

    const loadGroups = useCallback(async () => {
        setLoading(true);
        try {
            const dataFromService: Group[] = await getActiveGroups(); 
            
            const normalized: Group[] = dataFromService.map(g => ({
                groupId: g.groupId ?? uuidv4(), 
                groupName: g.groupName,
                description: g.description ?? "",
                isActive: g.isActive ?? true, 
                lastModifiedAt: g.lastModifiedAt ?? new Date().toISOString(),
                users: g.users ?? [],
            }));
            
            setGroups(normalized);
            
        } catch (error) {
            console.error("🔴 Error al cargar grupos activos (falla HMAC/Descifrado):", error);
            setGroups([]);
        } finally {
            setLoading(false);
            setSelectedRows([]);
        
        }
    }, []);

    useEffect(() => { loadGroups(); }, [loadGroups]);

    
    // 🟢 FUNCIÓN PRINCIPAL DE APERTURA: Crea el contenido y llama a openScreen
    const handleOpenGroupScreen = (groupToEdit: Group | null = null) => {
        const title = groupToEdit 
            ? `Editar Grupo: ${groupToEdit.groupName}` 
            : "Crear Nuevo Grupo";
        
        // 🟢 Creamos el componente AddEditGroupContent de forma dinámica
        const content = (
            <AddEditGroupContent
                group={groupToEdit} 
                onSave={handleSaveGroup}
                // closeTopScreen cierra la instancia actual, ideal para la duplicidad
                onClose={closeTopScreen} 
            />
        );
        
        // 🟢 Abrimos la pantalla con el título Y el componente de contenido
        openScreen(title, content); 
    };
    
    const handleOpenEditScreen = useCallback((group: Group) => {
        handleOpenGroupScreen(group);
    }, []);

    
    const handleSaveGroup = async (group: Group | null, groupName: string, description: string) => {
        const isEditing = group && group.groupId;
        
        try {
            if (isEditing) {
                const updatedGroup: Group = { ...group, groupName, description };
                await updateGroup(updatedGroup);

                setGroups(prev => prev.map(g => g.groupId === updatedGroup.groupId ? updatedGroup : g));
                
            } else {
                // 🔑 TIPO DE DATO CORRECTO PARA LLAMAR AL SERVICIO
                const newGroupData: Omit<Group, "groupId"> = { 
                    groupName,
                    description,
                    users: [],
                    lastModifiedAt: new Date().toISOString(),
                    isActive: true, 
                };
                const newGroup: Group = await createGroup(newGroupData);
                setGroups(prev => [...prev, newGroup]);
            }
            
            closeTopScreen(); // 🟢 Cerrar la pantalla superior después de guardar
            loadGroups(); 
        } catch (error) {
            console.error(isEditing ? "Error al actualizar el grupo:" : "Error al crear el grupo:", error);
        }
    };
    
    const handleSoftDeleteMassive = async () => {
        if (selectedRows.length === 0) return;
        
        try {
            // 🔑 El ID puede ser string o number, el servicio lo acepta
            const groupIds: (string | number)[] = selectedRows.map(g => g.groupId);
            
            await softDeleteGroupsMassive(groupIds); 
            
            loadGroups(); 
            
            setIsDeleteDialogOpen(false);
            setItemToDelete(null);
            setSelectedRows([]);

        } catch (error) {
            console.error("Error en la eliminación lógica masiva de grupos:", error);
        }
    };

    // Lógica para atajos de teclado o acciones desde otros componentes
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
            // Llamar a handleOpenEditScreen al hacer click en la celda
            onCellClick: handleOpenEditScreen 
        },
        { field: "description", header: "Descripción" },
    ];

    const buttons = [
         {
            label: "",
            color: "btn-primary", // 🔑 Clase para el color de fondo
            textColor: "text-light",  // 🔑 Clase para el color del texto (oscuro
            // 🔑 USAMOS la nueva propiedad 'icon'
            icon: <FaSyncAlt className={loading ? "spin-icon" : ""} />, 
            onClick: () => loadGroups(), // Llama a la función de carga
            disabled: loading // Deshabilitado mientras está cargando
        },
        {
            label: "Agregar",
            color: "btn-primary", 
            textColor: "text-light",
            onClick: () => handleOpenGroupScreen(), // Abrir para Crear
        },
        {
            label: "Editar",
            color: "btn-edit", 
            textColor: "text-light",
            onClick: (selectedRows?: Group[]) => {
                if (selectedRows && selectedRows.length === 1) {
                    handleOpenEditScreen(selectedRows[0]);
                }
            },
            isVisible: (selectedRows: any[]) => selectedRows.length === 1,
        },
        {
            label: "Eliminar",
            color: "btn-delete", 
            textColor: "text-light",
            onClick: (selectedRows?: Group[]) => {
                if (!selectedRows || selectedRows.length === 0) return;
                setItemToDelete(selectedRows[0]); 
                setIsDeleteDialogOpen(true);
            },
        },
    ];
    

    return (
        <div className="layout-container"> 
            <div className="table-wrapper-container"> 
                <ReusableTable
                    moduleName="Grupos"
                    data={groups}
                    rowKey="groupId"
                    columns={columns}
                    buttons={buttons}
                    selectableField="groupId"
                   
                    selectedRows={selectedRows}
                    setSelectedRows={setSelectedRows}
                    loading={loading}
                    emptyMessage={
                        loading 
                        ? "Cargando grupos..." 
                        : "No hay grupos activos o falló la carga."
                    }
                />
            </div>
            
            {/* ❌ CRÍTICO: El ScreenContainerLayout y su contenido NO se renderizan aquí.
                El Layout ahora se encarga de renderizar el contenido dinámico del stack 
                (incluyendo AddEditGroupContent) en un componente de nivel superior (ej. la página principal o AdminPage).
            */}
                
            <DeleteConfirmationDialog
                open={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={handleSoftDeleteMassive} 
                item={itemToDelete} 
                itemsCount={selectedRows.length} 
                entityName="grupo" 
                itemNameKey="groupName" 
                actionType="eliminar lógicamente"
            />
        
        </div>
    );
});

export default GroupManagement;