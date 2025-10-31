import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useDynamicForm } from './usedynamicform';
import { DynamicFormContext } from './dynamicformContext';
import DynamicSection from './dynamicsection';
/**
 * Componente principal que envuelve el formulario.
 */
const DynamicFormProvider = ({ sections, initialData, onSubmit, buttonText = 'Enviar', children, actions = [], className, 
// 🔥 Capturamos la nueva propiedad
singlePage = false, }) => {
    const formContextValue = useDynamicForm({
        sections,
        initialData,
        onSubmit
    });
    const { handleSubmit, isFormValid, currentStep, totalSteps, nextStep, prevStep, isCurrentStepValid, } = formContextValue;
    // 🛑 DEFINICIÓN DE HANDLER CRÍTICA: Resuelve el error 'Cannot find name'
    const handleFinalSubmitClick = (e) => {
        // Previene el submit nativo del botón
        e.preventDefault();
        // El hook useDynamicForm ya contiene toda la lógica de validación (incluida la de tablas)
        if (isFormValid) {
            // Llama al manejador de envío principal que a su vez llama a onSubmit(formData)
            handleSubmit(e);
        }
    };
    // 🛑 FIN DE LA DEFINICIÓN DE HANDLER CRÍTICA
    // 🔥 Bandera para saber si estamos en modo paginado (más de 1 paso y no es singlePage)
    const isMultiStep = !singlePage && totalSteps > 1;
    return (_jsx(DynamicFormContext.Provider, { value: formContextValue, children: _jsxs("form", { 
            // CRÍTICO: El evento onSubmit del FORM aún debe llamar a handleSubmit
            onSubmit: handleSubmit, className: `dynamic-form-container ${className || ''} ${singlePage ? 'single-page-mode' : ''}`, children: [isMultiStep && (_jsx("div", { className: "form-steps-indicator", children: sections.map((section, index) => {
                        const isActive = index === currentStep;
                        let stepClasses = 'step-item';
                        if (isActive) {
                            stepClasses += ' step-item-active';
                        }
                        if (section.hideTitleInSteps) {
                            stepClasses += ' step-item-number-only';
                        }
                        const stepTitle = section.title || `Paso ${index + 1}`;
                        const content = section.hideTitleInSteps ? `${index + 1}` : `${index + 1}. ${stepTitle}`;
                        return (_jsx("span", { className: stepClasses, title: stepTitle, children: content }, index));
                    }) })), sections.length > 0 && (_jsx("div", { className: "dynamic-section-wrapper", children: singlePage ? (sections.map((section, index) => (_jsx(DynamicSection, { section: section }, index)))) : (_jsx(DynamicSection, { section: sections[currentStep] })) })), children, _jsxs("div", { className: "dynamic-form-actions-wrapper", children: [isMultiStep && (_jsx("button", { type: "button", onClick: prevStep, disabled: currentStep === 0, className: "dynamic-form-submit-btn dynamic-form-submit-btn--secondary", style: { visibility: currentStep === 0 ? 'hidden' : 'visible' }, children: "< Anterior" })), _jsxs("div", { className: "dynamic-form-submit-group", children: [actions.map((btn, idx) => {
                                    let buttonClass = '';
                                    if (btn.type === 'submit') {
                                        buttonClass = 'dynamic-form-submit-btn--primary';
                                    }
                                    else {
                                        buttonClass = 'dynamic-form-submit-btn--secondary';
                                    }
                                    const customStyle = (btn.color || btn.textColor || btn.outlined) ? {
                                        backgroundColor: btn.outlined ? 'transparent' : (btn.color || undefined),
                                        color: btn.outlined ? (btn.color || undefined) : (btn.textColor || undefined),
                                        border: btn.outlined ? `1px solid ${btn.color || 'var(--default-color)'}` : 'none',
                                    } : {};
                                    return (_jsx("button", { type: btn.type || 'button', onClick: btn.onClick, disabled: btn.disabled, className: `dynamic-form-submit-btn ${buttonClass}`, style: customStyle, children: btn.label }, `action-${idx}`));
                                }), isMultiStep && currentStep < totalSteps - 1 ? (
                                // Botón Siguiente (Navegación)
                                _jsx("button", { type: "button", onClick: nextStep, disabled: !isCurrentStepValid, className: "dynamic-form-submit-btn dynamic-form-submit-btn--primary", children: "Siguiente >" })) : (
                                // 🛑 Botón Enviar (Final o SinglePage)
                                _jsx("button", { type: "button", onClick: handleFinalSubmitClick, disabled: !isFormValid, className: "dynamic-form-submit-btn dynamic-form-submit-btn--primary", children: buttonText }))] })] })] }) }));
};
export default DynamicFormProvider;
