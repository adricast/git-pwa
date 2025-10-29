// ============================================================================
// CAPA: Content/Vista - Componente reutilizable genérico de selección de datos
// ============================================================================

import React, { useState, useMemo } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { InputText } from 'primereact/inputtext';

/**
 * Interfaz para definir columnas del DataSelector
 */
export interface DataSelectorColumn<T = unknown> {
  field: string;
  header: string;
  bodyTemplate?: (item: T) => React.ReactNode;
}

/**
 * Props del componente DataSelector
 */
export interface DataSelectorProps<T = Record<string, unknown>> {
  /** Array de datos a mostrar */
  data: T[];
  /** Configuración de columnas */
  columns: DataSelectorColumn<T>[];
  /** Campo único para identificar cada fila */
  rowKey: string;
  /** Campos donde realizar la búsqueda */
  searchFields: string[];
  /** Placeholder del input de búsqueda */
  searchPlaceholder?: string;
  /** Callback cuando se selecciona un item */
  onSelect: (item: T | null) => void;
  /** Item actualmente seleccionado */
  selectedItem?: T | null;
  /** Label opcional que aparece inline con el buscador */
  label?: string;
  /** Mensaje cuando no hay datos */
  emptyMessage?: string;
  /** Clase CSS adicional */
  className?: string;
}

/**
 * Helper function para obtener valores de propiedades anidadas
 * Ejemplo: getNestedValue(obj, 'user.address.city')
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
 * Componente genérico para seleccionar items de una lista con búsqueda
 * Utiliza PrimeReact DataTable con selección única
 */
export const DataSelector = <T extends Record<string, any>>({
  data,
  columns,
  rowKey,
  searchFields,
  searchPlaceholder = 'Buscar...',
  onSelect,
  selectedItem,
  label,
  emptyMessage = 'No se encontraron resultados',
  className = ''
}: DataSelectorProps<T>) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrado de datos basado en el término de búsqueda
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;

    const query = searchTerm.toLowerCase();
    return data.filter(item =>
      searchFields.some(field => {
        const value = getNestedValue(item, field);
        if (!value) return false;

        // Manejar arrays (ej: documents[])
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
    <div className={`data-selector-container ${className}`}>
      {/* Barra de búsqueda con label opcional */}
      <div className="data-selector-search">
        {label && <label className="data-selector-label">{label}</label>}
        <IconField iconPosition="left" className="data-selector-input-wrapper">
          <InputIcon className="pi pi-search" />
          <InputText
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            className="data-selector-input"
          />
        </IconField>
      </div>

      {/* Tabla de datos con selección */}
      <DataTable
        value={filteredData}
        selectionMode="single"
        selection={selectedItem}
        onSelectionChange={(e) => onSelect(e.value as T)}
        dataKey={rowKey}
        emptyMessage={emptyMessage}
        stripedRows
        showGridlines
        className="data-selector-table"
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
  );
};

export default DataSelector;
