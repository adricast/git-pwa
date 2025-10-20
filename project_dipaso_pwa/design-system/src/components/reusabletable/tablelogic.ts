// src/components/ReusableTable/TableLogic.ts

import { useState, useMemo, useEffect, useCallback } from "react";
import type{ TableColumn, TableLogicHook } from "./interface";

/**
 * Custom Hook que maneja toda la lógica de filtrado y paginación de los datos.
 */
export const useTableLogic = (
    data: any[], 
    columns: TableColumn[], 
    initialRowsPerPage: number = 10
): TableLogicHook => {
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);

    // 1. Lógica de Filtrado
    const filteredData = useMemo(() => {
        if (!searchTerm) return data;

        const lowerCaseSearch = searchTerm.toLowerCase();

        return data.filter(row => 
            // Buscamos en todas las columnas definidas
            columns.some(col => {
                const value = String(row[col.field]).toLowerCase();
                return value.includes(lowerCaseSearch);
            })
        );
    }, [data, searchTerm, columns]);

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

    // Efecto para resetear la página a 1 cuando la búsqueda o el número de filas por página cambian
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, rowsPerPage]);

    return {
        searchTerm,
        setSearchTerm,
        currentPage,
        rowsPerPage,
        setRowsPerPage,
        totalPages,
        totalRows,
        paginatedData,
        handlePageChange,
    };
};