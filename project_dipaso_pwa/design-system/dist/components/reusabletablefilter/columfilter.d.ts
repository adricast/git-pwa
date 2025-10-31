import React from "react";
import type { TableColumn, ColumnFilterValue } from "./interface";
/**
 * Componente que renderiza el input de filtro adecuado (texto, número, fecha)
 * basado en la detección inteligente del tipo de dato de la columna.
 */
declare const ColumnFilterInput: React.FC<{
    column: TableColumn;
    filterValue: ColumnFilterValue;
    setFilter: (field: string, value: ColumnFilterValue) => void;
    data: any[];
}>;
export default ColumnFilterInput;
