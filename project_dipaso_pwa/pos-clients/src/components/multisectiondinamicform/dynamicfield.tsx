// src/components/forms/DynamicField.tsx

import React, { 
    type InputHTMLAttributes, 
    type TextareaHTMLAttributes, 
    type ReactElement
    // 🛑 SE ELIMINA 'type FormEvent' para corregir el error de ESLint/TS6133
} from 'react';
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
    const isVisible = field.isVisible ? field.isVisible(formData) : true;
    if (!isVisible) return null;

    // 2. Handlers y Props Comunes
    
    // Handler general para inputs de texto, número, select, textarea y date
    const onCommonChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        handleChange(field.name, e.target.value);
    };

    // Handler específico para checkbox
    const onCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleChange(field.name, e.target.checked); 
    };

    // Handler específico para files
    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // En lugar del valor, enviamos el objeto 'File' o 'FileList'
        const files = e.target.files;
        if (files && files.length > 0) {
            handleChange(field.name, files[0]);
        } else {
            handleChange(field.name, null);
        }
    };
    
    // Props comunes para la mayoría de los inputs
    const commonProps: Partial<InputHTMLAttributes<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>> = {
        id: field.name,
        name: field.name,
        placeholder: field.placeholder || field.label,
        required: field.required || false,
        className: "dynamic-form-input", 
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
                return (
                    <div className="dynamic-form-checkbox-group">
                        <input 
                            type="checkbox" 
                            {...commonProps} 
                            checked={!!currentValue} 
                            onChange={onCheckboxChange} 
                        />
                        <label htmlFor={field.name} className="checkbox-label">
                            {field.label}{field.required && <span className="required-star">*</span>}
                        </label>
                    </div>
                );
            case 'radio':
                return (
                    <div className="dynamic-form-radio-group">
                        {field.options?.map(option => (
                            <label key={option.value} className="radio-label">
                                <input
                                    type="radio"
                                    name={field.name}
                                    value={option.value}
                                    checked={currentValue === option.value}
                                    onChange={onCommonChange}
                                    required={field.required}
                                />
                                {option.label}
                            </label>
                        ))}
                    </div>
                );
            case 'custom':
                if (!field.component) return null;
                
                return React.cloneElement(field.component as ReactElement, { 
                    value: currentValue, 
                    onChange: (v: any) => handleChange(field.name, v),
                    ...field.inputProps, 
                } as any); 
            
            case 'file':
                return (
                    <input 
                        type="file"
                        {...commonProps as InputHTMLAttributes<HTMLInputElement>} 
                        onChange={onFileChange}
                    />
                );

            default: // text, email, password, number, date
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

    // 4. Estructura de Campo
    if (field.type === 'checkbox') {
        return <div className="dynamic-form-group checkbox-wrapper">{renderInput()}</div>;
    }

    // Renderizado estándar
    return (
        <div className="dynamic-form-group">
            <label htmlFor={field.name}>
                {field.label}{field.required && <span className="required-star">*</span>}
            </label>
            {renderInput()}
            {field.helperText && <small className="dynamic-form-helper-text">{field.helperText}</small>}
        </div>
    );
};

export default DynamicField;