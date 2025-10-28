// src/management/people/addeditemploy.tsx

import React, { useCallback, useMemo } from "react";
// Importamos los modelos complejos
import type { PersonModel } from "../../models/api/personModel"; 
import type { AddressModel } from "../../models/api/addressModel"; 
import type { DocumentModel } from "../../models/api/documentModel";
import type { EmployeeModel } from "../../models/api/employeeModel"; 

// 🛑 CRÍTICO: Importar la función para generar UUIDs
import { v4 as uuidv4 } from 'uuid'; 

// Ahora:
import { DynamicFormProviderSections } from '@dipaso/design-system';
import type { DynamicButtonProps } from '@dipaso/design-system';
import type { FormSection } from '@dipaso/design-system/dist/components/multisectiondinamicform/interface';
import { employFormSections } from "./employformconfig";

// Tipo de datos PLANA del formulario
interface EmployFormData {
        givenName: string;
        surName: string;
        phoneNumber?: string;
        genderId?: string;
        dateOfBirth?: string;
        employeeCode: string; 
        documents: DocumentModel[]; 

        street: string;
        cityId: string;
        postalCode?: string;
        countryId: string; 
        provinceId: string; 
        typeAddressId: string; // 🟢 NUEVO CAMPO AGREGADO AL TIPO DEL FORMULARIO
        employeeStatus: string; 
            
        employExists: boolean;
}

const DEFAULT_ID_PLACEHOLDER = '00000000-0000-0000-0000-000000000000';

/**
    * Formulario de creacion / edicion de Empleados (Persona con rol de Empleado).
    */
