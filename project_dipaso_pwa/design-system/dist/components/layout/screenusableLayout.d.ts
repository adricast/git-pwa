import React from "react";
interface ButtonConfig {
    label: string;
    color?: string;
    textColor?: string;
    onClick: (selectedRows?: any[]) => void;
}
interface TableColumn {
    field: string;
    header: string;
    bodyTemplate?: (row: any) => React.ReactNode;
}
interface ReusableTableProps {
    moduleName: string;
    data: any[];
    rowKey: string;
    columns: TableColumn[];
    buttons?: ButtonConfig[];
    selectableField?: string;
    onRowSelect?: (row: any | null) => void;
    styles?: {
        selectedRowClass?: string;
        rowHoverClass?: string;
    };
    selectedRows?: any[];
    setSelectedRows?: (rows: any[]) => void;
}
declare const ReusableTable: React.FC<ReusableTableProps>;
export default ReusableTable;
