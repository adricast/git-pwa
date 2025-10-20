// src/components/ReusableTable.tsx

import React, { useState, useCallback, useEffect } from "react";
//import "./../../styles/screenusableLayout.sass"; // 👈 Nueva ruta del SCSS

// --- Tipado ---

interface ButtonConfig {
  label: string;
  color?: string; // Propiedad de estilo de fondo SCSS (ej. 'btn-delete', 'btn-edit')
  textColor?: string; // Propiedad de estilo de texto SCSS
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
  // Las propiedades 'styles' se simplifican o eliminan si usamos un SCSS estático
  styles?: {
    // Dejamos solo las opciones de personalización más obvias si se usan con CSS Modules o variables CSS
    selectedRowClass?: string;
    rowHoverClass?: string;
  };
  selectedRows?: any[];
  setSelectedRows?: (rows: any[]) => void;
}

const ReusableTable: React.FC<ReusableTableProps> = ({
  moduleName,
  data,
  rowKey,
  columns,
  buttons = [],
  selectableField,
  onRowSelect,
  styles = {},
  selectedRows: controlledSelectedRows,
  setSelectedRows: setControlledSelectedRows,
}) => {
  // Manejo del estado interno/externo para filas seleccionadas
  const [internalSelectedRows, setInternalSelectedRows] = useState<any[]>(controlledSelectedRows || []);

  // Sincroniza el estado interno si las props cambian (para control externo)
  useEffect(() => {
    if (controlledSelectedRows) {
      setInternalSelectedRows(controlledSelectedRows);
    }
  }, [controlledSelectedRows]);

  // Determinar qué estado usar
  const currentSelectedRows = controlledSelectedRows || internalSelectedRows;
  const setSelection = setControlledSelectedRows || setInternalSelectedRows;

  const handleRowClick = useCallback((row: any) => {
    if (!selectableField) return;

    const isSelected = currentSelectedRows.includes(row);
    let newSelection: any[];

    // Si la fila ya está seleccionada, deseleccionarla; de lo contrario, seleccionarla
    if (isSelected) {
      newSelection = currentSelectedRows.filter((r) => r !== row);
    } else {
      newSelection = [...currentSelectedRows, row];
    }

    setSelection(newSelection);
    
    // Si se proporciona un callback para una sola fila, envíala
    if (onRowSelect) {
      // Si es selección múltiple, onRowSelect puede no ser adecuado, pero se mantiene la lógica original:
      onRowSelect(newSelection.length > 0 ? newSelection[0] : null);
    }
  }, [selectableField, currentSelectedRows, setSelection, onRowSelect]);

  const isRowSelected = (row: any) => currentSelectedRows.includes(row);

  return (
    <div className="table-container">
      <h2 className="table-title">{moduleName}</h2>

      {/* Botones */}
      <div className="table-actions">
        {buttons.map((btn, idx) => {
          const labelLower = btn.label.toLowerCase();
          const isDelete = labelLower === "eliminar";
          const isEdit = labelLower === "editar";
          
          // Lógica de deshabilitación basada en la selección
          const disabled =
            (isDelete && currentSelectedRows.length === 0) ||
            (isEdit && currentSelectedRows.length !== 1);

          // Clases basadas en el tipo de botón para estilos SCSS
          let btnClass = btn.color || 'btn-default';
          if (isDelete) btnClass = 'btn-delete';
          else if (isEdit) btnClass = 'btn-edit';

          return (
            <button
              key={idx}
              onClick={() => btn.onClick(currentSelectedRows)}
              className={`table-btn ${btnClass} ${btn.textColor || 'text-light'}`}
              disabled={disabled}
            >
              {btn.label}
            </button>
          );
        })}
      </div>

      {/* Tabla */}
      <div className="table-wrapper">
        <table className="data-table">
          <thead className="table-head">
            <tr>
              {selectableField && <th className="checkbox-col"></th>}
              {columns.map((col) => (
                <th key={col.field} className="table-header-cell">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="table-body">
            {data.map((row) => (
              <tr
                key={row[rowKey]}
                onClick={() => handleRowClick(row)}
                className={`table-row ${selectableField ? 'row-clickable' : ''} ${
                  isRowSelected(row)
                    ? styles.selectedRowClass || "row-selected"
                    : styles.rowHoverClass || "row-hover"
                }`}
              >
                {selectableField && (
                  <td className="table-cell table-checkbox-cell">
                    <input
                      type="checkbox"
                      checked={isRowSelected(row)}
                      readOnly
                      className="custom-checkbox"
                    />
                  </td>
                )}
                {columns.map((col) => (
                  <td key={col.field} className="table-cell">
                    {col.bodyTemplate ? col.bodyTemplate(row) : row[col.field]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReusableTable;
