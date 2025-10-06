// src/components/forms/DynamicSection.tsx

import React from 'react';
import type { FormSection } from './interface'; // Ajusta la ruta
import DynamicField from './dynamicfield'; // Importamos el componente de campo individual

interface DynamicSectionProps {
    section: FormSection;
}

/**
 * Componente que renderiza un grupo de campos y aplica el layout de columnas
 * definido en la configuración de la sección.
 */
const DynamicSection: React.FC<DynamicSectionProps> = ({ section }) => {
    
    // Generamos una clase CSS dinámica para el layout
    // Ejemplo: columns: 2 generará "dynamic-section-columns-2"
    const layoutClass = `dynamic-section-columns-${section.columns}`;

    return (
        <section className={`dynamic-form-section ${layoutClass}`}>
            
            {/* Título de la Sección, si existe */}
            {section.title && <h3>{section.title}</h3>}

            {/* Contenedor de los campos con el layout de columnas */}
            <div className="dynamic-section-fields-grid">
                {section.fields.map(field => (
                    // El campo 'custom' o 'checkbox' se maneja de forma especial 
                    // dentro de DynamicField, incluyendo la visibilidad condicional.
                    <DynamicField key={field.name} field={field} />
                ))}
            </div>
        </section>
    );
};

export default DynamicSection;