const AddEditEmployContent: React.FC<{
        employ: PersonModel | null; 
        onSave: (employ: PersonModel | null, data: Partial<PersonModel> & EmployFormData) => Promise<void>;
        onClose: () => void;
        isSinglePageMode: boolean;
}> = ({ 
    employ, 
    onSave, 
    onClose,
    isSinglePageMode 

}) => {
            
        // 1. Preparamos los datos iniciales para el formulario dinamico
        const initialData: Partial<EmployFormData> = useMemo(() => {
            const primaryAddress = employ?.addresses?.[0]; 

            const baseData: Partial<EmployFormData> = {
                    givenName: employ?.givenName || "",
                    surName: employ?.surName || "",
                    phoneNumber: employ?.phoneNumber || "",
                    dateOfBirth: employ?.dateOfBirth ? employ.dateOfBirth.substring(0, 10) : "", 
                    genderId: employ?.genderId || "",
                    employeeCode: employ?.employee?.employeeCode || "", 
                    employeeStatus: employ?.employee?.employeeStatus || 'A',
                    
                    documents: employ?.documents?.map(doc => ({
                           
                            ...doc,
                            docTypeId: doc.docTypeId, 
                            issuingCountry: doc.issuingCountry, 
                            personDocumentId: doc.personDocumentId || DEFAULT_ID_PLACEHOLDER, 
                    })) || [],
                    
                    street: primaryAddress?.street || "",
                    cityId: primaryAddress?.cityId || "",
                    postalCode: primaryAddress?.postalCode || "",
                    countryId: (primaryAddress as AddressModel)?.countryId || "", 
                    provinceId: (primaryAddress as AddressModel)?.stateId || "", 
                    typeAddressId: primaryAddress?.typeAddressId || "", // 🟢 Mapeo del valor de la API
                    employExists: !!employ,
            };
            return baseData;
        }, [employ]);
            
        // 2. Definimos el handler onSubmit que sera ejecutado por DynamicForm
        const handleDynamicSubmit = useCallback(async (data: Record<string, any>) => {
            const formData = data as unknown as EmployFormData;
                
        // Lógica de detección de cambios (se mantiene)
        if (employ) {
                const { employExists: initExists, ...initialCompareData } = initialData;
                const { employExists: currentExists, ...currentCompareData } = formData;
                const initialString = JSON.stringify(initialCompareData);
                const currentString = JSON.stringify(currentCompareData);
                
                if (initialString === currentString) {
                        console.log("Modificar: No se detectaron cambios en los datos. Cerrando formulario.");
                        return onClose(); 
                }
        }
        
            const { 
                    employeeCode, employeeStatus, documents, 
                    street, cityId, postalCode, countryId, provinceId,typeAddressId,
                    employExists, ...personFields 
            } = formData;
                    
            // Determina si es CREACIÓN o EDICIÓN
            const isCreation = !employ;

            // 🛑 Generación del UUID de Persona si es Creación, o usa el ID existente.
            const finalPersonId = isCreation ? uuidv4() : (employ?.personId || DEFAULT_ID_PLACEHOLDER);
            
            const defaultAddressId = employ?.addresses?.[0]?.addressId || DEFAULT_ID_PLACEHOLDER;
            const finalEmployeeStatus = employeeStatus || 'A';
            
            // Función auxiliar para generar IDs en el frontend si es necesario
            const generateId = (currentId: string | undefined): string => {
                // Genera ID si es nuevo (sin ID o con placeholder)
                return (!currentId || currentId === DEFAULT_ID_PLACEHOLDER) 
                    ? uuidv4() 
                    : currentId;
            };

            const patchPayload: Partial<PersonModel> = {
                    // 1. Campos de PersonModel (Nivel Superior)
                    ...personFields, 
                    
                    // 🛑 CRÍTICO: Usar el ID recién generado/existente
                    personId: finalPersonId, 
                                
                    // 2. Sub-objeto Empleado: Generar ID si es nuevo y usar el personId REAL
                    employee: {
                    employeeId: generateId(employ?.employee?.employeeId || DEFAULT_ID_PLACEHOLDER), 
                    employeeCode: employeeCode,
                    personId: finalPersonId, // 🛑 USAR EL ID REAL

                    isActive: true,
                    employeeStatus: finalEmployeeStatus, 
                    } as EmployeeModel,
                                
                    // 3. Arrays anidados (Documents): Generar ID si es necesario
                    documents: documents.map((doc) => {
    
                            const { personDocumentId: formDocId, ...docWithoutId } = doc;
                            const defaultUUID = DEFAULT_ID_PLACEHOLDER;
                            let finalDocumentId = formDocId;

                            if (!employ) {
                                // Caso CREACIÓN (POST)
                                if (!finalDocumentId || finalDocumentId === defaultUUID) {
                                    finalDocumentId = uuidv4(); // Generar ID si es nuevo en esta sesión
                                }
                            } else {
                                // Caso EDICIÓN (PUT) - Lógica de preservación de UUID/Placeholder
                                const originalDoc = employ.documents?.find(d => d.personDocumentId === formDocId);

                                if (originalDoc) {
                                    finalDocumentId = (originalDoc.personDocumentId !== defaultUUID) 
                                        ? originalDoc.personDocumentId // Preservar UUID Real
                                        : defaultUUID; // Preservar Placeholder
                                } else if (!formDocId || formDocId === defaultUUID) {
                                    // Búsqueda de un documento existente cuya identificación ha sido cambiada
                                    const existingMatch = employ.documents?.find(
                                        d => d.docTypeId === docWithoutId.docTypeId && d.personDocumentId !== defaultUUID
                                    );

                                    if (existingMatch) {
                                        // Si existe un match por TIPO con un ID real (actualización de un documento principal)
                                        finalDocumentId = existingMatch.personDocumentId;
                                    } else {
                                        // Es una fila NUEVA añadida en modo EDICIÓN. GENERAR UUID para forzar INSERT/UPSERT en el backend.
                                        finalDocumentId = uuidv4();
                                    }
                                } 
                            }
                            
                            // 🛑 Ajuste Crítico: Si el ID es un placeholder, lo eliminamos (para UPDATE),
                            // pero si es CREACIÓN, el ID SIEMPRE debe ir (es el UUID recién generado).
                            const isPlaceholder = finalDocumentId === DEFAULT_ID_PLACEHOLDER;
                            const shouldRemoveId = !isCreation && isPlaceholder; // Solo eliminar si es UPDATE y placeholder
                            
                            const documentToSend: any = {
                                ...docWithoutId, 
                                personId: finalPersonId, // 🛑 USAR EL ID REAL DE LA PERSONA
                                issuingCountry: (doc as DocumentModel).issuingCountry || 'ba79cc4d-756b-4c01-98a3-fcb9434a3dfc', 
                                isActive: (doc as DocumentModel).isActive ?? true,
                                
                                // Incluir el ID solo si es un UUID real.
                                ...(shouldRemoveId ? {} : { personDocumentId: finalDocumentId }), 
                            };

                            // Si el doc tenía created_by_user_id o updated_by_user_id (viene del servidor), lo eliminamos por seguridad
                            delete documentToSend.created_by_user_id;
                            delete documentToSend.updated_by_user_id;

                            return documentToSend;
                        }) as DocumentModel[],
                                
                    // 4. Arrays anidados (Addresses): Generar ID si es necesario
                    addresses: [{
                        addressId: generateId(defaultAddressId), // Genera ID si es nuevo
                        street: street,
                        cityId: cityId,
                        postalCode: postalCode,
                        countryId: countryId,     
                        stateId: provinceId, 
                        personId: finalPersonId, // 🛑 USAR EL ID REAL DE LA PERSONA
                        typeAddressId: typeAddressId,
                        isActive: true,
                    }] as AddressModel[],
            };
                    
            await onSave(employ, patchPayload as Partial<PersonModel> & EmployFormData);
        }, [employ, onSave, onClose, initialData]); 


    // 3. Definimos el boton "Cancelar"
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
                singlePage={isSinglePageMode}
                className="person-form" 
                actions={formActions} 
            />
        </div>
    );
};

export default AddEditEmployContent;