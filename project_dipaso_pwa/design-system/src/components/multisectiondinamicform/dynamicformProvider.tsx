// src/components/forms/dynamicformProvider.tsx

import React from 'react';
import { 
    type DynamicFormProviderProps 
} from './interface'; // Ajusta la ruta
import { useDynamicForm } from './usedynamicform'; // Ajusta la ruta
import { DynamicFormContext } from './dynamicformContext'; // Ajusta la ruta
// Importamos los subcomponentes necesarios para renderizar la estructura completa
import DynamicSection from './dynamicsection'; // Asegúrate que esta ruta sea correcta
// 🛑 Eliminamos la importación de CSSProperties ya que no usaremos más estilos en línea
// import type { CSSProperties } from 'react'; 


// 🛑 ELIMINAMOS el objeto navigationButtonStyle


/**
 * Componente principal que envuelve el formulario.
 * Inicializa el estado, la lógica y proporciona el contexto a todos los campos hijos.
 */
const DynamicFormProvider: React.FC<DynamicFormProviderProps> = ({
    sections,
    initialData,
    onSubmit,
    buttonText = 'Enviar', // Destructuramos buttonText con un valor por defecto
    children, 
    actions = [], 
    className, // Destructuramos className
}) => {
    
    // 1. Usar el hook de lógica para obtener el contexto
    const formContextValue = useDynamicForm({ 
        sections, 
        initialData, 
        onSubmit 
    });

    // 🛑 2. Desestructuramos los valores de Paginación y Validez
    const {
        handleSubmit,
        isFormValid,
        currentStep,
        totalSteps,
        nextStep,
        prevStep,
        isCurrentStepValid,
    } = formContextValue;

    // 3. Renderizar el Contexto
    return (
        <DynamicFormContext.Provider value={formContextValue}>
            
            {/* Renderizar el elemento <form> real y manejar el envío */}
            <form 
                onSubmit={handleSubmit} 
                className={`dynamic-form-container ${className || ''}`}
            >
                
                {/* 🛑 INDICADOR DE PASOS (Paginación 1 - 2 - 3...) */}
                {totalSteps > 1 && (
                    <div className="form-steps-indicator">
                        {sections.map((section, index) => {
                            const isActive = index === currentStep;
                            
                            // Clases para el paso
                            let stepClasses = 'step-item';
                            if (isActive) {
                                stepClasses += ' step-item-active';
                            }
                            if (section.hideTitleInSteps) {
                                stepClasses += ' step-item-number-only';
                            }
                            
                            // Lógica de visualización
                            const stepTitle = section.title || `Paso ${index + 1}`; 
                            
                            // Contenido que se mostrará en el paso
                            const content = section.hideTitleInSteps ? 
                                // Muestra solo el número si la opción está activa
                                `${index + 1}` : 
                                // Muestra el número y el título (comportamiento por defecto)
                                `${index + 1}. ${stepTitle}`;

                            return (
                                <span 
                                    key={index} 
                                    className={stepClasses}
                                    // Utiliza el título como tooltip (title de HTML)
                                    title={stepTitle} 
                                >
                                    {content}
                                </span>
                            );
                        })}
                    </div>
                )}
                
                {/* 🛑 RENDERIZAR SOLO LA SECCIÓN ACTUAL */}
                {sections.length > 0 && (
                    <DynamicSection section={sections[currentStep]} />
                )}

                {/* Contenido adicional que el usuario quiera agregar aquí */}
                {children}

                {/* 🟢 CONTROLES DE NAVEGACIÓN Y BOTONES PERSONALIZADOS */}
                {/* Usamos la clase principal para el contenedor de acciones */}
                <div className="dynamic-form-actions-wrapper">
                    
                    {/* 1. Botón ANTERIOR */}
                    {/* El div interno que separa 'Anterior' de los demás no es necesario si usamos justify-content: space-between 
                        en .dynamic-form-actions-wrapper. Lo omitimos y usamos una clase.
                    */}
                    <button 
                        type="button" 
                        onClick={prevStep} 
                        disabled={currentStep === 0}
                        // Usamos la clase base y la secundaria para el estilo de "Anterior"
                        className="dynamic-form-submit-btn dynamic-form-submit-btn--secondary"
                        style={{ 
                            // ⚠️ Mantenemos este estilo en línea ya que es una lógica de presentación condicional.
                            visibility: currentStep === 0 ? 'hidden' : 'visible', 
                        }}
                    >
                        &lt; Anterior
                    </button>


                    {/* 2. Botones personalizados + Siguiente/Enviar */}
                    {/* Creamos un div para agrupar las acciones y Siguiente/Enviar (para layout responsive en móvil) */}
                    <div className="dynamic-form-submit-group">
                        
                        {/* Botones personalizados (Ej: Cancelar, Limpiar) */}
                        {actions.map((btn, idx) => {
                             // Lógica para determinar la clase del botón de acción
                            let buttonClass = '';

                            if (btn.type === 'submit') {
                                buttonClass = 'dynamic-form-submit-btn--primary';
                            } else if (btn.outlined) {
                                // Para botones 'outlined' se podría usar la clase 'secondary' si tienes estilos definidos para ella
                                // o una clase específica como 'dynamic-form-submit-btn--outlined' si la defines en SCSS.
                                // Usaremos 'secondary' y si necesita colores específicos, se le pasa un estilo en línea condicional.
                                buttonClass = 'dynamic-form-submit-btn--secondary';
                            } else {
                                buttonClass = 'dynamic-form-submit-btn--secondary'; // Default para acciones que no son Submit
                            }

                            // ⚠️ Dejamos un estilo en línea **condicional** solo si el usuario especifica un color
                            // Esto permite que el SCSS maneje la mayoría de los casos (primary/secondary)
                            const customStyle = (btn.color || btn.textColor || btn.outlined) ? {
                                // Sobrescribir colores solo si se especifican en las props
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
                                    style={customStyle} // Aplicamos solo si hay estilos personalizados
                                >
                                    {btn.label}
                                </button>
                            )
                        })}

                        {/* 🛑 Botón SIGUIENTE o ENVIAR (Siempre usa el estilo primario) */}
                        {currentStep < totalSteps - 1 ? (
                            // Botón Siguiente
                            <button 
                                type="button" 
                                onClick={nextStep} 
                                disabled={!isCurrentStepValid}
                                className="dynamic-form-submit-btn dynamic-form-submit-btn--primary"
                            >
                                Siguiente &gt;
                            </button>
                        ) : (
                            // Botón Enviar (Submit)
                            <button 
                                type="submit" 
                                disabled={!isFormValid} // Deshabilita si la forma completa no es válida
                                // Usaremos la clase Primaria para el botón final, asumiendo que el SCSS maneja el color final (Verde)
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