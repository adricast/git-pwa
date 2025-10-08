// 📁 UserManagement.tsx (VERSION MOCK PARA DESARROLLO DE USUARIOS)

import { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from "react";
// 🟢 Solo necesitamos el hook para interactuar con el contexto
import { useScreenContainer } from "../../components/screencontainer/usescreencontainer"; 

import { v4 as uuidv4 } from "uuid";
import { FaSyncAlt } from "react-icons/fa"; 

// 🔑 CAMBIO: Definición del modelo de usuario según el prompt
export interface User {
    userId?: string|number; 
    tempId?: string; 
    username: string;
    identification: string;
    email: string;
    isactive: boolean; // Cambiado a minúsculas para coincidir con la convención de tu modelo
    groupId?: string;
    users?: User[];
}

// ❌ COMENTAR: Eliminamos la importación del servicio real para usar mocks
// import { getActiveUsers, softDeleteUsersMassive, createUser, updateUser } from "../../services/userServices"; 

import DeleteConfirmationDialog from "../../components/layout/deletedialogLayout";
import AddEditUserContent from "./addedituser"; 
import ReusableTable from "../../components/layout/reusabletableLayout"; 

import "./../styles/generalLayout.scss"; 


// =========================================================================
// 🧪 MOCKS DE SERVICIO Y DATOS FICTICIOS PARA USUARIOS
// =========================================================================

// 🔑 CAMBIO: Datos iniciales ficticios para simular la tabla de USUARIOS con el nuevo modelo
let MOCK_USERS: User[] = [
    { userId: "u1", username: "juan.perez", identification: "10001", email: "juan.perez@corp.com", isactive: true, groupId: "g1" },
    { userId: "u2", username: "ana.lopez", identification: "10002", email: "ana.lopez@corp.com", isactive: true, groupId: "g2" },
    { userId: "u3", username: "carlos.ruiz", identification: "10003", email: "carlos.ruiz@corp.com", isactive: false, groupId: "g1" },
];

// Función utilitaria para simular la latencia de la red
const mockServiceDelay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));


// 🔑 REEMPLAZO: Simulamos getActiveUsers
const getActiveUsers = async (): Promise<User[]> => {
    await mockServiceDelay(800);
    console.log("🟢 [MOCK] Usuarios cargados ficticiamente.");
    // Devolvemos solo los activos
    return MOCK_USERS.filter(u => u.isactive);
};

// 🔑 REEMPLAZO: Simulamos softDeleteUsersMassive
const softDeleteUsersMassive = async (userIds: (string | number)[]): Promise<void> => {
    await mockServiceDelay(700);
    // Simular la eliminación lógica actualizando el array mock
    MOCK_USERS = MOCK_USERS.map(u => {
        // Si u.userId existe Y está en la lista de IDs a eliminar, actualizamos el estado.
        if (u.userId && userIds.includes(u.userId)) { 
            return { ...u, isactive: false };
        }
        return u;
    });
    console.log(`🟢 [MOCK] Eliminación lógica simulada para IDs de usuarios: ${userIds.join(", ")}`);
    return;
};

// 🔑 REEMPLAZO: Simulamos createUser
const createUser = async (userData: Omit<User, "userId" | "tempId">): Promise<User> => {
    await mockServiceDelay(600);
    const newUser: User = {
        ...userData,
        userId: uuidv4(), // Generar un ID nuevo simulado
    };
    // Añadir al array mock
    MOCK_USERS.push(newUser);
    console.log(`🟢 [MOCK] Usuario creado simulado: ${newUser.username}`);
    return newUser;
};

// 🔑 REEMPLAZO: Simulamos updateUser
const updateUser = async (user: User): Promise<User> => {
    await mockServiceDelay(600);
    
    // Actualizar el array mock
    MOCK_USERS = MOCK_USERS.map(u => u.userId === user.userId ? user : u);

    console.log(`🟢 [MOCK] Usuario actualizado simulado: ${user.username}`);
    return user;
};

// =========================================================================
// 💻 COMPONENTE UserManagement
// =========================================================================


export type UserManagementRef = {
    handleOpenUserModal: () => void;
    handleEditFromShortcut: () => void;
    handleDeleteFromShortcut: () => void;
};

