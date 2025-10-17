// 📁 src/components/forms/employformconfig.tsx (Configuración Final para Empleado)

import type { FormSection } from '../../components/multisectiondinamicform/interface'; 

// Opciones de MOCK para campos tipo select
const identificationOptions = [
    { value: 'c0a8b121-64fa-4777-92ad-68aa8f8889d0', label: 'Cédula' }, 
    { value: 'a7ce41c6-4833-43de-835e-be1ddd99018d', label: 'RUC' },      
    { value: 'otro-pasaporte-uuid', label: 'Pasaporte' }, 
];

const genderOptions = [
    { value: 'ed1d00bc-6b84-480a-8b7a-50d6ccf369c8', label: 'Masculino' }, 
    { value: 'f1e1d00b-6b84-480a-8b7a-50d6ccf369c8', label: 'Femenino' },  
    { value: 'g2e2d00b-6b84-480a-8b7a-50d6ccf369c8', label: 'Otros' },     
];

// Opciones de MOCK para el estado del empleado (employee_status)
const employeeStatusOptions = [
    { value: 'A', label: 'Activo' }, 
    { value: 'I', label: 'Inactivo' }, 
    { value: 'L', label: 'Licencia' }, 
];

// --------------------------------------------------------------------------

export const employFormSections: FormSection[] = [

    // ----------------------------------------------------
    // SECCIÓN 1: DATOS PERSONALES Y DOCUMENTO PRINCIPAL
    // ----------------------------------------------------
    {
        title: "Datos Personales y Documentación",
        columns: 2, 
        fields: [
            // 1. givenName
            { name: "givenName", label: "Nombres", type: "text", required: true, placeholder: "Nombres del Empleado (Obligatorio)" },
            // 2. surName
            { name: "surName", label: "Apellidos", type: "text", required: true, placeholder: "Apellidos del Empleado (Obligatorio)" },
            // 3. docTypeId
            { name: "docTypeId", label: "Tipo de Documentación", type: "select", required: true, options: identificationOptions, placeholder: "Selecciona el tipo de documento" },
            // 4. docNumber
            { name: "docNumber", label: "Número de Identificación", type: "text", required: true, placeholder: "Número de Identificación" },
            // 5. phoneNumber
            { name: "phoneNumber", label: "Teléfono", type: "text", required: false, placeholder: "000 000 0000" },
            // 6. genderId
            { name: "genderId", label: "Sexo", type: "select", required: false, options: genderOptions, placeholder: "Selecciona el Genero" },
            // 7. dateOfBirth
            { name: "dateOfBirth", label: "Fecha de Nacimiento", type: "date", required: false },
        ],
    },
    
    // ----------------------------------------------------
    // SECCIÓN 2: DIRECCIÓN PRINCIPAL (Simplificación)
    // ----------------------------------------------------
    {
        title: "Dirección de Residencia",
        columns: 1, 
        fields: [
            // 8. street
            { name: "street", label: "Calle Principal y Secundaria", type: "textarea", required: true, placeholder: "Calle principal y secundaria (Obligatorio)", helperText: "Asegúrese de incluir calle principal y secundaria." },
            // 9. cityId
            { name: "cityId", label: "Ciudad ID", type: "text", required: true, placeholder: "ID de la Ciudad (Ej: 41190a6a-37be...)" },
            // 10. postalCode
            { name: "postalCode", label: "Código Postal", type: "text", required: false, placeholder: "Código Postal (Ej: 566)" },
        ],
    },
    
    // ----------------------------------------------------
    // ✅ SECCIÓN 3: DETALLES ESPECÍFICOS DEL EMPLEADO (Sub-objeto 'employee')
    // ----------------------------------------------------
    {
        title: "Datos Laborales del Empleado",
        columns: 2, 
        fields: [
            // 11. employeeCode (Mapea a employee.employeeCode)
            {
                name: "employeeCode", 
                label: "Código de Empleado",
                type: "text",
                required: true, 
                placeholder: "Ej: 566 (Código Interno)",
            },
            // 12. employeeStatus (Mapea a employee.employeeStatus)
            {
                name: "employeeStatus", 
                label: "Estado Laboral",
                type: "select",
                required: true, 
                options: employeeStatusOptions,
                placeholder: "Selecciona el estado (Activo/Inactivo)",
            },
            // 13. integrationCode (Mapea al campo de nivel superior)
            {
                name: "integrationCode",
                label: "Código de Integración",
                type: "text", 
                required: false,
                placeholder: "Código de sistema externo (Opcional)",
            },
        ],
    },
];