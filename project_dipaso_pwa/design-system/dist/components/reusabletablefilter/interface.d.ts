import React from "react";
export interface ButtonConfig {
    label: string;
    color?: string;
    textColor?: string;
    onClick: (selectedRows?: any[]) => void;
    icon?: React.ReactNode;
    isVisible?: (selectedRows: any[]) => boolean;
}
export type DataType = 'string' | 'number' | 'date' | 'boolean';
export interface TableColumn {
    field: string;
    header: string;
    bodyTemplate?: (row: any) => React.ReactNode;
    onCellClick?: (row: any) => void;
    filterable?: boolean;
    dataType?: DataType;
}
export type ColumnFilterValue = string | number | {
    min: string | number;
    max: string | number;
} | {
    'true'?: boolean;
    'false'?: boolean;
} | null;
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
