// src/components/forms/UserFormConfig.ts (MODIFICACIÓN)
import type { FormSection } from './../../components/dinamicform/interface';  // Ajusta la ruta

export const userFormSections: FormSection[] = [
    {
        title: "Información de Identificación",
        columns: 2, // 👈 ¡DOS COLUMNAS!
        fields: [
            {
                name: "identification",
                label: "Identificación",
                type: "text",
                required: true,
                placeholder: "Identificación (Obligatorio)",
            },
            {
                name: "email",
                label: "Correo Electrónico",
                type: "email",
                required: true,
                placeholder: "Correo electrónico (Obligatorio)",
            },
        ],
    },
    {
        title: "Datos de Usuario",
        columns: 1, // 👈 ¡UNA COLUMNA!
        fields: [
            {
                name: "username",
                label: "Nombre de Usuario",
                type: "text",
                required: true,
                placeholder: "Nombre de usuario (Obligatorio)",
            },
        ],
    },
];