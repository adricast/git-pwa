// groupuserLayout.tsx (CORREGIDO)

import { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from "react";
// Importamos getActiveGroups y softDeleteGroupsMassive
import type { Group } from "../../models/api/groupModel";
// Importaciones del servicio (asumiendo que las rutas están correctas)
import { getActiveGroups, softDeleteGroupsMassive, createGroup, updateGroup } from "../../services/groupuserServices"; 

import DeleteConfirmationDialog from "../layout/deletedialogLayout";
import DialogoReutilizable from "../layout/dialogLayout"; 
import AddEditGroupContent from "../../features/usersgroup/addeditgroup";
import ReusableTable from "../layout/reusabletableLayout"; 
import { v4 as uuidv4 } from "uuid";
// ❌ ELIMINADA: Importaciones para la gestión de fichas (FaUsers, useCardManager)
// import { FaUsers } from 'react-icons/fa'; 
// import { useCardManager } from './../../components/cardcontainer2/usercardmanager'; 

import "./../styles/groupuserLayout.scss"; 


export type GroupManagementRef = {
    handleOpenGroupModal: () => void;
    handleEditFromShortcut: () => void;
    handleDeleteFromShortcut: () => void;
};

// 🎯 CAMBIO 1: Eliminado el hook useCardManager
const GroupManagement = forwardRef<GroupManagementRef>((_, ref) => {
    const [groups, setGroups] = useState<Group[]>([]);
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
    const [selectedRows, setSelectedRows] = useState<Group[]>([]);
    const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false); 
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<Group | null>(null);
    const [loading, setLoading] = useState(true); 

    // ❌ ELIMINADA: Desestructuración de useCardManager
    // const { addCard, isCardOpen, updateCard, removeCard } = useCardManager(); 

    // 🎯 1. Implementar try...catch para capturar errores de cifrado/HMAC
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
            setSelectedGroup(null); 
        }
    }, []);

    useEffect(() => { loadGroups(); }, [loadGroups]);

    // 🎯 CAMBIO 2: Lógica de Apertura del Diálogo (Usado para CREAR)
    const handleOpenGroupDialog = (groupToEdit: Group | null = null) => {
        setSelectedGroup(groupToEdit); // Si es null, es creación; si no, es edición.
        setIsGroupDialogOpen(true);
    };
    
    // 🎯 CAMBIO 3: Función de Apertura para EDITAR (llama a handleOpenGroupDialog con datos)
    const handleOpenEditDialog = useCallback((group: Group) => {
        handleOpenGroupDialog(group);
    }, []);

    
    const handleSaveGroup = async (group: Group | null, groupName: string, description: string) => {
        const isEditing = group && group.groupId;
        
        try {
            if (isEditing) {
                const updatedGroup: Group = { ...group, groupName, description };
                await updateGroup(updatedGroup);

                setGroups(prev => prev.map(g => g.groupId === updatedGroup.groupId ? updatedGroup : g));
                
                // ❌ ELIMINADO: Lógica de cerrar la Card de edición
                // const editCardId = `group-edit-${updatedGroup.groupId}`;
                // if (removeCard) {
                //     removeCard(editCardId);
                // }
                
            } else {
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
            
            setIsGroupDialogOpen(false); // 🎯 Cerramos el diálogo después de guardar
            loadGroups(); 
        } catch (error) {
            console.error(isEditing ? "Error al actualizar el grupo:" : "Error al crear el grupo:", error);
        }
    };
    
    // 🎯 2. Función para la ELIMINACIÓN LÓGICA MASIVA (Soft Delete)
    const handleSoftDeleteMassive = async () => {
        if (selectedRows.length === 0) return;
        
        try {
            const groupIds = selectedRows.map(g => g.groupId);
            
            await softDeleteGroupsMassive(groupIds); 
            
            loadGroups(); 
            
            setIsDeleteDialogOpen(false);
            setItemToDelete(null);
            setSelectedRows([]);

        } catch (error) {
            console.error("Error en la eliminación lógica masiva de grupos:", error);
        }
    };

    // 🎯 CAMBIO 4: Actualizar useImperativeHandle para usar Diálogo de Edición
    useImperativeHandle(ref, () => ({
        handleOpenGroupModal: () => handleOpenGroupDialog(), // Abrir para Crear
        handleEditFromShortcut: () => { 
            if (selectedRows.length === 1) handleOpenEditDialog(selectedRows[0]);
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
            // 🎯 CAMBIO 5: Llamar a handleOpenEditDialog al hacer click en la celda
            onCellClick: handleOpenEditDialog 
        },
        { field: "description", header: "Descripción" },
    ];

    const buttons = [
        {
            label: "Agregar",
            color: "btn-primary", 
            textColor: "text-light",
            onClick: () => handleOpenGroupDialog(), // Abrir para Crear (selectedGroup es null)
        },
        {
            label: "Editar",
            color: "btn-edit", 
            textColor: "text-light",
            onClick: (selectedRows?: Group[]) => {
                if (selectedRows && selectedRows.length === 1) {
                    handleOpenEditDialog(selectedRows[0]); // 🎯 Llamar a handleOpenEditDialog
                }
            },
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
                    onRowSelect={(row) => setSelectedGroup(row)} 
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
        
        {/* DIÁLOGO REUTILIZABLE: Usado tanto para CREAR como para EDITAR */}
        <DialogoReutilizable
            // 🎯 CAMBIO 6: Abrir si isGroupDialogOpen es true
            isOpen={isGroupDialogOpen} 
            onClose={() => setIsGroupDialogOpen(false)}
            // 🎯 CAMBIO 7: Título dinámico
            titulo={selectedGroup ? `Editar Grupo: ${selectedGroup.groupName}` : "Crear Nuevo Grupo"} 
            >
            <AddEditGroupContent
                // 🎯 CAMBIO 8: Pasar el grupo seleccionado para edición
                group={selectedGroup}
                onSave={handleSaveGroup}
                onClose={() => setIsGroupDialogOpen(false)}
            />
        </DialogoReutilizable>
            
        {/* DIÁLOGO DE CONFIRMACIÓN DE ELIMINACIÓN */}
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