import React, { useState, useEffect, useRef, useCallback } from "react";
import { NavLink } from "react-router-dom";
import { FaTimes, FaWarehouse, FaUserCircle, FaAngleDown } from 'react-icons/fa'; // Se añade FaAngleDown
import "./../styles/navbar2Layout.scss"; 

export interface NavItem {
    label: string;
    path: string;
    icon: React.ReactNode;
}

interface Branch { 
    id: string; 
    name: string; 
    code?: string; // Propiedad opcional
}

interface NavProps {
    items: NavItem[];
    branches?: Branch[];
    userName?: string;
    userPhotoUrl?: string;
    onClose?: () => void; // Callback para cerrar Nav
    isVisible: boolean; // Indica si el sidebar está visible (usado para móvil)
    // 💡 Propiedad para manejar la sucursal activa desde el componente padre
    selectedBranchId?: string; 
    onBranchChange?: (branchId: string) => void; 
}

export const Nav: React.FC<NavProps> = ({
    items,
    branches = [],
    userName = "Usuario",
    userPhotoUrl,
    onClose,
    isVisible,
    // 💡 Se desestructura la nueva prop
    selectedBranchId: propSelectedBranchId, 
    onBranchChange,
}) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    // 💡 Usamos propSelectedBranchId si se pasa, si no, el primer ID, si no, cadena vacía.
    const [selectedBranch, setSelectedBranch] = useState(propSelectedBranchId || branches[0]?.id || ""); 
    const [compact, setCompact] = useState(false); 
    const navRef = useRef<HTMLDivElement>(null);

    const branchButtonRef = useRef<HTMLButtonElement>(null); 
    const [menuPosition, setMenuPosition] = useState<{ top: number, left: number } | null>(null);

    // --- Búsqueda de la sucursal seleccionada ---
    // 💡 Se usa el estado local 'selectedBranch' para buscar
    const currentBranch = branches.find(b => b.id === selectedBranch);

    // 💡 Sincroniza el estado local con la prop externa si cambia.
    useEffect(() => {
        if (propSelectedBranchId !== undefined && propSelectedBranchId !== selectedBranch) {
            setSelectedBranch(propSelectedBranchId);
        } else if (branches.length && !selectedBranch) {
            // Inicialización si no hay prop ni estado local
            setSelectedBranch(branches[0].id);
        }
    }, [branches, selectedBranch, propSelectedBranchId]);


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
        // Al abrir, calcula la posición; al cerrar, limpia.
        if (!dropdownOpen && branchButtonRef.current) {
            const rect = branchButtonRef.current.getBoundingClientRect();
            // El menú se posiciona Fijo a la derecha de la barra
            setMenuPosition({
                top: rect.top, // Alineado con la parte superior del botón
                left: rect.right // A la derecha de la barra
            });
        } else {
            setMenuPosition(null);
        }
        setDropdownOpen(prev => !prev);
    }, [dropdownOpen]);

    // Maneja la selección de sucursal
    const handleBranchSelect = (id: string) => {
        setSelectedBranch(id); 
        // 💡 Llama al callback si existe
        if (onBranchChange) {
            onBranchChange(id);
        }
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

        {/* LOGO PRINCIPAL: Vuelve a ser solo "DIP" */}
        <div className="logo center">
            <span className="text-xl font-extrabold text-white">DIP</span>
        </div>

        {/* Selector de Sucursal: Muestra la información y es el botón interactivo */}
        {branches.length > 0 && (
            <div className="branch-selector" >
                <button 
    className={`branch-btn ${currentBranch ? 'branch-selected' : ''}`} 
    onClick={toggleDropdown}
    ref={branchButtonRef}
    title={currentBranch?.name || "Seleccionar Sucursal"}
>
    {currentBranch ? (
        // Reemplaza "flex flex-col items-start w-full p-1"
        <div className="branch-content-expanded"> 
            
            {/* Logo y Código (Fila superior) */}
             <div className="branch-header-row">
                 <FaWarehouse className="branch-icon-lg" /> 
                {currentBranch.code && (
                    // Reemplaza "font-bold text-sm text-white leading-none"
                    <span className="branch-code">
                        {currentBranch.code}
                    </span>
                )}
                {/* Ícono de flecha que indica desplegable, útil solo cuando NO está compacta */}
                  {!compact && <FaAngleDown className="branch-arrow" />} 
            </div>
            
            {/* Nombre (Fila inferior) */}
               <span className="branch-name-row">
                {currentBranch.name}
            </span>
        </div>
    ) : (
        // Vista por defecto (solo ícono) si no hay sucursal seleccionada
        <FaWarehouse className="branch-icon" />
    )}
</button>
            </div>
        )}
        
        {/* Menú Desplegable (renderizado con posición fija) - Se mantiene aquí para evitar problemas de z-index */}
        {dropdownOpen && menuPosition && (
            <div className="branch-options"
                style={{
                    position: 'fixed',
                    top: menuPosition.top,
                    // 💡 Lógica para ajustar el 'left': Si la Nav está compacta, lo mantiene a la derecha;
                    // Si está expandida, el dropdown debe aparecer a la derecha de la Nav, no del botón.
                    left: compact ? menuPosition.left : navRef.current ? navRef.current.getBoundingClientRect().right : menuPosition.left, 
                    zIndex: 9999
                }}
            >
                <div className="branch-options-header">
                    Selecciona una Sucursal
                </div>
                {branches.map(b => (
                    <button 
                        key={b.id} 
                        className={`branch-option ${b.id === selectedBranch ? 'selected' : ''}`} 
                        onClick={() => handleBranchSelect(b.id)}
                    >
                        {b.name} ({b.code || 'N/A'})
                    </button>
                ))}
            </div>
        )}

        {/* Menu Items: NECESITA flex-grow: 1 en SCSS para empujar el bloque de usuario hacia abajo */}
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

        {/* 🔑 BLOQUE DE USUARIO MOVIDO AL FINAL y con CLASE user-info-bottom para posicionamiento */}
        <div className="user-info-container user-info-bottom"> 
            {/* 💡 AÑADIDA CLASE 'vertical-layout' */}
            <div className={`user-info vertical-layout ${compact ? 'compact' : ''}`}> 
                {userPhotoUrl ? (
                    <img src={userPhotoUrl} alt={userName} className="user-avatar" />
                ) : (
                    <div className="user-avatar-placeholder">
                        {userName[0] || <FaUserCircle />}
                    </div>
                )}
                {/* 💡 user-details solo se muestra si NO está en modo compacto */}
                {!compact && (
                    <div className="user-details">
                        <span className="user-name">{userName}</span>
                    </div>
                )}
            </div>
        </div>
        </nav>
    );
};

export default Nav;