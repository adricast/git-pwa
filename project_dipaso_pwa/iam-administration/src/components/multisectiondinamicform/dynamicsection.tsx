// src/components/forms/DynamicSection.tsx

import React from 'react';
import type { FormSection } from './interface'; // Ajusta la ruta
import DynamicField from './dynamicfield'; // Importamos el componente de campo individual
// 🛑 IMPORTAMOS EL HOOK DEL CONTEXTO PARA OBTENER EL PASO ACTUAL
import { useDynamicFormContext } from './dynamicformContext'; 

interface DynamicSectionProps {
    section: FormSection;
}

/**
 * Componente que renderiza un grupo de campos y aplica el layout de columnas
 * definido en la configuración de la sección.
 */
const DynamicSection: React.FC<DynamicSectionProps> = ({ section }) => {
    
    // 🛑 OBTENER INFORMACIÓN DEL PASO ACTUAL PARA EL ENCABEZADO
    const { currentStep, sections } = useDynamicFormContext();
    const currentSectionIndex = sections.findIndex(s => s.title === section.title); // Buscar el índice

    // Generamos una clase CSS dinámica para el layout
    const layoutClass = `dynamic-section-columns-${section.columns}`;
    
    // Título a usar, si no existe usa un fallback
    const sectionTitle = section.title || `Paso ${currentSectionIndex + 1}`;


    return (
        <section className={`dynamic-form-section ${layoutClass}`}>
            
            {/* Título de la Sección (Siempre renderiza el contenedor del encabezado) */}
            {sectionTitle && (
                // Usamos la clase 'section-header' definida en tu SCSS
                <div className="section-header">
                    
                    {/* 🛑 NÚMERO DEL PASO CON TOOLTIP para móvil */}
                    <div 
                        className="section-step-number" 
                        // Usamos el título como atributo de datos para el tooltip en móvil
                        data-tooltip={sectionTitle} 
                    >
                        {currentSectionIndex !== -1 ? currentSectionIndex + 1 : currentStep + 1}
                    </div>
                    
                    {/* 🛑 TÍTULO DE LA SECCIÓN (Visible solo en Desktop/Tablet) */}
                    {/* Usamos un h3 dentro del div para mantener la semántica y el estilo SCSS */}
                    <h3 className="section-title">
                        {sectionTitle}
                    </h3>

                </div>
            )}

            {/* Contenedor de los campos con el layout de columnas */}
            <div className="dynamic-section-fields-grid">
                {section.fields.map(field => (
                    <DynamicField key={field.name} field={field} />
                ))}
            </div>
        </section>
    );
};

export default DynamicSection;