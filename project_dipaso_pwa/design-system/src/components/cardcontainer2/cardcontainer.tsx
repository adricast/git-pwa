// src/components/CardContainer/CardContainer.tsx (MODIFICADO)

import React from 'react';
import { FaTimes } from 'react-icons/fa'; 
import { type CardContainerProps } from './interface';
import { CardProvider } from './cardprovider'; 
//import './../../styles/cardcontainer2Layout.sass';

const CardContainer: React.FC<CardContainerProps> = ({ 
  id,
  children, 
  title,
  className = '',
  onClose,
  // 🔑 AÑADIDO: Destructurar la nueva prop con valor por defecto
  hideHeader = false, 
}) => {
  
  // Función de cierre para el botón de la cabecera
  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose(id); 
  };

  return (
    // 🎯 Envuelve el contenido con el Provider para dar acceso a closeCard()
    <CardProvider id={id} onClose={onClose}>
      
      {/* 🔑 AÑADIDO: Clase content-only cuando se usa como ficha */}
      <div className={`card-container ${className} ${hideHeader ? 'content-only' : ''}`}>
        
        {/* 🔑 RENDERIZADO CONDICIONAL: Solo mostrar el header si hideHeader es false */}
        {!hideHeader && (
            <div className="card-header">
                {title && <h3 className="card-title">{title}</h3>}
                
                <button 
                    className="card-close-btn" 
                    onClick={handleClose}
                    aria-label={`Close card ${title || id}`}
                >
                    <FaTimes />
                </button>
            </div>
        )}

        <div className="card-content">
          {children}
        </div>
      </div>
    </CardProvider>
  );
};

export default CardContainer;