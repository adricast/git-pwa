// ============================================================================
// CAPA: Content/Vista - Componente reutilizable de tabla con acciones
// ============================================================================

import React from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';

/**
 * Interfaz para definir columnas de la tabla
 */
export interface DataTableColumn<T = unknown> {
  field: string;
  header: string;
  bodyTemplate?: (item: T) => React.ReactNode;
}

/**
 * Props del componente DataTableWithActions
 */
export interface DataTableWithActionsProps<T = Record<string, unknown>> {
  /** Título de la tabla */
  title?: string;
  /** Array de datos a mostrar */
  data: T[];
  /** Configuración de columnas */
  columns: DataTableColumn<T>[];
  /** Items seleccionados */
  selectedItems: T[];
  /** Callback cuando cambia la selección */
  onSelectionChange: (items: T[]) => void;
  /** Campo único para identificar cada fila */
  dataKey: string;
  /** Callback para eliminar items seleccionados */
  onDelete?: () => void;
  /** Callback para agregar nuevo item */
  onAdd?: () => void;
  /** Label del botón eliminar */
  deleteLabel?: string;
  /** Label del botón agregar */
  addLabel?: string;
  /** Mensaje cuando no hay datos */
  emptyMessage?: string;
  /** Clase CSS adicional */
  className?: string;
  /** Mostrar botones de acción */
  showActions?: boolean;
}

/**
 * Componente de tabla con selección múltiple y botones de acción
 * Utiliza PrimeReact DataTable con toolbar personalizado
 */
export const DataTableWithActions = <T extends Record<string, any>>({
  title,
  data,
  columns,
  selectedItems,
  onSelectionChange,
  dataKey,
  onDelete,
  onAdd,
  deleteLabel = 'Eliminar',
  addLabel = 'Agregar',
  emptyMessage = 'No hay datos disponibles',
  className = '',
  showActions = true
}: DataTableWithActionsProps<T>) => {
  return (
    <div className={`data-table-actions-container ${className}`}>
      {/* Header con título y acciones */}
      {(title || showActions) && (
        <div className="data-table-header">
          {title && <h3 className="data-table-title">{title}</h3>}
          {showActions && (
            <div className="data-table-actions">
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
          )}
        </div>
      )}

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
        className="data-table-actions-table"
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

export default DataTableWithActions;
