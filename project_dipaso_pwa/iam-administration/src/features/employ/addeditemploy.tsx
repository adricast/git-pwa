// 📁 src/management/people/addeditEmploy.tsx

import React, { useCallback, useMemo } from "react";
// 🎯 Importamos los modelos complejos
import type { PersonModel } from "./../../models/api/personModel"; 
import type { AddressModel } from "../../models/api/addressModel"; // Corregida la ruta para addressModel
import type { DocumentModel } from "./../../models/api/documentModel";
// ✅ NUEVO: Importamos el modelo de detalles de empleado
import type { EmployeeDetailsModel } from "./../../models/api/employdetailsModel"; 


import { employFormSections } from "./employformconfig";
import DynamicForm from "./../../components/multisectiondinamicform/dynamicformProvider"; 
import type { DynamicButtonProps } from './../../components/multisectiondinamicform/interface'; 

import "./../../components/styles/multisectiondynamicform.sass"; 

// 💡 Tipo de datos PLANA del formulario
interface EmployFormData {
    // Campos de PersonModel (Nivel Superior)
    givenName: string;
    surName: string;
    phoneNumber?: string;
    genderId?: string;
    dateOfBirth?: string;
    
    // Campos de EmployeeDetailsModel (Nivel Superior Plano)
    employeeCode: string; // Campo crucial del sub-objeto 'employee'
    // El estado del empleado ('A') podría ser fijo o un select en el formconfig
    
    // Campos de DocumentModel (Simplificación)
    docTypeId: string;
    docNumber: string;
    
    // Campos de AddressModel (Simplificación)
    street: string;
    cityId: string;
    postalCode?: string;
}

/**
 * Formulario de creación / edición de Empleados (Persona con rol de Empleado).
 */
const AddEditEmployContent: React.FC<{
    employ: PersonModel | null; 
    // ✅ onSave recibe el objeto complejo/plano para el patch
    onSave: (employ: PersonModel | null, data: Partial<PersonModel> & EmployFormData) => Promise<void>;
    onClose: () => void;
}> = ({ employ, onSave, onClose }) => {
    
    // 1. Preparamos los datos iniciales para el formulario dinámico
    const initialData: Partial<EmployFormData> = useMemo(() => {
        if (!employ) {
            return { dateOfBirth: "", genderId: "", employeeCode: "" };
        }
        
        // --- 🟢 Mapeo de PersonModel a Formulario Plano (Edición) ---
        const baseData: Partial<EmployFormData> = {
            // Campos de Persona
            givenName: employ.givenName || "",
            surName: employ.surName || "",
            phoneNumber: employ.phoneNumber || "",
            dateOfBirth: employ.dateOfBirth ? employ.dateOfBirth.substring(0, 10) : "", 
            genderId: employ.genderId || "",
            
            // ✅ Mapeo de Detalle de Empleado
            employeeCode: employ.employee?.employeeCode || "", 
        };

        // Mapeo de Documento Principal (documents[0])
        if (employ.documents && employ.documents.length > 0) {
            const primaryDoc = employ.documents[0];
            baseData.docTypeId = primaryDoc.docTypeId;
            baseData.docNumber = primaryDoc.docNumber;
        }

        // Mapeo de Dirección Principal (addresses[0])
        if (employ.addresses && employ.addresses.length > 0) {
            const primaryAddress = employ.addresses[0];
            baseData.street = primaryAddress.street;
            baseData.cityId = primaryAddress.cityId;
            baseData.postalCode = primaryAddress.postalCode;
        }

        return baseData;
    }, [employ]);
    
    // 2. Definimos el handler onSubmit que será ejecutado por DynamicForm
    const handleDynamicSubmit = useCallback(async (data: Record<string, string | number | boolean>) => {
        const formData = data as unknown as EmployFormData;
        
        // 💡 Separamos los campos de Person/Document/Address de los campos de Employee
        const { employeeCode, docTypeId, docNumber, street, cityId, postalCode, ...personFields } = formData;
        
        // 💡 Lógica de mapeo para crear el PATCH de PersonModel
        const patchPayload: Partial<PersonModel> = {
            // 1. Campos de PersonModel (Nivel Superior)
            ...personFields, // givenName, surName, phoneNumber, etc.
            
            // ✅ 2. Sub-objeto Empleado (siempre se incluye, pero solo se envía si isEmployee=true)
            employee: {
                employeeId: employ?.employee?.employeeId || '00000000-0000-0000-0000-000000000000', 
                employeeCode: employeeCode,
                personId: employ?.personId || '00000000-0000-0000-0000-000000000000',
                isActive: true,
                employeeStatus: employ?.employee?.employeeStatus || 'A', // Estado por defecto 'A'
                // createdByUserId (este campo es de auditoría, mejor no enviarlo en el patch)
            } as EmployeeDetailsModel,
            
            // 3. Arrays anidados (Documents)
            documents: [{
                personDocumentId: employ?.documents?.[0]?.personDocumentId || '00000000-0000-0000-0000-000000000000', 
                docTypeId: docTypeId,
                docNumber: docNumber,
                personId: employ?.personId || '00000000-0000-0000-0000-000000000000',
                issuingCountry: 'ba79cc4d-756b-4c01-98a3-fcb9434a3dfc', 
                isActive: true,
            }] as DocumentModel[],
            
            // 4. Arrays anidados (Addresses)
            addresses: [{
                addressId: employ?.addresses?.[0]?.addressId || '00000000-0000-0000-0000-000000000000', 
                street: street,
                cityId: cityId,
                postalCode: postalCode,
                personId: employ?.personId || '00000000-0000-0000-0000-000000000000',
                stateId: '105fb4c5-0ae8-40e4-b315-2f6671b368ac', 
                countryId: 'ba79cc4d-756b-4c01-98a3-fcb9434a3dfc', 
                typeAddressId: '8f2b1d3c-5e4a-7b0f-9d6c-1e8a9f0b2c3d', 
                isActive: true,
            }] as AddressModel[],
        };
        
        // Ejecutamos la lógica de guardado
        await onSave(employ, patchPayload as Partial<PersonModel> & EmployFormData);
    }, [employ, onSave]);

    // 3. Definimos el botón "Cancelar"
    const formActions: DynamicButtonProps[] = useMemo(() => ([
        {
            label: 'Cancelar',
            color: '#6c757d', 
            textColor: '#fff',
            type: 'button',
            onClick: onClose,
        }
    ]), [onClose]);


    return (
        <div className="person-form-wrapper">
            
            <DynamicForm
                sections={employFormSections} 
                initialData={initialData}
                onSubmit={handleDynamicSubmit}
                buttonText={employ ? "Actualizar Empleado" : "Crear Empleado"}
                className="person-form" 
                actions={formActions} 
            />
        </div>
    );
};

// ✅ Exportamos el componente
export default AddEditEmployContent;