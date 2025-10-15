
import type { FormSection } from './../../components/dinamicform/interface'; 

export const groupFormSections: FormSection[] = [
    {
        title: "Información Básica del Grupo",
        columns: 1, // Queremos que sea de una sola columna para este formulario simple
        fields: [
            {
                name: "groupName",
                label: "Nombre del Grupo",
                type: "text",
                required: true,
                placeholder: "Nombre del grupo (Obligatorio)",
            },
            {
                name: "description",
                label: "Descripción",
                type: "textarea",
                required: false,
                placeholder: "Descripción (Opcional)",
            },
        ],
    },
];
