import React, { useState, useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";

import "./../styles/navbarLayout.scss"; 
import { FaChevronDown,  FaTimes, FaWarehouse, FaUserCircle } from 'react-icons/fa';

export interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

interface NavProps {
  items: NavItem[];
  branches?: { id: string; name: string }[];
  userName?: string;
  userPhotoUrl?: string;
  onClose?: () => void; // Callback para cerrar Nav
   // 👈 Nueva prop
  isVisible: boolean; 
}

export const Nav: React.FC<NavProps> = ({
  items,
  branches = [],
  userName = "Usuario",
  userPhotoUrl,
  onClose,
   // 👈 Nueva prop
  isVisible
}) => {
  //const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(branches[0]?.id || "");
  const [compact, setCompact] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (branches.length && !selectedBranch) setSelectedBranch(branches[0].id);
  }, [branches, selectedBranch]);

  // Detecta ancho y compacta nav si es muy pequeño
  useEffect(() => {
    if (!navRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        setCompact(width <= 200);
      }
    });
    observer.observe(navRef.current);
    return () => observer.disconnect();
  }, []);

  const currentBranchName = branches.find(b => b.id === selectedBranch)?.name || "Seleccionar Sucursal";

  return (
    <>
      {/* Toggle móvil */}
   

      {/* Nav */}
       {/* Nav */}
         <nav ref={navRef} 
         
              className={`navbar ${compact ? 'compact' : 'expanded'} ${isVisible ? 'mobile-open' : ''}`}
          >
    
          {/* Botón para cerrar Nav */}
          {onClose && (
            <button className="nav-close-btn" onClick={onClose} title="Cerrar menú">
              <FaTimes />
            </button>
          )}

          {/* Logo */}
          <div className={`logo ${compact ? 'center' : ''}`}>
            {compact ? 'A' : 'DIPASO PWA'}
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
            {!compact && <span className="user-name">{userName}</span>}
          </div>

          {/* Branch selector */}
          {branches.length > 0 && (
            <div className="branch-selector">
              <button className="branch-btn" onClick={() => setDropdownOpen(!dropdownOpen)}>
                <FaWarehouse className="branch-icon" />
                {!compact && <span className="branch-name">{currentBranchName}</span>}
                {!compact && <FaChevronDown className={`branch-chevron ${dropdownOpen ? 'rotated' : ''}`} />}
              </button>
              {dropdownOpen && (
                <div className="branch-options">
                  {branches.map(b => (
                    <button key={b.id} className={`branch-option ${b.id === selectedBranch ? 'selected' : ''}`} onClick={() => { setSelectedBranch(b.id); setDropdownOpen(false); }}>
                      {b.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Menu Items */}
          <div className="menu-items">
            {items.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
                onClick={onClose} 
              >
                <div className="item-icon">{item.icon}</div>
                {!compact && <div className="item-label">{item.label}</div>}
                {compact && <div className="item-tooltip">{item.label}</div>}
              </NavLink>
            ))}
          </div>
        </nav>
      
    </>
  );
};

export default Nav;
