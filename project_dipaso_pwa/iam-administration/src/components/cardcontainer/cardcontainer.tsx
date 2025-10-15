// src/components/CardContainer/CardContainer.tsx

import React from 'react';
import { FaTimes } from 'react-icons/fa'; 
import { type CardContainerProps } from './interface';
import { CardProvider } from './cardprovider'; 
import './../styles/cardcontainerLayout.sass';

const CardContainer: React.FC<CardContainerProps> = ({ 
  id,
  children, 
  title,
  className = '',
  onClose,
}) => {
  
  // Función de cierre para el botón de la cabecera
  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose(id); 
  };

  return (
    <CardProvider id={id} onClose={onClose}>
      
      <div className={`card-container ${className}`}>
        
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

        <div className="card-content">
          {children}
        </div>
      </div>
    </CardProvider>
  );
};

export default CardContainer;