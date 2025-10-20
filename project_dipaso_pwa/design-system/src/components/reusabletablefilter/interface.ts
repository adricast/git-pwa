// src/components/reusabletable/interface.ts

import React from "react";

export interface ButtonConfig {
 label: string;
 color?: string; // Clase SCSS (ej. 'btn-delete')
 textColor?: string;
 onClick: (selectedRows?: any[]) => void;
 icon?: React.ReactNode;
 isVisible?: (selectedRows: any[]) => boolean;
}

export interface TableColumn {
 field: string;
 header: string;
 bodyTemplate?: (row: any) => React.ReactNode;
 onCellClick?: (row: any) => void; 
 // 🔑 CAMBIO: Propiedad opcional para deshabilitar el filtro por columna
 filterable?: boolean; 
}

// 🔑 CAMBIO: Nueva interfaz para los valores de filtro por columna
export type ColumnFilterValue = string | number | { min: string | number, max: string | number } | null;

// 🔑 CAMBIO: Nueva interfaz para el mapa de filtros
export interface ColumnFilters {
    [field: string]: ColumnFilterValue;
}

export interface ReusableTableFilterProps {
 moduleName: string;
 data: any[];
 rowKey: string;
 columns: TableColumn[];
 buttons?: ButtonConfig[];
 selectableField?: string;
 onRowSelect?: (row: any | null) => void;
 loading: boolean; 
 emptyMessage?: string; 
 styles?: {
    selectedRowClass?: string;
    rowHoverClass?: string;

 };
 selectedRows?: any[];
 setSelectedRows?: (rows: any[]) => void;
  initialRowsPerPage?: number;
}

export interface TableLogicHook {
    searchTerm: string;
    setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
    // 🔑 CAMBIO: Nuevas propiedades para la lógica de filtros por columna
    columnFilters: ColumnFilters;
    setColumnFilter: (field: string, value: ColumnFilterValue) => void;
    
    currentPage: number;
    rowsPerPage: number;
    setRowsPerPage: React.Dispatch<React.SetStateAction<number>>;
    totalPages: number;
    totalRows: number;
    paginatedData: any[];
    handlePageChange: (newPage: number) => void;
}