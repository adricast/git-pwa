import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useDynamicForm } from './usedynamicform';
import { DynamicFormContext } from './dynamicformContext';
import DynamicSection from './dynamicsection';
/**
 * Componente principal que envuelve el formulario.
 * Inicializa el estado, la lógica y proporciona el contexto a todos los campos hijos,
 * ahora en una vista única (no multipasos).
 */
const DynamicFormProvider = ({ 
// ✅ Recibe 'sections'
sections, initialData, onSubmit, buttonText = 'Enviar', children, actions = [], className, }) => {
    // 1. Usar el hook de lógica (ahora adaptado para tablas y formularios anidados)
    const formContextValue = useDynamicForm({
        sections, // Pasamos sections al hook
        initialData,
        onSubmit
    });
    // 2. Destructurar las propiedades de estado
    const { handleSubmit, isFormValid,
    // Las propiedades de paginación han sido eliminadas del hook
     } = formContextValue;
    return (_jsx(DynamicFormContext.Provider, { value: formContextValue, children: _jsxs("form", { onSubmit: handleSubmit, className: `dynamic-form-container ${className || ''}`, children: [_jsx("div", { className: "dynamic-form-all-sections-content", children: sections.map((section, index) => ( // Iteramos sobre las secciones de entrada
                    _jsx(DynamicSection, { section: section }, index))) }), children, _jsxs("div", { className: "dynamic-form-actions-wrapper", children: [actions.map((btn, index) => (_jsx("button", { type: btn.type || 'button', onClick: btn.onClick, disabled: btn.disabled, className: "dynamic-form-btn dynamic-form-btn--secondary", children: btn.label }, index))), _jsx("button", { type: "submit", 
                            // Deshabilitado si el formulario COMPLETO no es válido
                            disabled: !isFormValid, className: "dynamic-form-btn dynamic-form-btn--success", children: buttonText })] })] }) }));
};
export default DynamicFormProvider;
