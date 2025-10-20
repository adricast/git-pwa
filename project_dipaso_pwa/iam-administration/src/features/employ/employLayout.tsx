
import { useScreenContainer } from "@dipaso/design-system";
import DeleteConfirmationDialog from "@dipaso/design-system/dist/components/layout/deletedialogLayout";
import ReusableTable from "@dipaso/design-system/dist/components/layout/reusabletableLayout";

import { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from "react";

import type { Person } from "../../models/api/personModel";
import { personServiceConfig } from "./employserviceconfig"; 

import AddEditPersonContent from "./addeditemploy"; 
import { FaSyncAlt } from "react-icons/fa"; 

import "./../styles/generalLayout.sass"; 


// 🔑 ID DE USUARIO MOCKEADO: En una aplicación real, esto se obtendría
// de un hook o contexto de autenticación (ej. const { userId } = useAuth();)
const MOCK_USER_ID = "00000000-0000-0000-0000-000000000001"; 

// 🎯 TIPO DE PAYLOAD LOCAL: Elimina los campos generados por el servidor
type PersonCreatePayload = Omit<
    Person, 
    'personId' | 'createdAt' | 'updatedAt' | 'createdByUserId' | 'updatedByUserId'
>;


// 🟢 Desestructuramos las funciones del objeto de configuración de personas
const { 
    getActivePeople, 
    softDeletePeopleMassive, 
    createPerson, 
    updatePerson 
} = personServiceConfig; 


export type PeopleManagementRef = { // ✅ Tipo de Referencia actualizado
    handleOpenPersonModal: () => void;
    handleEditFromShortcut: () => void;
    handleDeleteFromShortcut: () => void;
};

const PeopleManagement = forwardRef<PeopleManagementRef>((_, ref) => { // ✅ Nombre del componente actualizado
    const { openScreen, closeTopScreen } = useScreenContainer();

    const [people, setPeople] = useState<Person[]>([]); // ✅ Estado cambiado a Person[]
    const [selectedRows, setSelectedRows] = useState<Person[]>([]);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<Person | null>(null); // ✅ Tipo cambiado a Person
    const [loading, setLoading] = useState(true); 

    const loadPeople = useCallback(async () => {
        setLoading(true);
        try {
            const dataFromService: Person[] = await getActivePeople(); 
            
            // ⭐ 1. LOG DE DATOS (Muestra lo que se recibió con éxito)
            console.log("🟢 Datos de la API descifrados:", dataFromService);
            
            // La normalización dependerá de cómo tu backend devuelva Person, 
            // aquí asumimos que ya viene listo, pero mantenemos el mapeo básico
            const normalized: Person[] = dataFromService.map(p => ({
                ...p,
                personId: p.personId,
                givenName: p.givenName,
                surName: p.surName,
                isActive: p.isActive, 
            }));
            
            setPeople(normalized); // ✅ Seteamos el estado de personas
            
        } catch (error) {
            // ⭐ 2. LOG DE ERROR DETALLADO (Muestra el objeto de error completo)
            console.error("🔴 Error completo al cargar personas:", error);
            
            setPeople([]);
        } finally {
            setLoading(false);
            setSelectedRows([]);
        }
    }, []);

    useEffect(() => { loadPeople(); }, [loadPeople]);

    
    // 🟢 FUNCIÓN PRINCIPAL DE APERTURA: Usa la interfaz Person
    const handleOpenPersonScreen = (personToEdit: Person | null = null) => {
        const title = personToEdit 
            ? `Editar Persona: ${personToEdit.givenName} ${personToEdit.surName}` // ✅ Título con campos de persona
            : "Crear Nueva Persona";
        
        const content = (
            <AddEditPersonContent // ✅ Componente de formulario de persona
                person={personToEdit} 
                onSave={handleSavePerson}
                onClose={closeTopScreen} 
            />
        );
        
        openScreen(title, content); 
    };
    
    const handleOpenEditScreen = useCallback((person: Person) => {
        handleOpenPersonScreen(person);
    }, []);

    // 🟢 Maneja tanto la creación como la actualización
    const handleSavePerson = async (person: Person | null, personPatch: Partial<Person>) => {
        const isEditing = person && person.personId;
        
        try {
            if (isEditing) {
                // 1. ACTUALIZAR
                const updatedPerson: Person = await updatePerson(
                    person.personId, 
                    MOCK_USER_ID, // 🔑 ID de usuario para el Header 'X-Updater-User-Id'
                    personPatch
                );

                setPeople(prev => prev.map(p => p.personId === updatedPerson.personId ? updatedPerson : p));
                
            } else {
                // 2. CREAR
                const newPersonData: PersonCreatePayload = { 
                    // 1. Incluye todos los campos de texto y booleano que vienen del formulario
                    // 🔑 CORRECCIÓN: Se utiliza la aserción en el spread para que TypeScript
                    // reconozca 'givenName', 'surName', etc., como presentes.
                    ...(personPatch as PersonCreatePayload), 
                    
                    // 2. Sobrescribe/Asegura valores por defecto para campos no nulos si no vienen del formulario
                    // Estos valores tienen prioridad sobre lo que venga en el spread si es null/undefined
                    isCustomer: personPatch.isCustomer ?? false,
                    isSupplier: personPatch.isSupplier ?? false,
                    isEmployee: personPatch.isEmployee ?? false,
                    isActive: personPatch.isActive ?? true, 
                };

                const newPerson: Person = await createPerson(
                    newPersonData, 
                    MOCK_USER_ID 
                );
                setPeople(prev => [...prev, newPerson]);
            }
            
            closeTopScreen(); 
            loadPeople(); 
        } catch (error) {
            console.error(isEditing ? "Error al actualizar la persona:" : "Error al crear la persona:", error);
        }
    };
    
    const handleSoftDeleteMassive = async () => {
        if (selectedRows.length === 0) return;
        
        try {
            // 🔑 El ID de persona es string
            const personIds: string[] = selectedRows.map(p => p.personId);
            
            await softDeletePeopleMassive(personIds, MOCK_USER_ID); // 🔑 Enviamos el ID del usuario
            
            loadPeople(); 
            
            setIsDeleteDialogOpen(false);
            setItemToDelete(null);
            setSelectedRows([]);

        } catch (error) {
            console.error("Error en la eliminación lógica masiva de personas:", error);
        }
    };

    // Lógica para atajos de teclado o acciones desde otros componentes
    useImperativeHandle(ref, () => ({
        handleOpenPersonModal: () => handleOpenPersonScreen(), // ✅ Función renombrada
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

    // DEFINICIÓN DE COLUMNAS (Ajustadas a campos de Persona)
    const columns = [
        { 
            field: "givenName", 
            header: "Nombre",
            onCellClick: handleOpenEditScreen // Abre la edición al hacer clic en el nombre
        },
        { field: "surName", header: "Apellido" },
        { field: "phoneNumber", header: "Teléfono" },
        { field: "isEmployee", header: "Es Empleado", bodyTemplate: (p: Person) => (p.isEmployee ? "Sí" : "No") }, // Ejemplo de bodyTemplate
        { field: "isCustomer", header: "Es Cliente", bodyTemplate: (p: Person) => (p.isCustomer ? "Sí" : "No") }, // Ejemplo de bodyTemplate
        { field: "isSuplier", header: "Es Proveedor", bodyTemplate: (p: Person) => (p.isSupplier ? "Sí" : "No") }, // Ejemplo de bodyTemplate

    ];

    const buttons = [
        {
            label: "",
            color: "btn-primary", 
            textColor: "text-light", 
            icon: <FaSyncAlt className={loading ? "spin-icon" : ""} />, 
            onClick: () => loadPeople(), // Llama a la función de carga
            disabled: loading 
        },
        {
            label: "Agregar",
            color: "btn-primary", 
            textColor: "text-light",
            onClick: () => handleOpenPersonScreen(), // Abrir para Crear
        },
        {
            label: "Editar",
            color: "btn-edit", 
            textColor: "text-light",
            onClick: (selectedRows?: Person[]) => {
                if (selectedRows && selectedRows.length === 1) {
                    handleOpenEditScreen(selectedRows[0]);
                }
            },
            isVisible: (selectedRows: Person[]) => selectedRows.length === 1,
        },
        {
            label: "Eliminar",
            color: "btn-delete", 
            textColor: "text-light",
            onClick: (selectedRows?: Person[]) => {
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
                    moduleName="Personas" // ✅ Módulo renombrado
                    data={people} // ✅ Datos de personas
                    rowKey="personId" // ✅ Clave de fila
                    columns={columns}
                    buttons={buttons}
                    selectableField="personId"
                    
                    selectedRows={selectedRows}
                    setSelectedRows={setSelectedRows}
                    loading={loading}
                    emptyMessage={
                        loading 
                        ? "Cargando personas..." // ✅ Mensaje actualizado
                        : "No hay personas registradas o falló la carga."
                    }
                />
            </div>
            
            <DeleteConfirmationDialog
                open={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={handleSoftDeleteMassive} 
                item={itemToDelete} // ✅ Objeto de tipo Person
                itemsCount={selectedRows.length} 
                entityName="persona" // ✅ Entidad renombrada
                itemNameKey="givenName" // ✅ Usamos el nombre de la persona
                actionType="eliminar lógicamente"
            />
        
        </div>
    );
});

export default PeopleManagement;