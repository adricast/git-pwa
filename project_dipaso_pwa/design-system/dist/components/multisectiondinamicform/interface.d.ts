import type { InputHTMLAttributes, TextareaHTMLAttributes, ReactNode, FormEvent } from 'react';
/** Props para botones de acción personalizados */
export interface DynamicButtonProps {
    label: string;
    color?: string;
    textColor?: string;
    onClick?: () => void;
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
    outlined?: boolean;
}
/** Tipos de datos de entrada que maneja el formulario (Extendidos) */
export type FieldType = "text" | "email" | "password" | "number" | "select" | "textarea" | "checkbox" | "radio" | "date" | "file" | "custom" | "table" | "action" | "tree";
export interface TableColumn {
    name: string;
    label: string;
    type: Exclude<FieldType, 'table' | 'custom'>;
    placeholder?: string;
    required?: boolean;
    options?: SelectOption[];
}
/** Opciones para campos 'select' y 'radio' */
export interface SelectOption {
    value: string | number;
    label: string;
}
/** Configuración de un campo individual (Extendida) */
export interface FormField {
    name: string;
    label: string;
    type: FieldType;
    placeholder?: string;
    required?: boolean;
    options?: SelectOption[];
    component?: ReactNode;
    inputProps?: InputHTMLAttributes<HTMLInputElement> | TextareaHTMLAttributes<HTMLTextAreaElement>;
    isVisible?: (data: Record<string, any>) => boolean;
    columnsDefinition?: TableColumn[];
    helperText?: string;
    errorText?: string;
    treeNodes?: TreeNode[];
    paginationEnabled?: boolean;
    initialRowsPerPage?: number;
}
/** Configuración para un Contenedor/Sección (maneja el layout en columnas) */
export interface FormSection {
    title?: string;
    columns: 1 | 2 | 3 | 4;
    fields: FormField[];
    hideTitleInSteps?: boolean;
}
export interface TreeNode {
    id: string;
    label: string;
    children?: TreeNode[];
    type: 'module' | 'option' | 'action';
}
export interface SummaryDetailItem {
    label: string;
    value: string | number | boolean | React.ReactNode;
    style?: React.CSSProperties;
}
/** Define una sección completa del resumen (Ej: "Datos Generales") */
export interface SummarySectionData {
    title: string;
    items: SummaryDetailItem[];
}
/** Props del componente genérico DynamicSummaryDisplay */
export interface DynamicSummaryDisplayProps {
    sections: SummarySectionData[];
    confirmationMessage: string;
}
/** Estructura de Props para el Provider (Configuración principal) */
export interface DynamicFormProviderProps {
    sections: FormSection[];
    initialData?: Record<string, any>;
    onSubmit: (data: Record<string, any>) => void;
    buttonText?: string;
    children?: ReactNode;
    className?: string;
    actions?: DynamicButtonProps[];
    singlePage?: boolean;
}
/** Estructura de la Data expuesta por el Contexto/Hook (AGREGAMOS PAGINACIÓN) */
export interface DynamicFormContextData {
    formData: Record<string, any>;
    handleChange: (name: string, value: any) => void;
    sections: FormSection[];
    handleSubmit: (e: FormEvent) => void;
    currentStep: number;
    totalSteps: number;
    nextStep: () => void;
    prevStep: () => void;
    isCurrentStepValid: boolean;
    isFormValid: boolean;
}
