// src/components/reusabletable/interfaz.ts

import React from "react";

export interface ButtonConfig {
 label: string;
 color?: string; // Clase SCSS (ej. 'btn-delete')
 textColor?: string;
 onClick: (selectedRows?: any[]) => void;
}

export interface TableColumn {
 field: string;
 header: string;
 bodyTemplate?: (row: any) => React.ReactNode;
 onCellClick?: (row: any) => void; 
}

export interface ReusableTableProps {
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
    currentPage: number;
    rowsPerPage: number;
    setRowsPerPage: React.Dispatch<React.SetStateAction<number>>;
    totalPages: number;
    totalRows: number;
    paginatedData: any[];
    handlePageChange: (newPage: number) => void;
}