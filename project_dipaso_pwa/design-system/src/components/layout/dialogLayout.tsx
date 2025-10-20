import React, { useState, useRef, useEffect, useCallback } from 'react';
// Importa tu SASS global
//import './../../styles/layouts/dialogLayout.sass';

// Define el tipo para las props del componente
interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  titulo: string;
  children: React.ReactNode;
}

/**
 * Componente de Diálogo (Modal) Reutilizable y Movible.
 */
const DialogoReutilizable: React.FC<DialogProps> = ({ 
  isOpen, 
  onClose, 
  titulo, 
  children 
}) => {

  const [pos, setPos] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartPos = useRef<{ x: number, y: number }>({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    setPos({
      x: e.clientX - dragStartPos.current.x,
      y: e.clientY - dragStartPos.current.y
    });
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'grabbing';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'auto';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'auto';
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  if (!isOpen) return null;

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartPos.current.x = e.clientX - pos.x;
    dragStartPos.current.y = e.clientY - pos.y;
  };

  return (
    <div className="overlay">
      <div 
        className="dialogoContenido"
        style={{
          transform: `translate(${pos.x}px, ${pos.y}px)`,
          cursor: isDragging ? 'grabbing' : 'auto'
        }}
      >
        <div 
          className="dialogoEncabezado"
          onMouseDown={handleMouseDown}
        >
          <h2>{titulo}</h2>
          <button onClick={onClose} className="cerrarBoton">&times;</button>
        </div>

        <div className="dialogo-contenido">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DialogoReutilizable;
