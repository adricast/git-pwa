// src/components/Nav.tsx
import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
// No necesitamos el SCSS: import "./Nav.scss"; 
import { FaChevronDown, FaBars, FaTimes, FaWarehouse, FaUserCircle } from 'react-icons/fa';

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
}

export const Nav: React.FC<NavProps> = ({
  items,
  branches = [],
  userName = "Usuario",
  userPhotoUrl,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(branches[0]?.id || "");
  
  // El estado 'compact' se usará para el colapso de la barra lateral
  const [compact, setCompact] = useState(false); 
  
  // Efecto para inicializar la sucursal seleccionada
  useEffect(() => {
    if (branches.length > 0 && !selectedBranch) {
      setSelectedBranch(branches[0].id);
    }
  }, [branches, selectedBranch]);

  // Nombre de la sucursal seleccionada
  const currentBranchName = branches.find((b) => b.id === selectedBranch)?.name || "Seleccionar Sucursal";

  // --- CLASES DE TAILWIND CSS ---

  const navBaseClasses = `
    fixed top-0 left-0 h-full z-40 bg-gray-800 text-white shadow-2xl
    transition-all duration-300 ease-in-out p-4 flex flex-col
    w-64 ${compact ? 'lg:w-20' : 'lg:w-64'}
    hidden lg:flex
    ${mobileOpen ? '!flex' : ''}
  `;

  const itemClasses = `
    relative flex items-center p-3 my-1 rounded-lg text-sm font-medium
    hover:bg-indigo-600 hover:text-white transition-colors duration-200
    whitespace-nowrap
  `;
  const activeItemClasses = `bg-indigo-700 text-white shadow-md`;
  
  const toggleClasses = `
    fixed top-4 right-4 z-50 p-2 text-2xl bg-indigo-700 text-white rounded-md
    lg:hidden cursor-pointer
  `;
  
  const contentClasses = `
    flex-grow overflow-y-auto space-y-4
  `;
  
  return (
    <>
      <button
        className={toggleClasses}
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
      >
        {mobileOpen ? <FaTimes /> : <FaBars />}
      </button>
    
      <button
        className={`
          hidden lg:block absolute top-4 
          ${compact ? 'left-[4.5rem]' : 'left-56'} 
          p-1 bg-gray-700 text-white rounded-full z-50
          transition-all duration-300 ease-in-out hover:bg-indigo-600
        `}
        onClick={() => setCompact(!compact)}
        aria-label={compact ? "Expandir menú" : "Colapsar menú"}
      >
        <FaChevronDown className={compact ? 'rotate-90' : '-rotate-90'} size={14} />
      </button>

      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black opacity-50 z-30 lg:hidden" 
          onClick={() => setMobileOpen(false)} 
        />
      )}

      <nav className={navBaseClasses}>
        <div className={`text-2xl font-extrabold mb-8 text-indigo-400 
            ${compact ? 'text-center' : 'text-left'}`}>
          <span className={compact ? 'hidden' : 'inline'}>App Name</span>
          <span className={compact ? 'inline' : 'hidden'}>A</span>
        </div>

        <div className={contentClasses}>
          <div className="flex items-center space-x-3 pb-4 border-b border-gray-700">
            {userPhotoUrl ? (
              <img src={userPhotoUrl} alt={userName} className="w-10 h-10 rounded-full object-cover border-2 border-indigo-400" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-xl font-bold">
                {userName[0] || <FaUserCircle />}
              </div>
            )}
            <span className={`text-sm font-semibold truncate ${compact ? 'hidden' : 'inline'}`}>
              {userName}
            </span>
          </div>

          {branches.length > 0 && (
            <div className="relative pt-4">
              <button
                className={`w-full flex items-center justify-between p-3 text-sm rounded-lg border border-gray-600 bg-gray-700
                hover:bg-gray-600 transition-colors duration-200
                ${compact ? 'justify-center' : ''}`}
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <FaWarehouse className={`text-indigo-400 ${compact ? 'mr-0' : 'mr-3'}`} size={16}/>
                <span className={`truncate text-left ${compact ? 'hidden' : 'inline'}`}>
                  {currentBranchName}
                </span>
                <FaChevronDown className={`w-3 h-3 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''} ${compact ? 'hidden' : 'inline'}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute top-full mt-2 w-full bg-gray-700 rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto">
                  {branches.map((b) => (
                    <button
                      key={b.id}
                      className={`w-full text-left p-3 text-sm hover:bg-indigo-600 transition-colors duration-150
                      ${b.id === selectedBranch ? 'bg-indigo-500 font-bold' : ''}`}
                      onClick={() => {
                        setSelectedBranch(b.id);
                        setDropdownOpen(false);
                      }}
                    >
                      {b.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="mt-6 space-y-1">
            {items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `group ${itemClasses} ${isActive ? activeItemClasses : 'text-gray-300'}`
                }
                onClick={() => setMobileOpen(false)}
              >
                <div className={`flex-shrink-0 text-xl ${compact ? 'mx-auto' : 'mr-3'}`}>
                  {item.icon}
                </div>
                <div className={`${compact ? 'hidden' : 'inline'}`}>{item.label}</div>
                {compact && (
                  <div className="
                    absolute left-full ml-4 top-1/2 -translate-y-1/2 
                    opacity-0 group-hover:opacity-100 transition-opacity duration-200
                    bg-gray-900 text-white text-sm p-2 rounded-lg shadow-xl 
                    whitespace-nowrap pointer-events-none z-50
                    lg:block
                  ">
                    {item.label}
                  </div>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>
    
      <div className={`
          hidden lg:block h-full 
          w-64 ${compact ? 'lg:w-20' : 'lg:w-64'} 
          transition-all duration-300 ease-in-out
        `} 
      />
    </>
  );
};

export default Nav;
