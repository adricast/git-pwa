import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// ✅ RUTA CORREGIDA: De `./dynamicformContext` a `../../contexts/dynamicformContext`
import { useDynamicFormContext } from './dynamicformContext';
// 🆕 AGREGADO: Necesario para renderizar las secciones internas del formulario anidado
import DynamicSection from './dynamicsection';
/**
 * Componente que renderiza un campo individual (input, select, checkbox, etc.)
 * y lo conecta al estado del formulario a través del contexto.
 */
const DynamicField = ({ field }) => {
    // 1. Consumir el Contexto y obtener datos
    const { formData, handleChange } = useDynamicFormContext();
    const currentValue = formData[field.name];
    // [Avanzado] Lógica de visibilidad condicional
    // Si la función isVisible existe, la ejecuta para determinar si el campo debe ser visible.
    const isVisible = field.isVisible ? field.isVisible(formData) : true;
    if (!isVisible)
        return null;
    // 2. Handlers y Props Comunes
    // Handler general para inputs de texto, número, select y textarea
    const onCommonChange = (e) => {
        // El valor (e.target.value) se envía al hook, donde se procesan las conversiones a number/string
        handleChange(field.name, e.target.value);
    };
    // Handler especial para checkboxes
    const onCheckboxChange = (e) => {
        // Para checkbox, el valor es booleano (e.target.checked)
        handleChange(field.name, e.target.checked);
    };
    // Handler especial para date (el hook se encarga del formato)
    const onDateChange = (e) => {
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
    const renderInput = () => {
        switch (field.type) {
            case 'select':
                return (_jsx("select", { ...commonProps, value: currentValue ?? '', onChange: onCommonChange, children: field.options?.map(option => (_jsx("option", { value: option.value, children: option.label }, option.value))) }));
            case 'textarea':
                return (_jsx("textarea", { ...commonProps, value: currentValue ?? '', onChange: onCommonChange }));
            case 'checkbox':
                return (
                // El valor del checkbox es booleano
                _jsx("input", { type: "checkbox", ...commonProps, checked: currentValue === true, onChange: onCheckboxChange, 
                    // Quitamos la clase de estilo base para que el CSS de checkbox aplique
                    className: 'dynamic-form-checkbox' }));
            case 'date':
                return (_jsx("input", { type: "date", ...commonProps, 
                    // Formato de fecha esperado por el input type="date"
                    value: currentValue || '', onChange: onDateChange }));
            case 'custom':
                // Si es un componente custom, lo renderizamos y le pasamos los datos
                return field.component ? (_jsx(field.component, { value: currentValue, onChange: handleChange, formData: formData, field: field })) : (_jsx("div", { className: 'dynamic-form-error', children: "Componente custom no definido." }));
            case 'radio':
                return (_jsx("div", { className: "dynamic-form-radio-group", children: field.options?.map(option => (_jsxs("label", { className: "dynamic-form-radio-label", children: [_jsx("input", { type: "radio", ...commonProps, value: option.value, checked: currentValue === option.value, onChange: onCommonChange }), option.label] }, option.value))) }));
            // 🆕 CASO AGREGADO Y CORREGIDO: Renderizado de Formularios Anidados
            case 'nestedForm': { // 💡 FIX: Abrimos bloque de código para evitar "no-case-declarations"
                // Hacemos un casting seguro para acceder a 'sections'
                const nestedField = field;
                return (_jsxs("div", { className: "dynamic-form-nested-container", children: [nestedField.label && _jsx("h4", { children: nestedField.label }), nestedField.sections.map((section, index) => (_jsx(DynamicSection, { section: section }, index)))] }));
            } // 💡 FIX: Cerramos bloque de código
            default: // text, email, password, number, file, etc.
                return (_jsx("input", { type: field.type, ...commonProps, value: currentValue ?? '', onChange: onCommonChange }));
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
        return (_jsxs("div", { className: "dynamic-form-group checkbox-wrapper", children: [_jsx("div", { className: "dynamic-form-checkbox-group", children: renderInput() }), _jsxs("label", { htmlFor: field.name, children: [field.label, field.required && _jsx("span", { className: "required-star", children: "*" })] })] }));
    }
    // Renderizado estándar para la mayoría de los campos (Label encima del input)
    return (_jsxs("div", { className: "dynamic-form-group", children: [_jsxs("label", { htmlFor: field.name, children: [field.label, field.required && _jsx("span", { className: "required-star", children: "*" })] }), renderInput()] }));
};
export default DynamicField;
