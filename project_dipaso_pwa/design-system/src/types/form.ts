// Centralización de tipos para formularios

import type { ReactNode, ComponentType, InputHTMLAttributes, TextareaHTMLAttributes, FormEvent } from 'react';

// Opciones para campos select/radio
export interface OptionItem {
    label: string;
    value: string | number;
}

export interface SelectOption {
    value: string | number;
    label: string;
}

// Columnas para campos tipo tabla
export interface TableColumn {
    name: string;
    label: string;
    type: string;
    required?: boolean;
    options?: OptionItem[] | SelectOption[];
    placeholder?: string;
}

// Tipos de campo
export type FieldType =
    | "text"
    | "email"
    | "password"
    | "number"
    | "select"
    | "textarea"
    | "checkbox"
    | "radio"
    | "custom"
    | "date"
    | "nestedForm"
    | "table"
    | "file";

// Campo base
export interface BaseFormField {
    name: string;
    label: string;
    required?: boolean;
    placeholder?: string;
    disabled?: boolean;
    isVisible?: (data: Record<string, any>) => boolean;
}

// Campos discriminados
export interface SimpleInputField extends BaseFormField, Omit<InputHTMLAttributes<HTMLInputElement>, 'name' | 'disabled' | 'placeholder' | 'type'> {
    type: "text" | "email" | "password" | "number" | "date";
}
export interface OptionField extends BaseFormField {
    type: "select" | "radio";
    options: OptionItem[] | SelectOption[];
}
export interface TextareaField extends BaseFormField, Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'name' | 'disabled' | 'placeholder'> {
    type: "textarea";
}
export interface CheckboxField extends BaseFormField {
    type: "checkbox";
}
export interface CustomField extends BaseFormField {
    type: "custom";
    component: ComponentType<any> | ReactNode;
    customProps?: Record<string, any>;
}
export interface NestedFormField extends BaseFormField {
    type: "nestedForm";
    sections: FormSection[];
}
export interface TableField extends BaseFormField {
    type: "table";
    columnsDefinition: TableColumn[];
}

export type FormField =
    | SimpleInputField
    | OptionField
    | TextareaField
    | CheckboxField
    | CustomField
    | NestedFormField
    | TableField;

export interface FormSection {
    title?: string;
    columns: 1 | 2 | 3 | 4;
    fields: FormField[];
    hideTitleInSteps?: boolean;
}

export interface DynamicButtonProps {
    label: string;
    color?: string;
    textColor?: string;
    onClick?: () => void;
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
    outlined?: boolean;
}

export interface DynamicFormProviderProps {
    sections: FormSection[];
    initialData?: Record<string, any>;
    onSubmit: (data: Record<string, any>) => void;
    buttonText?: string;
    children?: ReactNode;
    className?: string;
    actions?: DynamicButtonProps[];
}

export interface DynamicFormContextData {
    formData: Record<string, any>;
    handleChange: (name: string, value: any) => void;
    sections: FormSection[];
    handleSubmit: (e: FormEvent) => void;
    currentStep?: number;
    totalSteps?: number;
    nextStep?: () => void;
    prevStep?: () => void;
    isCurrentStepValid?: boolean;
    isFormValid: boolean;
}
export interface TreeNode {
    id: string; // UUID o ID único del elemento
    label: string; // Texto a mostrar
    children?: TreeNode[]; // Sub-elementos anidados
    type: 'module' | 'option' | 'action'; // Tipo de nodo (para estilos/lógica)
    // Otros metadatos necesarios...
}

export {};