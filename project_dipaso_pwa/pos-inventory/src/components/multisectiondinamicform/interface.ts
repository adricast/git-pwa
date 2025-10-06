// src/interfaces/dynamicForm.interface.ts

// Usar 'import type { ... }' es la forma correcta de importar tipos
import type { InputHTMLAttributes, TextareaHTMLAttributes, ReactNode, FormEvent } from 'react';

// ----------------------------------------------
// TIPOS DE SOPORTE
// ----------------------------------------------

/** Props para botones de acción personalizados */
export interface DynamicButtonProps {
    label: string;              // Texto del botón
    color?: string;             // Color de fondo (ej: '#4CAF50')
    textColor?: string;         // Color del texto (ej: '#ffffff')
    onClick?: () => void;       // Acción al hacer clic
    type?: 'button' | 'submit' | 'reset'; // Tipo nativo del botón
    disabled?: boolean;         // Estado deshabilitado
    outlined?: boolean;         // Opción de estilo "outlined"
}

/** Tipos de datos de entrada que maneja el formulario (Extendidos) */
export type FieldType = 
    | "text" 
    | "email" 
    | "password" 
    | "number" 
    | "select" 
    | "textarea" 
    | "checkbox" 
    | "radio"
    | "date"       // Nuevo: para campos de fecha
    | "file"       // Nuevo: para subir archivos
    | "custom";    // Para inyectar componentes React

/** Opciones para campos 'select' y 'radio' */
export interface SelectOption {
    value: string | number;
    label: string;
}

// ----------------------------------------------
// CONFIGURACIÓN DE ELEMENTOS
// ----------------------------------------------

/** Configuración de un campo individual (Extendida) */
export interface FormField {
    name: string;
    label: string;
    type: FieldType;
    placeholder?: string;
    required?: boolean;

    // Para 'select' y 'radio'
    options?: SelectOption[]; 
    
    // Para 'custom' (inyección de componente)
    component?: ReactNode;

    // Para pasar props nativas de HTML (incluye la propiedad 'pattern' para regex)
    inputProps?: InputHTMLAttributes<HTMLInputElement> | TextareaHTMLAttributes<HTMLTextAreaElement>;

    // [Opcional Avanzado] Para renderizado condicional basado en otros datos del formulario
    isVisible?: (data: Record<string, any>) => boolean;
    
    // NUEVO: Mensaje de ayuda o error específico
    helperText?: string; 
    errorText?: string; 
}

/** Configuración para un Contenedor/Sección (maneja el layout en columnas) */
export interface FormSection {
    title?: string; // Título opcional de la sección (usado en la paginación)
    columns: 1 | 2 | 3 | 4; // Define el layout: 1, 2, 3 o 4 columnas
    fields: FormField[]; // Los campos que van en esta sección
    hideTitleInSteps?: boolean; 
}

// ----------------------------------------------
// PROPS DEL PROVIDER Y CONTEXTO
// ----------------------------------------------

/** Estructura de Props para el Provider (Configuración principal) */
export interface DynamicFormProviderProps {
    sections: FormSection[]; // La configuración jerárquica del formulario
    initialData?: Record<string, any>; // Datos iniciales
    onSubmit: (data: Record<string, any>) => void; // Función de envío
    buttonText?: string;
    children?: ReactNode; // Contenido adicional dentro del <form>
    className?: string; 
    actions?: DynamicButtonProps[]; // Array de botones de acción
}

/** Estructura de la Data expuesta por el Contexto/Hook (AGREGAMOS PAGINACIÓN) */
export interface DynamicFormContextData {
    // Estado de los datos del formulario
    formData: Record<string, any>; 
    
    // Handlers para actualizar los datos
    handleChange: (name: string, value: any) => void;
    
    // Estructura de los campos (para renderizado)
    sections: FormSection[];

    // Lógica de envío
    handleSubmit: (e: FormEvent) => void;
    
    // **PROPIEDADES DE PAGINACIÓN (NUEVAS)**
    currentStep: number;         // El índice de la sección actual
    totalSteps: number;          // El número total de secciones
    nextStep: () => void;        // Función para avanzar a la siguiente sección
    prevStep: () => void;        // Función para retroceder a la sección anterior
    isCurrentStepValid: boolean; // Indica si la sección actual cumple sus requisitos
    
    // Propiedad de validez (general)
    isFormValid: boolean; 
}