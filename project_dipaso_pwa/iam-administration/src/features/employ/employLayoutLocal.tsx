// 📁 EmployManagement.tsx 

import { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from "react";

import { useScreenContainer, ReusableTableFilterLayout } from '@dipaso/design-system';
// IMPORTACIONES DE MODELOS
import type { PersonModel } from "../../models/api/personModel"; 
import type { DocumentModel } from "../../models/api/documentModel";

// Importamos la configuración de servicios, incluyendo los tipos de payload y la consulta por ID.
import { 
    personServiceConfig, 
    type PersonCreationPayload, 
    type PersonUpdatePayload
} from "./employserviceconfig"; 

import EmployFormWrapper from "./employformwrapper"; // Importamos el Wrapper

import { FaSyncAlt } from "react-icons/fa"; 
import '@dipaso/design-system/dist/styles/index.css';

import "./../styles/generalLayout.sass"; 
import DeleteConfirmationDialog from "@dipaso/design-system/dist/components/layout/deletedialogLayout";


const MOCK_USER_ID = "00000000-0000-0000-0000-000000000001"; 

// TIPO DE DATOS DEL FORMULARIO (Definición completa para desestructuración)
interface EmployFormData { 
    givenName: string; 
    surName: string; 
    phoneNumber?: string; 
    genderId?: string; 
    dateOfBirth?: string;
    
    // Estructuras complejas
    documents: DocumentModel[]; 
    
    // Campos planos de dirección (Necesarios para la desestructuración)
    street: string; 
    cityId: string; 
    postalCode?: string;
    countryId?: string;
    provinceId?: string;

    // Campos de estado de empleado para la lógica de edición
    employeeCode?: string;
    employeeStatus?: string;
    employExists?: boolean;
}


const { 
    getActivePeople, 
    softDeletePeopleMassive, 
    createPerson, 
    updatePerson,
    // 🛑 CRÍTICO: Importar la función de detalle por ID
    getPersonById 
} = personServiceConfig; 


// Referencia renombrada a EmployManagementRef
export type EmployManagementRef = { 
    handleOpenPersonModal: () => void;
    handleEditFromShortcut: () => void;
    handleDeleteFromShortcut: () => void;
};

// Componente renombrado a EmployManagement
const EmployManagement = forwardRef<EmployManagementRef>((_, ref) => { 
    const { openScreen, closeTopScreen } = useScreenContainer();

    // Estados
    const [people, setPeople] = useState<PersonModel[]>([]); 
    const [selectedRows, setSelectedRows] = useState<PersonModel[]>([]);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<PersonModel | null>(null); 
    const [loading, setLoading] = useState(true); 

    // Función para recargar la tabla
    const loadPeople = useCallback(async () => {
        setLoading(true);
        try {
            const dataFromService: PersonModel[] = await getActivePeople(); 
            setPeople(dataFromService); 
        } catch (error) {
            console.error("Error completo al cargar empleados:", error);
            setPeople([]);
        } finally {
            setLoading(false);
            setSelectedRows([]);
        }
    }, []);

    useEffect(() => { loadPeople(); }, [loadPeople]);

    
    // Función que abre el formulario (usa los detalles completos)
    const handleOpenPersonScreen = (personToEdit: PersonModel | null = null) => {
        const title = personToEdit 
            ? `Editar Empleado: ${personToEdit.givenName} ${personToEdit.surName}` 
            : "Crear Nuevo Empleado";
        
        const content = (
            <EmployFormWrapper 
                employ={personToEdit} // Recibe los detalles COMPLETOs
                onSave={handleSavePerson} 
                onClose={closeTopScreen} 
            />
        );
        
        openScreen(title, content); 
    };
    
    // 🛑 FUNCIÓN MODIFICADA: Llama a la API para cargar detalles completos
    const handleOpenEditScreen = useCallback(async (person: PersonModel) => {
        setLoading(true); 
        try {
            // 1. Consulta el detalle completo por el ID de la persona
            const fullPersonDetails: PersonModel = await getPersonById(person.personId); 
            
            // 2. Abre el formulario con el objeto detallado
            handleOpenPersonScreen(fullPersonDetails);
            
        } catch (error) {
            console.error("Error al cargar los detalles completos del empleado para edición:", error);
        } finally {
            setLoading(false); 
        }
    }, [handleOpenPersonScreen]);


    // 🟢 Maneja tanto la creación como la actualización
   const handleSavePerson = async (
    person: PersonModel | null, 
    personPatch: Partial<PersonModel> & EmployFormData
) => {
    const isEditing = person && person.personId;
    
    // Desestructuramos para excluir los campos planos que NO son parte de PersonModel
    const { 
        street, cityId, postalCode, countryId, provinceId,
        employeeStatus, employeeCode, employExists, // Excluir campos planos
        ...personPayloadToSend 
    } = personPatch;
    
    const finalPayload = personPayloadToSend as unknown as PersonUpdatePayload;

    try {
        let resultPerson: PersonModel;

        if (isEditing) {
            // 1. ACTUALIZAR
            resultPerson = await updatePerson(
                person!.personId, 
                MOCK_USER_ID, 
                finalPayload
            );
            // 🛑 CORRECCIÓN DE TIPO: Usamos as PersonModel[]
            setPeople(prev => prev.map(p => p.personId === resultPerson.personId ? resultPerson : p) as PersonModel[]);
        } else {
            // 2. CREAR
            const newPersonData: PersonCreationPayload = { 
                ...(finalPayload as PersonCreationPayload), 
                isCustomer: true, 
                isSupplier: false, 
                isEmployee: true, 
                isActive: true, 
                createdByUserId: MOCK_USER_ID, 
            };
            resultPerson = await createPerson(newPersonData, MOCK_USER_ID);
            setPeople(prev => [...prev, resultPerson]);
        }
        
        // 🚀 PASO CRÍTICO DE ÉXITO: Solo si la operación de API fue exitosa
        closeTopScreen(); 
        loadPeople(); 

    } catch (error) {
        // 🚨 Si se llega aquí, el formulario NO se cerrará.
        console.error("🛑 ERROR DE GUARDADO DETECTADO. El formulario permanece abierto.", error);
    }
};
    
    const handleSoftDeleteMassive = async () => {
        if (selectedRows.length === 0) return;
        
        try {
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

    // DEFINICIÓN DE COLUMNAS 
    const columns = [
        { 
            field: "givenName", 
            header: "Nombre",
            onCellClick: handleOpenEditScreen // Esto desencadena la carga de detalles
        },
        { field: "surName", header: "Apellido" },
        { field: "phoneNumber", header: "Teléfono" },
        { field: "isEmployee", header: "Es Empleado", bodyTemplate: (p: PersonModel) => (p.isEmployee ? "Sí" : "No") }, 
        { field: "isCustomer", header: "Es Cliente", bodyTemplate: (p: PersonModel) => (p.isCustomer ? "Sí" : "No") }, 
        { field: "isSupplier", header: "Es Proveedor", bodyTemplate: (p: PersonModel) => (p.isSupplier ? "Sí" : "No") }, 
    ];

    // Botones
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