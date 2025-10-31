import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/ReusableTable/ReusableTable.tsx
import { useState, useCallback, useEffect } from "react";
import { FaChevronLeft, FaChevronRight, FaSearch } from "react-icons/fa";
import { useTableLogic } from "./../reusabletable/tablelogic";
//import "./../../styles/reusabletableLayout.sass"; 
const ReusableTable = ({ moduleName, data, rowKey, columns, buttons = [], selectableField, onRowSelect, styles = {}, selectedRows: controlledSelectedRows, setSelectedRows: setControlledSelectedRows, initialRowsPerPage = 10, }) => {
    // --- Lógica de la tabla (Hook) ---
    const { searchTerm, setSearchTerm, currentPage, rowsPerPage, setRowsPerPage, totalPages, totalRows, paginatedData, handlePageChange, } = useTableLogic(data, columns, initialRowsPerPage);
    // --- Lógica de la Selección (Estado) ---
    const [internalSelectedRows, setInternalSelectedRows] = useState(controlledSelectedRows || []);
    const currentSelectedRows = controlledSelectedRows || internalSelectedRows;
    const setSelection = setControlledSelectedRows || setInternalSelectedRows;
    // Sincroniza el estado interno si las props de control cambian
    useEffect(() => {
        if (controlledSelectedRows) {
            setInternalSelectedRows(controlledSelectedRows);
        }
    }, [controlledSelectedRows]);
    const handleRowClick = useCallback((row) => {
        if (!selectableField)
            return;
        const isSelected = currentSelectedRows.includes(row);
        let newSelection;
        if (isSelected) {
            newSelection = currentSelectedRows.filter((r) => r !== row);
        }
        else {
            newSelection = [...currentSelectedRows, row];
        }
        setSelection(newSelection);
        if (onRowSelect) {
            onRowSelect(newSelection.length > 0 ? newSelection[0] : null);
        }
    }, [selectableField, currentSelectedRows, setSelection, onRowSelect]);
    const isRowSelected = (row) => currentSelectedRows.includes(row);
    return (_jsxs("div", { className: "table-container", children: [_jsx("h2", { className: "table-title", children: moduleName }), _jsxs("div", { className: "table-header-controls", children: [_jsx("div", { className: "table-actions", children: buttons.map((btn, idx) => {
                            const shouldRender = btn.isVisible
                                ? btn.isVisible(currentSelectedRows)
                                : true; // Por defecto, si no se define isVisible, el botón es visible.
                            if (!shouldRender)
                                return null; // Si no debe renderizarse, salimos del map.
                            const labelLower = btn.label.toLowerCase();
                            const isDelete = labelLower === "eliminar";
                            const isEdit = labelLower === "editar";
                            const disabled = (isDelete && currentSelectedRows.length === 0) ||
                                (isEdit && currentSelectedRows.length !== 1);
                            let btnClass = btn.color || 'btn-default';
                            if (isDelete)
                                btnClass = 'btn-delete';
                            else if (isEdit)
                                btnClass = 'btn-edit';
                            return (_jsxs("button", { onClick: () => btn.onClick(currentSelectedRows), className: `table-btn ${btnClass} ${btn.textColor || 'text-light'}`, disabled: disabled, children: [btn.icon && (_jsx("span", { style: {
                                            marginRight: '8px',
                                            display: 'flex',
                                            alignItems: 'center'
                                        }, children: btn.icon })), btn.label] }, idx));
                        }) }), _jsxs("div", { className: "search-box", children: [_jsx(FaSearch, { className: "search-icon" }), _jsx("input", { type: "text", placeholder: "Buscar...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "search-input", "aria-label": "Buscar en la tabla" })] })] }), _jsx("div", { className: "table-wrapper", children: _jsxs("table", { className: "data-table", children: [_jsx("thead", { className: "table-head", children: _jsxs("tr", { children: [selectableField && _jsx("th", { className: "checkbox-col" }), columns.map((col) => (_jsx("th", { className: "table-header-cell", children: col.header }, col.field)))] }) }), _jsxs("tbody", { className: "table-body", children: [paginatedData.map((row) => (_jsxs("tr", { onClick: () => handleRowClick(row), className: `table-row ${selectableField ? 'row-clickable' : ''} ${isRowSelected(row)
                                        ? styles.selectedRowClass || "row-selected"
                                        : styles.rowHoverClass || "row-hover"}`, children: [selectableField && (_jsx("td", { className: "table-cell table-checkbox-cell", children: _jsx("input", { type: "checkbox", checked: isRowSelected(row), readOnly: true, className: "custom-checkbox" }) })), columns.map((col) => (_jsx("td", { 
                                            // 1. Aplica la clase para el estilo de enlace si hay handler
                                            className: `table-cell ${col.onCellClick ? 'clickable-cell' : ''}`, onClick: (e) => {
                                                // 2. IMPEDIR la selección de fila si se hace clic en la celda de enlace
                                                e.stopPropagation();
                                                if (col.onCellClick) {
                                                    // 3. Ejecuta la función de click de la columna
                                                    col.onCellClick(row);
                                                }
                                                else {
                                                    // 4. Si no hay handler, permite la selección de fila normal
                                                    handleRowClick(row);
                                                }
                                            }, children: col.bodyTemplate ? col.bodyTemplate(row) : row[col.field] }, col.field)))] }, row[rowKey]))), paginatedData.length === 0 && (_jsx("tr", { children: _jsx("td", { colSpan: columns.length + (selectableField ? 1 : 0), className: "no-data-cell", children: data.length === 0 ? "No hay datos para mostrar." : `No se encontraron resultados para "${searchTerm}"` }) }))] })] }) }), _jsxs("div", { className: "table-footer", children: [_jsxs("div", { className: "pagination-info", children: ["Mostrando ", totalRows === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1, " -", Math.min(currentPage * rowsPerPage, totalRows), " de ", totalRows, " registros"] }), _jsxs("div", { className: "pagination-controls", children: [_jsx("button", { onClick: () => handlePageChange(currentPage - 1), disabled: currentPage === 1, className: "page-btn", children: _jsx(FaChevronLeft, {}) }), _jsxs("span", { className: "page-number", children: ["P\u00E1gina ", currentPage, " de ", totalPages || 1] }), _jsx("button", { onClick: () => handlePageChange(currentPage + 1), disabled: currentPage === totalPages || totalRows === 0, className: "page-btn", children: _jsx(FaChevronRight, {}) })] }), _jsxs("div", { className: "rows-per-page", children: [_jsx("label", { htmlFor: "rows-select", children: "Filas por p\u00E1g.:" }), _jsxs("select", { id: "rows-select", value: rowsPerPage, onChange: (e) => setRowsPerPage(Number(e.target.value)), className: "rows-select", children: [_jsx("option", { value: 5, children: "5" }), _jsx("option", { value: 10, children: "10" }), _jsx("option", { value: 20, children: "20" }), _jsx("option", { value: 50, children: "50" })] })] })] })] }));
};
export default ReusableTable;
