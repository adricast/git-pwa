// 📁 src/components/forms/employformconfig.tsx (Configuración Final para Empleado)

//import type { FormSection } from '../../components/multisectiondinamicform/interface'; 
import { 

  type MultiSectionFormSection, 

} from '@dipaso/design-system';
/**
 * Interface para las opciones de formulario { value: string, label: string }
 */
interface FormOption {
    value: string;
    label: string;
}

// 🚨 PLACEHOLDER DE GÉNERO: Array vacío que será llenado por el Wrapper.
// Mantenemos el nombre original 'genderOptions' pero con un valor vacío.
export const genderOptions: FormOption[] = []; 
export const countryOptions: FormOption[] = [];
// Opciones de MOCK para campos tipo select
export const identificationOptions: FormOption[] = [];
export const provinceOptions: FormOption[] = []; 
export const cityOptions: FormOption[] = [];

// Opciones de MOCK para el estado del empleado (employee_status)
const employeeStatusOptions: FormOption[] = [
    { value: 'A', label: 'Activo' }, 
    { value: 'I', label: 'Inactivo' }, 
    { value: 'L', label: 'Licencia' }, 
];

// 🛑 Listado de países MOCK



// --------------------------------------------------------------------------

/**
 * EXPORTACIÓN ORIGINAL MANTENIDA: La constante employFormSections[]
 */
export const employFormSections: MultiSectionFormSection[] = [

    // ----------------------------------------------------
    // SECCIÓN 1: DATOS PERSONALES
    // ----------------------------------------------------
    {
        title: "Datos Personales",
        columns: 2, 
        fields: [
            // 1. givenName
            { name: "givenName", label: "Nombres", type: "text", required: true, placeholder: "Nombres del Empleado (Obligatorio)" },
            // 2. surName
            { name: "surName", label: "Apellidos", type: "text", required: true, placeholder: "Apellidos del Empleado (Obligatorio)" },
            // 5. phoneNumber
            { name: "phoneNumber", label: "Teléfono", type: "text", required: false, placeholder: "000 000 0000" },
            // 6. genderId
            // 🚨 Referencia al array vacío global 'genderOptions' que el Wrapper llenará.
            { name: "genderId", label: "Sexo", type: "select", required: false, options: genderOptions, placeholder: "Selecciona el Genero" },
            // 7. dateOfBirth
            { name: "dateOfBirth", label: "Fecha de Nacimiento", type: "date", required: false },
        ],
    },
    
    // 🛑 SECCIÓN 2: Documentación (Tabla Parametrizada)
    {
        title: "Documentación de Identificación",
        columns: 1, // La tabla usa todo el ancho
        fields: [
            { 
                name: "documents", 
                label: "Documentos del Empleado", 
                type: "table", 
                required: true, 
                // Definición de las columnas de la tabla:
                columnsDefinition: [
                    { 
                        name: "docTypeId", 
                        label: "Tipo", 
                        type: "select", 
                        required: true, 
                        options: identificationOptions 
                    },
                    { 
                        name: "docNumber", 
                        label: "Número", 
                        type: "text", 
                        required: true, 
                        placeholder: "Número de identificación" 
                    },
                    // 🛑 REINCORPORADA LA COLUMNA DE PAÍS COMO SELECT (es requerida)
                    { 
                        name: "issuingCountry", 
                        label: "País de Emisión", 
                        type: "select", 
                        required: true, 
                        options: countryOptions 
                    },
                    { 
                        name: "isActive", 
                        label: "Activo", 
                        type: "checkbox", 
                        required: false 
                    },
                ]
            },
        ],
    },


    // ----------------------------------------------------
    // SECCIÓN 3: DIRECCIÓN PRINCIPAL (Simplificación)
    // ----------------------------------------------------
   {
    title: "Dirección de Residencia",
    columns: 2, // Se divide la sección en dos columnas
    fields: [
        // 1. countryId (PAÍS - Nuevo select)
        { 
            name: "countryId", 
            label: "País", 
            type: "select", 
            required: true, 
            options: countryOptions, // Opciones inyectadas por el Wrapper
            placeholder: "Selecciona el País" 
        },

        // 2. provinceId (PROVINCIA - Nuevo select)
        // Este campo se añade para la cascada, usando el placeholder mutado.
        { 
            name: "provinceId", 
            label: "Provincia", 
            type: "select", 
            required: true, 
            options: provinceOptions, 
            placeholder: "Selecciona la Provincia" 
        },
        
        // 3. cityId (CIUDAD - Convierte el campo ID en Select)
        // Reemplaza el antiguo campo de texto cityId.
        { 
            name: "cityId", 
            label: "Ciudad", 
            type: "select", 
            required: true, 
            options: cityOptions, 
            placeholder: "Selecciona la Ciudad" 
        },
        
        // 4. street (Ocupa el resto de espacio si es necesario, o se deja en su propia fila/columna)
        // Manteniendo el diseño de dos columnas, street puede ir en una fila separada o al lado de postalCode.
        { 
            name: "street", 
            label: "Calle Principal y Secundaria", 
            type: "textarea", 
            required: true, 
            placeholder: "Calle principal y secundaria (Obligatorio)", 
            helperText: "Asegúrese de incluir calle principal y secundaria." 
        },

        // 5. postalCode (Mantenido)
        { name: "postalCode", label: "Código Postal", type: "text", required: false, placeholder: "Código Postal (Ej: 566)" },
    ],
},
    
    // ----------------------------------------------------
    // SECCIÓN 4: DETALLES ESPECÍFICOS DEL EMPLEADO (Sub-objeto 'employee')
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