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
 * Esta versión está optimizada para formularios de vista única.
 */
const DynamicSection: React.FC<DynamicSectionProps> = ({ section }) => {
    
    // Generamos una clase CSS dinámica para el layout
    // Ejemplo: columns: 2 generará "dynamic-section-columns-2"
    const layoutClass = `dynamic-section-columns-${section.columns}`;

   
      return (
        // La sección ahora es solo un contenedor para el fieldset
        <section className={`dynamic-form-section ${layoutClass}`}>
            
            {/* 🛑 CAMBIO CLAVE: Usamos FIELDSET y LEGEND nativos */}
            <fieldset className="dynamic-fieldset">
                
                {/* LEGEND es el título que flota sobre la línea del fieldset */}
                {section.title && <legend className="dynamic-legend">{section.title}</legend>}

                {/* Contenedor de los campos (AHORA DENTRO DEL FIELDSET) */}
                <div className="dynamic-section-fields-grid">
                    {/* Iteramos y renderizamos los campos, incluyendo 'table' y 'nestedForm' */}
                    {section.fields.map(field => (
                        <DynamicField key={field.name} field={field} />
                    ))}
                </div>
            </fieldset>
        </section>
    );
};

export default DynamicSection;