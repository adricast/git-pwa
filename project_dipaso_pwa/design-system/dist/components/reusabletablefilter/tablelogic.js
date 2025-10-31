// src/components/ReusableTable/TableLogic.ts
import { useState, useMemo, useEffect, useCallback } from "react";
/**
 * Función auxiliar para detectar de forma rudimentaria el tipo de dato de una columna.
 */
const getDataType = (data, field) => {
    if (data.length === 0)
        return 'string';
    const firstValue = data[0][field];
    if (typeof firstValue === 'boolean')
        return 'boolean';
    if (typeof firstValue === 'string' && ['true', 'false'].includes(firstValue.trim().toLowerCase())) {
        return 'boolean';
    }
    if (typeof firstValue === 'number' || /^\d+(\.\d+)?$/.test(String(firstValue))) {
        return 'number';
    }
    if (typeof firstValue === 'string' && !isNaN(new Date(firstValue)) && isFinite(new Date(firstValue))) {
        return 'date';
    }
    return 'string';
};
// 🔧 CAMBIO: helper para normalizar cualquier valor a booleano estricto
const toBool = (v) => {
    if (typeof v === 'boolean')
        return v;
    if (typeof v === 'string') {
        const s = v.trim().toLowerCase();
        if (s === 'true')
            return true;
        if (s === 'false')
            return false;
    }
    return null; // si no se puede interpretar, devolvemos null para no romper
};
/**
 * Custom Hook que maneja toda la lógica de filtrado y paginación de los datos.
 */
export const useTableLogic = (data, columns, initialRowsPerPage = 10) => {
    const [searchTerm, setSearchTerm] = useState("");
    // ✅ NUEVO: Estado para filtros individuales por columna
    const [columnFilters, setColumnFilters] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);
    // ✅ NUEVO: Función para actualizar un filtro de columna específico
    const setColumnFilter = useCallback((field, value) => {
        setColumnFilters(prev => ({
            ...prev,
            [field]: value
        }));
    }, []);
    // 1. Lógica de Filtrado COMPLEJA (Global + Columnas)
    const filteredData = useMemo(() => {
        let currentData = data;
        const lowerCaseSearch = searchTerm.toLowerCase();
        // 1.1 Filtrado Global
        if (searchTerm) {
            currentData = currentData.filter(row => columns.some(col => {
                const value = String(row[col.field]).toLowerCase();
                return value.includes(lowerCaseSearch);
            }));
        }
        // 1.2 Filtrado por Columna
        Object.entries(columnFilters).forEach(([field, filterValue]) => {
            if (!filterValue)
                return;
            const dataType = getDataType(data, field);
            currentData = currentData.filter(row => {
                const rowValue = row[field];
                // 🔧 CAMBIO: caso booleano con shape { 'true'?: boolean; 'false'?: boolean }
                if (typeof filterValue === 'object' &&
                    ('true' in filterValue || 'false' in filterValue) &&
                    dataType === 'boolean') {
                    const sel = filterValue;
                    const selTrue = !!sel['true'];
                    const selFalse = !!sel['false'];
                    // Regla del componente: si ambos o ninguno => no filtra (equivale a true global)
                    if ((selTrue && selFalse) || (!selTrue && !selFalse))
                        return true;
                    const b = toBool(rowValue); // normaliza a boolean
                    if (b === null)
                        return false; // valor no interpretable como boolean
                    // Si solo True está marcado => solo true
                    // Si solo False está marcado => solo false
                    return selTrue ? b === true : b === false;
                }
                if (dataType === 'number' || dataType === 'date') {
                    // Manejo de rangos (números y fechas)
                    const { min, max } = filterValue;
                    const minVal = dataType === 'number' ? Number(min) : new Date(min).getTime();
                    const maxVal = dataType === 'number' ? Number(max) : new Date(max).getTime();
                    const value = dataType === 'number' ? Number(rowValue) : new Date(rowValue).getTime();
                    const passesMin = (min === '' || isNaN(minVal)) || value >= minVal;
                    const passesMax = (max === '' || isNaN(maxVal)) || value <= maxVal;
                    return passesMin && passesMax;
                }
                else { // 'string' (texto)
                    const filterText = String(filterValue).toLowerCase();
                    const rowText = String(rowValue).toLowerCase();
                    return rowText.includes(filterText);
                }
            });
        });
        return currentData;
    }, [data, searchTerm, columns, columnFilters]); // Dependencia columnFilters crucial
    // 2. Lógica de Paginación
    const totalRows = filteredData.length;
    const totalPages = Math.ceil(totalRows / rowsPerPage);
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;
        return filteredData.slice(startIndex, endIndex);
    }, [filteredData, currentPage, rowsPerPage]);
    // Función para cambiar de página
    const handlePageChange = useCallback((newPage) => {
        if (newPage > 0 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    }, [totalPages]);
    // Efecto para resetear la página a 1 cuando la búsqueda o los filtros cambian
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, rowsPerPage, columnFilters]); // Dependencia columnFilters crucial
    return {
        searchTerm,
        setSearchTerm,
        // ✅ DEVOLVER las nuevas propiedades
        columnFilters,
        setColumnFilter,
        currentPage,
        rowsPerPage,
        setRowsPerPage,
        totalPages,
        totalRows,
        paginatedData,
        handlePageChange,
    };
};
