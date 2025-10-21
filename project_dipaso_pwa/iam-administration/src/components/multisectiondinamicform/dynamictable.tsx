// src/components/forms/DynamicTable.tsx

import React, { useCallback, useMemo, useEffect } from 'react'; // Agregamos useEffect para demostrar el uso
// Importamos solo los tipos necesarios para la tabla
import type { TableColumn, FieldType, SelectOption } from './interface'; 

// 🛑 USAMOS useDynamicFormContext
import { useDynamicFormContext } from './dynamicformContext'; 


interface DynamicTableProps {
    fieldName: string; // El nombre de la propiedad en formData que guarda el array (ej: 'items')
    columnsDefinition: TableColumn[];
    value: Record<string, any>[]; // El array de filas actual
    // 🛑 Eliminamos 'onChange' de las props ya que lo obtendremos del contexto.
}

/**
 * Componente que renderiza una tabla dinámica donde las celdas son inputs (parametrizados).
 * Depende de useDynamicFormContext para obtener los handlers y el estado global (formData).
 */
const DynamicTable: React.FC<DynamicTableProps> = ({ 
    fieldName, 
    columnsDefinition, 
    value // El array de filas actual
}) => {
    
    // 1. 🛑 USAR EL CONTEXTO: Obtenemos handleChange Y formData del hook
    const { handleChange, formData } = useDynamicFormContext();
    
    // 2. 🛑 DEMOSTRACIÓN DE USO DE formData: 
    // Podemos usar formData para reaccionar a cambios en otros campos del formulario.
    // Ejemplo: Si hay un campo llamado 'discountRate' fuera de la tabla, podemos calcularlo aquí.
    const discountRate = formData.discountRate || 0;

    useEffect(() => {
        // Log de ejemplo para demostrar que `formData` está disponible y se actualiza
        if (discountRate > 0) {
            console.log(`Aplicando tasa de descuento global: ${discountRate}% (Estado global: ${JSON.stringify(formData)})`);
        }
    }, [discountRate, formData]);


    // Generar una nueva fila vacía con los valores por defecto
    const createEmptyRow = useMemo(() => {
        return columnsDefinition.reduce((acc, col) => {
            acc[col.name] = col.type === 'number' ? '' : (col.type === 'checkbox' ? false : '');
            return acc;
        }, {} as Record<string, any>);
    }, [columnsDefinition]);

    // Handler para agregar una nueva fila
    const handleAddRow = useCallback(() => {
        const newRow = createEmptyRow;
        const newTableData = [...value, newRow];
        handleChange(fieldName, newTableData);
    }, [fieldName, createEmptyRow, value, handleChange]);

    // Handler para eliminar una fila por índice
    const handleRemoveRow = useCallback((index: number) => {
        const newTableData = value.filter((_, i) => i !== index);
        handleChange(fieldName, newTableData);
    }, [fieldName, value, handleChange]);

    // Handler para cambiar el valor de una celda específica
    const handleCellChange = useCallback((
        rowIndex: number, 
        columnName: string, 
        newValue: any, 
        columnType: FieldType
    ) => {
        const newTableData = value.map((row, i) => {
            if (i === rowIndex) {
                // Lógica de tipado para 'number' y 'checkbox'
                let finalValue = newValue;
                if (columnType === 'number') {
                    const numValue = parseFloat(newValue);
                    finalValue = newValue === '' ? '' : (isNaN(numValue) ? newValue : numValue);
                } else if (columnType === 'checkbox') {
                    finalValue = !!newValue;
                }
                
                // 🛑 Lógica de cálculo que podría usar el valor de formData (discountRate)
                // if (columnName === 'price' && discountRate > 0) {
                //    finalValue = finalValue * (1 - discountRate / 100);
                // }
                
                return {
                    ...row,
                    [columnName]: finalValue,
                };
            }
            return row;
        });
        
        handleChange(fieldName, newTableData);
        
    }, [fieldName, value, handleChange, discountRate]); // 🛑 Dependencia de discountRate para forzar re-render

    // Componente auxiliar para renderizar el input de la celda
    const renderCellInput = (rowIndex: number, column: TableColumn, cellValue: any) => {
        
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
                handleCellChange(rowIndex, column.name, inputValue, column.type);
            }
        };

        switch (column.type) {
            case 'select':
                return (
                    <select {...commonProps}>
                        <option value="" disabled>Seleccionar</option>
                        {column.options?.map((option: SelectOption) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
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
                        onChange={(e) => handleCellChange(rowIndex, column.name, e.target.checked, column.type)}
                    />
                );
            case 'radio':
            case 'file':
                return <span>Tipo {column.type} no soportado en tabla</span>;
            
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
                        <th className="action-column">Acciones</th>
                    </tr>
                </thead>
                
                <tbody>
                    {value.map((row, rowIndex) => (
                        <tr key={rowIndex} className="dynamic-table-row">
                            {columnsDefinition.map(col => (
                                <td key={`${col.name}-${rowIndex}`} className={`cell-${col.type}`}>
                                    {renderCellInput(rowIndex, col, row[col.name])}
                                </td>
                            ))}
                            <td>
                                <button 
                                    type="button" 
                                    className="dynamic-table-remove-btn"
                                    onClick={() => handleRemoveRow(rowIndex)}
                                    title="Eliminar fila"
                                >
                                    ❌
                                </button>
                            </td>
                        </tr>
                    ))}
                    {value.length === 0 && (
                        <tr>
                            <td colSpan={columnsDefinition.length + 1} style={{ textAlign: 'center', fontStyle: 'italic' }}>
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
        </div>
    );
};

export default DynamicTable;