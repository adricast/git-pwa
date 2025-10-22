// 📁 EmployManagement.tsx 

import { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from "react";

import { useScreenContainer, ReusableTableFilterLayout } from '@dipaso/design-system';
// 🎯 IMPORTACIONES DE MODELOS: Usamos el modelo principal para la gestión
import type { PersonModel } from "../../models/api/personModel"; 
// Se ha eliminado el AddressModel importado para limpiar
import type { DocumentModel } from "../../models/api/documentModel";

// Importamos la configuración de servicios, incluyendo los tipos de payload.
import { 
    personServiceConfig, 
    type PersonCreationPayload, // Importamos el tipo de payload correcto desde la config
    type PersonUpdatePayload
} from "./employserviceconfig"; 

import DeleteConfirmationDialog from "./../../components/layout/deletedialogLayout";
import EmployFormWrapper from "./employformwrapper"; // 🚨 Importamos el Wrapper

import { FaSyncAlt } from "react-icons/fa"; 

import "./../styles/generalLayout.sass"; 


const MOCK_USER_ID = "00000000-0000-0000-0000-000000000001"; 

// 💡 TIPO DE DATOS DEL FORMULARIO (Definición completa para desestructuración)
interface EmployFormData { 
    givenName: string; 
    surName: string; 
    phoneNumber?: string; 
    genderId?: string; 
    dateOfBirth?: string;
    
    // Estructuras complejas
    documents: DocumentModel[]; 
    
    // Campos planos de dirección (Necesarios para la desestructuración en handleSavePerson)
    street: string; 
    cityId: string; 
    postalCode?: string;
    countryId?: string;
    provinceId?: string;
}


const { 
    getActivePeople, 
    softDeletePeopleMassive, 
    createPerson, 
    updatePerson 
} = personServiceConfig; 


// ✅ Referencia renombrada a EmployManagementRef
export type EmployManagementRef = { 
    handleOpenPersonModal: () => void;
    handleEditFromShortcut: () => void;
    handleDeleteFromShortcut: () => void;
};

// ✅ Componente renombrado a EmployManagement
const EmployManagement = forwardRef<EmployManagementRef>((_, ref) => { 
    const { openScreen, closeTopScreen } = useScreenContainer();

    // ✅ Estados usando PersonModel
    const [people, setPeople] = useState<PersonModel[]>([]); 
    const [selectedRows, setSelectedRows] = useState<PersonModel[]>([]);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<PersonModel | null>(null); 
    const [loading, setLoading] = useState(true); 

    const loadPeople = useCallback(async () => {
        setLoading(true);
        try {
            // ✅ Usa el servicio configurado para obtener datos de la API real
            const dataFromService: PersonModel[] = await getActivePeople(); 
            
            console.log("🟢 Datos de la API descifrados:", dataFromService);
            
            setPeople(dataFromService); 
            
        } catch (error) {
            console.error("🔴 Error completo al cargar empleados:", error);
            setPeople([]);
        } finally {
            setLoading(false);
            setSelectedRows([]);
        }
    }, []);

    useEffect(() => { loadPeople(); }, [loadPeople]);

    
    // ✅ Usa PersonModel
    const handleOpenPersonScreen = (personToEdit: PersonModel | null = null) => {
        const title = personToEdit 
            ? `Editar Empleado: ${personToEdit.givenName} ${personToEdit.surName}` 
            : "Crear Nuevo Empleado";
        
        // 🚨 Renderiza el wrapper del formulario
        const content = (
            <EmployFormWrapper 
                employ={personToEdit} 
                onSave={handleSavePerson} 
                onClose={closeTopScreen} 
            />
        );
        
        openScreen(title, content); 
    };
    
    // ✅ Usa PersonModel
    const handleOpenEditScreen = useCallback((person: PersonModel) => {
        handleOpenPersonScreen(person);
    }, []);

    // 🟢 Maneja tanto la creación como la actualización
    const handleSavePerson = async (
        person: PersonModel | null, 
        personPatch: Partial<PersonModel> & EmployFormData
    ) => {
        const isEditing = person && person.personId;
        
        // 💡 CAMBIO CLAVE: Desestructuramos para excluir los campos planos de dirección.
        // El resto (employee, documents, addresses) es el payload estructurado.
        const { 
            street, cityId, postalCode, countryId, provinceId,
            ...personPayloadToSend 
        } = personPatch;
        
        // El payload ya contiene los arrays 'addresses', 'documents', y el sub-objeto 'employee'.
        const finalPayload = personPayloadToSend as unknown as PersonUpdatePayload;

        try {
            if (isEditing) {
                // 1. ACTUALIZAR: Enviamos el payload listo a la API
                const updatedPerson: PersonModel = await updatePerson(
                    person.personId, 
                    MOCK_USER_ID, 
                    finalPayload
                );

                setPeople(prev => prev.map(p => p.personId === updatedPerson.personId ? updatedPerson : p));
                
            } else {
                // 2. CREAR: Añadimos campos de auditoría y roles.
                
                const newPersonData: PersonCreationPayload = { 
                    // Usa el payload ya estructurado por el formulario
                    ...(finalPayload as PersonCreationPayload), 
                    
                    // Asignación de ROLES y metadatos por defecto
                    isCustomer: true, 
                    isSupplier: false, 
                    isEmployee: true, 
                    isActive: true, 
                    createdByUserId: MOCK_USER_ID, 
                    
                    // 🛑 YA NO SE REQUIERE RECONSTRUCCIÓN MANUAL DE ARRAYS
                };


                const newPerson: PersonModel = await createPerson(
                    newPersonData, 
                    MOCK_USER_ID 
                );
                setPeople(prev => [...prev, newPerson]);
            }
            
            closeTopScreen(); 
            loadPeople(); 
        } catch (error) {
            console.error(isEditing ? "Error al actualizar el empleado:" : "Error al crear el empleado:", error);
        }
    };
    
    const handleSoftDeleteMassive = async () => {
        if (selectedRows.length === 0) return;
        
        try {
            // ✅ IDs usando PersonModel
            const personIds: string[] = selectedRows.map(p => p.personId);
            
            await softDeletePeopleMassive(personIds, MOCK_USER_ID); 
            
            loadPeople(); 
            
            setIsDeleteDialogOpen(false);
            setItemToDelete(null);
            setSelectedRows([]);

        } catch (error) {
            console.error("Error en la eliminación lógica masiva de empleados:", error);
        }
    };

    // ✅ usa EmployManagementRef
    useImperativeHandle(ref, () => ({
        handleOpenPersonModal: () => handleOpenPersonScreen(), 
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

    // DEFINICIÓN DE COLUMNAS (Sin cambios)
    const columns = [
        { 
            field: "givenName", 
            header: "Nombre",
            onCellClick: handleOpenEditScreen 
        },
        { field: "surName", header: "Apellido" },
        { field: "phoneNumber", header: "Teléfono" },
        // ✅ Aseguramos que bodyTemplate usa PersonModel
        { field: "isEmployee", header: "Es Empleado", bodyTemplate: (p: PersonModel) => (p.isEmployee ? "Sí" : "No") }, 
        { field: "isCustomer", header: "Es Cliente", bodyTemplate: (p: PersonModel) => (p.isCustomer ? "Sí" : "No") }, 
        { field: "isSupplier", header: "Es Proveedor", bodyTemplate: (p: PersonModel) => (p.isSupplier ? "Sí" : "No") }, 
    ];

    // Botones (Sin cambios)
    const buttons = [
        {
            label: "",
            color: "btn-primary", 
            textColor: "text-light", 
            icon: <FaSyncAlt className={loading ? "spin-icon" : ""} />, 
            onClick: () => loadPeople(), 
            disabled: loading 
        },
        {
            label: "Agregar Empleado", 
            color: "btn-primary", 
            textColor: "text-light",
            onClick: () => handleOpenPersonScreen(), 
        },
        {
            label: "Editar",
            color: "btn-edit", 
            textColor: "text-light",
            onClick: (selectedRows?: PersonModel[]) => {
                if (selectedRows && selectedRows.length === 1) {
                    handleOpenEditScreen(selectedRows[0]);
                }
            },
            isVisible: (selectedRows: PersonModel[]) => selectedRows.length === 1,
        },
        {
            label: "Eliminar",
            color: "btn-delete", 
            textColor: "text-light",
            onClick: (selectedRows?: PersonModel[]) => {
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
                    moduleName="Gestión de Empleados" 
                    data={people} 
                    rowKey="personId" 
                    columns={columns}
                    buttons={buttons}
                    selectableField="personId"
                    selectedRows={selectedRows}
                    setSelectedRows={setSelectedRows}
                    loading={loading}
                    emptyMessage={
                        loading 
                        ? "Cargando empleados..." 
                        : "No hay empleados registrados o falló la carga."
                    }
                />
            </div>
            
            <DeleteConfirmationDialog
                open={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={handleSoftDeleteMassive} 
                item={itemToDelete} 
                itemsCount={selectedRows.length} 
                entityName="empleado" 
                itemNameKey="givenName" 
                actionType="eliminar lógicamente"
            />
        
        </div>
    );
});

export default EmployManagement;