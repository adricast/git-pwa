import React from 'react';
import type { FormField } from './interface';
interface DynamicFieldProps {
    field: FormField;
}
/**
 * Componente que renderiza un campo individual (input, select, checkbox, etc.)
 * y lo conecta al estado del formulario a través del contexto.
 */
declare const DynamicField: React.FC<DynamicFieldProps>;
export default DynamicField;
