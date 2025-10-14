// 📁 src/management/people/PersonFormConfig.ts (AJUSTE FINAL)

import type { FormSection } from '../../../components/dinamicform/interface'; 

export const personFormSections: FormSection[] = [
    {
        title: "Información Personal Básica",
        columns: 2, 
        fields: [
            {
                name: "givenName",
                label: "Nombre(s)",
                type: "text",
                required: true,
                placeholder: "Ej: Juan Andrés",
            },
            {
                name: "surName",
                label: "Apellido(s)",
                type: "text",
                required: true,
                placeholder: "Ej: Pérez Castro",
            },
            {
                name: "dateOfBirth",
                label: "Fecha de Nacimiento",
                type: "date",
                required: false,
            },
            {
                name: "genderId",
                label: "Género",
                type: "select",
                required: false,
                // Opciones de ejemplo, debes cargarlas dinámicamente
               options: [
                    { label: "Seleccionar...", value: "" },
                    { label: "Masculino", value: "11111111-1111-1111-1111-111111111111" },
                    { label: "Femenino", value: "22222222-2222-2222-2222-222222222222" },
                ],

                placeholder: "Seleccione un género",
            },
        ],
    },
    
    // --- Contacto y Clasificación ---
    
    {
        title: "Clasificacion",
        columns: 2, // Usamos 2 columnas para equilibrar la vista
        fields: [
            {
                name: "phoneNumber",
                label: "Teléfono",
                type: "text",
                required: false,
                placeholder: "Ej: +503 7777-7777",
            },
           
           
            // Espacio de relleno si es necesario, o dejamos que el layout se ajuste
        ],
    },

      
    {
        title: "Contacto",
        columns: 2, // Usamos 2 columnas para equilibrar la vista
        fields: [
       
           
            // --- Checkboxes para la clasificación ---
            {
                name: "isEmployee",
                label: "Es Empleado",
                type: "checkbox", // 🔑 Tipo Checkbox
                required: false,
            },
            {
                name: "isCustomer",
                label: "Es Cliente",
                type: "checkbox", // 🔑 Tipo Checkbox
                required: false,
            },
            {
                name: "isSupplier",
                label: "Es Proveedor",
                type: "checkbox", // 🔑 Tipo Checkbox
                required: false,
            },
            // Espacio de relleno si es necesario, o dejamos que el layout se ajuste
        ],
    },
];