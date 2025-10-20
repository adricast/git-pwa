// 📁 src/management/people/addeditemploy.tsx

import React, { useCallback, useMemo } from "react";
// 🎯 Importamos los modelos complejos
import type { PersonModel } from "./../../models/api/personModel"; 
import type { AddressModel } from "../../models/api/addressModel"; 
import type { DocumentModel } from "./../../models/api/documentModel";
// ✅ NUEVO: Importamos el modelo de detalles de empleado
import type { EmployeeDetailsModel } from "./../../models/api/employdetailsModel"; 


import { employFormSections } from "./employformconfig";
//import DynamicForm from "./../../components/multisectiondinamicform/dynamicformProvider"; 
//import type { DynamicButtonProps } from './../../components/multisectiondinamicform/interface'; 

import "./../../components/styles/multisectiondynamicform.sass"; 

import { 

  DynamicFormProviderSections as DynamicForm, 
  type DynamicButtonProps
} from '@dipaso/design-system';

// 💡 Tipo de datos PLANA del formulario
interface EmployFormData {
    // Campos de PersonModel (Nivel Superior)
    givenName: string;
    surName: string;
    phoneNumber?: string;
    genderId?: string;
    dateOfBirth?: string;
    
    // Campos de EmployeeDetailsModel (Nivel Superior Plano)
    employeeCode: string; 
    
    // 🛑 CAMPO DE TABLA: Ahora es un array de objetos (DocumentModel)
    documents: DocumentModel[]; 
    
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
    onSave: (employ: PersonModel | null, data: Partial<PersonModel> & EmployFormData) => Promise<void>;
    onClose: () => void;
}> = ({ employ, onSave, onClose }) => {
    
    // 1. Preparamos los datos iniciales para el formulario dinámico
    const initialData: Partial<EmployFormData> = useMemo(() => {
        if (!employ) {
            return { dateOfBirth: "", genderId: "", employeeCode: "", documents: [] };
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
            
            // 🛑 Mapeo de Documentos (Pasamos el array completo)
            // Esto prepara el array de documentos existente para ser editable en la tabla.
            documents: employ.documents || [],
        };

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
    const handleDynamicSubmit = useCallback(async (data: Record<string, any>) => {
        const formData = data as unknown as EmployFormData;
        
        // 💡 Separamos los campos de Person/Document/Address de los campos de Employee
        const { employeeCode, documents, street, cityId, postalCode, ...personFields } = formData;
        
        // 💡 Lógica de mapeo para crear el PATCH de PersonModel
        const patchPayload: Partial<PersonModel> = {
            // 1. Campos de PersonModel (Nivel Superior)
            ...personFields, 
            
            // ✅ 2. Sub-objeto Empleado
            employee: {
                employeeId: employ?.employee?.employeeId || '00000000-0000-0000-0000-000000000000', 
                employeeCode: employeeCode,
                personId: employ?.personId || '00000000-0000-0000-0000-000000000000',
                isActive: true,
                employeeStatus: employ?.employee?.employeeStatus || 'A',
            } as EmployeeDetailsModel,
            
            // 🛑 3. Arrays anidados (Documents): CORRECCIÓN DEL MAPEO PARA EVITAR LA SOBRESCRITURA
            documents: documents.map((doc, index) => {
                
                // 1. Obtener el ID existente del documento original, si aplica.
                const existingDocumentId = employ?.documents?.[index]?.personDocumentId || '00000000-0000-0000-0000-000000000000';
                
                // 2. Mapear la data de la tabla, asegurando que los IDs y valores fijos se apliquen al final.
                return {
                    // Cargar todos los campos editables desde la tabla (docTypeId, docNumber, etc.)
                    ...doc,
                    
                    // Sobrescribir/Asegurar las claves de estructura al final:
                    personDocumentId: existingDocumentId, // Usamos el ID recuperado/por defecto
                    personId: employ?.personId || '00000000-0000-0000-0000-000000000000', 
                    // Asegurar valores por defecto/fijos que podrían no estar en la tabla
                    issuingCountry: (doc as DocumentModel).issuingCountry || 'ba79cc4d-756b-4c01-98a3-fcb9434a3dfc', 
                    isActive: (doc as DocumentModel).isActive ?? true,
                }
            }) as DocumentModel[],
            
            // 4. Arrays anidados (Addresses) - Se mantiene simplificado a 1
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