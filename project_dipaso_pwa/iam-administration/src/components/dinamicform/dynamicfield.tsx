// src/components/forms/DynamicField.tsx

import React, {
    type InputHTMLAttributes,
    type TextareaHTMLAttributes,
    type ReactElement
} from 'react';
// ✅ RUTA CORREGIDA: De `./interface` a `../../interfaces/dynamicForm.interface`
import type { 
    FormField, 
    NestedFormField // 🆕 AGREGADO: Importamos el tipo para el formulario anidado
} from './interface'; 
// ✅ RUTA CORREGIDA: De `./dynamicformContext` a `../../contexts/dynamicformContext`
import { useDynamicFormContext } from './dynamicformContext';
// 🆕 AGREGADO: Necesario para renderizar las secciones internas del formulario anidado
import DynamicSection from './dynamicsection'; 

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

    // Handler especial para checkboxes
    const onCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Para checkbox, el valor es booleano (e.target.checked)
        handleChange(field.name, e.target.checked);
    };

    // Handler especial para date (el hook se encarga del formato)
    const onDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleChange(field.name, e.target.value);
    };

    // Propiedades comunes para todos los campos (input, select, textarea)
    const commonProps = {
        id: field.name,
        name: field.name,
        placeholder: field.placeholder || '',
        required: field.required || false,
        disabled: field.disabled || false,
        className: 'dynamic-form-input', // Clase base para estilos
    };

    // 3. Renderizado del Input (Switch/Case por tipo)
    const renderInput = (): ReactElement => {
        switch (field.type) {
            case 'select':
                return (
                    <select
                        {...commonProps as React.SelectHTMLAttributes<HTMLSelectElement>}
                        value={currentValue ?? ''}
                        onChange={onCommonChange}
                    >
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
                        onChange={onCommonChange}
                    />
                );
            case 'checkbox':
                return (
                    // El valor del checkbox es booleano
                    <input
                        type="checkbox"
                        {...commonProps as InputHTMLAttributes<HTMLInputElement>}
                        checked={currentValue === true} // Debe ser booleano
                        onChange={onCheckboxChange}
                        // Quitamos la clase de estilo base para que el CSS de checkbox aplique
                        className='dynamic-form-checkbox'
                    />
                );
            case 'date':
                return (
                    <input
                        type="date"
                        {...commonProps as InputHTMLAttributes<HTMLInputElement>}
                        // Formato de fecha esperado por el input type="date"
                        value={currentValue || ''}
                        onChange={onDateChange}
                    />
                );
            case 'custom':
                // Si es un componente custom, lo renderizamos y le pasamos los datos
                return field.component ? (
                    <field.component
                        value={currentValue}
                        onChange={handleChange} // Pasamos el handler central
                        formData={formData} // Pasamos todos los datos para lógica avanzada
                        field={field}
                    />
                ) : (
                    <div className='dynamic-form-error'>Componente custom no definido.</div>
                );
            case 'radio':
                return (
                    <div className="dynamic-form-radio-group">
                        {field.options?.map(option => (
                            <label key={option.value} className="dynamic-form-radio-label">
                                <input
                                    type="radio"
                                    {...commonProps as InputHTMLAttributes<HTMLInputElement>}
                                    value={option.value}
                                    checked={currentValue === option.value}
                                    onChange={onCommonChange}
                                />
                                {option.label}
                            </label>
                        ))}
                    </div>
                );
            // 🆕 CASO AGREGADO Y CORREGIDO: Renderizado de Formularios Anidados
            case 'nestedForm': { // 💡 FIX: Abrimos bloque de código para evitar "no-case-declarations"
                // Hacemos un casting seguro para acceder a 'sections'
                const nestedField = field as NestedFormField; 
                
                return (
                    <div className="dynamic-form-nested-container">
                        {/* Aplicamos el label del campo padre al formulario anidado */}
                        {nestedField.label && <h4>{nestedField.label}</h4>}
                        
                        {/* Iteramos sobre las secciones internas del NestedForm. 
                            DynamicSection llama a DynamicField, que usa el contexto 
                            del formulario padre para el estado y validación.
                        */}
                        {nestedField.sections.map((section, index) => (
                            <DynamicSection key={index} section={section} />
                        ))}
                    </div>
                );
            } // 💡 FIX: Cerramos bloque de código
                
            default: // text, email, password, number, file, etc.
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

    // 4. Estructura de Campo (El label se renderiza diferente para checkbox y anidados)
    
    // Si es un formulario anidado, el label ya se incluyó en renderInput (con <h4>), y no necesita el wrapper estándar de DynamicField.
    // Simplemente devolvemos el renderizado del NestedForm completo.
    if (field.type === 'nestedForm') {
        return renderInput();
    }
    
    // Lógica especial para Checkbox
    if (field.type === 'checkbox') {
        return (
            <div className="dynamic-form-group checkbox-wrapper">

                {/* 1. CHECKBOX (Input) - VA PRIMERO para la izquierda */}
                <div className="dynamic-form-checkbox-group">
                    {renderInput()}
                </div>
                {/* 2. Etiqueta de texto (LABEL) - VA SEGUNDO para la derecha */}
                <label htmlFor={field.name}>
                    {field.label}{field.required && <span className="required-star">*</span>}
                </label>
            </div>
        );
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