// 📁 src/components/forms/usergroupformconfig.tsx (FINAL CON TREE SELECT Y CASTING CORREGIDO)

import type { FormField, FormSection, TreeNode } from "@dipaso/design-system";

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

// =========================================================
// 🛑 DEFINICIÓN DEL ÁRBOL DE POLÍTICAS (MOVIDA DESDE EL WRAPPER)
// =========================================================

const iamPolicyTree: TreeNode[] = [
    {
        id: 'module-iam',
        label: 'Administración de Identidades y Accesos (IAM)',
        type: 'module',
        children: [
            {
                id: 'option-user-management',
                label: 'Gestión de Usuarios',
                type: 'option',
                children: [
                    { id: 'action-create-user', label: 'Crear Usuarios', type: 'action' },
                    { id: 'action-edit-user', label: 'Editar Usuarios', type: 'action' },
                    { id: 'action-delete-user', label: 'Eliminar Usuarios', type: 'action' },
                ],
            },
            {
                id: 'option-group-management',
                label: 'Gestión de Grupos',
                type: 'option',
                children: [
                    { id: 'action-view-group', label: 'Ver Grupos', type: 'action' },
                    { id: 'action-assign-policy', label: 'Asignar/Revocar Políticas', type: 'action' },
                ],
            },
        ],
    },
    {
        id: 'module-inventory',
        label: 'Módulo de Inventario',
        type: 'module',
        children: [
            { id: 'action-view-stock', label: 'Ver Stock (Reportes)', type: 'action' },
            { id: 'action-adjust-stock', label: 'Realizar Ajustes de Stock', type: 'action' },
        ],
    },
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
        title: "1. Información del Grupo",
        columns: 2, 
        fields: [
            // ... (Campos existentes del Paso 1)
            { 
                name: "groupName", 
                label: "Nombre del Grupo", 
                type: "text", 
                required: true, 
                placeholder: "Ej: Gerentes, Soporte Técnico (Obligatorio)" 
            },
            { 
                name: "integrationCode", 
                label: "Código de Integración", 
                type: "text", 
                required: false, 
                placeholder: "Código de sistema externo (Opcional)" 
            },
            { 
                name: "criticality", 
                label: "Criticidad", 
                type: "select", 
                required: true, 
                options: criticalityOptions, 
                placeholder: "Selecciona el nivel de criticidad" 
            },
            { 
                name: "isActive", 
                label: "Activo", 
                type: "checkbox", 
                required: false 
            },
            { 
                name: "description", 
                label: "Descripción del Grupo", 
                type: "textarea", 
                required: false, 
                placeholder: "Detalles completos del propósito del grupo",
            },
        ] as FormField[],
    },
    
    // 🛑 SECCIÓN 2: ASIGNACIÓN DE POLÍTICAS
    {
        title: '2. Asignación de Políticas',
        columns: 1, 
        fields: [
            {
                name: 'selectedPolicies',
                label: 'Selección de Módulos, Opciones y Acciones (Políticas)',
                // 🛑 CORRECCIÓN: Usar 'as any' para forzar el literal de cadena 'tree'
                type: 'tree' as any, 
                required: true, 
                // 🛑 CORRECCIÓN: Forzar el tipo del objeto del campo a FormField
                treeNodes: iamPolicyTree as any, 
                helperText: 'Seleccione los permisos que este grupo de usuarios debe tener.',
            } as FormField, // Forzar el tipo del campo individual
        ] as FormField[], 
    },
] as unknown as FormSection[]; // 🛑 CORRECCIÓN FINAL: Casting para eliminar la incompatibilidad del arreglo