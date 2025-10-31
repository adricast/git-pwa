import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/forms/DynamicField.tsx (FINAL CON SOPORTE PARA TABLA)
import React from 'react';
import { useDynamicFormContext } from './dynamicformContext'; // Ajusta la ruta
// 🛑 IMPORTAR EL NUEVO COMPONENTE DE TABLA
import DynamicTable from './dynamictable'; // Asumimos esta ruta para el componente de tabla
import DynamicTreeSelect from './dynamictreeselect'; // <--- 🛑 NUEVO IMPORT
/**
 * Componente que renderiza un campo individual (input, select, checkbox, etc.)
 * y lo conecta al estado del formulario a través del contexto.
 */
const DynamicField = ({ field }) => {
    // 1. Consumir el Contexto y obtener datos
    const { formData, handleChange } = useDynamicFormContext();
    const currentValue = formData[field.name];
    // [Avanzado] Lógica de visibilidad condicional
    const isVisible = field.isVisible ? field.isVisible(formData) : true;
    if (!isVisible)
        return null;
    // 2. Handlers y Props Comunes
    // Handler general para inputs de texto, número, select, textarea y date
    const onCommonChange = (e) => {
        handleChange(field.name, e.target.value);
    };
    // Handler específico para checkbox
    const onCheckboxChange = (e) => {
        handleChange(field.name, e.target.checked);
    };
    // Handler específico para files
    const onFileChange = (e) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleChange(field.name, files[0]);
        }
        else {
            handleChange(field.name, null);
        }
    };
    // Props comunes para la mayoría de los inputs
    const commonProps = {
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
                return (_jsxs("select", { ...commonProps, value: currentValue ?? '', onChange: onCommonChange, children: [_jsx("option", { value: "", disabled: true, children: field.placeholder || `Seleccionar ${field.label}` }), field.options?.map(option => (_jsx("option", { value: option.value, children: option.label }, option.value)))] }));
            case 'textarea':
                return (_jsx("textarea", { ...commonProps, value: currentValue ?? '', onChange: onCommonChange, rows: 4 }));
            case 'checkbox':
                return (_jsxs("div", { className: "dynamic-form-checkbox-group", children: [_jsx("input", { type: "checkbox", ...commonProps, checked: !!currentValue, onChange: onCheckboxChange }), _jsxs("label", { htmlFor: field.name, className: "checkbox-label", children: [field.label, field.required && _jsx("span", { className: "required-star", children: "*" })] })] }));
            case 'radio':
                return (_jsx("div", { className: "dynamic-form-radio-group", children: field.options?.map(option => (_jsxs("label", { className: "radio-label", children: [_jsx("input", { type: "radio", name: field.name, value: option.value, checked: currentValue === option.value, onChange: onCommonChange, required: field.required }), option.label] }, option.value))) }));
            case 'custom':
                if (!field.component)
                    return null;
                // 🛑 CORRECCIÓN: Clona el elemento y pasa los valores del contexto
                return React.cloneElement(field.component, {
                    value: currentValue,
                    onChange: (v) => handleChange(field.name, v),
                    formData: formData, // 🛑 Pasar formData completo para el resumen
                    ...field.inputProps,
                });
            case 'file':
                return (_jsx("input", { type: "file", ...commonProps, onChange: onFileChange }));
            case 'table': // 🛑 PASAR PROPIEDADES DE PAGINACIÓN
                if (!field.columnsDefinition)
                    return null;
                return (_jsx(DynamicTable, { fieldName: field.name, columnsDefinition: field.columnsDefinition, value: currentValue || [], 
                    // 🔥 CORRECCIÓN: Pasar las propiedades de paginación
                    paginationEnabled: field.paginationEnabled, initialRowsPerPage: field.initialRowsPerPage }));
            case 'tree': // 🛑 NUEVO CASO 'tree'
                if (!field.treeNodes)
                    return null;
                return (_jsx(DynamicTreeSelect, { fieldName: field.name, treeNodes: field.treeNodes, 
                    // Aseguramos que el valor sea un array de strings (el tipo de dato esperado)
                    value: currentValue || [] }));
            default: // text, email, password, number, date
                return (_jsx("input", { type: field.type, ...commonProps, value: currentValue ?? '', onChange: onCommonChange }));
        }
    };
    // 4. Estructura de Campo (Ajuste para ocultar la etiqueta para la tabla)
    if (field.type === 'checkbox') {
        return (_jsxs("div", { className: "dynamic-form-group checkbox-wrapper", children: [_jsx("div", { className: "dynamic-form-checkbox-group", children: renderInput() }), _jsxs("label", { htmlFor: field.name, children: [field.label, field.required && _jsx("span", { className: "required-star", children: "*" })] })] }));
    }
    // Renderizado especial para 'table': El componente de tabla maneja su propio diseño y label.
    if (field.type === 'table') {
        return (_jsxs("div", { className: "dynamic-form-group dynamic-form-table-group", children: [_jsxs("label", { children: [field.label, field.required && _jsx("span", { className: "required-star", children: "*" })] }), renderInput(), field.helperText && _jsx("small", { className: "dynamic-form-helper-text", children: field.helperText })] }));
    }
    // Renderizado estándar
    return (_jsxs("div", { className: "dynamic-form-group", children: [_jsxs("label", { htmlFor: field.name, children: [field.label, field.required && _jsx("span", { className: "required-star", children: "*" })] }), renderInput(), field.helperText && _jsx("small", { className: "dynamic-form-helper-text", children: field.helperText })] }));
};
export default DynamicField;
