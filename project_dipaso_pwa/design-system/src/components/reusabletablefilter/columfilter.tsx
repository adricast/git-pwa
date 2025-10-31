// src/components/ReusableTable/ColumnFilterInput.tsx
 
import React, { useCallback, useMemo } from "react";
// ✅ CORRECCIÓN: Cambiado 'interface' por 'interfaz' para coincidir con el nombre de tu archivo.
import type { TableColumn, ColumnFilterValue } from "./interface";
//import "./../styles/reusabletablefilterLayout.sass"; // Asume que los estilos están aquí
 
// Función auxiliar para detectar el tipo de dato
const getDataType = (data: any[], field: string): 'number' | 'date' | 'string' | 'boolean' => {
    if (data.length === 0) return 'string';
    const firstValue = data[0][field];
    if (typeof firstValue === "boolean") return "boolean";
 
    if (typeof firstValue === 'string' && ['true', 'false'].includes(firstValue.trim().toLowerCase())) {
        return 'boolean';
    }
 
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
 
    // --- Boolean handler: 2 checkboxes (true/false) ---
    const handleBooleanChange = useCallback(
        (key: "true" | "false") =>
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const current =
              (filterValue as { 'true'?: boolean; 'false'?: boolean }) || {};
            // 🔧 CAMBIO 2 (recomendado): tipa explícitamente `next`
            const next: { 'true'?: boolean; 'false'?: boolean } = {
              'true': key === "true" ? e.target.checked : !!current['true'],
              'false': key === "false" ? e.target.checked : !!current['false'],
            };
 
            // Reglas:
            // - ambos desmarcados => no filtrar (null)
            // - ambos marcados    => no filtrar (null)
            // - solo uno marcado  => filtrar por ese valor
            if ((next['true'] && next['false']) || (!next['true'] && !next['false'])) {
              setFilter(column.field, null);
            } else {
              setFilter(column.field, next);
            }
        },
        [filterValue, setFilter, column.field]
    );
 
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
 
    if (dataType === 'boolean') {
        const boolValue = (filterValue as { 'true'?: boolean; 'false'?: boolean }) || {};
        const checkedTrue = !!boolValue['true'];
        const checkedFalse = !!boolValue['false'];
 
        return (
            <div className="boolean-filter-container" style={{ display: 'flex', gap: 12 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input
                        type="checkbox"
                        checked={checkedTrue}
                        onChange={handleBooleanChange('true')}
                    />
                    Si
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input
                        type="checkbox"
                        checked={checkedFalse}
                        onChange={handleBooleanChange('false')}
                    />
                    No
                </label>
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