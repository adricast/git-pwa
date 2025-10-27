// 📁 src/components/forms/DynamicTable.tsx (VERSIÓN FINAL Y COMPLETA)

import React, { useCallback, useMemo, useEffect, useState } from 'react'; 
// Importamos solo los tipos necesarios para la tabla
import type { TableColumn, FieldType, SelectOption } from './interface'; 

// 🛑 USAMOS useDynamicFormContext
import { useDynamicFormContext } from './dynamicformContext'; 


export interface DynamicTableProps {
    fieldName: string; 
    columnsDefinition: TableColumn[];
    value: Record<string, any>[]; 
    // 🛑 NUEVAS PROPS DE CONFIGURACIÓN DE LA TABLA (asumo que se pasan desde FormField)
    paginationEnabled?: boolean; // Habilita la paginación
    initialRowsPerPage?: number; // Filas por página iniciales
}

// 🛑 Hardcodeamos el ID placeholder (Necesario para la lógica de la 'X')
const DEFAULT_ID_PLACEHOLDER = "00000000-0000-0000-0000-000000000000";

// 🔥 FUNCIÓN AUXILIAR PARA OBTENER LOS VALORES USADOS EN OTRAS FILAS (Para deshabilitar select)
const getUsedValues = (
    currentFieldName: string, 
    currentGlobalIndex: number, 
    tableValue: Array<Record<string, any>>
): Set<string> => {
    const used = new Set<string>();
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
const DynamicTable: React.FC<DynamicTableProps> = ({ 
    fieldName, 
    columnsDefinition, 
    value, 
    paginationEnabled = false, 
    initialRowsPerPage = 5,    
}) => {
    
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
        if (!paginationEnabled) { return value; }
        const startIndex = (currentPage - 1) * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;
        return value.slice(startIndex, endIndex);
    }, [value, paginationEnabled, currentPage, rowsPerPage]);

    const totalPages = paginationEnabled ? Math.ceil(value.length / rowsPerPage) : 1;
    const canGoNext = currentPage < totalPages;
    const canGoPrev = currentPage > 1;

    // Handler para cambiar las filas por página
    const handleRowsPerPageChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        const newRpp = parseInt(e.target.value, 10);
        setRowsPerPage(newRpp);
        setCurrentPage(1);
    }, []);


    // =========================================================
    // HANDLERS DE TABLA (Funciones de mutación de datos)
    // =========================================================

    // 1. Inicializa la fila
    const createEmptyRow = useMemo(() => {
        const baseRow: Record<string, any> = {
            personDocumentId: DEFAULT_ID_PLACEHOLDER, 
            isActive: true, 
            personId: formData.personId || '', 
            createdByUserId: formData.createdByUserId || '00000000-0000-0000-0000-000000000001',
        };
        
        return columnsDefinition.reduce((acc, col) => {
            acc[col.name] = col.type === 'number' ? '' : (col.type === 'checkbox' ? false : '');
            return acc;
        }, baseRow as Record<string, any>);
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
    const handleRemoveRow = useCallback((index: number) => {
        const newTableData = value.filter((_, i) => i !== index);
        handleChange(fieldName, newTableData);
    }, [fieldName, value, handleChange]);

    // 4. Cambiar celda (Usa índice global)
    const handleCellChange = useCallback((
        rowIndex: number, // Índice global de la fila
        columnName: string, 
        newValue: any, 
        columnType: FieldType
    ) => {
        const newTableData = value.map((row, i) => {
            // ✅ CORRECCIÓN DE PAGINACIÓN: Comparamos el índice global 'i' con el índice global pasado 'rowIndex'
            if (i === rowIndex) {
                let finalValue = newValue;
                if (columnType === 'number') {
                    const numValue = parseFloat(newValue);
                    finalValue = newValue === '' ? '' : (isNaN(numValue) ? newValue : numValue);
                } else if (columnType === 'checkbox') {
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
    const renderCellInput = (rowIndex: number, column: TableColumn, cellValue: any) => {
        
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
            
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
                const isCheckbox = e.target.type === 'checkbox';
                const inputValue = isCheckbox ? (e.target as HTMLInputElement).checked : e.target.value;
                // ✅ Pasamos el índice GLOBAL a handleCellChange
                handleCellChange(globalRowIndex, column.name, inputValue, column.type); 
            }
        };

        switch (column.type) {
            case 'select':
                // 🔥 Lógica para deshabilitar las opciones ya usadas
                const usedValues = getUsedValues(column.name, globalRowIndex, value);
                const currentCellValue = String(cellValue ?? '');

                return (
                    <select {...commonProps}>
                        <option value="" disabled>Seleccionar</option>
                        {column.options?.map((option: SelectOption) => {
                            const optionValue = String(option.value);
                            const isUsed = usedValues.has(optionValue);
                            const isDisabled = isUsed && optionValue !== currentCellValue;

                            return (
                                <option 
                                    key={option.value} 
                                    value={option.value}
                                    disabled={isDisabled}
                                >
                                    {option.label}
                                </option>
                            )
                        })}
                    </select>
                );
            case 'textarea':
                return <textarea {...commonProps as any} rows={1} />;
            case 'checkbox':
                return (
                    <input 
                        type="checkbox" 
                        {...commonProps} 
                        checked={!!cellValue}
                        onChange={(e) => handleCellChange(globalRowIndex, column.name, e.target.checked, column.type)}
                    />
                );
            case 'radio':
            case 'file':
                return <span>Tipo {column.type} no soportado en tabla</span>;

            case 'action': // Si la columna es de tipo 'action', no renderizamos un input
                return <></>; 
            
            default: // text, number, email, date, password
                return <input type={column.type} {...commonProps as any} />;
        }
    };
    

    return (
        <div className="dynamic-table-wrapper">
            <table className="dynamic-table">
                <thead>
                    <tr>
                        {columnsDefinition.map(col => (
                            <th key={col.name} className={`header-${col.type}`}>
                                {col.label}
                                {col.required && <span className="required-star">*</span>}
                            </th>
                        ))}
                    </tr>
                </thead>
                
                <tbody>
                    {paginatedValue.map((row, rowIndex) => {
                        const globalIndex = paginationEnabled 
                            ? (currentPage - 1) * rowsPerPage + rowIndex 
                            : rowIndex;

                        return (
                            <tr key={globalIndex} className="dynamic-table-row">
                                {columnsDefinition.map(col => {
                                    
                                    // 🛑 LÓGICA DE VISIBILIDAD DE ACCIÓN
                                    if ((col as any).type === 'action' && (col as any).actionType === 'delete') {
                                        
                                        const isVisibleFn = (col as any).isVisible;
                                        // Utilizamos la función de visibilidad definida en employformconfig.tsx
                                        const isVisible = isVisibleFn ? isVisibleFn(row) : true;

                                        return (
                                            <td key={`${col.name}-${globalIndex}`} className={`cell-action`}>
                                                {isVisible && (
                                                    <button 
                                                        type="button" 
                                                        className="dynamic-table-remove-btn"
                                                        onClick={() => handleRemoveRow(globalIndex)}
                                                        title="Eliminar fila"
                                                    >
                                                        ❌
                                                    </button>
                                                )}
                                            </td>
                                        );
                                    }

                                    // Para otros campos, usar el renderizador de input normal.
                                    return (
                                        <td key={`${col.name}-${globalIndex}`} className={`cell-${col.type}`}>
                                            {renderCellInput(rowIndex, col, row[col.name])} 
                                        </td>
                                    );
                                })}
                            </tr>
                        );
                    })}
                    {value.length === 0 && (
                        <tr>
                            {/* Ajustamos el colSpan para que use SOLO las columnas definidas */}
                            <td colSpan={columnsDefinition.length} style={{ textAlign: 'center', fontStyle: 'italic' }}>
                                ⚠️ No hay ítems. Presione "Agregar Fila".
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
            
            <button 
                type="button" 
                className="dynamic-table-add-btn"
                onClick={handleAddRow}
            >
                ➕ Agregar Fila
            </button>

            {/* 🛑 CONTROLES DE PAGINACIÓN */}
            {paginationEnabled && totalPages > 1 && (
                <div className="dynamic-table-pagination-controls">
                    <span>
                        Página {currentPage} de {totalPages} ({value.length} filas en total)
                    </span>
                    <button 
                        type="button" 
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={!canGoPrev}
                    >
                        &lt; Anterior
                    </button>
                    <button 
                        type="button" 
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={!canGoNext}
                    >
                        Siguiente &gt;
                    </button>
                    
                    {/* Selector de Filas por Página */}
                    <select value={rowsPerPage} onChange={handleRowsPerPageChange}>
                        {[5, 10, 20, 50].map(num => (
                            <option key={num} value={num}>{num} por página</option>
                        ))}
                    </select>
                </div>
            )}
        </div>
    );
};

export default DynamicTable;