const UserManagement = forwardRef<UserManagementRef>((_, ref) => {
    const { openScreen, closeTopScreen } = useScreenContainer();

    const [users, setUsers] = useState<User[]>([]);
    const [selectedRows, setSelectedRows] = useState<User[]>([]);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<User | null>(null);
    const [loading, setLoading] = useState(true); 

    const loadUsers = useCallback(async () => {
        setLoading(true);
        try {
            // 🔑 LLAMADA MOCK
            const dataFromService: User[] = await getActiveUsers(); 
            
            // La normalización solo asegura la existencia de campos clave
            const normalized: User[] = dataFromService.map(u => ({
                userId: u.userId ?? uuidv4(), 
                username: u.username,
                identification: u.identification,
                email: u.email,
                isactive: u.isactive ?? true, 
                groupId: u.groupId,
                // No incluimos 'tempId' o 'users' aquí a menos que se usen en la tabla
            }));
            
            setUsers(normalized);
            
        } catch (error) {
            console.error("🔴 Error al cargar usuarios activos (MOCK ERROR):", error);
            setUsers([]);
        } finally {
            setLoading(false);
            setSelectedRows([]);
        }
    }, []);

    useEffect(() => { loadUsers(); }, [loadUsers]);

    
    // 🟢 FUNCIÓN PRINCIPAL DE APERTURA
    const handleOpenUserScreen = (userToEdit: User | null = null) => {
        const title = userToEdit 
            ? `Editar Usuario: ${userToEdit.username}` 
            : "Crear Nuevo Usuario";
        
        const content = (
            <AddEditUserContent
                user={userToEdit} 
                onSave={handleSaveUser as any} 
                onClose={closeTopScreen} 
            />
        );
        
        openScreen(title, content); 
    };
    
    const handleOpenEditScreen = useCallback((user: User) => {
        handleOpenUserScreen(user);
    }, []);

    
    // 🔑 CAMBIO: handleSaveUser - debe reflejar los campos del nuevo modelo
    const handleSaveUser = async (user: User | null, username: string, identification: string, email: string) => {
        const isEditing = user && user.userId;
        
        try {
            if (isEditing) {
                // 🔑 CAMBIO: Actualizamos los campos específicos del modelo
                const updatedUser: User = { ...user, username, identification, email };
                
                await updateUser(updatedUser);

                setUsers(prev => prev.map(u => u.userId === updatedUser.userId ? updatedUser : u));
                
            } else {
                // 🔑 CAMBIO: Tipo de datos para crear un User (omitiendo IDs generados)
                const newUserData: Omit<User, "userId" | "tempId" | "users"> = { 
                    username,
                    identification,
                    email,
                    isactive: true, 
                    // groupId: undefined, // Si es opcional en la creación, se omite
                };
                
                const newUser: User = await createUser(newUserData);
                
                setUsers(prev => [...prev, newUser]);
            }
            
            closeTopScreen(); 
            loadUsers(); // Recargamos para refrescar la lista
        } catch (error) {
            console.error(isEditing ? "Error al actualizar el usuario (MOCK ERROR):" : "Error al crear el usuario (MOCK ERROR):", error);
        }
    };
    
    const handleSoftDeleteMassive = async () => {
        if (selectedRows.length === 0) return;
        
        try {
            const userIds: string[] = selectedRows
                .map(u => u.userId)
                // Usamos un Type Guard para filtrar los valores 'undefined' o 'null'.
                .filter((id): id is string => !!id); 
            
            await softDeleteUsersMassive(userIds); 
            
            loadUsers(); 
            
            setIsDeleteDialogOpen(false);
            setItemToDelete(null);
            setSelectedRows([]);

        } catch (error) {
            console.error("Error en la eliminación lógica masiva de usuarios (MOCK ERROR):", error);
        }
    };

    useImperativeHandle(ref, () => ({
        handleOpenUserModal: () => handleOpenUserScreen(), 
        handleEditFromShortcut: () => { 
            if (selectedRows.length === 1) handleOpenEditScreen(selectedRows[0] as User);
        },
        handleDeleteFromShortcut: () => {
            if (selectedRows.length > 0) {
                setItemToDelete(selectedRows[0] as User); 
                setIsDeleteDialogOpen(true);
            }
        },
    }));

    // 🔑 CAMBIO: DEFINICIÓN DE COLUMNAS PARA EL MODELO DE USUARIO ESPECIFICADO
    const columns = [
        { 
            field: "username", 
            header: "Nombre de Usuario",
            onCellClick: handleOpenEditScreen 
        },
        { field: "identification", header: "Identificación" },
        { field: "email", header: "Correo Electrónico" },
        // Puedes añadir más columnas según tu necesidad (ej. GroupId, Estado)
    ];

    const buttons = [
        // Botón de Refrescar
        {
            label: "",
            color: "btn-primary", // 🔑 Clase para el color de fondo
            textColor: "text-light",  // 🔑 Clase para el color del texto (oscuro
            // 🔑 USAMOS la nueva propiedad 'icon'
            icon: <FaSyncAlt className={loading ? "spin-icon" : ""} />, 
            onClick: () => loadUsers(), // Llama a la función de carga
            disabled: loading // Deshabilitado mientras está cargando
        },
        {
            label: "Agregar",
            color: "btn-primary", 
            textColor: "text-light",
            onClick: () => handleOpenUserScreen(), 
        },
        {
            label: "Editar",
            color: "btn-edit", 
            textColor: "text-light",
            onClick: (selectedRows?: User[]) => { 
                if (selectedRows && selectedRows.length === 1) {
                    handleOpenEditScreen(selectedRows[0]);
                }
            },
        },
        {
            label: "Eliminar",
            color: "btn-delete", 
            textColor: "text-light",
            onClick: (selectedRows?: User[]) => { 
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
                    // 🔑 CAMBIO: Nombre del módulo
                    moduleName="Usuarios"
                    data={users} 
                    rowKey="userId" // 🔑 CAMBIO: Clave de la fila
                    columns={columns}
                    buttons={buttons}
                    selectableField="userId" // 🔑 CAMBIO: Campo seleccionable
                    
                    selectedRows={selectedRows}
                    setSelectedRows={setSelectedRows}
                    loading={loading}
                    emptyMessage={
                        loading 
                        ? "Cargando usuarios..." 
                        : "No hay usuarios activos o falló la carga (MOCK)."
                    }
                />
            </div>
            
            <DeleteConfirmationDialog
                open={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={handleSoftDeleteMassive} 
                item={itemToDelete} 
                itemsCount={selectedRows.length} 
                // 🔑 CAMBIO: Nombre de la entidad y clave
                entityName="usuario" 
                itemNameKey="username" // Usamos el username para la descripción en el diálogo
                actionType="eliminar lógicamente"
            />
        
        </div>
    );
});

export default UserManagement;