import type { ReactNode, ComponentType, InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
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
/** Tipos de datos de entrada que maneja el formulario (ACTUALIZADO: Agregamos 'table') */
export type FieldType = "text" | "email" | "password" | "number" | "select" | "textarea" | "checkbox" | "radio" | "custom" | "date" | "nestedForm" | "table";
/** Estructura para una opción dentro de un campo 'select' o 'radio'. */
export interface OptionItem {
    label: string;
    value: string | number;
}
/** Estructura para definir una columna dentro de un campo de tipo 'table' */
export interface TableColumn {
    name: string;
    label: string;
    type: Exclude<FieldType, 'table' | 'custom' | 'nestedForm'>;
    required?: boolean;
    options?: OptionItem[];
    placeholder?: string;
}
export type CustomReactComponent = ComponentType<CustomComponentProps>;
/** Propiedades Base comunes a todos los campos del formulario */
interface BaseFormField {
    name: string;
    label: string;
    required?: boolean;
    placeholder?: string;
    disabled?: boolean;
    isVisible?: (data: Record<string, any>) => boolean;
}
type OmittedInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'name' | 'disabled' | 'placeholder' | 'type'>;
type OmittedTextareaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'name' | 'disabled' | 'placeholder'>;
export interface SimpleInputField extends BaseFormField, OmittedInputProps {
    type: "text" | "email" | "password" | "number" | "date";
}
export interface OptionField extends BaseFormField {
    type: "select" | "radio";
    options: OptionItem[];
}
export interface TextareaField extends BaseFormField, OmittedTextareaProps {
    type: "textarea";
}
export interface CheckboxField extends BaseFormField {
    type: "checkbox";
}
export interface CustomField extends BaseFormField {
    type: "custom";
    component: CustomReactComponent;
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
export type FormField = SimpleInputField | OptionField | TextareaField | CheckboxField | CustomField | NestedFormField | TableField;
export interface CustomComponentProps {
    value: any;
    onChange: (name: string, value: any) => void;
    formData: Record<string, any>;
    field: FormField;
}
/** Configuración para un Contenedor/Sección (maneja el layout en columnas) */
export interface FormSection {
    title?: string;
    columns: 1 | 2 | 3 | 4;
    fields: FormField[];
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
}
/** Estructura de la Data expuesta por el Contexto/Hook */
export interface DynamicFormContextData {
    formData: Record<string, any>;
    handleChange: (name: string, value: any) => void;
    sections: FormSection[];
    isFormValid: boolean;
    handleSubmit: (e: React.FormEvent) => void;
}
export {};
