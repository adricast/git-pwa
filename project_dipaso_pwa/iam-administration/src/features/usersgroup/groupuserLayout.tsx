import { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from "react";
//import { useNavigate } from "react-router-dom";
import type { Group } from "./../../models/api/groupModel";
import { getGroups, createGroup, updateGroup, deleteGroup } from "./../../services/groupuserServices";

import DeleteConfirmationDialog from "./deleteconfirmationdialog";
import DialogoReutilizable from "./../../components/layout/dialogLayout"; 
import AddEditGroupContent from "./addeditgroup";
import ReusableTable from "./../../components/layout/reusabletableLayout"; 
import { v4 as uuidv4 } from "uuid";
// 🔑 Importaciones para la gestión de fichas
import { FaUsers } from 'react-icons/fa'; 
import { useCardManager } from './../../components/cardcontainer2/usercardmanager'; 

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
    // Este estado solo controla el modal para CREACIÓN (ver uso abajo)
    const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false); 
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<Group | null>(null);

    //const navigate = useNavigate();
    // 🔑 Hook del gestor de fichas
    const { addCard, isCardOpen, updateCard, removeCard } = useCardManager(); 

    const loadGroups = useCallback(async () => {
        const dataFromService = await getGroups();
        const normalized: Group[] = dataFromService.map(g => ({
            groupId: g.groupId ?? uuidv4(),
            groupName: g.groupName,
            description: g.description ?? "",
            lastModifiedAt: g.lastModifiedAt ?? new Date().toISOString(),
            users: g.users ?? [],
        }));
        setGroups(normalized);
        setSelectedRows([]);
        setSelectedGroup(null); 
    }, []);

    useEffect(() => { loadGroups(); }, [loadGroups]);

    // Función para abrir el modal (solo se usa para CREACIÓN)
    const handleOpenGroupDialog = () => {
        setSelectedGroup(null); // Asegura modo creación
        setIsGroupDialogOpen(true);
    };
    
    // 🔑 FUNCIÓN CLAVE: Abre o actualiza una ficha para EDITAR un grupo
    const handleOpenEditCard = useCallback((group: Group) => {
        const editCardId = `group-edit-${group.groupId}`; 
        
        const cardTitle = (
            <><FaUsers style={{ marginRight: '8px' }} /> Editar Grupo: {group.groupName}</>
        );

        // Función de cierre para la ficha
        const onCloseEdit = () => {
            if (removeCard) {
                removeCard(editCardId);
            }
        };

        const cardContent = (
            <AddEditGroupContent
                group={group} 
                onSave={handleSaveGroup} // Llama a la función de guardado con el objeto 'group'
                onClose={onCloseEdit} // Pasa la función de cierre de ficha
            />
        );

        // Si la ficha ya existe, la actualiza. Si no, la añade.
        if (isCardOpen(editCardId)) {
            updateCard(editCardId, cardTitle, cardContent);
        } else {
            addCard(cardTitle, cardContent, editCardId);
        }

    }, [addCard, isCardOpen, updateCard, removeCard]);

    
    // 🔑 FUNCIÓN CORREGIDA: Recibe group | null, groupName, description.
    const handleSaveGroup = async (group: Group | null, groupName: string, description: string) => {
        const isEditing = group && group.groupId;
        
        try {
            if (isEditing) {
                // Modo Edición (Ficha)
                const updatedGroup: Group = { ...group, groupName, description };
                await updateGroup(updatedGroup);

                // 1. Actualiza el estado local
                setGroups(prev => prev.map(g => g.groupId === updatedGroup.groupId ? updatedGroup : g));
                
                // 2. Cierra la ficha de edición
                const editCardId = `group-edit-${updatedGroup.groupId}`;
                if (removeCard) {
                    removeCard(editCardId);
                }
            } else {
                // Modo Creación (Modal) - group es null
                const newGroupData: Omit<Group, "groupId"> = {
                    groupName,
                    description,
                    lastModifiedAt: new Date().toISOString(),
                    users: [],
                };
                const newGroup: Group = await createGroup(newGroupData);
                setGroups(prev => [...prev, newGroup]);
                setIsGroupDialogOpen(false); // Cierra el modal de CREACIÓN
            }
            
            loadGroups(); // Recargar datos para reflejar cambios en la tabla
        } catch (error) {
            console.error(isEditing ? "Error al actualizar el grupo:" : "Error al crear el grupo:", error);
        }
    };
    
    const handleDeleteGroup = async () => {
        if (!itemToDelete || !itemToDelete.groupId) return;
        await deleteGroup(itemToDelete.groupId);
        setGroups(prev => prev.filter(g => g.groupId !== itemToDelete.groupId));
        setItemToDelete(null);
        setSelectedRows([]);
        setSelectedGroup(null);
        setIsDeleteDialogOpen(false);
    };

    useImperativeHandle(ref, () => ({
        handleOpenGroupModal: () => handleOpenGroupDialog(), // Abre modal de creación
        handleEditFromShortcut: () => { 
            // Si el usuario usa el botón 'Editar' o un shortcut de teclado
            if (selectedRows.length === 1) handleOpenEditCard(selectedRows[0]);
        },
        handleDeleteFromShortcut: () => {
            if (selectedRows.length === 1) {
                setItemToDelete(selectedRows[0]);
                setIsDeleteDialogOpen(true);
            }
        },
    }));

    // 🔑 DEFINICIÓN DE COLUMNAS CON EL CLICK HANDLER
    const columns = [
        { 
            field: "groupName", 
            header: "Nombre del Grupo",
            // Asocia el click de la celda a la función que abre la FICHA de edición
            onCellClick: handleOpenEditCard 
        },
        { field: "description", header: "Descripción" },
    ];

    const buttons = [
        {
            label: "Agregar",
            color: "btn-primary", 
            textColor: "text-light",
            onClick: () => handleOpenGroupDialog(), // Abre el modal de creación
        },
        {
            // El botón "Editar" ahora abrirá la ficha de edición al hacer clic.
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
          { 
          /*
            <button
                className="back-btn" 
                onClick={() => navigate(-1)} 
            >
                ← Volver
            </button>
          */
          } 
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
                />
            </div>
        
        {/* DIÁLOGO REUTILIZABLE: SOLO PARA CREACIÓN (selectedGroup es null) */}
        <DialogoReutilizable
            isOpen={isGroupDialogOpen && selectedGroup === null} 
            onClose={() => setIsGroupDialogOpen(false)}
            titulo={"Crear Nuevo Grupo"} 
            >
            <AddEditGroupContent
                group={null} // Fuerza el modo Creación. onSave recibirá 'null'.
                onSave={handleSaveGroup}
                onClose={() => setIsGroupDialogOpen(false)} // Cierra el modal
            />
        </DialogoReutilizable>
            
            <DeleteConfirmationDialog
                open={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={handleDeleteGroup}
                item={itemToDelete}
            />
        </div>
    );
});

export default GroupManagement;