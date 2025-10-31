import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// 📁 src/components/forms/DynamicTable.tsx (VERSIÓN FINAL Y COMPLETA)
import { useCallback, useMemo, useEffect, useState } from 'react';
// 🛑 USAMOS useDynamicFormContext
import { useDynamicFormContext } from './dynamicformContext';
// 🛑 Hardcodeamos el ID placeholder (Necesario para la lógica de la 'X')
const DEFAULT_ID_PLACEHOLDER = "00000000-0000-0000-0000-000000000000";
// 🔥 FUNCIÓN AUXILIAR PARA OBTENER LOS VALORES USADOS EN OTRAS FILAS (Para deshabilitar select)
const getUsedValues = (currentFieldName, currentGlobalIndex, tableValue) => {
    const used = new Set();
    tableValue.forEach((row, idx) => {
        // Excluimos la fila actual de la comparación
        if (idx !== currentGlobalIndex) {
            const val = row[currentFieldName];
            if (val) {
                used.add(String(val));
            }
        }
    });
    return used;
};
/**
 * Componente que renderiza una tabla dinámica con soporte para paginación.
 */
const DynamicTable = ({ fieldName, columnsDefinition, value, paginationEnabled = false, initialRowsPerPage = 5, uniqueFieldName, }) => {
    const { handleChange, formData } = useDynamicFormContext();
    const discountRate = formData.discountRate || 0;
    // 🛑 ESTADO DE PAGINACIÓN
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);
    useEffect(() => {
        setCurrentPage(1);
    }, [value.length, rowsPerPage]);
    // 🛑 LÓGICA DE PAGINACIÓN: Slicing de los datos
    const paginatedValue = useMemo(() => {
        if (!paginationEnabled) {
            return value;
        }
        const startIndex = (currentPage - 1) * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;
        return value.slice(startIndex, endIndex);
    }, [value, paginationEnabled, currentPage, rowsPerPage]);
    const totalPages = paginationEnabled ? Math.ceil(value.length / rowsPerPage) : 1;
    const canGoNext = currentPage < totalPages;
    const canGoPrev = currentPage > 1;
    // Handler para cambiar las filas por página
    const handleRowsPerPageChange = useCallback((e) => {
        const newRpp = parseInt(e.target.value, 10);
        setRowsPerPage(newRpp);
        setCurrentPage(1);
    }, []);
    // =========================================================
    // HANDLERS DE TABLA (Funciones de mutación de datos)
    // =========================================================
    // 1. Inicializa la fila
    const createEmptyRow = useMemo(() => {
        const baseRow = {
            personDocumentId: DEFAULT_ID_PLACEHOLDER,
            isActive: true,
            personId: formData.personId || '',
            createdByUserId: formData.createdByUserId || '00000000-0000-0000-0000-000000000001',
        };
        return columnsDefinition.reduce((acc, col) => {
            acc[col.name] = col.type === 'number' ? '' : (col.type === 'checkbox' ? false : '');
            return acc;
        }, baseRow);
    }, [columnsDefinition, formData.personId, formData.createdByUserId]);
    // 2. Agregar fila
    const handleAddRow = useCallback(() => {
        const newRow = createEmptyRow;
        const newTableData = [...value, newRow];
        handleChange(fieldName, newTableData);
        if (paginationEnabled) {
            const newTotalPages = Math.ceil(newTableData.length / rowsPerPage);
            setCurrentPage(newTotalPages);
        }
    }, [fieldName, createEmptyRow, value, handleChange, paginationEnabled, rowsPerPage]);
    // 3. Eliminar fila
    const handleRemoveRow = useCallback((index) => {
        const newTableData = value.filter((_, i) => i !== index);
        handleChange(fieldName, newTableData);
    }, [fieldName, value, handleChange]);
    // 4. Cambiar celda (Usa índice global)
    const handleCellChange = useCallback((rowIndex, // Índice global de la fila
    columnName, newValue, columnType) => {
        const newTableData = value.map((row, i) => {
            // ✅ CORRECCIÓN DE PAGINACIÓN: Comparamos el índice global 'i' con el índice global pasado 'rowIndex'
            if (i === rowIndex) {
                let finalValue = newValue;
                if (columnType === 'number') {
                    const numValue = parseFloat(newValue);
                    finalValue = newValue === '' ? '' : (isNaN(numValue) ? newValue : numValue);
                }
                else if (columnType === 'checkbox') {
                    finalValue = !!newValue;
                }
                return {
                    ...row,
                    [columnName]: finalValue,
                };
            }
            return row;
        });
        handleChange(fieldName, newTableData);
    }, [fieldName, value, handleChange, discountRate]);
    // =========================================================
    // RENDERIZADO DE INPUTS
    // =========================================================
    // Componente auxiliar para renderizar el input de la celda
    const renderCellInput = (rowIndex, column, cellValue) => {
        // 🛑 CRÍTICO: Calculamos el índice GLOBAL para pasar al handler
        const globalRowIndex = paginationEnabled
            ? (currentPage - 1) * rowsPerPage + rowIndex
            : rowIndex;
        const commonProps = {
            id: `${fieldName}-${rowIndex}-${column.name}`,
            name: `${fieldName}[${rowIndex}].${column.name}`,
            placeholder: column.placeholder || column.label,
            required: column.required || false,
            className: "dynamic-table-cell-input",
            value: column.type === 'checkbox' ? (!!cellValue) : (cellValue ?? ''),
            onChange: (e) => {
                const isCheckbox = e.target.type === 'checkbox';
                const inputValue = isCheckbox ? e.target.checked : e.target.value;
                // ✅ Pasamos el índice GLOBAL a handleCellChange
                handleCellChange(globalRowIndex, column.name, inputValue, column.type);
            }
        };
        switch (column.type) {
            case 'select':
                // 🛑 CORRECCIÓN CRÍTICA: Solo aplicar la lógica de deshabilitación si 
                // la columna actual coincide con el campo único definido.
                const isUniqueColumn = column.name === uniqueFieldName;
                // 🔥 Lógica para deshabilitar las opciones ya usadas
                const usedValues = isUniqueColumn
                    ? getUsedValues(column.name, globalRowIndex, value)
                    : new Set(); // Si no es la columna única, el set de valores usados está vacío
                const currentCellValue = String(cellValue ?? '');
                return (_jsxs("select", { ...commonProps, children: [_jsx("option", { value: "", disabled: true, children: "Seleccionar" }), column.options?.map((option) => {
                            const optionValue = String(option.value);
                            const isUsed = usedValues.has(optionValue);
                            // La inhabilitación SOLO ocurre si:
                            // 1. Es la columna única (isUniqueColumn = true)
                            // 2. El valor está usado (isUsed = true) Y no es el valor actual.
                            // Si isUniqueColumn es false, usedValues está vacío y la inhabilitación nunca se aplica.
                            const isDisabled = isUsed && optionValue !== currentCellValue;
                            return (_jsx("option", { value: option.value, disabled: isDisabled, children: option.label }, option.value));
                        })] }));
            case 'textarea':
                return _jsx("textarea", { ...commonProps, rows: 1 });
            case 'checkbox':
                return (_jsx("input", { type: "checkbox", ...commonProps, checked: !!cellValue, onChange: (e) => handleCellChange(globalRowIndex, column.name, e.target.checked, column.type) }));
            case 'radio':
            case 'file':
                return _jsxs("span", { children: ["Tipo ", column.type, " no soportado en tabla"] });
            case 'action': // Si la columna es de tipo 'action', no renderizamos un input
                return _jsx(_Fragment, {});
            default: // text, number, email, date, password
                return _jsx("input", { type: column.type, ...commonProps });
        }
    };
    return (_jsxs("div", { className: "dynamic-table-wrapper", children: [_jsxs("table", { className: "dynamic-table", children: [_jsx("thead", { children: _jsx("tr", { children: columnsDefinition.map(col => (_jsxs("th", { className: `header-${col.type}`, children: [col.label, col.required && _jsx("span", { className: "required-star", children: "*" })] }, col.name))) }) }), _jsxs("tbody", { children: [paginatedValue.map((row, rowIndex) => {
                                const globalIndex = paginationEnabled
                                    ? (currentPage - 1) * rowsPerPage + rowIndex
                                    : rowIndex;
                                return (_jsx("tr", { className: "dynamic-table-row", children: columnsDefinition.map(col => {
                                        // 🛑 LÓGICA DE VISIBILIDAD DE ACCIÓN
                                        if (col.type === 'action' && col.actionType === 'delete') {
                                            const isVisibleFn = col.isVisible;
                                            // Utilizamos la función de visibilidad definida en employformconfig.tsx
                                            const isVisible = isVisibleFn ? isVisibleFn(row) : true;
                                            return (_jsx("td", { className: `cell-action`, children: isVisible && (_jsx("button", { type: "button", className: "dynamic-table-remove-btn", onClick: () => handleRemoveRow(globalIndex), title: "Eliminar fila", children: "\u274C" })) }, `${col.name}-${globalIndex}`));
                                        }
                                        // Para otros campos, usar el renderizador de input normal.
                                        return (_jsx("td", { className: `cell-${col.type}`, children: renderCellInput(rowIndex, col, row[col.name]) }, `${col.name}-${globalIndex}`));
                                    }) }, globalIndex));
                            }), value.length === 0 && (_jsx("tr", { children: _jsx("td", { colSpan: columnsDefinition.length, style: { textAlign: 'center', fontStyle: 'italic' }, children: "\u26A0\uFE0F No hay \u00EDtems. Presione \"Agregar Fila\"." }) }))] })] }), _jsx("button", { type: "button", className: "dynamic-table-add-btn", onClick: handleAddRow, children: "\u2795 Agregar Fila" }), paginationEnabled && totalPages > 1 && (_jsxs("div", { className: "dynamic-table-pagination-controls", children: [_jsxs("span", { children: ["P\u00E1gina ", currentPage, " de ", totalPages, " (", value.length, " filas en total)"] }), _jsx("button", { type: "button", onClick: () => setCurrentPage(currentPage - 1), disabled: !canGoPrev, children: "< Anterior" }), _jsx("button", { type: "button", onClick: () => setCurrentPage(currentPage + 1), disabled: !canGoNext, children: "Siguiente >" }), _jsx("select", { value: rowsPerPage, onChange: handleRowsPerPageChange, children: [5, 10, 20, 50].map(num => (_jsxs("option", { value: num, children: [num, " por p\u00E1gina"] }, num))) })] }))] }));
};
export default DynamicTable;
