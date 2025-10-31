import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import DynamicField from './dynamicfield'; // Importamos el componente de campo individual
/**
 * Componente que renderiza un grupo de campos y aplica el layout de columnas
 * definido en la configuración de la sección.
 * Esta versión está optimizada para formularios de vista única.
 */
const DynamicSection = ({ section }) => {
    // Generamos una clase CSS dinámica para el layout
    // Ejemplo: columns: 2 generará "dynamic-section-columns-2"
    const layoutClass = `dynamic-section-columns-${section.columns}`;
    return (
    // La sección ahora es solo un contenedor para el fieldset
    _jsx("section", { className: `dynamic-form-section ${layoutClass}`, children: _jsxs("fieldset", { className: "dynamic-fieldset", children: [section.title && _jsx("legend", { className: "dynamic-legend", children: section.title }), _jsx("div", { className: "dynamic-section-fields-grid", children: section.fields.map(field => (_jsx(DynamicField, { field: field }, field.name))) })] }) }));
};
export default DynamicSection;
