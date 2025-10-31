import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/ReusableTable.tsx
import { useState, useCallback, useEffect } from "react";
const ReusableTable = ({ moduleName, data, rowKey, columns, buttons = [], selectableField, onRowSelect, styles = {}, selectedRows: controlledSelectedRows, setSelectedRows: setControlledSelectedRows, }) => {
    // Manejo del estado interno/externo para filas seleccionadas
    const [internalSelectedRows, setInternalSelectedRows] = useState(controlledSelectedRows || []);
    // Sincroniza el estado interno si las props cambian (para control externo)
    useEffect(() => {
        if (controlledSelectedRows) {
            setInternalSelectedRows(controlledSelectedRows);
        }
    }, [controlledSelectedRows]);
    // Determinar qué estado usar
    const currentSelectedRows = controlledSelectedRows || internalSelectedRows;
    const setSelection = setControlledSelectedRows || setInternalSelectedRows;
    const handleRowClick = useCallback((row) => {
        if (!selectableField)
            return;
        const isSelected = currentSelectedRows.includes(row);
        let newSelection;
        // Si la fila ya está seleccionada, deseleccionarla; de lo contrario, seleccionarla
        if (isSelected) {
            newSelection = currentSelectedRows.filter((r) => r !== row);
        }
        else {
            newSelection = [...currentSelectedRows, row];
        }
        setSelection(newSelection);
        // Si se proporciona un callback para una sola fila, envíala
        if (onRowSelect) {
            // Si es selección múltiple, onRowSelect puede no ser adecuado, pero se mantiene la lógica original:
            onRowSelect(newSelection.length > 0 ? newSelection[0] : null);
        }
    }, [selectableField, currentSelectedRows, setSelection, onRowSelect]);
    const isRowSelected = (row) => currentSelectedRows.includes(row);
    return (_jsxs("div", { className: "table-container", children: [_jsx("h2", { className: "table-title", children: moduleName }), _jsx("div", { className: "table-actions", children: buttons.map((btn, idx) => {
                    const labelLower = btn.label.toLowerCase();
                    const isDelete = labelLower === "eliminar";
                    const isEdit = labelLower === "editar";
                    // Lógica de deshabilitación basada en la selección
                    const disabled = (isDelete && currentSelectedRows.length === 0) ||
                        (isEdit && currentSelectedRows.length !== 1);
                    // Clases basadas en el tipo de botón para estilos SCSS
                    let btnClass = btn.color || 'btn-default';
                    if (isDelete)
                        btnClass = 'btn-delete';
                    else if (isEdit)
                        btnClass = 'btn-edit';
                    return (_jsx("button", { onClick: () => btn.onClick(currentSelectedRows), className: `table-btn ${btnClass} ${btn.textColor || 'text-light'}`, disabled: disabled, children: btn.label }, idx));
                }) }), _jsx("div", { className: "table-wrapper", children: _jsxs("table", { className: "data-table", children: [_jsx("thead", { className: "table-head", children: _jsxs("tr", { children: [selectableField && _jsx("th", { className: "checkbox-col" }), columns.map((col) => (_jsx("th", { className: "table-header-cell", children: col.header }, col.field)))] }) }), _jsx("tbody", { className: "table-body", children: data.map((row) => (_jsxs("tr", { onClick: () => handleRowClick(row), className: `table-row ${selectableField ? 'row-clickable' : ''} ${isRowSelected(row)
                                    ? styles.selectedRowClass || "row-selected"
                                    : styles.rowHoverClass || "row-hover"}`, children: [selectableField && (_jsx("td", { className: "table-cell table-checkbox-cell", children: _jsx("input", { type: "checkbox", checked: isRowSelected(row), readOnly: true, className: "custom-checkbox" }) })), columns.map((col) => (_jsx("td", { className: "table-cell", children: col.bodyTemplate ? col.bodyTemplate(row) : row[col.field] }, col.field)))] }, row[rowKey]))) })] }) })] }));
};
export default ReusableTable;
