// 📁 src/components/forms/DynamicSection.tsx (¡CORRECCIÓN DE REGEX FINAL!)

import React from 'react';
import type { FormSection } from './interface'; 
import DynamicField from './dynamicfield'; 
import { useDynamicFormContext } from './dynamicformContext'; 

interface DynamicSectionProps {
    section: FormSection;
}

/**
 * Función auxiliar para eliminar el prefijo numérico o de paso al inicio del título.
 * Esta versión es altamente flexible para eliminar números, puntos, guiones y espacios.
 */
const cleanTitlePrefix = (title: string): string => {
    // ✅ Regex más robusta:
    // 1. Busca uno o más dígitos al inicio (^\d+).
    // 2. Seguido de cero o más caracteres que NO sean letras/números/guiones [^a-zA-Z0-9-]*
    // 3. Y elimina cualquier espacio en blanco subsiguiente (\s*).
    const regex = /^\d+[^a-zA-Z0-9-]*\s*/; 
    
    // Si la limpieza anterior no funcionó, probaremos una limpieza simple de cualquier dígito/punto inicial
    const result = title.replace(regex, '').trim();

    // Si el título empieza AÚN con un número (ej. si la Regex inicial falló), probamos un método más simple
    if (result.match(/^\d+\.\s*/)) {
        return result.replace(/^\d+\.\s*/, '').trim();
    }
    
    return result;
};


const DynamicSection: React.FC<DynamicSectionProps> = ({ section }) => {
    
    const { currentStep, sections } = useDynamicFormContext();
    const currentSectionIndex = sections.findIndex(s => s.title === section.title); 

    const layoutClass = `dynamic-section-columns-${section.columns}`;
    
    // 1. Obtener el título original de la configuración (Ej: "1. Datos Personales...")
    const sectionTitleOriginal = section.title || `Paso sin título`; 
    
    // 2. ✅ CORRECCIÓN: Limpiar el título.
    const displayTitle = cleanTitlePrefix(sectionTitleOriginal);
    
    // 3. Usamos el índice de la sección para el círculo
    const stepNumber = currentSectionIndex !== -1 ? currentSectionIndex + 1 : currentStep + 1;
    console.log('sections'+stepNumber);

    return (
        // Contenedor principal
        <fieldset className={`dynamic-form-section ${layoutClass}`}>
            
            {displayTitle && (
                // Cabecera como LEGEND
                <legend className="section-header">
                    
                    {/* 🛑 CÍRCULO: Elemento que muestra el número */}
                    
                    
                    {/* 🛑 TÍTULO DE LA SECCIÓN (Texto limpio) */}
                    <h3 className="section-title">
                        {/* ✅ AQUI SOLO VA EL TEXTO DESCRIPTIVO */}
                        {displayTitle} 
                    </h3>

                </legend>
            )}

            {/* Contenedor de los campos */}
            <div className="dynamic-section-fields-grid">
                {section.fields.map(field => (
                    <DynamicField key={field.name} field={field} />
                ))}
            </div>
        </fieldset>
    );
};

export default DynamicSection;