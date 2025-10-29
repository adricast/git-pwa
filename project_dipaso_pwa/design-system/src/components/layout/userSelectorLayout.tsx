// Componente de selección de usuario con tabla
import React, { useState, useMemo } from 'react';
import { FaSearch } from 'react-icons/fa';

export interface UserSelectorColumn {
  field: string;
  header: string;
  bodyTemplate?: (item: any) => React.ReactNode;
}

export interface UserSelectorProps<T = any> {
  data: T[];
  columns: UserSelectorColumn[];
  rowKey: string;
  searchFields: string[];
  searchPlaceholder?: string;
  onSelect: (item: T | null) => void;
  selectedItem: T | null;
  emptyMessage?: string;
  label?: string;
}

// Helper function to get nested property value
const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

const UserSelectorLayout = <T extends Record<string, any>>({
  data,
  columns,
  rowKey,
  searchFields,
  searchPlaceholder = 'Buscar...',
  onSelect,
  selectedItem,
  emptyMessage = 'No se encontraron resultados',
  label
}: UserSelectorProps<T>) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;

    const query = searchTerm.toLowerCase();
    return data.filter(item =>
      searchFields.some(field => {
        const value = getNestedValue(item, field);
        if (!value) return false;

        // Handle arrays
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

  const isSelected = (item: T) => {
    if (!selectedItem) return false;
    return item[rowKey] === selectedItem[rowKey];
  };

  return (
    <div className="user-selector-container">
      {/* Label y Campo de búsqueda */}
      <div className="user-selector-search">
        {label && <label className="user-selector-label">{label}</label>}
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Tabla de resultados */}
      <div className="user-selector-table-wrapper">
        <table className="user-selector-table">
          <thead className="table-head">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className="table-header-cell">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <tr
                  key={item[rowKey]}
                  className={`table-row row-clickable row-hover ${
                    isSelected(item) ? 'row-selected' : ''
                  }`}
                  onClick={() => onSelect(item)}
                >
                  {columns.map((col, idx) => (
                    <td key={idx} className="table-cell">
                      {col.bodyTemplate
                        ? col.bodyTemplate(item)
                        : getNestedValue(item, col.field) || ''}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="no-data-cell">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserSelectorLayout;
