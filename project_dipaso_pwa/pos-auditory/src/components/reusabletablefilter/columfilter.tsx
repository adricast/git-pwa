// src/components/ReusableTable/ColumnFilterInput.tsx

import React, { useCallback, useMemo } from "react";
// ✅ CORRECCIÓN: Cambiado 'interface' por 'interfaz' para coincidir con el nombre de tu archivo.
import type { TableColumn, ColumnFilterValue } from "./interface"; 
import "./../styles/reusabletablefilterLayout.scss"; // Asume que los estilos están aquí

// Función auxiliar para detectar el tipo de dato
const getDataType = (data: any[], field: string): 'number' | 'date' | 'string' => {
    if (data.length === 0) return 'string'; 
    const firstValue = data[0][field];
    if (typeof firstValue === 'number' || /^\d+(\.\d+)?$/.test(String(firstValue))) return 'number';
    if (typeof firstValue === 'string' && !isNaN(new Date(firstValue) as any) && isFinite(new Date(firstValue) as any)) return 'date';
    return 'string';
};

/**
 * Componente que renderiza el input de filtro adecuado (texto, número, fecha)
 * basado en la detección inteligente del tipo de dato de la columna.
 */
const ColumnFilterInput: React.FC<{ 
    column: TableColumn, 
    filterValue: ColumnFilterValue, 
    setFilter: (field: string, value: ColumnFilterValue) => void,
    data: any[]
}> = ({ column, filterValue, setFilter, data }) => {
    
    // Usamos useMemo para detectar el tipo solo cuando cambian los datos o la columna
    const dataType = useMemo(() => getDataType(data, column.field), [data, column.field]);

    const handleStringChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Establece el filtro en null si está vacío para evitar filtrar por una cadena vacía
        setFilter(column.field, e.target.value.trim() === "" ? null : e.target.value);
    };

    const handleRangeChange = useCallback((type: 'min' | 'max', e: React.ChangeEvent<HTMLInputElement>) => {
        // Inicializa o desestructura el valor actual del rango
        const { min, max } = (filterValue as { min: string, max: string }) || { min: '', max: '' };
        
        const newMin = type === 'min' ? e.target.value : min;
        const newMax = type === 'max' ? e.target.value : max;
        
        // Si ambos están vacíos, reseteamos el filtro a null
        if (newMin === "" && newMax === "") {
             setFilter(column.field, null);
        } else {
             setFilter(column.field, { min: newMin, max: newMax });
        }
    }, [column.field, filterValue, setFilter]);

    // Ocultar filtro si filterable es false
    if (column.filterable === false) { 
        return <div className="filter-placeholder" style={{ height: '30px' }}></div>; 
    }

    if (dataType === 'number' || dataType === 'date') {
        // Para números y fechas, usamos dos inputs para definir un rango
        const { min, max } = (filterValue as { min: string, max: string }) || { min: '', max: '' };
        const inputType = dataType === 'number' ? 'number' : 'date';

        return (
            <div className="range-filter-container">
                <input 
                    type={inputType} 
                    placeholder={dataType === 'number' ? "Mín." : "Fecha inicio"}
                    value={min}
                    onChange={(e) => handleRangeChange('min', e)}
                    className="range-input min-input"
                />
                <input 
                    type={inputType} 
                    placeholder={dataType === 'number' ? "Máx." : "Fecha fin"}
                    value={max}
                    onChange={(e) => handleRangeChange('max', e)}
                    className="range-input max-input"
                />
            </div>
        );
    }
    
    // Por defecto: filtro de texto
    return (
        <input
            type="text"
            placeholder={`Filtrar...`}
            value={String(filterValue || "")}
            onChange={handleStringChange}
            className="column-filter-input"
            aria-label={`Filtrar por ${column.header}`}
        />
    );
};

export default ColumnFilterInput;