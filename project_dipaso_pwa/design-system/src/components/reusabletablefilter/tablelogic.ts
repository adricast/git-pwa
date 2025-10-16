// src/components/ReusableTable/TableLogic.ts

import { useState, useMemo, useEffect, useCallback } from "react";
// Importa todos los tipos necesarios, incluyendo ColumnFilters y ColumnFilterValue
import type{ 
    TableColumn, 
    TableLogicHook,
    ColumnFilters, 
    ColumnFilterValue 
} from "./interface"; // O './interface' según tu estructura real

/**
 * Función auxiliar para detectar de forma rudimentaria el tipo de dato de una columna.
 */
const getDataType = (data: any[], field: string): 'number' | 'date' | 'string' => {
    if (data.length === 0) return 'string'; 

    const firstValue = data[0][field];
    if (typeof firstValue === 'number' || /^\d+(\.\d+)?$/.test(String(firstValue))) {
        return 'number';
    }
    if (typeof firstValue === 'string' && !isNaN(new Date(firstValue) as any) && isFinite(new Date(firstValue) as any)) {
        return 'date';
    }
    return 'string';
};


/**
 * Custom Hook que maneja toda la lógica de filtrado y paginación de los datos.
 */
export const useTableLogic = (
    data: any[], 
    columns: TableColumn[], 
    initialRowsPerPage: number = 10
): TableLogicHook => {
    const [searchTerm, setSearchTerm] = useState("");
    // ✅ NUEVO: Estado para filtros individuales por columna
    const [columnFilters, setColumnFilters] = useState<ColumnFilters>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);

    // ✅ NUEVO: Función para actualizar un filtro de columna específico
    const setColumnFilter = useCallback((field: string, value: ColumnFilterValue) => {
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
            currentData = currentData.filter(row => 
                columns.some(col => {
                    const value = String(row[col.field]).toLowerCase();
                    return value.includes(lowerCaseSearch);
                })
            );
        }

        // 1.2 Filtrado por Columna
        Object.entries(columnFilters).forEach(([field, filterValue]) => {
            if (!filterValue) return;

            const dataType = getDataType(data, field);
            
            currentData = currentData.filter(row => {
                const rowValue = row[field];

                if (dataType === 'number' || dataType === 'date') {
                    // Manejo de rangos (números y fechas)
                    const { min, max } = filterValue as { min: any, max: any };
                    
                    const minVal = dataType === 'number' ? Number(min) : new Date(min).getTime();
                    const maxVal = dataType === 'number' ? Number(max) : new Date(max).getTime();
                    const value = dataType === 'number' ? Number(rowValue) : new Date(rowValue).getTime();

                    const passesMin = (min === '' || isNaN(minVal)) || value >= minVal;
                    const passesMax = (max === '' || isNaN(maxVal)) || value <= maxVal;
                    
                    return passesMin && passesMax;

                } else { // 'string' (texto)
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
    const handlePageChange = useCallback((newPage: number) => {
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