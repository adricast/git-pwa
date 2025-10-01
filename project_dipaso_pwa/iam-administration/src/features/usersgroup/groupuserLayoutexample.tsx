import { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from "react";
// Importamos getActiveGroups y softDeleteGroupsMassive
import type { Group } from "../../models/api/groupModel";
// Importaciones del servicio (asumiendo que las rutas están correctas)
import { getActiveGroups, softDeleteGroupsMassive, createGroup, updateGroup } from "../../services/groupuserServices"; 

import DeleteConfirmationDialog from "../../components/layout/deletedialogLayout";
import DialogoReutilizable from "../../components/layout/dialogLayout"; 
import AddEditGroupContent from "./addeditgroup";
import ReusableTable from "../../components/layout/reusabletableLayout"; 
import { v4 as uuidv4 } from "uuid";
// 🔑 Importaciones para la gestión de fichas
import { FaUsers } from 'react-icons/fa'; 
import { useCardManager } from '../../components/cardcontainer2/usercardmanager'; 

import "./../styles/groupuserLayout.scss"; 


export type GroupManagementRef = {
    handleOpenGroupModal: () => void;
    handleEditFromShortcut: () => void;
    handleDeleteFromShortcut: () => void;
};

const GroupManagement = forwardRef<GroupManagementRef>((_, ref) => {
    const [groups, setGroups] = useState<Group[]>([]);
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
    const [selectedRows, setSelectedRows] = useState<Group[]>([]);
    const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false); 
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<Group | null>(null);
    const [loading, setLoading] = useState(true); // 🎯 Estado de carga para mostrar al usuario

    const { addCard, isCardOpen, updateCard, removeCard } = useCardManager(); 

    // 🎯 1. CORRECCIÓN CLAVE: Implementar try...catch para capturar errores de cifrado/HMAC
    const loadGroups = useCallback(async () => {
        setLoading(true);
        try {
            // Llama a getActiveGroups(), que ahora incluye descifrado y verificación HMAC
            const dataFromService: Group[] = await getActiveGroups(); 
            
            // Si la respuesta del servicio es [Group, Group, ...]
            const normalized: Group[] = dataFromService.map(g => ({
                // Asegúrate de usar group.groupId del servicio, que es 'user_group_id' mapeado
                groupId: g.groupId ?? uuidv4(), 
                groupName: g.groupName,
                description: g.description ?? "",
                // Asegúrate de que los campos opcionales estén presentes si son necesarios:
                isActive: g.isActive ?? true, 
                lastModifiedAt: g.lastModifiedAt ?? new Date().toISOString(),
                users: g.users ?? [],
            }));
            
            setGroups(normalized);
            
        } catch (error) {
            // ¡ESTE ES EL ERROR QUE PROBABLEMENTE ESTÁS IGNORANDO!
            console.error("🔴 Error al cargar grupos activos (falla HMAC/Descifrado):", error);
            // Podrías mostrar un toast o mensaje de error al usuario aquí
            setGroups([]); // Asegura que la tabla no se intente renderizar con datos rotos
        } finally {
            setLoading(false);
            setSelectedRows([]);
            setSelectedGroup(null); 
        }
    }, []);

    useEffect(() => { loadGroups(); }, [loadGroups]);

    // ... (El resto de funciones y lógica del componente se mantiene igual)

    const handleOpenGroupDialog = () => {
        setSelectedGroup(null);
        setIsGroupDialogOpen(true);
    };
    
    const handleOpenEditCard = useCallback((group: Group) => {
        const editCardId = `group-edit-${group.groupId}`; 
        
        const cardTitle = (
            <><FaUsers style={{ marginRight: '8px' }} /> Editar Grupo: {group.groupName}</>
        );

        const onCloseEdit = () => {
            if (removeCard) {
                removeCard(editCardId);
            }
        };

        const cardContent = (
            <AddEditGroupContent
                group={group} 
                onSave={handleSaveGroup}
                onClose={onCloseEdit}
            />
        );

        if (isCardOpen(editCardId)) {
            updateCard(editCardId, cardTitle, cardContent);
        } else {
            addCard(cardTitle, cardContent, editCardId);
        }

    }, [addCard, isCardOpen, updateCard, removeCard]);

    
    const handleSaveGroup = async (group: Group | null, groupName: string, description: string) => {
        const isEditing = group && group.groupId;
        
        try {
            if (isEditing) {
                const updatedGroup: Group = { ...group, groupName, description };
                await updateGroup(updatedGroup);

                setGroups(prev => prev.map(g => g.groupId === updatedGroup.groupId ? updatedGroup : g));
                
                const editCardId = `group-edit-${updatedGroup.groupId}`;
                if (removeCard) {
                    removeCard(editCardId);
                }
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
                setIsGroupDialogOpen(false);
            }
            
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

    useImperativeHandle(ref, () => ({
        handleOpenGroupModal: () => handleOpenGroupDialog(),
        handleEditFromShortcut: () => { 
            if (selectedRows.length === 1) handleOpenEditCard(selectedRows[0]);
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
            onCellClick: handleOpenEditCard 
        },
        { field: "description", header: "Descripción" },
    ];

    const buttons = [
        {
            label: "Agregar",
            color: "btn-primary", 
            textColor: "text-light",
            onClick: () => handleOpenGroupDialog(),
        },
        {
            label: "Editar",
            color: "btn-edit", 
            textColor: "text-light",
            onClick: (selectedRows?: Group[]) => {
                if (selectedRows && selectedRows.length === 1) {
                    handleOpenEditCard(selectedRows[0]);
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
                    loading={loading} // 🎯 Mostrar estado de carga
                    emptyMessage={
                        loading 
                        ? "Cargando grupos..." 
                        : "No hay grupos activos o falló la carga."
                    }
                />
            </div>
        
        {/* DIÁLOGO REUTILIZABLE: SOLO PARA CREACIÓN */}
        <DialogoReutilizable
            isOpen={isGroupDialogOpen && selectedGroup === null} 
            onClose={() => setIsGroupDialogOpen(false)}
            titulo={"Crear Nuevo Grupo"} 
            >
            <AddEditGroupContent
                group={null}
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