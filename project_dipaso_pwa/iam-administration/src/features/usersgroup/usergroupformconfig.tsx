// 📁 src/components/forms/usergroupformconfig.tsx

import type { FormSection } from "@dipaso/design-system";

/**
 * Interface para las opciones de formulario { value: string, label: string }
 */
interface FormOption {
    value: string;
    label: string;
}

// Opciones de MOCK para el campo 'criticality'
const criticalityOptions: FormOption[] = [
    { value: 'LOW', label: 'Baja' }, 
    { value: 'MEDIUM', label: 'Media' }, 
    { value: 'HIGH', label: 'Alta' }, 
];

// --------------------------------------------------------------------------

/**
 * EXPORTACIÓN PRINCIPAL: La constante userGroupFormSections[]
 */
export const userGroupFormSections: FormSection[] = [

    // ----------------------------------------------------
    // SECCIÓN 1: DATOS GENERALES DEL GRUPO
    // ----------------------------------------------------
    {
        title: "Información del Grupo",
        columns: 2, 
        fields: [
            // 1. groupName
            { 
                name: "groupName", 
                label: "Nombre del Grupo", 
                type: "text", 
                required: true, 
                placeholder: "Ej: Gerentes, Soporte Técnico (Obligatorio)" 
            },
            // 2. integrationCode
            { 
                name: "integrationCode", 
                label: "Código de Integración", 
                type: "text", 
                required: false, 
                placeholder: "Código de sistema externo (Opcional)" 
            },
            // 3. criticality
            { 
                name: "criticality", 
                label: "Criticidad", 
                type: "select", 
                required: true, 
                options: criticalityOptions, 
                placeholder: "Selecciona el nivel de criticidad" 
            },
            // 4. isActive
            { 
                name: "isActive", 
                label: "Activo", 
                type: "checkbox", 
                required: false 
            },
        ],
    },
    
    // ----------------------------------------------------
    // SECCIÓN 2: DESCRIPCIÓN
    // ----------------------------------------------------
    {
        title: "Descripción",
        columns: 1, 
        fields: [
            // 5. description
            { 
                name: "description", 
                label: "Descripción del Grupo", 
                type: "textarea", 
                required: false, 
                placeholder: "Detalles completos del propósito del grupo",
            },
        ],
    },
];