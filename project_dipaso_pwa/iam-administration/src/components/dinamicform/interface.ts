// src/interfaces/dynamicForm.interface.ts

// Usar 'import type { ... }' es la forma correcta de importar tipos
import type { 
    ReactNode, 
    ComponentType,
    InputHTMLAttributes, 
    TextareaHTMLAttributes
} from 'react';

// ----------------------------------------------------------------------
// TIPOS BASE
// ----------------------------------------------------------------------

/** Props para botones de acción personalizados */
export interface DynamicButtonProps {
    label: string; // Texto del botón
    color?: string;// Color de fondo (ej: '#4CAF50')
    textColor?: string; // Color del texto (ej: '#ffffff')
    onClick?: () => void;// Acción al hacer clic
    type?: 'button' | 'submit' | 'reset'; // Tipo nativo del botón (incluye 'reset')
    disabled?: boolean; // Estado deshabilitado
    outlined?: boolean; // Opción de estilo "outlined"
}

/** Tipos de datos de entrada que maneja el formulario (ACTUALIZADO: Agregamos 'table') */
export type FieldType = 
| "text" 
| "email" 
| "password" 
| "number" 
| "select" 
| "textarea" 
| "checkbox" 
| "radio"
| "custom" // Para inyectar componentes React
| "date"
| "nestedForm" // PARA FORMULARIOS ANIDADOS
| "table"; // 🛑 NUEVO: Para tablas de ítems dinámicas

/** Estructura para una opción dentro de un campo 'select' o 'radio'. */
export interface OptionItem {
    label: string;
    value: string | number; 
}

// ----------------------------------------------------------------------
// ESTRUCTURAS DE TABLA
// ----------------------------------------------------------------------

/** Estructura para definir una columna dentro de un campo de tipo 'table' */
export interface TableColumn {
    name: string; // El 'name' del campo dentro de la fila (ej: 'product', 'quantity')
    label: string; // Título de la columna
    // Una tabla no puede contener tablas anidadas ni formularios custom/anidados
    type: Exclude<FieldType, 'table' | 'custom' | 'nestedForm'>; 
    required?: boolean;
    options?: OptionItem[]; // Para campos 'select' o 'radio' dentro de la tabla
    placeholder?: string;
}

// ----------------------------------------------------------------------
// ESTRUCTURAS DE CAMPO (Discriminated Union)
// ----------------------------------------------------------------------

// 💡 Declaración adelantada: Necesitamos este tipo para definir CustomField
export type CustomReactComponent = ComponentType<CustomComponentProps>;

/** Propiedades Base comunes a todos los campos del formulario */
interface BaseFormField {
    name: string; // La clave en formData (REQUIRED en BaseFormField)
    label: string; // La etiqueta que ve el usuario
    required?: boolean; // Es requerido para validación (opcional)
    placeholder?: string; // Placeholder opcional
    disabled?: boolean; // Estado deshabilitado para cualquier campo.
    // [Opcional Avanzado] Para renderizado condicional basado en otros datos del formulario
    isVisible?: (data: Record<string, any>) => boolean;
}

// Creamos un tipo auxiliar que omite las propiedades en conflicto y duplicadas.
type OmittedInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'name' | 'disabled' | 'placeholder' | 'type'>;
type OmittedTextareaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'name' | 'disabled' | 'placeholder'>;


// 1. Campos de Entrada Simples (text, number, password, email, date)
export interface SimpleInputField extends BaseFormField, OmittedInputProps {
    type: "text" | "email" | "password" | "number" | "date";
}

// 2. Campos con Opciones (select, radio)
export interface OptionField extends BaseFormField {
    type: "select" | "radio";
    options: OptionItem[]; 
}

// 3. Campo Textarea
export interface TextareaField extends BaseFormField, OmittedTextareaProps {
    type: "textarea";
}

// 4. Campo Checkbox
export interface CheckboxField extends BaseFormField {
    type: "checkbox";
}

// 5. Campo Custom (Requiere el componente CustomReactComponent)
export interface CustomField extends BaseFormField {
    type: "custom";
    component: CustomReactComponent; // Usa el tipo definido arriba
    customProps?: Record<string, any>;
}

// 6. Campo NestedForm (Un formulario hijo sin botones propios)
export interface NestedFormField extends BaseFormField {
    type: "nestedForm"; 
    // La configuración interna del sub-formulario
    sections: FormSection[]; 
}

// 🛑 7. Campo de Tabla (TableField)
export interface TableField extends BaseFormField {
    type: "table";
    columnsDefinition: TableColumn[]; // Requerida para definir la estructura de las filas
}


// 8. FormField es la unión de todos los tipos posibles.
export type FormField = 
| SimpleInputField 
| OptionField 
| TextareaField
| CheckboxField
| CustomField
| NestedFormField
| TableField; // 🛑 INCLUIDO EL NUEVO TIPO


// ----------------------------------------------------------------------
// TIPOS DE COMPONENTE CUSTOM (CIERRA EL CICLO DE DEPENDENCIA)
// ----------------------------------------------------------------------

// 💡 NECESARIO: Definición de las props que recibirá cualquier componente custom
export interface CustomComponentProps {
    value: any;
    // El handler central: acepta el nombre del campo y el nuevo valor
    onChange: (name: string, value: any) => void; 
    formData: Record<string, any>; // Todos los datos del formulario
    field: FormField; // La configuración completa del campo
}


/** Configuración para un Contenedor/Sección (maneja el layout en columnas) */
export interface FormSection {
    title?: string; // Título opcional de la sección
    columns: 1 | 2 | 3 | 4; // Define el layout: 1, 2, 3 o 4 columnas
    fields: FormField[]; // Los campos que van en esta sección
}

/** Estructura de Props para el Provider (Configuración principal) */
export interface DynamicFormProviderProps {
    // ✅ MODIFICADO: Ahora solo acepta secciones
    sections: FormSection[]; // La configuración del formulario en una vista única
    initialData?: Record<string, any>; // Datos iniciales
    onSubmit: (data: Record<string, any>) => void; // Función de envío
    buttonText?: string;
    children?: ReactNode; // Contenido adicional dentro del <form>
    className?: string; 
    actions?: DynamicButtonProps[]; // Array de botones de acción
}

/** Estructura de la Data expuesta por el Contexto/Hook */
export interface DynamicFormContextData {
    // Estado de los datos del formulario
    formData: Record<string, any>; 
    // Handlers para actualizar los datos
    handleChange: (name: string, value: any) => void;
    
    // ✅ MODIFICADO: Solo se expone la estructura de secciones (sections)
    sections: FormSection[]; 
    
    // Estado de validación del formulario (completo, para el submit final)
    isFormValid: boolean; 
    // Handler para el envío del formulario
    handleSubmit: (e: React.FormEvent) => void;
}
