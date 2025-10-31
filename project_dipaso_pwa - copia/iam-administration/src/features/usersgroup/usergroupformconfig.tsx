// 📁 src/components/forms/usergroupformconfig.tsx (FINAL CON TRES PASOS Y RESUMEN GENÉRICO)


// Importamos los tipos necesarios (SummarySectionData de @dipaso/design-system)
import type { FormField, FormSection, TreeNode, SummarySectionData } from "@dipaso/design-system";
// 🛑 Importamos el componente genérico DynamicSummaryDisplay de la librería
import { DynamicSummaryDisplay } from "@dipaso/design-system"; 
// NOTA: Asumimos que useDynamicFormContext ya está disponible globalmente o vía import en un componente wrapper.

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
// 🛑 DEFINICIÓN DEL ÁRBOL DE POLÍTICAS (BASE DE DATOS PARA EL ÁRBOL)
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
 * 💡 FUNCIÓN AUXILIAR: Encuentra el label de un ID seleccionado en el árbol
 */
const findPolicyLabel = (id: string, nodes: TreeNode[]): string | undefined => {
    for (const node of nodes) {
        if (node.id === id) return node.label;
        if (node.children) {
            const found = findPolicyLabel(id, node.children);
            if (found) return found;
        }
    }
    return undefined;
};


/**
 * 🛑 FUNCIÓN DE INYECCIÓN DEL PASO 3 (Crea un wrapper que hace el mapeo)
 * Este componente recibe el formData completo inyectado por DynamicField (via prop).
 */
const SummaryWrapper = ({ formData }: { formData: Record<string, any> }) => {
    
    // 1. Lógica de Negocio: Resolver IDs a Labels
    const selectedPolicies = (formData.selectedPolicies as string[]) || [];
    const policyLabels = selectedPolicies
        .map(id => findPolicyLabel(id, iamPolicyTree))
        .filter((label): label is string => !!label);

    // 2. Mapeo a la Estructura Genérica (SummarySectionData[])
    const summarySections: SummarySectionData[] = [
        // SECCIÓN 1: Datos Generales (Paso 1)
        {
            title: 'Datos Generales',
            items: [
                { label: 'Nombre del Grupo', value: formData.groupName || '(Vacío)' },
                { label: 'Criticidad', value: formData.criticality || '(N/A)' },
                { label: 'Cód. Integración', value: formData.integrationCode || '(N/A)' },
                { label: 'Activo', value: formData.isActive ? 'Sí' : 'No' },
                // Usamos style para forzar el layout
                { label: 'Descripción', value: formData.description || '(N/A)', style: { gridColumn: 'span 2' } }, 
            ]
        },
        // SECCIÓN 2: Políticas Asignadas (Paso 2)
        {
            title: `Políticas de Acceso (${policyLabels.length} Permisos)`,
            items: [
                { 
                    label: 'Permisos', 
                    // Mostramos las políticas separadas por ; para la visualización genérica
                    value: policyLabels.length > 0 ? policyLabels.join('; ') : 'Ninguna política seleccionada.',
                    style: { gridColumn: 'span 2' }
                },
            ]
        }
    ];

    // 3. Renderizado del componente genérico
    return (
        <DynamicSummaryDisplay
            sections={summarySections}
            confirmationMessage="Presione el botón 'Crear Grupo' o 'Actualizar Grupo' para finalizar."
        />
    );
};


/**
 * EXPORTACIÓN PRINCIPAL: La constante userGroupFormSections[]
 */
export const userGroupFormSections: FormSection[] = [

    // ----------------------------------------------------
    // SECCIÓN 1: DATOS GENERALES DEL GRUPO (sin cambios)
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
                type: 'tree' as any, 
                required: true, 
                treeNodes: iamPolicyTree as any, 
                helperText: 'Seleccione los permisos que este grupo de usuarios debe tener.',
            } as FormField, 
        ] as FormField[], 
    },

    // 🛑 SECCIÓN 3: RESUMEN Y CONFIRMACIÓN FINAL
    {
        title: '3. Resumen y Confirmación',
        columns: 1, 
        fields: [
            {
                name: 'summaryView',
                label: '',
                type: 'custom' as any, 
                required: false, 
                // 🛑 INYECTAMOS EL WRAPPER QUE REALIZA EL MAPEO Y USA EL COMPONENTE GENÉRICO
                component: <SummaryWrapper formData={{}} />,
            } as FormField,
        ] as FormField[], 
    },
] as unknown as FormSection[];