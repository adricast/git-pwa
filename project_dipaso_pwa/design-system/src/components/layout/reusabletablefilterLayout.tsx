// src/components/ReusableTable/ReusableTable.tsx

import React, { useState, useCallback, useEffect } from "react";
import { FaChevronLeft, FaChevronRight, FaSearch } from "react-icons/fa";
// ✅ CORRECCIÓN: Usando 'interfaz' para resolver el error TS2305
import {type ReusableTableFilterProps as ReusableTableProps } from "./../../components/reusabletablefilter/interface";
import { useTableLogic } from "../reusabletablefilter/tablelogic";

// ✅ NUEVO: Importar el componente de entrada de filtro de columna
import ColumnFilterInput from "./../../components/reusabletablefilter/columfilter"; 

import "./../styles/reusabletablefilterLayout.sass"; 

const ReusableTableFilterLayout: React.FC<ReusableTableProps> = ({
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
    // NO HAY ERROR TS(2339) AQUÍ si TableLogicHook y useTableLogic están actualizados
    columnFilters, setColumnFilter,
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
          <div className="search-container"> 
          <div className="search-box">
              <FaSearch className="search-icon" />
              <input
                  type="text"
                  placeholder="Búsqueda Global..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                  aria-label="Buscar en la tabla"
              />
          </div>
         </div>
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
            {/* ✅ NUEVO: Fila de filtros por columna */}
            <tr className="filter-row">
              {selectableField && <th className="checkbox-col"></th>}
              {columns.map((col) => (
                <th key={`filter-${col.field}`} className="table-filter-cell">
                    <ColumnFilterInput 
                        column={col} 
                        filterValue={columnFilters[col.field]}
                        setFilter={setColumnFilter}
                        data={data} // Se usa para la detección de tipo de dato
                    />
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
                {/* IMPLEMENTACIÓN DEL CLICK EN LA CELDA */}
                {columns.map((col) => (
                  <td 
                    key={col.field} 
                    className={`table-cell ${col.onCellClick ? 'clickable-cell' : ''}`}
                    onClick={(e) => {
                        e.stopPropagation(); 
                        if (col.onCellClick) {
                            col.onCellClick(row); 
                        } else {
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
                      {/* ✅ MENSAJE MEJORADO: Distingue entre tabla vacía y resultado de filtro/búsqueda */}
                      {totalRows === 0 && searchTerm === "" && Object.keys(columnFilters).length === 0 
                            ? "No hay datos para mostrar." 
                            : `No se encontraron resultados que coincidan con los criterios de búsqueda.`}
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

export default ReusableTableFilterLayout;