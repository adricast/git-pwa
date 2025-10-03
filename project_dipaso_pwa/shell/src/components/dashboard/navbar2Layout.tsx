import React, { useState, useEffect, useRef, useCallback } from "react";
import { NavLink } from "react-router-dom";
import { FaTimes, FaWarehouse, FaUserCircle } from 'react-icons/fa'; 
import "./../styles/navbar2Layout.scss"; 

export interface NavItem {
 label: string;
 path: string;
 icon: React.ReactNode;
}

interface Branch { 
 id: string; 
 name: string; 
 code?: string;
}

interface NavProps {
 items: NavItem[];
 branches?: Branch[];
 userName?: string;
 userPhotoUrl?: string;
 onClose?: () => void; // Callback para cerrar Nav
 isVisible: boolean; // Indica si el sidebar está visible (usado para móvil)
}

export const Nav: React.FC<NavProps> = ({
 items,
 branches = [],
 userName = "Usuario",
 userPhotoUrl,
 onClose,
 isVisible
}) => {
 const [dropdownOpen, setDropdownOpen] = useState(false);
 const [selectedBranch, setSelectedBranch] = useState(branches[0]?.id || ""); 
 // El estado 'compact' basado en el ResizeObserver ya no es estrictamente necesario 
    // si el ancho es fijo a 80px, pero se mantiene para la lógica de estilos SCSS.
 const [compact, setCompact] = useState(false); 
 const navRef = useRef<HTMLDivElement>(null);

 const branchButtonRef = useRef<HTMLButtonElement>(null); 
 const [menuPosition, setMenuPosition] = useState<{ top: number, left: number } | null>(null);

 useEffect(() => {
 if (branches.length && !selectedBranch) setSelectedBranch(branches[0].id);
 }, [branches, selectedBranch]);

 // Usa ResizeObserver para determinar si la nav está compacta (<= 85px)
 useEffect(() => {
 if (!navRef.current) return;
 const observer = new ResizeObserver((entries) => {
 for (const entry of entries) {
 const width = entry.contentRect.width;
 setCompact(width <= 85); 
 }
 });
 observer.observe(navRef.current);
 return () => observer.disconnect();
 }, []);

 // Función para abrir el menú de sucursales y calcular su posición (fijo)
 const toggleDropdown = useCallback(() => {
 if (!dropdownOpen && branchButtonRef.current) {
 const rect = branchButtonRef.current.getBoundingClientRect();
 setMenuPosition({
 top: rect.top, // Alineado con la parte superior del botón
 left: rect.right // A la derecha de la barra
 });
 } else {
setMenuPosition(null);
 }
 setDropdownOpen(!dropdownOpen);
 }, [dropdownOpen]);

 // Maneja la selección de sucursal
 const handleBranchSelect = (id: string) => {
 setSelectedBranch(id); 
 setDropdownOpen(false);
 setMenuPosition(null);
 }
 
 return (
 <nav ref={navRef} 
 className={`nav vertical ${compact ? 'compact' : 'expanded'} ${isVisible ? 'mobile-open' : ''}`}
 >
 
 {/* Botón para cerrar Nav (visible solo en móvil por SCSS) */}
 {onClose && (
 <button 
                    className="nav-close-btn" 
                    onClick={onClose} 
                    title="Cerrar menú"
                >
 <FaTimes />
 </button>
 )}

 {/* Logo */}
 <div className="logo center">
 DIP 
</div>

 {/* Usuario */}
 <div className="user-info">
{userPhotoUrl ? (
<img src={userPhotoUrl} alt={userName} className="user-avatar" />
) : (
<div className="user-avatar-placeholder">
 {userName[0] || <FaUserCircle />}
 </div>
 )}
 </div>

{/* Selector de Sucursal */}
{branches.length > 0 && (
<div className="branch-selector" >
<button 
className="branch-btn" 
onClick={toggleDropdown}
 ref={branchButtonRef}
 >
 <FaWarehouse className="branch-icon" />
 </button>
 </div>
 )}
 
 {/* Menú Desplegable (renderizado con posición fija) */}
 {dropdownOpen && menuPosition && (
 <div className="branch-options"
style={{
 position: 'fixed',
 top: menuPosition.top,
left: menuPosition.left,
 zIndex: 9999
}}
>
{branches.map(b => (
<button 
key={b.id} 
className={`branch-option ${b.id === selectedBranch ? 'selected' : ''}`} 
onClick={() => handleBranchSelect(b.id)}
 >
 {b.name}
 </button>
))}
 </div>
)}

 {/* Menu Items */}
<div className="menu-items">
{items.map(item => (
<NavLink
key={item.path}
to={item.path}
className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
title={item.label} 
// Cierra el sidebar móvil al hacer click en un ítem
                        {...(onClose && { onClick: onClose })}
>
 <div className="icon">{item.icon}</div>
 <div className="label">{item.label}</div> 
</NavLink>
))}
 </div>
 </nav>
 );
};

export default Nav;