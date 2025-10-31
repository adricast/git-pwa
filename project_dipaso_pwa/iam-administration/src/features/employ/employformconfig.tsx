// 📁 src/components/forms/employformconfig.tsx

// Importamos FormSection y FormField desde el archivo local de interfaces (asumo que se llama './interface')
import type { FormSection, FormField } from '@dipaso/design-system'; 
// Mantenemos la importación de la librería para satisfacer la estructura de los tipos base


/**
 * Interface para las opciones de formulario { value: string, label: string }
 */
interface FormOption {
    value: string;
    label: string;
}

// 🛑 Definición del marcador de posición para documentos nuevos (ID por defecto)
const DEFAULT_ID_PLACEHOLDER = "00000000-0000-0000-0000-000000000000";

// ... (Opciones MOCK y constantes sin cambios) ...
export const genderOptions: FormOption[] = []; 
export const countryOptions: FormOption[] = [];
export const identificationOptions: FormOption[] = [];
export const provinceOptions: FormOption[] = []; 
export const cityOptions: FormOption[] = [];

const employeeStatusOptions: FormOption[] = [
    { value: 'A', label: 'Activo' }, 
    { value: 'I', label: 'Inactivo' }, 
];

// Define la plantilla para las nuevas filas (para inicializar el array)
const INITIAL_DOCUMENT_ROW = {
    docTypeId: "", 
    docNumber: "",
    issuingCountry: "",
    isActive: true, 
    personDocumentId: DEFAULT_ID_PLACEHOLDER, // Usamos la constante
};


/**
 * EXPORTACIÓN CORREGIDA: Usamos el tipo local FormSection
 */
export const employFormSections: FormSection[] = [

    // ----------------------------------------------------
    // SECCIÓN 1: DATOS PERSONALES
    // ----------------------------------------------------
    {
        title: "Datos Personales",
        columns: 2, 
        fields: [
            { name: "givenName", label: "Nombres", type: "text", required: true, placeholder: "Nombres del Empleado (Obligatorio)" },
            { name: "surName", label: "Apellidos", type: "text", required: true, placeholder: "Apellidos del Empleado (Obligatorio)" },
            { name: "phoneNumber", label: "Teléfono", type: "text", required: false, placeholder: "000 000 0000" },
            { name: "genderId", label: "Sexo", type: "select", required: false, options: genderOptions, placeholder: "Selecciona el Genero" },
            { name: "dateOfBirth", label: "Fecha de Nacimiento", type: "date", required: false },
        ] as FormField[], // Casteo a FormField[]
    },
    
    // 🛑 SECCIÓN 2: Documentación (Tabla Parametrizada)
    {
        title: "Documentación de Identificación",
        columns: 1, 
        fields: [
            { 
                name: "documents", 
                label: "Documentos del Empleado", 
                type: "table", 
                required: true, 
                uniqueByField: "docTypeId",
                // 🔥 PROPIEDADES DE PAGINACIÓN:
                paginationEnabled: true,      
                initialRowsPerPage: 5,        
                
                initialValue: [INITIAL_DOCUMENT_ROW], 

                columnsDefinition: [
                    { name: "docTypeId", label: "Tipo", type: "select", required: true, options: identificationOptions },
                    { name: "docNumber", label: "Número", type: "text", required: true, placeholder: "Número de identificación" },
                    { name: "issuingCountry", label: "País de Emisión", type: "select", required: true, options: countryOptions },
                    { name: "isActive", label: "Activo", type: "checkbox", required: false },
                    
                    // ✅ COLUMNA DE ACCIÓN AÑADIDA CON LÓGICA DE VISIBILIDAD
                    { 
                        name: "actions", 
                        label: "ACCIONES", 
                        type: "action",
                        actionType: "delete", // Tipo de acción para renderizar la 'X' de eliminar
                        // CRÍTICO: Muestra la 'X' SOLO si el ID del documento es el placeholder
                        isVisible: (rowData: Record<string, any>) => 
                            rowData.personDocumentId === DEFAULT_ID_PLACEHOLDER || !rowData.personDocumentId
                    }
                ]
            } as FormField, // 🛑 Casting
        ] as FormField[],
    },


    // ----------------------------------------------------
    // SECCIÓN 3: DIRECCIÓN PRINCIPAL
    // ----------------------------------------------------
    {
    title: "Dirección de Residencia",
    columns: 2, 
    fields: [
        { name: "countryId", label: "País", type: "select", required: true, options: countryOptions, placeholder: "Selecciona el País" },
        { name: "provinceId", label: "Provincia", type: "select", required: true, options: provinceOptions, placeholder: "Selecciona la Provincia" },
        { name: "cityId", label: "Ciudad", type: "select", required: true, options: cityOptions, placeholder: "Selecciona la Ciudad" },
        { 
            name: "street", 
            label: "Calle Principal y Secundaria", 
            type: "textarea", 
            required: true, 
            placeholder: "Calle principal y secundaria (Obligatorio)",
        },
        { name: "postalCode", label: "Código Postal", type: "text", required: false, placeholder: "Código Postal (Ej: 566)" },
    ] as FormField[],
    },
    
    // ----------------------------------------------------
    // SECCIÓN 4: DETALLES ESPECÍFICOS DEL EMPLEADO
    // ----------------------------------------------------
    {
        title: "Datos Laborales del Empleado",
        columns: 2, 
        fields: [
            { name: "employeeCode", label: "Código de Empleado", type: "text", required: true, placeholder: "Ej: 566 (Código Interno)" },
            {
                name: "employeeStatus", 
                label: "Estado Laboral",
                type: "select",
                required: false, 
                options: employeeStatusOptions,
                placeholder: "Selecciona el estado (Activo/Inactivo)",
                isVisible: (data: Record<string, any>) => !!data.employExists,
            },
            { name: "integrationCode", label: "Código de Integración", type: "text", required: false, placeholder: "Código de sistema externo (Opcional)" },
        ] as FormField[],
    },
] as FormSection[]; // Casting final