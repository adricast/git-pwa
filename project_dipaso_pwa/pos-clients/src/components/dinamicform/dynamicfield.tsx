// src/components/forms/DynamicField.tsx

import React, { type InputHTMLAttributes, type TextareaHTMLAttributes, type ReactElement } from 'react';
import type { FormField } from './interface'; // Ajusta la ruta
import { useDynamicFormContext } from './dynamicformContext'; // Ajusta la ruta

interface DynamicFieldProps {
    field: FormField;
}

/**
 * Componente que renderiza un campo individual (input, select, checkbox, etc.)
 * y lo conecta al estado del formulario a través del contexto.
 */
const DynamicField: React.FC<DynamicFieldProps> = ({ field }) => {
    
    // 1. Consumir el Contexto y obtener datos
    const { formData, handleChange } = useDynamicFormContext();
    const currentValue = formData[field.name];
    
    // [Avanzado] Lógica de visibilidad condicional
    // Si la función isVisible existe, la ejecuta para determinar si el campo debe ser visible.
    const isVisible = field.isVisible ? field.isVisible(formData) : true;
    if (!isVisible) return null;

    // 2. Handlers y Props Comunes
    
    // Handler general para inputs de texto, número, select y textarea
    const onCommonChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        // El valor (e.target.value) se envía al hook, donde se procesan las conversiones a number/string
        handleChange(field.name, e.target.value);
    };

    // Handler específico para checkbox
    const onCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Los checkbox envían un booleano (e.target.checked), que el hook convierte a boolean
        handleChange(field.name, e.target.checked); 
    };
    
    // Props comunes para la mayoría de los inputs
    const commonProps: Partial<InputHTMLAttributes<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>> = {
        id: field.name,
        name: field.name,
        placeholder: field.placeholder || field.label,
        required: field.required || false,
        className: "dynamic-form-input", 
        // Parámetros específicos de HTML pasados por la configuración (ej. min, max, autoFocus)
        ...field.inputProps, 
    };

    // 3. Renderizado Condicional por Tipo de Campo
    const renderInput = () => {
        switch (field.type) {
            case 'select':
                return (
                    <select 
                        {...commonProps} 
                        value={currentValue ?? ''} 
                        onChange={onCommonChange as any}
                        // Usamos 'as any' para evitar el error de tipado con select/textarea en commonProps
                    >
                        <option value="" disabled>{field.placeholder || `Seleccionar ${field.label}`}</option>
                        {field.options?.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                );
            case 'textarea':
                return (
                    <textarea 
                        {...commonProps as TextareaHTMLAttributes<HTMLTextAreaElement>} 
                        value={currentValue ?? ''} 
                        onChange={onCommonChange as any} 
                        rows={4} 
                    />
                );
            case 'checkbox':
                // Nota: Los checkbox usan 'checked' en lugar de 'value'
                return (
                    <div className="dynamic-form-checkbox-group">
                        <input 
                            type="checkbox" 
                            {...commonProps} 
                            checked={!!currentValue} // Usa !! para asegurar el booleano
                            onChange={onCheckboxChange} 
                        />
                        <label htmlFor={field.name} className="checkbox-label">
                            {field.label}{field.required && <span className="required-star">*</span>}
                        </label>
                    </div>
                );
            case 'radio':
                // Renderizar un grupo de radio buttons
                return (
                    <div className="dynamic-form-radio-group">
                        {field.options?.map(option => (
                            <label key={option.value} className="radio-label">
                                <input
                                    type="radio"
                                    name={field.name} // IMPORTANTE: Mismo nombre para el grupo
                                    value={option.value}
                                    checked={currentValue === option.value}
                                    onChange={onCommonChange}
                                    required={field.required}
                                    // Se usa 'defaultChecked' en lugar de 'checked' si el componente no fuera controlado
                                />
                                {option.label}
                            </label>
                        ))}
                    </div>
                );
            case 'custom':
                // Permite inyectar cualquier componente React (ej. selector de fecha de librería externa)
                // Se clona el elemento para inyectar props de valor y cambio
                if (!field.component) return null;
                
                return React.cloneElement(field.component as ReactElement, { 
                    // Estas son las props que estás inyectando
                    value: currentValue, 
                    // Asegúrate que tu componente custom acepte una prop onChange
                    onChange: (v: any) => handleChange(field.name, v),
                    ...field.inputProps, // Permite pasar props al componente custom
                } as any); 
            
            default: // text, email, password, number
                return (
                    <input 
                        type={field.type} 
                        {...commonProps as InputHTMLAttributes<HTMLInputElement>} 
                        value={currentValue ?? ''}
                        onChange={onCommonChange}
                    />
                );
        }
    };

    // 4. Estructura de Campo (El label se renderiza diferente para checkbox)
    if (field.type === 'checkbox') {
        // Para checkbox, el label se renderiza junto al input en renderInput()
        return <div className="dynamic-form-group checkbox-wrapper">{renderInput()}</div>;
    }

    // Renderizado estándar para la mayoría de los campos (Label encima del input)
    return (
        <div className="dynamic-form-group">
            <label htmlFor={field.name}>
                {field.label}{field.required && <span className="required-star">*</span>}
            </label>
            {renderInput()}
        </div>
    );
};

export default DynamicField;