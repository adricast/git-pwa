import React from 'react';
import type { FormSection } from './interface';
interface DynamicSectionProps {
    section: FormSection;
}
/**
 * Componente que renderiza un grupo de campos y aplica el layout de columnas
 * definido en la configuración de la sección.
 * Esta versión está optimizada para formularios de vista única.
 */
declare const DynamicSection: React.FC<DynamicSectionProps>;
export default DynamicSection;
