// src/components/ReusableTable/ReusableTable.tsx

import React, { useState, useCallback, useEffect } from "react";
import { FaChevronLeft, FaChevronRight, FaSearch } from "react-icons/fa";
import {type ReusableTableProps } from "../reusabletable/interface";
import { useTableLogic } from "./../reusabletable/tablelogic";

import "./../styles/reusabletableLayout.sass"; 

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
  initialRowsPerPage = 10, 
}) => {
  // --- Lógica de la tabla (Hook) ---
  const {
    searchTerm, setSearchTerm,
    currentPage, rowsPerPage, setRowsPerPage,
    totalPages, totalRows, paginatedData,
    handlePageChange,
  } = useTableLogic(data, columns, initialRowsPerPage);
    
  // --- Lógica de la Selección (Estado) ---
  const [internalSelectedRows, setInternalSelectedRows] = useState<any[]>(controlledSelectedRows || []);
  const currentSelectedRows = controlledSelectedRows || internalSelectedRows;
  const setSelection = setControlledSelectedRows || setInternalSelectedRows;

  // Sincroniza el estado interno si las props de control cambian
  useEffect(() => {
    if (controlledSelectedRows) {
      setInternalSelectedRows(controlledSelectedRows);
    }
  }, [controlledSelectedRows]);


  const handleRowClick = useCallback((row: any) => {
    if (!selectableField) return;

    const isSelected = currentSelectedRows.includes(row);
    let newSelection: any[];

    if (isSelected) {
      newSelection = currentSelectedRows.filter((r) => r !== row);
    } else {
      newSelection = [...currentSelectedRows, row];
    }

    setSelection(newSelection);
    
    if (onRowSelect) {
      onRowSelect(newSelection.length > 0 ? newSelection[0] : null);
    }
  }, [selectableField, currentSelectedRows, setSelection, onRowSelect]);

  const isRowSelected = (row: any) => currentSelectedRows.includes(row);

  return (
    <div className="table-container">
      <h2 className="table-title">{moduleName}</h2>

      {/* Control de Búsqueda y Acciones */}
      <div className="table-header-controls">
          <div className="table-actions">
            {buttons.map((btn, idx) => {
              const shouldRender = btn.isVisible 
                                     ? btn.isVisible(currentSelectedRows) 
                                     : true; // Por defecto, si no se define isVisible, el botón es visible.

                if (!shouldRender) return null; // Si no debe renderizarse, salimos del map.

              const labelLower = btn.label.toLowerCase();
              const isDelete = labelLower === "eliminar";
              const isEdit = labelLower === "editar";
              const disabled =
                (isDelete && currentSelectedRows.length === 0) ||
                (isEdit && currentSelectedRows.length !== 1);

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
                  {/* 🔑 CAMBIO CLAVE: Renderiza el icono si existe */}
                  {btn.icon && (
                    <span 
                      style={{ 
                        marginRight: '8px', 
                        display: 'flex', 
                        alignItems: 'center' 
                      }}>
                        {btn.icon}
                    </span>
                  )}
                  {btn.label}
                </button>
              );
            })}
          </div>

          <div className="search-box">
              <FaSearch className="search-icon" />
              <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                  aria-label="Buscar en la tabla"
              />
          </div>
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
            {paginatedData.map((row) => (
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
                {/* 🔑 IMPLEMENTACIÓN DEL CLICK EN LA CELDA */}
                {columns.map((col) => (
                  <td 
                    key={col.field} 
                    // 1. Aplica la clase para el estilo de enlace si hay handler
                    className={`table-cell ${col.onCellClick ? 'clickable-cell' : ''}`}
                    onClick={(e) => {
                        // 2. IMPEDIR la selección de fila si se hace clic en la celda de enlace
                        e.stopPropagation(); 
                        if (col.onCellClick) {
                            // 3. Ejecuta la función de click de la columna
                            col.onCellClick(row); 
                        } else {
                            // 4. Si no hay handler, permite la selección de fila normal
                            handleRowClick(row);
                        }
                    }}
                  >
                    {col.bodyTemplate ? col.bodyTemplate(row) : row[col.field]}
                  </td>
                ))}
              </tr>
            ))}
            {paginatedData.length === 0 && (
              <tr>
                   <td colSpan={columns.length + (selectableField ? 1 : 0)} className="no-data-cell">
                      {data.length === 0 ? "No hay datos para mostrar." : `No se encontraron resultados para "${searchTerm}"`}
                   </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Paginación */}
      <div className="table-footer">
          <div className="pagination-info">
              Mostrando {totalRows === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1} - 
              {Math.min(currentPage * rowsPerPage, totalRows)} de {totalRows} registros
          </div>
          
          <div className="pagination-controls">
              <button 
                  onClick={() => handlePageChange(currentPage - 1)} 
                  disabled={currentPage === 1}
                  className="page-btn"
              >
                  <FaChevronLeft />
              </button>
              
              <span className="page-number">
                  Página {currentPage} de {totalPages || 1}
              </span>
              
              <button 
                  onClick={() => handlePageChange(currentPage + 1)} 
                  disabled={currentPage === totalPages || totalRows === 0}
                  className="page-btn"
              >
                  <FaChevronRight />
              </button>
          </div>
          
          <div className="rows-per-page">
              <label htmlFor="rows-select">Filas por pág.:</label>
              <select 
                  id="rows-select"
                  value={rowsPerPage} 
                  onChange={(e) => setRowsPerPage(Number(e.target.value))}
                  className="rows-select"
              >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
              </select>
          </div>
      </div>
    </div>
  );
};

export default ReusableTable;