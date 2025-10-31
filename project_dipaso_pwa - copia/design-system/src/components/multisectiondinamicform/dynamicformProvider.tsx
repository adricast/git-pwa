// 📁 src/components/forms/dynamicformProvider.tsx (CORRECCIÓN FINAL)

import React from 'react';
import { 
    type DynamicFormProviderProps 
} from './interface'; 
import { useDynamicForm } from './usedynamicform'; 
import { DynamicFormContext } from './dynamicformContext'; 
import DynamicSection from './dynamicsection'; 


/**
 * Componente principal que envuelve el formulario.
 */
const DynamicFormProvider: React.FC<DynamicFormProviderProps> = ({
    sections,
    initialData,
    onSubmit,
    buttonText = 'Enviar', 
    children, 
    actions = [], 
    className, 
    // 🔥 Capturamos la nueva propiedad
    singlePage = false, 
}) => {
    
    const formContextValue = useDynamicForm({ 
        sections, 
        initialData, 
        onSubmit 
    });

    const {
        handleSubmit,
        isFormValid,
        currentStep,
        totalSteps,
        nextStep,
        prevStep,
        isCurrentStepValid,
    } = formContextValue;

    // 🛑 DEFINICIÓN DE HANDLER CRÍTICA: Resuelve el error 'Cannot find name'
    const handleFinalSubmitClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        // Previene el submit nativo del botón
        e.preventDefault(); 
        
        // El hook useDynamicForm ya contiene toda la lógica de validación (incluida la de tablas)
        if (isFormValid) {
            // Llama al manejador de envío principal que a su vez llama a onSubmit(formData)
            handleSubmit(e as unknown as React.FormEvent); 
        }
    };
    // 🛑 FIN DE LA DEFINICIÓN DE HANDLER CRÍTICA

    // 🔥 Bandera para saber si estamos en modo paginado (más de 1 paso y no es singlePage)
    const isMultiStep = !singlePage && totalSteps > 1;


    return (
        <DynamicFormContext.Provider value={formContextValue}>
            
            <form 
                // CRÍTICO: El evento onSubmit del FORM aún debe llamar a handleSubmit
                onSubmit={handleSubmit} 
                className={`dynamic-form-container ${className || ''} ${singlePage ? 'single-page-mode' : ''}`}
            >
                
                {/* 🛑 INDICADOR DE PASOS (Solo visible si es Multi-Step) */}
                {isMultiStep && (
                    <div className="form-steps-indicator">
                        {sections.map((section, index) => {
                            const isActive = index === currentStep;
                            let stepClasses = 'step-item';
                            if (isActive) { stepClasses += ' step-item-active'; }
                            if (section.hideTitleInSteps) { stepClasses += ' step-item-number-only'; }
                            
                            const stepTitle = section.title || `Paso ${index + 1}`; 
                            const content = section.hideTitleInSteps ? `${index + 1}` : `${index + 1}. ${stepTitle}`;

                            return (
                                <span key={index} className={stepClasses} title={stepTitle}>
                                    {content}
                                </span>
                            );
                        })}
                    </div>
                )}
                
                {/* 🛑 RENDERIZADO CONDICIONAL DE SECCIONES */}
                {sections.length > 0 && (
                    <div className="dynamic-section-wrapper">
                        {/* 🔥 Renderiza TODAS las secciones si es singlePage, o solo la actual si es Multi-Step */}
                        {singlePage ? (
                            sections.map((section, index) => (
                                <DynamicSection key={index} section={section} />
                            ))
                        ) : (
                            <DynamicSection section={sections[currentStep]} />
                        )}
                    </div>
                )}

                {children}

                {/* 🟢 CONTROLES DE NAVEGACIÓN Y BOTONES PERSONALIZADOS */}
                <div className="dynamic-form-actions-wrapper">
                    
                    {/* Botón ANTERIOR (Solo si es Multi-Step) */}
                    {isMultiStep && (
                        <button 
                            type="button" 
                            onClick={prevStep} 
                            disabled={currentStep === 0}
                            className="dynamic-form-submit-btn dynamic-form-submit-btn--secondary"
                            style={{ visibility: currentStep === 0 ? 'hidden' : 'visible' }}
                        >
                            &lt; Anterior
                        </button>
                    )}


                    {/* 2. Botones personalizados + Siguiente/Enviar */}
                    <div className="dynamic-form-submit-group">
                        
                        {/* Botones personalizados (Mapeo sin cambios) */}
                        {actions.map((btn, idx) => {
                             let buttonClass = '';
                             if (btn.type === 'submit') { buttonClass = 'dynamic-form-submit-btn--primary'; } else { buttonClass = 'dynamic-form-submit-btn--secondary'; }
                             const customStyle = (btn.color || btn.textColor || btn.outlined) ? {
                                 backgroundColor: btn.outlined ? 'transparent' : (btn.color || undefined),
                                 color: btn.outlined ? (btn.color || undefined) : (btn.textColor || undefined),
                                 border: btn.outlined ? `1px solid ${btn.color || 'var(--default-color)'}` : 'none',
                             } : {};

                             return (
                                 <button
                                     key={`action-${idx}`}
                                     type={btn.type || 'button'}
                                     onClick={btn.onClick}
                                     disabled={btn.disabled}
                                     className={`dynamic-form-submit-btn ${buttonClass}`}
                                     style={customStyle} 
                                 >
                                     {btn.label}
                                 </button>
                             )
                        })}

                        {/* 🛑 Botón SIGUIENTE o ENVIAR */}
                        {/* El botón SIGUIENTE solo se muestra si es Multi-step Y NO es el último paso. */}
                        {isMultiStep && currentStep < totalSteps - 1 ? (
                            // Botón Siguiente (Navegación)
                            <button 
                                type="button" 
                                onClick={nextStep} 
                                disabled={!isCurrentStepValid}
                                className="dynamic-form-submit-btn dynamic-form-submit-btn--primary"
                            >
                                Siguiente &gt;
                            </button>
                        ) : (
                            // 🛑 Botón Enviar (Final o SinglePage)
                            <button 
                                type="button" 
                                onClick={handleFinalSubmitClick} // Usa el handler definido arriba
                                disabled={!isFormValid} 
                                className="dynamic-form-submit-btn dynamic-form-submit-btn--primary" 
                            >
                                {buttonText}
                            </button>
                        )}
                    </div>
                </div>
            </form>
        </DynamicFormContext.Provider>
    );
};

export default DynamicFormProvider;