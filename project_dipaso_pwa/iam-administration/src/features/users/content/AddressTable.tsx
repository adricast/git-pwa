// ============================================================================
// CAPA: Content/Vista - Componente de tabla de direcciones con acciones
// ============================================================================

import React from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import '../styles/AddressTable.sass';

/**
 * Interfaz para definir columnas de la tabla
 */
export interface AddressTableColumn<T = unknown> {
  field: string;
  header: string;
  bodyTemplate?: (item: T) => React.ReactNode;
}

/**
 * Props del componente AddressTable
 */
export interface AddressTableProps<T = Record<string, unknown>> {
  title?: string;
  data: T[];
  columns: AddressTableColumn<T>[];
  selectedItems: T[];
  onSelectionChange: (items: T[]) => void;
  dataKey: string;
  onDelete?: () => void;
  onAdd?: () => void;
  deleteLabel?: string;
  addLabel?: string;
  emptyMessage?: string;
}

/**
 * Componente de tabla de direcciones con selección múltiple y botones de acción
 */
export const AddressTable = <T extends Record<string, any>>({
  title = 'Listado de Direcciones',
  data,
  columns,
  selectedItems,
  onSelectionChange,
  dataKey,
  onDelete,
  onAdd,
  deleteLabel = 'Eliminar',
  addLabel = 'Agregar',
  emptyMessage = 'No hay datos disponibles'
}: AddressTableProps<T>) => {
  return (
    <div className="address-table-container">
      {/* Header con título y acciones */}
      <div className="address-table-header">
        <h3 className="address-table-title">{title}</h3>
        <div className="address-table-actions">
          {onDelete && (
            <Button
              label={deleteLabel}
              icon="pi pi-trash"
              className="p-button-outlined p-button-secondary"
              onClick={onDelete}
              disabled={selectedItems.length === 0}
            />
          )}
          {onAdd && (
            <Button
              label={addLabel}
              icon="pi pi-plus"
              className="p-button-outlined"
              onClick={onAdd}
            />
          )}
        </div>
      </div>

      {/* Tabla de datos */}
      <DataTable
        value={data}
        selection={selectedItems}
        onSelectionChange={(e) => onSelectionChange(e.value as T[])}
        selectionMode="multiple"
        dataKey={dataKey}
        stripedRows
        showGridlines
        responsiveLayout="scroll"
        emptyMessage={emptyMessage}
        className="address-datatable"
      >
        <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} exportable={false} />
        {columns.map((col, idx) => (
          <Column
            key={idx}
            field={col.field}
            header={col.header}
            body={col.bodyTemplate ? (rowData: T) => col.bodyTemplate!(rowData) : undefined}
          />
        ))}
      </DataTable>
    </div>
  );
};

export default AddressTable;
