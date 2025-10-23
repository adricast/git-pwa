// 📁 src/management/people/addeditemploy.tsx

import React, { useCallback, useMemo } from "react";
// 🎯 Importamos los modelos complejos
import type { PersonModel } from "./../../models/api/personModel"; 
import type { AddressModel } from "../../models/api/addressModel"; 
import type { DocumentModel } from "./../../models/api/documentModel";
import type { EmployeeDetailsModel } from "./../../models/api/employdetailsModel"; 

// ✅ Ahora:
import { DynamicFormProviderSections } from '@dipaso/design-system';
// Use the FormSection type from the same path as DynamicFormProviderSections expects:
import type { DynamicButtonProps } from '@dipaso/design-system';
import type { FormSection } from '@dipaso/design-system/dist/components/multisectiondinamicform/interface';
import { employFormSections } from "./employformconfig";

// 💡 Tipo de datos PLANA del formulario (CORREGIDO)
interface EmployFormData {
    // ... (Campos de PersonModel y EmployeeDetailsModel)
    givenName: string;
    surName: string;
    phoneNumber?: string;
    genderId?: string;
    dateOfBirth?: string;
    employeeCode: string; 
    documents: DocumentModel[]; 
    
    // ✅ CORRECCIÓN DE TIPO: Estos campos son planos en la data del formulario,
    // pero deben ser tratados como si existieran en el AddressModel subyacente para el mapeo.
    street: string;
    cityId: string;
    postalCode?: string;
    countryId: string; // <-- CRÍTICO
    provinceId: string; // <-- CRÍTICO
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
        
        // ❌ ELIMINADA 'const defaultAddressId' para evitar error ts(6133).
        const primaryAddress = employ?.addresses?.[0]; // Dirección principal, si existe

        // --- 🟢 BASE DE DATOS INICIAL (Edición y Creación) ---
        const baseData: Partial<EmployFormData> = {
            // Campos de Persona
            givenName: employ?.givenName || "",
            surName: employ?.surName || "",
            phoneNumber: employ?.phoneNumber || "",
            dateOfBirth: employ?.dateOfBirth ? employ.dateOfBirth.substring(0, 10) : "", 
            genderId: employ?.genderId || "",
            
            // Detalle de Empleado
            employeeCode: employ?.employee?.employeeCode || "", 
            
            // 🛑 Documentos
            documents: employ?.documents || [],
            
            // ✅ DIRECCIÓN (Inicialización de Campos Individuales)
            // Se usa el encadenamiento opcional para la seguridad del objeto
            street: primaryAddress?.street || "",
            cityId: primaryAddress?.cityId || "",
            postalCode: primaryAddress?.postalCode || "",
            // ✅ ASUMIMOS que estos campos existen en el objeto AddressModel (primaryAddress)
            countryId: (primaryAddress as AddressModel)?.countryId || "", 
            provinceId: (primaryAddress as AddressModel)?.stateId || "", 
        };

        return baseData;
    }, [employ]);
    
    // 2. Definimos el handler onSubmit que será ejecutado por DynamicForm
    const handleDynamicSubmit = useCallback(async (data: Record<string, any>) => {
        const formData = data as unknown as EmployFormData;
        
        // 💡 Separamos los campos de dirección y employeeCode de PersonModel
        const { employeeCode, documents, street, cityId, postalCode, countryId, provinceId, ...personFields } = formData;
        
        // Usamos valores por defecto si no existen
        const personId = employ?.personId || '00000000-0000-0000-0000-000000000000'; 
        const defaultAddressId = employ?.addresses?.[0]?.addressId || '00000000-0000-0000-0000-000000000000';

        const patchPayload: Partial<PersonModel> = {
            // 1. Campos de PersonModel (Nivel Superior)
            ...personFields, 
            
            // ✅ 2. Sub-objeto Empleado
            employee: {
                employeeId: employ?.employee?.employeeId || '00000000-0000-0000-0000-000000000000', 
                employeeCode: employeeCode,
                personId: personId,
                isActive: true,
                employeeStatus: employ?.employee?.employeeStatus || 'A',
            } as EmployeeDetailsModel,
            
            // 🛑 3. Arrays anidados (Documents): Mapeo de la Tabla
            documents: documents.map((doc, index) => {
                const existingDocumentId = employ?.documents?.[index]?.personDocumentId || '00000000-0000-0000-0000-000000000000';
                
                return {
                    ...doc,
                    personDocumentId: existingDocumentId,
                    personId: personId, 
                    // Asegura que los campos de selección se pasen
                    issuingCountry: (doc as DocumentModel).issuingCountry || 'ba79cc4d-756b-4c01-98a3-fcb9434a3dfc', 
                    isActive: (doc as DocumentModel).isActive ?? true,
                }
            }) as DocumentModel[],
            
            // 4. Arrays anidados (Addresses)
            addresses: [{
                addressId: defaultAddressId, 
                street: street,
                cityId: cityId,
                postalCode: postalCode,
                countryId: countryId,   // ✅ Usamos el valor del formulario
                stateId: provinceId, // ✅ Usamos el valor del formulario
                
                // Valores Fijos/Backend
                personId: personId,
              
                typeAddressId: '8f2b1d3c-5e4a-4d45-98f1-a160240bdecd', // ID de tipo de dirección (mock)
                isActive: true,
            }] as AddressModel[],
        };
        
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
            
            <DynamicFormProviderSections
                sections={employFormSections as FormSection[]} 
                initialData={initialData}
                onSubmit={handleDynamicSubmit}
                buttonText={employ ? "Actualizar Empleado" : "Crear Empleado"}
                className="person-form" 
                actions={formActions} 
            />
        </div>
    );
};

export default AddEditEmployContent;