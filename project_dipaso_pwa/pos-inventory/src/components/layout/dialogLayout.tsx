import React, { useState, useRef, useEffect, useCallback } from 'react';
import styles from './../styles/dialogLayout.module.scss';

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
  // ----------------------------------------------------
  // ✅ 1. LLAMADA INCONDICIONAL DE HOOKS (DEBE IR AL PRINCIPIO)
  // ----------------------------------------------------

  const [pos, setPos] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartPos = useRef<{ x: number, y: number }>({ x: 0, y: 0 });
  
  // Manejador para el movimiento del mouse
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;

    const newX = e.clientX - dragStartPos.current.x;
    const newY = e.clientY - dragStartPos.current.y;

    setPos({ x: newX, y: newY });
  }, [isDragging]);

  // Manejador para el final del arrastre
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Hook para añadir y remover los listeners globales (document)
  useEffect(() => {
    // La lógica CONDICIONAL (if/else) debe estar DENTRO del hook
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
  
  // ----------------------------------------------------
  // ✅ 2. LÓGICA CONDICIONAL DE RENDERIZADO (VA DESPUÉS DE LOS HOOKS)
  // ----------------------------------------------------
  if (!isOpen) {
    return null; // Oculta el componente si no está abierto
  }

  // ----------------------------------------------------
  // 3. RESTO DE LAS FUNCIONES Y EL RENDERIZADO
  // ----------------------------------------------------
  
  // Manejador para el inicio del arrastre
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);

    dragStartPos.current.x = e.clientX - pos.x;
    dragStartPos.current.y = e.clientY - pos.y;
  };
  
  return (
    <div className={styles.overlay}>
      <div 
        className={styles.dialogoContenido}
        style={{
          transform: `translate(${pos.x}px, ${pos.y}px)`, 
          cursor: isDragging ? 'grabbing' : 'auto' 
        }}
      >
        <div 
          className={styles.dialogoEncabezado} 
          onMouseDown={handleMouseDown}
        >
          <h2>{titulo}</h2>
          <button 
            onClick={onClose} 
            className={styles.cerrarBoton}
          >
            &times;
          </button>
        </div>
        
        <div className="dialogo-contenido">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DialogoReutilizable;