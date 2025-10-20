// 📁 EmployManagement.tsx (Anteriormente PeopleManagement.tsx)

import { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from "react";
//import { useScreenContainer } from "../../components/screencontainer/usescreencontainer"; 
// import ReusableTable from "./../../components/layout/reusabletablefilterLayout"; 
import { 

 useScreenContainer,
 ReusableTableFilterLayout

} from '@dipaso/design-system';

//import ReusableTable from "./../../components/layout/reusabletablefilterLayout"; 
// 🎯 IMPORTACIONES DE MODELOS: Usamos el modelo principal para la gestión
import type { PersonModel } from "../../models/api/personModel"; 
import type { AddressModel } from "../../models/api/addressModel";
import type { DocumentModel } from "../../models/api/documentModel";

// Importamos la configuración de servicios
import { personServiceConfig } from "./employserviceconfig"; 

import DeleteConfirmationDialog from "./../../components/layout/deletedialogLayout";
// 🚨 CORRECCIÓN DE IMPORTACIÓN: Reemplazamos AddEditPersonContent por el Wrapper
// import AddEditPersonContent from "./addeditemploy"; 
import EmployFormWrapper from "./employformwrapper"; // 🚨 Importamos el Wrapper

import { FaSyncAlt } from "react-icons/fa"; 

import "./../styles/generalLayout.sass"; 


const MOCK_USER_ID = "00000000-0000-0000-0000-000000000001"; 

// 🎯 TIPO DE PAYLOAD DE CREACIÓN DE PERSONA: Excluye IDs y campos de auditoría generados por el backend.
type PersonCreatePayload = Omit<
    PersonModel, 
    'personId' | 'createdAt' | 'updatedAt' | 'createdByUserId' | 'updatedByUserId'
>;

// 💡 TIPO DE DATOS DEL FORMULARIO (ACTUALIZADO para reflejar la tabla 'documents')
interface EmployFormData { // Usamos el nombre EmployFormData para coincidir con addeditemploy.tsx
    givenName: string; 
    surName: string; 
    phoneNumber?: string; 
    genderId?: string; 
    dateOfBirth?: string;
    
    // 🛑 CAMBIO CLAVE: Usa el array documents[] de la tabla dinámica
    documents: DocumentModel[]; 
    
    // Campos de dirección
    street: string; 
    cityId: string; 
    postalCode?: string;
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
            // ✅ Esperamos PersonModel[] del servicio
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
        
        const content = (
            // 🚨 CAMBIO CLAVE: Renderizamos el Wrapper que maneja la carga y la mutación
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
        person: PersonModel | null, // 🚨 ESTA ES LA VARIABLE CORRECTA
        // 🛑 USAMOS EL NUEVO TIPO EmployFormData
        personPatch: Partial<PersonModel> & EmployFormData
    ) => {
        const isEditing = person && person.personId;
        
        // 💡 EXTRAEMOS CAMPOS DEL ARRAY DOCUMENTS[]
        // 🛑 Desestructuramos el array documents directamente (el cual contiene docTypeId y docNumber internamente)
        const { documents, street, cityId, postalCode, ...personFields } = personPatch;

        try {
            if (isEditing) {
                // 1. ACTUALIZAR 
                const updatedPerson: PersonModel = await updatePerson(
                    person.personId, 
                    MOCK_USER_ID, 
                    personPatch
                );

                setPeople(prev => prev.map(p => p.personId === updatedPerson.personId ? updatedPerson : p));
                
            } else {
                // 2. CREAR
                
                // Aplicamos los ROLES POR DEFECTO aquí (isEmployee: true, isCustomer: true, isSupplier: false)
                const newPersonData: PersonCreatePayload = { 
                    ...(personFields as PersonCreatePayload), 
                    
                    // Asignación de ROLES por defecto
                    isCustomer: true, 
                    isSupplier: false, 
                    isEmployee: true, 
                    isActive: true, 
                    createdByUserId: MOCK_USER_ID, // Añadir el ID de creación
                    
                    // 🛑 CONSTRUCCIÓN DE ESTRUCTURAS ANIDADAS: Usamos el array documents[] completo
                    documents: documents.map(doc => ({
                        ...doc,
                        // El issuingCountry ahora viene del select del formulario.
                        // Si no lo seleccionó (y el campo no era requerido), lo dejamos como está o vacío.
                        issuingCountry: (doc as DocumentModel).issuingCountry || '', 
                    })) as DocumentModel[], 
                    
                    addresses: [{
                        // ✅ CORRECCIÓN: Usamos 'person' en lugar de 'employ'
                        addressId: person?.addresses?.[0]?.addressId || '00000000-0000-0000-0000-000000000000', 
                        street: street,
                        cityId: cityId,
                        postalCode: postalCode,
                        personId: person?.personId || '00000000-0000-0000-0000-000000000000',
                        stateId: '105fb4c5-0ae8-40e4-b315-2f6671b368ac', 
                        countryId: 'ba79cc4d-756b-4c01-98a3-fcb9434a3dfc', 
                        typeAddressId: '8f2b1d3c-5e4a-7b0f-9d6c-1e8a9f0b2c3d', 
                        isActive: true,
                    }] as AddressModel[],
                } as PersonCreatePayload;


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

    // DEFINICIÓN DE COLUMNAS (Aseguramos el tipo PersonModel)
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
            label: "Agregar Empleado", // ✅ Etiqueta más específica
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
                    moduleName="Gestión de Empleados" // ✅ Módulo renombrado
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
                entityName="empleado" // ✅ Entidad renombrada
                itemNameKey="givenName" 
                actionType="eliminar lógicamente"
            />
        
        </div>
    );
});

export default EmployManagement;