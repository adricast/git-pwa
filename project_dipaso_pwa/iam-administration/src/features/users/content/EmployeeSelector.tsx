// ============================================================================
// CAPA: Content/Vista - Componente de selección de empleados
// ============================================================================

import React, { useState, useMemo } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { InputText } from 'primereact/inputtext';
import '../styles/EmployeeSelector.sass';

/**
 * Interfaz para definir columnas del selector
 */
export interface EmployeeSelectorColumn<T = Record<string, never>> {
  field: string;
  header: string;
  bodyTemplate?: (item: T) => React.ReactNode;
}

/**
 * Props del componente EmployeeSelector
 */
export interface EmployeeSelectorProps<T = Record<string, never>> {
  data: T[];
  columns: EmployeeSelectorColumn<T>[];
  rowKey: string;
  searchFields: string[];
  searchPlaceholder?: string;
  onSelect: (item: T | null) => void;
  selectedItem?: T | null;
  label?: string;
  emptyMessage?: string;
}

/**
 * Helper function para obtener valores de propiedades anidadas
 */
const getNestedValue = (obj: Record<string, unknown>, path: string): unknown => {
  return path.split('.').reduce((current: unknown, key: string) => {
    if (current && typeof current === 'object') {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
};

/**
 * Componente de selección de empleados con búsqueda y tabla
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const EmployeeSelector = <T extends Record<string, any>>({
  data,
  columns,
  rowKey,
  searchFields,
  searchPlaceholder = 'Buscar...',
  onSelect,
  selectedItem,
  label,
  emptyMessage = 'No se encontraron resultados'
}: EmployeeSelectorProps<T>) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrado de datos basado en el término de búsqueda
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;

    const query = searchTerm.toLowerCase();
    return data.filter(item =>
      searchFields.some(field => {
        const value = getNestedValue(item, field);
        if (!value) return false;

        // Manejar arrays
        if (Array.isArray(value)) {
          return value.some(v =>
            String(v).toLowerCase().includes(query) ||
            (typeof v === 'object' && Object.values(v).some(val =>
              String(val).toLowerCase().includes(query)
            ))
          );
        }

        return String(value).toLowerCase().includes(query);
      })
    );
  }, [data, searchTerm, searchFields]);

  return (
    <div className="employee-selector-container">
      <div className="mb-4 flex items-center gap-3 search-wrapper">
        {label && <label className="text-sm font-semibold whitespace-nowrap">{label}</label>}
        <IconField iconPosition="left" className="flex-1">
          <InputIcon className="pi pi-search" />
          <InputText
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </IconField>
      </div>

      <div className="datatable-responsive-wrapper">
        <DataTable
          value={filteredData}
          selectionMode="single"
          selection={selectedItem}
          onSelectionChange={(e) => onSelect(e.value as T)}
          dataKey={rowKey}
          emptyMessage={emptyMessage}
          stripedRows
          showGridlines
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 25, 50]}
          className="employee-datatable"
        >
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
    </div>
  );
};

export default EmployeeSelector;
