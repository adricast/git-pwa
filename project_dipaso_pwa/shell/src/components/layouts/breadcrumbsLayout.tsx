// src/components/layout/breadcrumbsLayout.tsx

import React from "react";
import { useNavigate } from "react-router-dom";
// 🎯 Importamos el tipo desde su archivo dedicado
import { type BreadcrumbItem } from './../breadcrumb/interface'; 
// 🎯 Importamos los estilos SCSS puros
import './../styles/breadcrumbsLayout.sass'; 

// Ya no hay 'export interface BreadcrumbItem' aquí, solo la usamos.

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  activeColor?: string;
  textColor?: string;
  separator?: string;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  activeColor = "#4f46e5",
  textColor = "#2c3e50",
  separator = "→",
}) => {
  const navigate = useNavigate();

  return (
    // 🎯 Clases CSS puras aplicadas
    <nav className="breadcrumbs-nav" aria-label="breadcrumb">
      {items.map((crumb, index) => (
        <span key={crumb.url} className="breadcrumb-item">
          <button
            onClick={() => index !== items.length - 1 && navigate(crumb.url)}
            style={{
              color: index === items.length - 1 ? activeColor : textColor,
              cursor: index === items.length - 1 ? "default" : "pointer",
            }}
            className={`breadcrumb-button ${
              index === items.length - 1 ? "active" : ""
            }`}
          >
            {crumb.label}
          </button>
          {index < items.length - 1 && (
            <span style={{ color: textColor }} className="breadcrumb-separator">
              {separator}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
};

export default Breadcrumbs;