import React from 'react';
import type { TableColumn } from './interface';
export interface DynamicTableProps {
    fieldName: string;
    columnsDefinition: TableColumn[];
    value: Record<string, any>[];
    paginationEnabled?: boolean;
    initialRowsPerPage?: number;
    uniqueFieldName?: string;
}
/**
 * Componente que renderiza una tabla dinámica con soporte para paginación.
 */
declare const DynamicTable: React.FC<DynamicTableProps>;
export default DynamicTable;
