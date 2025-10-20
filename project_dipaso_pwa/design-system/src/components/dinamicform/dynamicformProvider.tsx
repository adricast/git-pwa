// src/components/forms/DynamicFormProvider.tsx

import React from 'react';
import type { 
    DynamicFormProviderProps 
} from './interface'; 
import { useDynamicForm } from './usedynamicform'; 
import { DynamicFormContext } from './dynamicformContext'; 
import DynamicSection from './dynamicsection'; 


/**
 * Componente principal que envuelve el formulario.
 * Inicializa el estado, la lógica y proporciona el contexto a todos los campos hijos,
 * ahora en una vista única (no multipasos).
 */
const DynamicFormProvider: React.FC<DynamicFormProviderProps> = ({
    // ✅ MODIFICADO: Recibe 'sections' en lugar de 'steps'
    sections, 
    initialData,
    onSubmit,
    buttonText = 'Enviar', 
    children, 
    actions = [], 
    className, 
}) => {
    
    // 1. Usar el hook de lógica
    // 💡 NOTA: Esto generará un error de tipado temporal hasta que modifiquemos usedynamicform.tsx
    const formContextValue = useDynamicForm({ 
        sections, // ✅ MODIFICADO: Pasamos sections al hook
        initialData, 
        onSubmit 
    });

    // 2. Destructurar las propiedades de estado
    const { 
        handleSubmit, 
        isFormValid,
        // 🛑 ELIMINADAS: currentStepIndex, isStepValid, goToNextStep, goToPreviousStep, etc.
    } = formContextValue;

    // 3. Lógica de pasos eliminada
    // 🛑 ELIMINADO: currentStep, isFirstStep, isLastStep

    return (
        <DynamicFormContext.Provider value={formContextValue}>
            
            <form 
                onSubmit={handleSubmit} 
                className={`dynamic-form-container ${className || ''}`}
            >
                {/* 🛑 ELIMINADO: El indicador de Stepper */}
                
                {/* 🛑 RENDERIZADO SIMPLIFICADO: Renderiza TODAS las secciones de una vez */}
                <div className="dynamic-form-all-sections-content">
                    {sections.map((section, index) => ( // ✅ Iteramos sobre las secciones de entrada
                        <DynamicSection key={index} section={section} />
                    ))}
                </div>

                {/* Contenido adicional opcional */}
                {children}

                {/* 🛑 BOTONES DE ACCIÓN Y ENVÍO: */}
                <div className="dynamic-form-actions-wrapper">
                    
                    {/* 5a. Botones de acción secundarios (Se mantienen) */}
                    {actions.map((btn, index) => (
                        <button
                            key={index}
                            type={btn.type || 'button'}
                            onClick={btn.onClick}
                            disabled={btn.disabled}
                            className="dynamic-form-btn dynamic-form-btn--secondary"
                        >
                            {btn.label}
                        </button>
                    ))}

                    {/* 🛑 ELIMINADOS: Botones "Anterior" y "Siguiente" */}

                    {/* 5b. Botón de ENVÍO (Único botón principal) */}
                    <button 
                        type="submit" 
                        // Deshabilitado si el formulario COMPLETO (padre e hijos) no es válido
                        disabled={!isFormValid} 
                        className="dynamic-form-btn dynamic-form-btn--success"
                    >
                        {buttonText}
                    </button>
                </div>
            </form>
        </DynamicFormContext.Provider>
    );
};

export default DynamicFormProvider;