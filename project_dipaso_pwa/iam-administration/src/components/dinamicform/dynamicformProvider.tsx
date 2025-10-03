import React from 'react';
import { 
    type DynamicFormProviderProps 
} from './interface'; // Ajusta la ruta
import { useDynamicForm } from './usedynamicform'; // Ajusta la ruta
import { DynamicFormContext } from './dynamicformContext'; // Ajusta la ruta
// Importamos los subcomponentes necesarios para renderizar la estructura completa
import DynamicSection from './dynamicsection'; // Asegúrate que esta ruta sea correcta


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

    // 2. Renderizar el Contexto
    return (
        <DynamicFormContext.Provider value={formContextValue}>
            
            {/* 3. Renderizar el elemento <form> real y manejar el envío */}
            <form 
                onSubmit={formContextValue.handleSubmit} 
                // Aplicamos la clase que viene por prop, además de la clase base
                className={`dynamic-form-container ${className || ''}`}
            >
                
                {/* 🛑 Renderizar las secciones dinámicamente */ }
                {sections.map((section, index) => (
                    <DynamicSection key={index} section={section} />
                ))}

                {/* Contenido adicional que el usuario quiera agregar aquí */}
                {children}

                {/* 🟢 Sección de botones parametrizables + Botón de Envío (Guardar) */}
                <div style={{ 
                    display: 'flex', 
                    gap: '12px', 
                    marginTop: '20px', 
                    justifyContent: 'flex-end', // Botones a la derecha
                    paddingTop: '10px',
                    borderTop: '1px solid #eee'
                }}>
                    
                    {/* 1. Botones personalizados (Ej: Cancelar) */}
                    {actions.map((btn, idx) => (
                        <button
                            key={`action-${idx}`}
                            type={btn.type || 'button'}
                            onClick={btn.onClick}
                            disabled={btn.disabled}
                            // Estilos sencillos para que sean funcionales
                            style={{
                                backgroundColor: btn.outlined ? 'transparent' : btn.color || '#6c757d', 
                                color: btn.outlined ? btn.color || '#6c757d' : btn.textColor || '#fff',
                                border: btn.outlined ? `2px solid ${btn.color || '#6c757d'}` : 'none',
                                padding: '10px 18px',
                                borderRadius: '6px',
                                fontWeight: 600,
                                cursor: btn.disabled ? 'not-allowed' : 'pointer',
                                opacity: btn.disabled ? 0.6 : 1,
                                transition: 'all 0.3s ease',
                            }}
                        >
                            {btn.label}
                        </button>
                    ))}

                    {/* 2. Botón de Envío principal (Guardar/Crear/Actualizar) */}
                    <button 
                        type="submit" 
                        disabled={!formContextValue.isFormValid} // Deshabilita si la forma no es válida
                        // Estilos para el botón principal (destacado)
                        style={{
                            backgroundColor: '#007bff', // Azul primario
                            color: '#fff',
                            border: 'none',
                            padding: '10px 18px',
                            borderRadius: '6px',
                            fontWeight: 600,
                            cursor: !formContextValue.isFormValid ? 'not-allowed' : 'pointer',
                            opacity: !formContextValue.isFormValid ? 0.6 : 1,
                            transition: 'all 0.3s ease',
                        }}
                    >
                        {buttonText}
                    </button>
                </div>
            </form>
        </DynamicFormContext.Provider>
    );
};

export default DynamicFormProvider;
