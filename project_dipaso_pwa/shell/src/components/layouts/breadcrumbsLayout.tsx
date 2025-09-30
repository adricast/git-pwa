// src/components/layout/Breadcrumbs.tsx
import React from "react";
import { useNavigate } from "react-router-dom";

interface BreadcrumbItem {
  label: string;
  url: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  activeColor?: string;  // color del breadcrumb activo
  textColor?: string;    // color de los demás
  separator?: string;    // separador entre items
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  activeColor = "#4f46e5", // violeta tailwind
  textColor = "#2c3e50",   // gris oscuro
  separator = "→",
}) => {
  const navigate = useNavigate();

  return (
    <nav className="flex flex-wrap items-center text-sm mb-2" aria-label="breadcrumb">
      {items.map((crumb, index) => (
        <span key={crumb.url} className="flex items-center">
          <button
            onClick={() => index !== items.length - 1 && navigate(crumb.url)}
            style={{
              color: index === items.length - 1 ? activeColor : textColor,
              cursor: index === items.length - 1 ? "default" : "pointer",
            }}
            className={`px-2 py-1 rounded transition-colors duration-200 hover:bg-gray-100 font-medium ${
              index === items.length - 1 ? "font-bold" : ""
            }`}
          >
            {crumb.label}
          </button>
          {index < items.length - 1 && (
            <span className="mx-1 text-gray-400">{separator}</span>
          )}
        </span>
      ))}
    </nav>
  );
};

export default Breadcrumbs;
